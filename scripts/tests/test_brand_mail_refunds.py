"""Tests for scripts/brand_mail.py respond-refunds and the probe's `responders` (RULING-2026-09-29-lines (h)).

Standard library only; no network: IMAP, SMTP and the refund command are fakes. What these pin, beyond the ruling:
a spoofed or unauthenticated From never triggers a refund; the refund command, not this script, decides which sale
(this product, this buyer, inside the live window, once); the reply is one fixed sentence that says nothing about
whether the address bought anything; no address, subject or body is ever printed; and a dry run - the default -
changes nothing anywhere.

Addresses are placeholders on reserved example domains.
"""

import base64
import datetime as dt
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from email.message import EmailMessage
from email.utils import format_datetime
from unittest import mock

SCRIPTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_ROOT = os.path.dirname(SCRIPTS_DIR)
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

import brand_mail  # noqa: E402

UTC = dt.timezone.utc
NOW = dt.datetime(2026, 10, 20, 12, 0, 0, tzinfo=UTC)
BRAND = "mehudak@brand.example"
PASSWORD = "abcd efgh ijkl mnop"
TOKEN = "gumroad-token-never-printed-0123"
BUYER = "buyer.one@example.org"
VICTIM = "victim.two@example.net"
ENV = {"BRAND_MAIL_ADDRESS": BRAND, "BRAND_MAIL_APP_PASSWORD": PASSWORD, "GUMROAD_ACCESS_TOKEN": TOKEN}
MAIN = dict(ENV, GITHUB_REF="refs/heads/main")
PRODUCT_ID = "32-nPAicqbLj8B_WswVlMw=="
GOOD_AR = "mx.google.com; dkim=pass header.i=@example.org header.s=s1 header.b=abc; spf=pass (google.com: domain of %s designates 192.0.2.1 as permitted sender) smtp.mailfrom=%s; dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=example.org" % (BUYER, BUYER)
FAIL_AR = "mx.google.com; dkim=none; spf=softfail (google.com: domain of transitioning x@example.net does not designate 192.0.2.9 as permitted sender) smtp.mailfrom=x@example.net; dmarc=fail (p=NONE) header.from=example.net"


def days_ago(n):
    return NOW - dt.timedelta(days=n)


def mail(body="שלום, אני מבקש החזר על Pro.", subject="Re: You bought Pro", sender=BUYER, auth=(GOOD_AR,), received=None,
         html=None, extra=(), message_id="<req-1@example.org>", charset_b64=False):
    """A whole message as the server stores it: its receiving server's Authentication-Results on top."""
    msg = EmailMessage()
    for value in auth:
        msg["Authentication-Results"] = value
    for name, value in extra:
        msg[name] = value
    msg["From"] = sender
    msg["To"] = BRAND
    msg["Subject"] = subject
    msg["Date"] = format_datetime(received or days_ago(1))
    msg["Message-ID"] = message_id
    msg["In-Reply-To"] = "<receipt-9@gumroad.com>"
    if html is not None:
        msg.set_content(html, subtype="html", cte="base64")
    else:
        msg.set_content(body, cte="base64" if charset_b64 else "quoted-printable")
    return {"received": received or days_ago(1), "raw": bytes(msg), "flags": set()}


def imap_date(when):
    return when.strftime("%d-%b-%Y %H:%M:%S +0000")


# The only STOREs respond-refunds may send (RULING-2026-10-05-refund-state (a)): \\Answered alone, \\Answered and
# \\Flagged in ONE command on a balance refusal, and \\Flagged off once the refund happened.
STORE_OPS = (("+FLAGS", "(\\Answered)"), ("+FLAGS", "(\\Answered \\Flagged)"), ("-FLAGS", "(\\Flagged)"))
WAITING = {"\\Answered", "\\Flagged"}


class FakeIMAP:
    """IMAP4_SSL for respond-refunds: UID SEARCH/FETCH/STORE on INBOX; records selects, searches and stores."""

    instances = []

    def __init__(self, inbox, host=None, port=None, ssl_context=None, timeout=None):
        self.inbox = inbox  # [message dict], uid = index + 1
        self.selects, self.stores, self.fetches, self.searches, self.logged_out = [], [], [], [], False
        self.store_ops = []  # (uid, op, flags), in order
        FakeIMAP.instances.append(self)

    def login(self, user, password):
        self.user = user

    def select(self, mailbox="INBOX", readonly=False):
        self.selects.append((mailbox[1:-1] if mailbox.startswith('"') else mailbox, readonly))
        self.readonly = readonly
        return "OK", [str(len(self.inbox)).encode()]

    def uid(self, command, *args):
        command = command.upper()
        if command == "SEARCH":
            self.searches.append(args)
            # The waiting requests (FLAGGED, any date: a SINCE here would drop an old promise; the tests assert there is
            # none) or the new ones (NOT ANSWERED SINCE <date>).
            flagged = args[:1] == ("FLAGGED",)
            assert flagged or (args[:3] == ("NOT", "ANSWERED", "SINCE") and len(args) == 4), args
            keys = list(args[1:] if flagged else args[2:])
            dates = dict(zip(keys[0::2], keys[1::2]))
            assert set(dates) <= {"SINCE"} and len(keys) % 2 == 0, args
            since = dt.datetime.strptime(dates["SINCE"], "%d-%b-%Y").replace(tzinfo=UTC) if "SINCE" in dates else None
            uids = [str(i + 1).encode() for i, m in enumerate(self.inbox)
                    if (("\\Flagged" in m["flags"]) if flagged else ("\\Answered" not in m["flags"]))
                    and (since is None or m["received"] >= since)]
            return "OK", [b" ".join(uids)]
        if command == "FETCH":
            uid, parts = args
            self.fetches.append(parts)
            assert parts == "(INTERNALDATE BODY.PEEK[])", parts  # PEEK: reading never sets \\Seen
            m = self.inbox[int(uid) - 1]
            head = ('%s (UID %s INTERNALDATE "%s" BODY[] {%d}' % (uid, uid, imap_date(m["received"]), len(m["raw"]))).encode()
            return "OK", [(head, m["raw"]), b")"]
        if command == "STORE":
            if self.readonly:
                raise AssertionError("STORE in a read-only (EXAMINE) session")
            uid, op, flags = args
            assert (op, flags) in STORE_OPS, (op, flags)
            self.stores.append(int(uid))
            self.store_ops.append((int(uid), op, flags))
            names = set(flags.strip("()").split())
            target = self.inbox[int(uid) - 1]["flags"]
            if op == "+FLAGS":
                target.update(names)
            else:
                target.difference_update(names)
            return "OK", [b""]
        raise AssertionError("unexpected UID %s" % command)

    def logout(self):
        self.logged_out = True
        return "BYE", [b""]

    def _forbidden(self, *_a, **_k):
        raise AssertionError("respond-refunds never copies, moves, expunges or deletes mail")

    store = copy = move = expunge = append = create = delete = rename = _forbidden


class FakeSMTP:
    instances = []

    def __init__(self, host, port, timeout=None, context=None):
        self.sent, self.logins = [], []
        FakeSMTP.instances.append(self)

    def login(self, user, password):
        if getattr(FakeSMTP, "fail_login", None):
            raise FakeSMTP.fail_login
        self.logins.append(user)

    def send_message(self, msg):
        if getattr(FakeSMTP, "fail", None):
            raise FakeSMTP.fail
        self.sent.append(msg)
        return {}

    def quit(self):
        pass


def refuse(*_a, **_k):
    raise AssertionError("must not be opened here")


class Runner:
    """The refund command (refund --email <sender> --requested-at <when>), faked: records every call; answers
    (code, lines), or each of `answers` in turn with the last one repeating."""

    def __init__(self, code=0, lines=("refund: none",), answers=None):
        self.calls = []
        self.answers = list(answers) if answers else [(code, list(lines))]

    def __call__(self, sender, requested_at, apply, env):
        self.calls.append((sender, requested_at, apply))
        code, lines = self.answers.pop(0) if len(self.answers) > 1 else self.answers[0]
        return code, list(lines)


class BySender(Runner):
    """A balance refusal naming a sale of the sender's own: "refund: balance-insufficient (sale s-<local part>)"."""

    def __call__(self, sender, requested_at, apply, env):
        self.calls.append((sender, requested_at, apply))
        return brand_mail.BALANCE_EXIT, ["refund: balance-insufficient (sale s-%s)" % sender.split("@")[0].replace(".", "-")]


def write_json(directory, name, data):
    path = os.path.join(directory, name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    return path


class RespondHarness(unittest.TestCase):
    def setUp(self):
        FakeIMAP.instances, FakeSMTP.instances, FakeSMTP.fail, FakeSMTP.fail_login = [], [], None, None
        # The product exists (create --write-site-json ran): the repository's own site.json has no productId yet.
        self.dir = tempfile.mkdtemp()
        self.addCleanup(lambda: __import__("shutil").rmtree(self.dir, ignore_errors=True))
        self.site(PRODUCT_ID)

    def site(self, product_id):
        path = write_json(self.dir, "site.json", {"gumroad": {"productId": product_id, "productUrl": ""}})
        patcher = mock.patch.object(brand_mail, "SITE_JSON", path)
        patcher.start()
        self.addCleanup(patcher.stop)

    def respond(self, inbox, *flags, env=None, runner=None, smtp=FakeSMTP, now=NOW):
        out, err = io.StringIO(), io.StringIO()
        runner = runner or Runner()
        code = brand_mail.main(
            ["respond-refunds", *flags], env=MAIN if env is None else env, stdout=out, stderr=err, now=now,
            smtp_factory=smtp, imap_factory=lambda host, port, ssl_context=None, timeout=None: FakeIMAP(inbox),
            refund_runner=runner,
        )
        return code, out.getvalue(), err.getvalue(), runner

    def replies(self):
        return [m for s in FakeSMTP.instances for m in s.sent]


class NotConfiguredTests(RespondHarness):
    def test_without_the_mailbox_secrets_it_reads_nothing_and_exits_0(self):
        out, err = io.StringIO(), io.StringIO()
        code = brand_mail.main(["respond-refunds", "--apply"], env={}, stdout=out, stderr=err, now=NOW,
                               smtp_factory=refuse, imap_factory=refuse, refund_runner=refuse)
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out.getvalue()), {"configured": False, "missing": ["BRAND_MAIL_ADDRESS", "BRAND_MAIL_APP_PASSWORD"]})

    def test_without_the_gumroad_token_it_reads_nothing_and_exits_0(self):
        env = {k: v for k, v in MAIN.items() if k != "GUMROAD_ACCESS_TOKEN"}
        out = io.StringIO()
        code = brand_mail.main(["respond-refunds", "--apply"], env=env, stdout=out, stderr=io.StringIO(), now=NOW,
                               smtp_factory=refuse, imap_factory=refuse, refund_runner=refuse)
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out.getvalue()), {"configured": False, "missing": ["GUMROAD_ACCESS_TOKEN"]})

    def test_a_real_run_goes_only_from_main(self):
        for ref in ("refs/heads/claude/x", "", "refs/pull/1/merge"):
            code, out, err, runner = self.respond([mail()], "--apply", env=dict(ENV, GITHUB_REF=ref))
            self.assertEqual(code, 2, ref)
            self.assertIn("refs/heads/main", err)
            self.assertEqual(FakeIMAP.instances, [])
            self.assertEqual(runner.calls, [])

    def test_a_personal_mailbox_address_is_refused(self):
        code, out, err, runner = self.respond([mail()], env=dict(MAIN, BRAND_MAIL_ADDRESS="someone@example.org"))
        self.assertEqual(code, 2)
        self.assertEqual(runner.calls, [])


class ProductNotCreatedTests(RespondHarness):
    """Before create --write-site-json, site.json has no productId: nothing can have been sold (enable needs a deployed
    productId), so the responder reads no mail and exits 0 - never a red scheduled run over a refund request that no
    sale can match (fixer review of 29.9, finding 5)."""

    def test_without_a_product_id_it_reads_nothing_and_exits_0(self):
        for product_id in ("", "   ", None):
            self.site(product_id)
            FakeIMAP.instances = []
            out, err = io.StringIO(), io.StringIO()
            code = brand_mail.main(["respond-refunds", "--apply"], env=MAIN, stdout=out, stderr=err, now=NOW,
                                   smtp_factory=refuse, imap_factory=refuse, refund_runner=refuse)
            self.assertEqual(code, 0, err.getvalue())
            self.assertEqual(json.loads(out.getvalue()), {"configured": False, "missing": ["gumroad.productId"]})

    def test_a_site_json_without_a_gumroad_block_is_no_product_either(self):
        path = write_json(self.dir, "bare.json", {"siteName": "x"})
        with mock.patch.object(brand_mail, "SITE_JSON", path):
            out = io.StringIO()
            code = brand_mail.main(["respond-refunds"], env=MAIN, stdout=out, stderr=io.StringIO(), now=NOW,
                                   smtp_factory=refuse, imap_factory=refuse, refund_runner=refuse)
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out.getvalue())["missing"], ["gumroad.productId"])

    def test_an_unreadable_site_json_fails_the_run_without_reading_mail(self):
        with open(os.path.join(self.dir, "broken.json"), "w") as f:
            f.write("{not json")
        for path in (os.path.join(self.dir, "broken.json"), os.path.join(self.dir, "absent.json")):
            with mock.patch.object(brand_mail, "SITE_JSON", path):
                out = io.StringIO()
                code = brand_mail.main(["respond-refunds", "--apply"], env=MAIN, stdout=out, stderr=io.StringIO(), now=NOW,
                                       smtp_factory=refuse, imap_factory=refuse, refund_runner=refuse)
            self.assertEqual(code, 1, path)
            report = json.loads(out.getvalue())
            self.assertTrue(report["configured"])
            self.assertIn("error", report)


class DryRunTests(RespondHarness):
    def test_the_default_is_a_dry_run_that_changes_nothing(self):
        code, out, err, runner = self.respond([mail()])
        self.assertEqual(code, 0, err)
        report = json.loads(out)
        self.assertTrue(report["dryRun"])
        (imap,) = FakeIMAP.instances
        self.assertEqual(imap.selects, [("INBOX", True)])  # EXAMINE
        self.assertEqual(imap.stores, [])
        self.assertEqual(FakeSMTP.instances, [])
        self.assertEqual([c[2] for c in runner.calls], [False])  # the refund command runs as a dry run too
        self.assertEqual(report["handled"][0]["outcome"], "dry run: would answer")


class ApplyTests(RespondHarness):
    def test_an_authenticated_request_is_refunded_by_the_command_answered_once_and_marked_answered(self):
        inbox = [mail(received=days_ago(2))]
        code, out, err, runner = self.respond(inbox, "--apply")
        self.assertEqual(code, 0, err)
        self.assertEqual(runner.calls, [(BUYER, days_ago(2), True)])  # the request time is the server's INTERNALDATE
        (imap,) = FakeIMAP.instances
        self.assertEqual(imap.selects, [("INBOX", False)])
        self.assertEqual(imap.stores, [1])
        (reply,) = self.replies()
        self.assertEqual(reply["To"], BUYER)
        self.assertEqual(reply["In-Reply-To"], "<req-1@example.org>")
        self.assertEqual(reply["Auto-Submitted"], "auto-replied")
        self.assertEqual(reply.get_content().strip(), brand_mail.REFUND_REPLY)
        self.assertEqual(json.loads(out)["handled"][0]["outcome"], "answered")

    def test_a_notice_sent_through_the_home_pages_cancellation_link_is_a_refund_request(self):
        # il-biz-tools' "ביטול עסקה (Pro)" link: mailto:<the brand mailbox, no +tag>?subject=ביטול עסקה – Pro, with the
        # name and ID number the page asks for (RULING-2026-09-30-documents (b), 14ט). It must reach this responder.
        notice = mail(subject="ביטול עסקה – Pro", body="שלום, ישראלה ישראלי, ת.ז. 000000018.", received=days_ago(1))
        code, out, err, runner = self.respond([notice], "--apply")
        self.assertEqual(code, 0, err)
        self.assertEqual(runner.calls, [(BUYER, days_ago(1), True)])
        self.assertEqual(json.loads(out)["handled"][0]["outcome"], "answered")
        # The same notice to the statement's +accessibility address is accessibility mail, never read here - which is
        # why publish-gate.js cancelHref drops the +tag (reviewers of 30.9).
        tagged = dict(notice, raw=notice["raw"].replace(b"To: " + BRAND.encode(), b"To: mehudak+accessibility@brand.example"))
        self.assertNotEqual(tagged["raw"], notice["raw"])
        FakeSMTP.instances = []
        code, out, err, runner = self.respond([tagged], "--apply")
        self.assertEqual(code, 0, err)
        self.assertEqual(runner.calls, [])

    def test_the_reply_is_one_fixed_sentence_that_says_nothing_about_a_purchase(self):
        s = brand_mail.REFUND_REPLY
        self.assertEqual(s.count("."), 1)
        self.assertTrue(s.endswith("."))
        self.assertIn("Mehudak (מהודק)", s)
        self.assertIn("תשובה אוטומטית", s)  # an automated answer says it is one
        self.assertIn("Gumroad", s)
        # RULING-2026-09-30-documents (d): "refunded in full" is made exact - in the currency charged.
        self.assertIn("במלואה, במטבע שבו חויבתם, דרך Gumroad", s)
        for word in ("לא נמצאה", "לא נמצא", "מצאנו", "הוחזרה", "not found", "no purchase", "בלי שאלות", "מובטח"):
            self.assertNotIn(word, s)
        # Whatever the refund command found - a refund, nothing, a sale outside the window - the reply is the same.
        bodies = []
        for runner in (Runner(0, ["refunded sale S1"]), Runner(0, ["nothing to refund"]), Runner(0, ["outside the 30-day window: 1"])):
            FakeSMTP.instances = []
            self.respond([mail()], "--apply", runner=runner)
            (reply,) = self.replies()
            bodies.append((reply["Subject"], reply.get_content()))
        self.assertEqual(len(set(bodies)), 1)

    def test_a_second_run_does_not_touch_an_answered_request(self):
        inbox = [mail()]
        self.respond(inbox, "--apply")
        code, out, err, runner = self.respond(inbox, "--apply")
        self.assertEqual(code, 0, err)
        self.assertEqual(runner.calls, [])
        self.assertEqual(len(self.replies()), 1)

    def test_one_answer_per_sender_per_run(self):
        inbox = [mail(message_id="<a@example.org>"), mail(message_id="<b@example.org>", body="refund please")]
        code, out, err, runner = self.respond(inbox, "--apply")
        self.assertEqual(code, 0, err)
        self.assertEqual(len(runner.calls), 1)
        self.assertEqual(len(self.replies()), 1)
        self.assertEqual(sorted(FakeIMAP.instances[0].stores), [1, 2])

    def test_a_refund_command_that_stops_leaves_the_request_unanswered_and_fails_the_run(self):
        code, out, err, runner = self.respond([mail()], "--apply", runner=Runner(1, ["STOPPED: GET /v2/sales was refused live"]))
        self.assertEqual(code, 1)
        self.assertEqual(self.replies(), [])
        self.assertEqual(FakeIMAP.instances[0].stores, [])
        self.assertIn("not answered", json.loads(out)["handled"][0]["outcome"])

    def test_a_reply_that_cannot_be_sent_leaves_the_request_unanswered_and_fails_the_run(self):
        FakeSMTP.fail = OSError("connection reset")
        code, out, err, runner = self.respond([mail()], "--apply")
        self.assertEqual(code, 1)
        self.assertEqual(FakeIMAP.instances[0].stores, [])

    def test_a_login_the_server_refuses_answers_nothing_and_fails_the_run(self):
        import smtplib
        FakeSMTP.fail_login = smtplib.SMTPAuthenticationError(535, b"no")
        code, out, err, runner = self.respond([mail()], "--apply")
        self.assertEqual(code, 1)
        self.assertEqual(self.replies(), [])
        self.assertEqual(FakeIMAP.instances[0].stores, [])
        self.assertNotIn(PASSWORD, out + err)

    def test_at_most_a_bounded_number_of_requests_per_run(self):
        inbox = [mail(sender="b%d@example.org" % i, auth=(GOOD_AR.replace(BUYER, "b%d@example.org" % i),),
                      message_id="<r%d@example.org>" % i) for i in range(brand_mail.MAX_REFUND_REQUESTS_PER_RUN + 3)]
        code, out, err, runner = self.respond(inbox, "--apply")
        self.assertEqual(len(runner.calls), brand_mail.MAX_REFUND_REQUESTS_PER_RUN)
        self.assertEqual(json.loads(out)["left"], 3)
        # Bounded even when every attempt fails.
        for m in inbox:
            m["flags"].clear()
        code, out, err, failing = self.respond(inbox, "--apply", runner=Runner(1, ["STOPPED"]))
        self.assertEqual(len(failing.calls), brand_mail.MAX_REFUND_REQUESTS_PER_RUN)
        self.assertEqual(code, 1)


class SenderVerificationTests(RespondHarness):
    """A refund moves money: only a From the receiving server authenticated may ask for one."""

    def assert_ignored(self, message, reason):
        code, out, err, runner = self.respond([message], "--apply")
        self.assertEqual(code, 0, err)
        self.assertEqual(runner.calls, [], reason)
        self.assertEqual(self.replies(), [], reason)
        self.assertEqual(FakeIMAP.instances[-1].stores, [], reason)
        self.assertEqual(json.loads(out)["unauthenticated"], 1, reason)

    def test_a_spoofed_from_with_failing_dkim_and_spf_is_ignored(self):
        self.assert_ignored(mail(sender=VICTIM, auth=(FAIL_AR,)), "spoofed")

    def test_no_authentication_results_at_all_is_ignored(self):
        self.assert_ignored(mail(auth=()), "none")

    def test_a_forged_pass_below_the_servers_own_failing_header_is_ignored(self):
        forged = "mx.google.com; dkim=pass header.i=@example.net; spf=pass smtp.mailfrom=%s" % VICTIM
        self.assert_ignored(mail(sender=VICTIM, auth=(FAIL_AR, forged)), "forged")

    def test_results_from_another_server_are_not_trusted(self):
        self.assert_ignored(mail(auth=(GOOD_AR.replace("mx.google.com", "relay.example.com"),)), "authserv")

    def test_a_pass_for_another_domain_does_not_vouch_for_the_from(self):
        other = "mx.google.com; dkim=pass header.d=mailer.example header.i=@mailer.example; spf=pass smtp.mailfrom=bounce@mailer.example"
        self.assert_ignored(mail(auth=(other,)), "unaligned")
        # A look-alike suffix is not a subdomain.
        lookalike = "mx.google.com; dkim=pass header.d=ample.org; spf=fail smtp.mailfrom=%s" % BUYER
        self.assert_ignored(mail(auth=(lookalike,)), "suffix")

    def test_two_from_addresses_are_ignored(self):
        self.assert_ignored(mail(sender="%s, %s" % (BUYER, VICTIM)), "two from")

    def test_dkim_or_spf_alone_suffices_when_aligned(self):
        dkim_only = "mx.google.com; dkim=pass header.d=example.org; spf=neutral smtp.mailfrom=x@elsewhere.example"
        spf_only = "mx.google.com; dkim=fail header.d=example.org; spf=pass smtp.mailfrom=%s" % BUYER
        subdomain = "mx.google.com; dkim=pass header.d=example.org"
        for auth, sender in ((dkim_only, BUYER), (spf_only, BUYER), (subdomain, "buyer@mail.example.org")):
            FakeSMTP.instances = []
            code, out, err, runner = self.respond([mail(sender=sender, auth=(auth,))], "--apply")
            self.assertEqual(code, 0, err)
            self.assertEqual([c[0] for c in runner.calls], [sender], auth)

    def test_the_verified_sender_is_the_from_address_never_reply_to(self):
        message = mail(extra=(("Reply-To", VICTIM),))
        code, out, err, runner = self.respond([message], "--apply")
        self.assertEqual([c[0] for c in runner.calls], [BUYER])
        (reply,) = self.replies()
        self.assertEqual(reply["To"], BUYER)

    def test_the_authserv_id_is_configurable(self):
        env = dict(MAIN, BRAND_MAIL_AUTHSERV_ID="mx.example.net")
        code, out, err, runner = self.respond([mail(auth=(GOOD_AR.replace("mx.google.com", "mx.example.net"),))], "--apply", env=env)
        self.assertEqual(len(runner.calls), 1)


class RecognitionTests(RespondHarness):
    def handled(self, message):
        FakeSMTP.instances = []
        code, out, err, runner = self.respond([message], "--apply")
        self.assertEqual(code, 0, err)
        return len(runner.calls) == 1

    def test_the_senders_own_words_ask_for_a_refund_or_a_cancellation(self):
        for body in ("I would like a refund.", "אפשר החזר כספי?", "please cancel my purchase", "אני רוצה לבטל את העסקה",
                     "ביטול עסקה", "Can I get my money back?", "תחזירו לי את הכסף"):
            self.assertTrue(self.handled(mail(body=body, subject="Pro")), body)
        self.assertTrue(self.handled(mail(body="hi", subject="Refund request")), "subject")
        self.assertTrue(self.handled(mail(body="אני מבקש החזר", charset_b64=True)), "base64 Hebrew")

    def test_more_ways_of_asking_are_requests(self):
        for words in ("Refund please", "Can you refund me?", "How do I get a refund?", "It does not work, so refund me.",
                      "Per your refund policy, I want a refund.", "Cancellation of my order, please.", "Money-back please",
                      "אני רוצה החזר", "אפשר לקבל החזר?", "בקשה להחזר", "אני רוצה את הכסף בחזרה", "ביטול הרכישה",
                      "תבטלו לי את העסקה", "אפשר לבטל את ההזמנה?", "מגיע לי החזר מלא"):
            self.assertTrue(brand_mail.asks_for_refund(words.lower()), words)

    def test_a_support_question_that_uses_a_verb_or_a_bookkeeping_refund_is_not_a_request(self):
        """Fixer review of 29.9, finding 1: each of the first six refunded a buyer inside the window who asked for nothing.
        The rest are the product's own domain - receipts, invoices, VAT - or a refund the sender says they do not want."""
        for body in (
            "הלוגו נעלם מהקבלה, איך להחזיר אותו?",
            "איך לבטל את צבע המותג במסמך אחד?",
            "תחזירו לי את הצבע הקודם",
            "How do I cancel the logo on a single invoice?",
            "My bank says the payment was cancelled… I want to keep Pro",
            "אפשר להפיק קבלה על החזר הוצאות?",
            "What is your refund policy?",
            "How do I issue a refund to my client?",
            "How do I record refunds for my customers?",
            "Can the invoice show a VAT refund?",
            "Does Pro come with a money-back guarantee?",
            "I'm not asking for a refund, just help with activation.",
            "I don’t want a refund.",
            "איך מפיקים קבלה על החזר ללקוח?",
            "איך רושמים החזר מס בדוח?",
            "מה עם החזר מע\"מ?",
            "מה מדיניות ההחזרים?",
            "אני לא מבקש החזר, רק עזרה בהפעלה",
            "איך מבטלים חשבונית?",
            "החזרה של מוצר ללקוח - איך רושמים?",
            "I need an invoice for a refund.",
            "The report should list refunds to my customers.",
            "How do I issue a refund in the app?",
            "מה מדיניות ההחזר שלכם?",
            "איך מוציאים קבלה על החזר?",
            "איך רושמים החזר ללקוחה?",
        ):
            self.assertFalse(brand_mail.asks_for_refund(body.lower()), body)
            self.assertFalse(self.handled(mail(body=body, subject="Re: You bought Pro")), body)

    def test_a_receipt_reply_without_such_words_is_not_a_refund_request(self):
        self.assertFalse(self.handled(mail(body="How do I activate the key?")))

    def test_words_only_in_the_quoted_receipt_do_not_count(self):
        body = ("How do I activate?\n\nOn Mon, Oct 19, 2026 at 10:00 AM Gumroad <noreply@gumroad.com> wrote:\n"
                "> 30-day money back guarantee. Refund policy: ...\n")
        self.assertFalse(self.handled(mail(body=body)))
        quoted_only = "Thanks!\n> You can ask for a refund within 30 days.\n"
        self.assertFalse(self.handled(mail(body=quoted_only)))
        # Clients that quote without "> ": everything from the reply header down is the receipt, not the sender.
        for header in ("-----Original Message-----", "From: Gumroad <noreply@gumroad.com>",
                       "בתאריך יום ב׳, 19 באוק׳ 2026 ב-10:00 מאת Gumroad:", "On Mon, Oct 19, 2026 Gumroad wrote:"):
            unprefixed = "How do I activate?\n\n%s\nYou bought Pro. Refund policy: 30 days.\n" % header
            self.assertFalse(self.handled(mail(body=unprefixed)), header)
        html = '<div>How do I activate?</div><div class="gmail_quote">On ... wrote:<blockquote>refund policy</blockquote></div>'
        self.assertFalse(self.handled(mail(html=html)))
        self.assertTrue(self.handled(mail(html="<p>I want a <b>refund</b></p><blockquote>receipt</blockquote>")))

    def test_automated_list_and_platform_mail_is_never_answered(self):
        for extra, sender in (
            ((("Auto-Submitted", "auto-replied"),), BUYER),
            ((("Precedence", "bulk"),), BUYER),
            ((("List-Unsubscribe", "<mailto:u@example.org>"),), BUYER),
            ((), "noreply@example.org"),
            ((), "mailer-daemon@example.org"),
            ((), "support@gumroad.com"),
        ):
            auth = (GOOD_AR.replace(BUYER, sender).replace("example.org", sender.split("@")[1]),)
            self.assertFalse(self.handled(mail(extra=extra, sender=sender, auth=auth, body="refund")), (extra, sender))

    def test_mail_from_the_brand_itself_and_accessibility_mail_are_left_alone(self):
        self.assertFalse(self.handled(mail(sender=BRAND, body="refund", auth=(GOOD_AR.replace(BUYER, BRAND).replace("example.org", "brand.example"),))))
        self.assertFalse(self.handled(mail(subject="נגישות והחזר", body="refund")))

    def venue_files(self, sent_records):
        questions = write_json(self.dir, "questions.json", {"venues": [
            {"venue": "displate", "to": "artists@displate.com", "subject": "Question: an artist shop run by an AI agent"},
            {"venue": "n8n", "to": None, "subject": "Question: paid templates from an AI-operated creator account"},
        ]})
        sent = write_json(self.dir, "sent.json", {"sent": sent_records, "repliesRecorded": []})
        return ["--questions", questions, "--sent", sent]

    def test_a_venue_answering_our_question_never_gets_the_refund_answer(self):
        """Fixer review of 29.9, finding 1: a venue that writes "refund" is answering us, not buying; it is neither
        refunded, answered nor marked answered, so the probe still counts its reply."""
        record = {"venue": "displate", "messageId": "<q-1@brand.example>", "sentAt": "2026-10-01T09:00:00Z", "status": "sent"}
        files = self.venue_files([record])
        helpdesk = "agent@help.example.com"
        helpdesk_ar = (GOOD_AR.replace(BUYER, helpdesk).replace("example.org", "help.example.com"),)
        displate = "team@support.displate.com"
        displate_ar = (GOOD_AR.replace(BUYER, displate).replace("example.org", "support.displate.com"),)
        for message, why in (
            (mail(sender=helpdesk, auth=helpdesk_ar, body="We do not offer refunds on artist payouts.",
                  extra=(("References", "<q-1@brand.example>"),)), "threaded to our question"),
            (mail(sender=displate, auth=displate_ar, body="Please cancel the order of this design, a refund follows."), "the venue's domain"),
            (mail(subject="[Ticket 88] Re: Question: paid templates from an AI-operated creator account", body="refund policy aside, a refund"), "our subject"),
        ):
            FakeSMTP.instances = []
            code, out, err, runner = self.respond([message], "--apply", *files)
            self.assertEqual(code, 0, err)
            self.assertEqual(runner.calls, [], why)
            self.assertEqual(self.replies(), [], why)
            self.assertEqual(FakeIMAP.instances[-1].stores, [], why)
        # A buyer's own request in the same run is still handled.
        code, out, err, runner = self.respond([mail()], "--apply", *files)
        self.assertEqual(len(runner.calls), 1)

    def test_only_recent_unanswered_inbox_mail_is_searched(self):
        self.respond([mail()], "--apply")
        # The waiting requests' FLAGGED search comes first and carries no date (BalanceWaitTests); this is the other one.
        (search,) = [s for s in FakeIMAP.instances[0].searches if s[:2] == ("NOT", "ANSWERED")]
        since = dt.datetime.strptime(search[3], "%d-%b-%Y").replace(tzinfo=UTC)
        self.assertEqual((NOW - since).days, brand_mail.REFUND_LOOKBACK_DAYS)


class NothingLeaksTests(RespondHarness):
    def test_no_address_subject_body_or_secret_in_the_output_or_the_errors(self):
        inbox = [mail(subject="Refund for SECRET-SUBJECT", body="refund BODY-SECRET"), mail(sender=VICTIM, auth=(FAIL_AR,), message_id="<v@x>")]
        runner = Runner(0, ["sales of this product to the requesting address: 1", "echo %s" % BUYER.upper()])
        code, out, err, _ = self.respond(inbox, "--apply", runner=runner)
        text = out + err
        for leak in (BUYER, BUYER.upper(), "buyer.one", VICTIM, "victim.two", "SECRET-SUBJECT", "BODY-SECRET", BRAND, PASSWORD, TOKEN):
            self.assertNotIn(leak, text, leak)
        self.assertIn("[address]", text)  # the command's line that echoed it was redacted, not dropped

    def test_an_unexpected_error_prints_its_type_only(self):
        with mock.patch.object(brand_mail, "authenticated_sender", side_effect=ValueError("From: %s" % BUYER)):
            code, out, err, _ = self.respond([mail()], "--apply")
        self.assertEqual(code, 1)
        self.assertNotIn(BUYER, out + err)


# What the refund command prints (gumroad-pro-product.js refund --email): its own lines, then its result line. The sale
# ids are obvious fakes; the responder must print none of them (RULING-2026-10-05-refund-state (a)6).
BALANCE_LINES = [
    "refund window in force: 30 days, measured at the request (2026-10-18T12:00:00.000Z)",
    "PUT /v2/sales/sale-A/refund -> HTTP 200 success=false",
    "STOPPED: Gumroad refused the refund of sale sale-A for balance (the unpaid balance does not cover it yet). Sale sale-A is not refunded.",
    "refund: balance-insufficient (sale sale-A)",
]
BALANCE = (brand_mail.BALANCE_EXIT, BALANCE_LINES)
REFUNDED = (0, ["PUT /v2/sales/sale-A/refund -> HTTP 200 success=true", "refunded sale sale-A in full; refund id: none returned",
                "refund: refunded (sale sale-A)"])
ALREADY = (0, ["sale sale-A is already refunded in full: nothing more to refund", "refund: already-refunded (sale sale-A)"])
NONE = (0, ["sales of this product to the requesting address: 0", "nothing to refund", "refund: none"])


def flagged(**kw):
    """A request this responder answered with the holding reply and flagged: the waiting state, in the mailbox."""
    return dict(mail(**kw), flags=set(WAITING))


class BalanceWaitTests(RespondHarness):
    """RULING-2026-10-05-refund-state (a), on RULING-2026-09-30-documents (d): a refund Gumroad refuses for balance (the
    refund command's exit 3) gets one facts-only holding reply and ONE STORE +FLAGS (\\Answered \\Flagged). The request
    itself, flagged, is the waiting state: nothing is written to disk or committed, and no sale id is kept beyond the run
    or printed. Every run starts with UID SEARCH FLAGGED and re-runs the first lookup for each flagged request; a refund
    that happened answers the sender with REFUND_REPLY in its thread and takes the flag off."""

    def test_a_balance_refusal_gets_one_holding_reply_and_one_store_of_both_flags_and_writes_no_file(self):
        before = sorted(os.listdir(self.dir))
        inbox = [mail(received=days_ago(2))]
        with mock.patch.object(brand_mail, "write_json_atomic", side_effect=AssertionError("respond-refunds writes no file")):
            code, out, err, runner = self.respond(inbox, "--apply", runner=Runner(*BALANCE))
        self.assertEqual(code, 0, err)  # a known wait, not a failure
        (reply,) = self.replies()
        self.assertEqual(reply["To"], BUYER)
        self.assertEqual(reply["In-Reply-To"], "<req-1@example.org>")
        self.assertEqual(reply["Auto-Submitted"], "auto-replied")
        self.assertEqual(reply.get_content().strip(), brand_mail.HOLDING_REPLY)
        self.assertEqual(FakeIMAP.instances[0].store_ops, [(1, "+FLAGS", "(\\Answered \\Flagged)")])
        self.assertEqual(inbox[0]["flags"], WAITING)
        # No file anywhere: not in this test's directory, not the old state/colony/refund-retries.json, no path for one.
        self.assertEqual(sorted(os.listdir(self.dir)), before)
        self.assertFalse(os.path.exists(os.path.join(REPO_ROOT, "state", "colony", "refund-retries.json")))
        self.assertFalse(hasattr(brand_mail, "REFUND_RETRIES"))
        report = json.loads(out)
        self.assertEqual(report["waiting"], 1)
        self.assertIn("holding reply", report["handled"][0]["outcome"])
        self.assertEqual(brand_mail.WAITING_FLAG, "\\Flagged")
        # Once: the next run finds the request by its flag, runs the first lookup again, and on the balance again sends
        # nothing and stores nothing.
        FakeSMTP.instances = []
        with mock.patch.object(brand_mail, "write_json_atomic", side_effect=AssertionError("respond-refunds writes no file")):
            code, out, err, again = self.respond(inbox, "--apply", runner=Runner(*BALANCE))
        self.assertEqual(code, 0, err)
        self.assertEqual(again.calls, [(BUYER, days_ago(2), True)])
        self.assertEqual(self.replies(), [])
        self.assertEqual(FakeIMAP.instances[-1].store_ops, [])
        self.assertEqual(inbox[0]["flags"], WAITING)
        report = json.loads(out)
        self.assertEqual(report["waiting"], 1)
        self.assertIn("kept", report["retries"][0]["outcome"])

    def test_a_flagged_request_whose_lookup_now_refunds_is_answered_in_its_thread_and_unflagged(self):
        for answer in (REFUNDED, ALREADY):
            FakeSMTP.instances = []
            inbox = [mail(received=days_ago(2))]
            self.respond(inbox, "--apply", runner=Runner(*BALANCE))
            FakeSMTP.instances = []
            later = NOW + dt.timedelta(days=5)
            code, out, err, runner = self.respond(inbox, "--apply", runner=Runner(*answer), now=later)
            self.assertEqual(code, 0, err)
            # The first lookup again, by the request's own sender, the window measured at the request.
            self.assertEqual(runner.calls, [(BUYER, days_ago(2), True)], answer)
            (reply,) = self.replies()
            self.assertEqual(reply["To"], BUYER)
            self.assertEqual(reply["In-Reply-To"], "<req-1@example.org>")
            self.assertEqual(reply.get_content().strip(), brand_mail.REFUND_REPLY)
            self.assertEqual(FakeIMAP.instances[-1].store_ops, [(1, "-FLAGS", "(\\Flagged)")], answer)
            self.assertEqual(inbox[0]["flags"], {"\\Answered"})
            report = json.loads(out)
            self.assertEqual(report["waiting"], 0)
            self.assertEqual(report["retries"][0]["uid"], "1")
            self.assertIn("answered", report["retries"][0]["outcome"])
            # Nothing left to retry: no flag, no unanswered request, no command.
            FakeSMTP.instances = []
            code, out, err, idle = self.respond(inbox, "--apply", runner=Runner(*REFUNDED), now=later)
            self.assertEqual(code, 0, err)
            self.assertEqual(idle.calls, [])
            self.assertEqual(self.replies(), [])

    def test_a_second_request_for_a_sale_already_waiting_is_marked_answered_only(self):
        inbox = [flagged(received=days_ago(2)),
                 mail(message_id="<req-2@example.org>", body="still waiting for my refund", received=days_ago(0.5))]
        code, out, err, runner = self.respond(inbox, "--apply", runner=Runner(*BALANCE))
        self.assertEqual(code, 0, err)
        self.assertEqual(len(runner.calls), 2)  # the flagged request's lookup, then the new one's
        self.assertEqual(self.replies(), [])  # no second holding reply
        self.assertEqual(FakeIMAP.instances[-1].store_ops, [(2, "+FLAGS", "(\\Answered)")])  # no second flag
        self.assertEqual(inbox[1]["flags"], {"\\Answered"})
        self.assertEqual(inbox[0]["flags"], WAITING)
        self.assertIn("already waiting", json.loads(out)["handled"][0]["outcome"])

    def test_the_same_buyer_writing_from_two_addresses_in_one_run_gets_one_holding_reply_and_one_flag(self):
        account = "account@example.org"
        inbox = [mail(received=days_ago(2)),
                 mail(sender=account, auth=(GOOD_AR.replace(BUYER, account),), message_id="<r2@example.org>", received=days_ago(1))]
        code, out, err, runner = self.respond(inbox, "--apply", runner=Runner(*BALANCE))
        self.assertEqual(code, 0, err)
        self.assertEqual(len(runner.calls), 2)
        self.assertEqual([r.get_content().strip() for r in self.replies()], [brand_mail.HOLDING_REPLY])
        self.assertEqual(FakeIMAP.instances[0].store_ops, [(1, "+FLAGS", "(\\Answered \\Flagged)"), (2, "+FLAGS", "(\\Answered)")])
        self.assertEqual(json.loads(out)["waiting"], 1)

    def test_none_or_a_stop_on_a_flagged_request_keeps_its_flag_and_fails_the_run(self):
        # The holding reply said the refund will be issued: a quiet "nothing to refund" (the window shrank, the sale is
        # disputed), a result line that is not the last one, a dry-run line under --apply, a balance exit that names no
        # sale and every other stop are never taken as done.
        for answer in (NONE, (0, []), (0, ["refund: dry-run (sale sale-A) - dry run"]),
                       (0, ["refund: refunded (sale sale-A)", "refund: none"]),
                       (1, ["STOPPED: GET /v2/sales was refused live (HTTP 500); nothing was refunded."]),
                       (brand_mail.BALANCE_EXIT, ["STOPPED: something"]), (124, ["the refund command did not finish"])):
            FakeSMTP.instances = []
            inbox = [flagged(received=days_ago(2))]
            code, out, err, _ = self.respond(inbox, "--apply", runner=Runner(*answer))
            self.assertEqual(code, 1, answer)
            self.assertEqual(self.replies(), [], answer)
            self.assertEqual(FakeIMAP.instances[-1].store_ops, [], answer)
            self.assertEqual(inbox[0]["flags"], WAITING, answer)
            report = json.loads(out)
            self.assertIn("kept", report["retries"][0]["outcome"], answer)
            self.assertEqual(report["waiting"], 1, answer)

    def test_an_answer_that_cannot_be_sent_keeps_the_flag_so_the_next_run_answers(self):
        inbox = [flagged(received=days_ago(2))]
        FakeSMTP.fail = OSError("connection reset")
        code, out, err, _ = self.respond(inbox, "--apply", runner=Runner(*REFUNDED))
        self.assertEqual(code, 1)
        self.assertEqual(FakeIMAP.instances[-1].store_ops, [])
        self.assertEqual(inbox[0]["flags"], WAITING)
        self.assertIn("kept", json.loads(out)["retries"][0]["outcome"])
        FakeSMTP.fail = None
        # The next run finds the sale refunded by the last one: "already-refunded" is a refund that happened.
        code, out, err, _ = self.respond(inbox, "--apply", runner=Runner(*ALREADY))
        self.assertEqual(code, 0, err)
        self.assertEqual([r.get_content().strip() for r in self.replies()], [brand_mail.REFUND_REPLY])
        self.assertEqual(inbox[0]["flags"], {"\\Answered"})

    def test_a_holding_reply_that_cannot_be_sent_stores_nothing_and_leaves_the_request_for_the_next_run(self):
        FakeSMTP.fail = OSError("connection reset")
        inbox = [mail(received=days_ago(2))]
        code, out, err, runner = self.respond(inbox, "--apply", runner=Runner(*BALANCE))
        self.assertEqual(code, 1)
        self.assertEqual(FakeIMAP.instances[0].store_ops, [])
        self.assertEqual(inbox[0]["flags"], set())
        self.assertEqual(json.loads(out)["waiting"], 0)

    def test_a_flagged_mail_that_is_not_a_verified_refund_request_is_left_alone_and_counted(self):
        # A stray star is harmless by construction: never answered, never unflagged, never a refund command.
        stray = [
            flagged(body="How do I activate the key?", subject="Pro", message_id="<s1@example.org>"),
            flagged(sender=VICTIM, auth=(FAIL_AR,), message_id="<s2@example.net>"),
            flagged(extra=(("Auto-Submitted", "auto-replied"),), message_id="<s3@example.org>"),
            flagged(subject="נגישות והחזר", body="refund", message_id="<s4@example.org>"),
            flagged(sender=BRAND, body="refund", auth=(GOOD_AR.replace(BUYER, BRAND).replace("example.org", "brand.example"),)),
        ]
        code, out, err, runner = self.respond(stray, "--apply", runner=Runner(*REFUNDED))
        self.assertEqual(code, 0, err)
        self.assertEqual(runner.calls, [])
        self.assertEqual(self.replies(), [])
        self.assertEqual(FakeIMAP.instances[-1].store_ops, [])
        for m in stray:
            self.assertEqual(m["flags"], WAITING)
        report = json.loads(out)
        self.assertEqual(report["flaggedIgnored"], len(stray))
        self.assertEqual(report["waiting"], 0)
        self.assertEqual(report["retries"], [])

    def test_a_dry_run_examines_stores_nothing_and_says_what_it_would_do(self):
        other = "b2@example.org"
        inbox = [flagged(received=days_ago(3)), flagged(sender=other, auth=(GOOD_AR.replace(BUYER, other),), message_id="<r2@example.org>", received=days_ago(3)),
                 mail(sender="b3@example.org", auth=(GOOD_AR.replace(BUYER, "b3@example.org"),), message_id="<r3@example.org>", received=days_ago(1))]
        answers = [(0, ["dry run: would refund sale sale-A in full", "refund: dry-run (sale sale-A) - dry run"]),
                   (0, ["refund: already-refunded (sale sale-B) - dry run"]), BALANCE]
        code, out, err, runner = self.respond(inbox, runner=Runner(answers=answers))
        self.assertEqual(code, 0, err)
        (imap,) = FakeIMAP.instances
        self.assertEqual(imap.selects, [("INBOX", True)])  # EXAMINE
        self.assertEqual(imap.store_ops, [])
        self.assertEqual(FakeSMTP.instances, [])
        self.assertEqual([c[2] for c in runner.calls], [False, False, False])
        report = json.loads(out)
        self.assertTrue(report["dryRun"])
        for record in report["retries"] + report["handled"]:
            self.assertTrue(record["outcome"].startswith("dry run"), record)
            self.assertIn("would", record["outcome"], record)
        self.assertEqual([m["flags"] for m in inbox], [WAITING, WAITING, set()])
        # A dry run's "none" on a flagged request still fails, so a session looks before the schedule does.
        code, out, err, _ = self.respond([flagged(received=days_ago(3))], runner=Runner(*NONE))
        self.assertEqual(code, 1)

    def test_the_bound_covers_flagged_and_new_requests_together(self):
        n = brand_mail.MAX_REFUND_REQUESTS_PER_RUN
        who = lambda tag, i: "%s%d@example.org" % (tag, i)
        waiting = [flagged(sender=who("f", i), auth=(GOOD_AR.replace(BUYER, who("f", i)),), message_id="<f%d@example.org>" % i,
                           received=days_ago(3)) for i in range(n - 2)]
        new = [mail(sender=who("n", i), auth=(GOOD_AR.replace(BUYER, who("n", i)),), message_id="<n%d@example.org>" % i,
                    received=days_ago(1)) for i in range(5)]
        inbox = waiting + new
        code, out, err, runner = self.respond(inbox, "--apply", runner=BySender())
        self.assertEqual(code, 0, err)
        self.assertEqual(len(runner.calls), n)
        # The waiting requests first, then the new ones while the bound allows.
        self.assertEqual([c[0] for c in runner.calls], [who("f", i) for i in range(n - 2)] + [who("n", 0), who("n", 1)])
        report = json.loads(out)
        self.assertEqual(report["left"], 3)
        self.assertEqual(report["waiting"], n)  # n - 2 kept, 2 newly flagged
        # Bounded by the flagged requests alone too: the ones beyond it stay flagged, counted as left and as waiting.
        many = [flagged(sender=who("g", i), auth=(GOOD_AR.replace(BUYER, who("g", i)),), message_id="<g%d@example.org>" % i,
                        received=days_ago(3)) for i in range(n + 2)]
        code, out, err, runner = self.respond(many, "--apply", runner=BySender())
        self.assertEqual(code, 0, err)
        self.assertEqual(len(runner.calls), n)
        report = json.loads(out)
        self.assertEqual(report["left"], 2)
        self.assertEqual(report["waiting"], n + 2)
        self.assertTrue(all(m["flags"] == WAITING for m in many))

    def test_the_printed_report_carries_no_sale_id_and_no_address(self):
        leaky = ["PUT /v2/sales/sale-B%3D%3D/refund -> HTTP 200 success=false", "echo %s" % BUYER,
                 "STOPPED: Gumroad refused the refund of sale sale-B== for balance. Sale sale-B== is not refunded."]
        texts = []
        inbox = [mail(received=days_ago(2))]
        # A balance refusal (its lines, then the holding reply), a retry on the balance again, a retry that refunds,
        # and a stop on a new request: every line the command prints reaches the report redacted.
        for answer in (BALANCE, (BALANCE[0], leaky + BALANCE_LINES), REFUNDED):
            FakeSMTP.instances = []
            code, out, err, _ = self.respond(inbox, "--apply", runner=Runner(*answer))
            self.assertEqual(code, 0, err)
            texts.append(out + err)
        code, out, err, _ = self.respond([mail(message_id="<x@example.org>")], "--apply",
                                         runner=Runner(1, ["STOPPED: PUT /v2/sales/sale-A/refund was refused live (HTTP 500). Sale sale-A is not refunded."]))
        self.assertEqual(code, 1)
        texts.append(out + err)
        for text in texts:
            for leak in ("sale-A", "sale-B", BUYER, "buyer.one", BRAND):
                self.assertNotIn(leak, text, leak)
        joined = "".join(texts)
        self.assertIn("[id]", joined)
        self.assertIn("[address]", joined)  # redacted, not dropped
        report = json.loads(texts[0])
        self.assertIn("refund: balance-insufficient (sale [id])", report["handled"][0]["refundLog"])
        self.assertIn("PUT /v2/sales/[id]/refund -> HTTP 200 success=false", report["handled"][0]["refundLog"])
        self.assertEqual(brand_mail.redact_sale_ids(["refund: refunded (sale A-x1==)", "GET /v2/sales -> HTTP 200", "sales of this product: 1"]),
                         ["refund: refunded (sale [id])", "GET /v2/sales -> HTTP 200", "sales of this product: 1"])

    def test_the_flagged_search_has_no_date_bound(self):
        # A refund promised long ago is retried until it happens, not for REFUND_LOOKBACK_DAYS.
        inbox = [flagged(received=days_ago(200))]
        code, out, err, runner = self.respond(inbox, "--apply", runner=Runner(*BALANCE))
        self.assertEqual(code, 0, err)
        searches = FakeIMAP.instances[-1].searches
        self.assertEqual(searches[0], ("FLAGGED",))  # first, and with no SINCE
        self.assertEqual(sum(1 for s in searches if s[:1] == ("FLAGGED",)), 1)
        self.assertEqual(runner.calls, [(BUYER, days_ago(200), True)])
        self.assertEqual(json.loads(out)["waiting"], 1)

    def test_the_retry_runs_refund_by_the_senders_address_at_the_requests_internaldate_never_by_sale_id(self):
        ahead = NOW + dt.timedelta(minutes=5)  # the server's clock may run ahead of this runner's
        inbox = [flagged(received=ahead)]
        argvs = []

        def fake_run(argv, **kw):
            argvs.append(argv)
            return subprocess.CompletedProcess(argv, brand_mail.BALANCE_EXIT, stdout="refund: balance-insufficient (sale sale-A)\n", stderr="")

        out = io.StringIO()
        with mock.patch.object(brand_mail.subprocess, "run", fake_run):
            code = brand_mail.main(["respond-refunds", "--apply"], env=MAIN, stdout=out, stderr=io.StringIO(), now=NOW,
                                   smtp_factory=FakeSMTP, imap_factory=lambda *a, **k: FakeIMAP(inbox))
        self.assertEqual(code, 0, out.getvalue())
        self.assertEqual(argvs, [["node", brand_mail.PRODUCT_SCRIPT, "refund", "--email", BUYER, "--requested-at",
                                  "2026-10-20T12:05:00Z", "--apply"]])
        self.assertNotIn("--sale", argvs[0])
        self.assertFalse(hasattr(brand_mail, "node_retry_runner"))

    def test_a_buyer_whose_flagged_request_is_answered_gets_one_reply_even_with_a_follow_up_waiting(self):
        # One answer per sender per run, the flagged requests' answers included.
        inbox = [flagged(received=days_ago(2)),
                 mail(message_id="<req-2@example.org>", body="עדיין מחכה להחזר שלי", received=days_ago(0.5))]
        code, out, err, runner = self.respond(inbox, "--apply", runner=Runner(*REFUNDED))
        self.assertEqual(code, 0, err)
        self.assertEqual([r.get_content().strip() for r in self.replies()], [brand_mail.REFUND_REPLY])
        self.assertEqual(len(runner.calls), 1)  # covered by the flagged request's answer: no second refund command
        self.assertEqual(FakeIMAP.instances[-1].store_ops, [(1, "-FLAGS", "(\\Flagged)"), (2, "+FLAGS", "(\\Answered)")])
        (handled,) = json.loads(out)["handled"]
        self.assertIn("covered", handled["outcome"])

    def test_two_flagged_requests_of_one_sender_answer_once(self):
        inbox = [flagged(received=days_ago(3), message_id="<a@example.org>"), flagged(received=days_ago(2), message_id="<b@example.org>")]
        code, out, err, runner = self.respond(inbox, "--apply", runner=Runner(answers=[REFUNDED, ALREADY]))
        self.assertEqual(code, 0, err)
        self.assertEqual(len(self.replies()), 1)
        self.assertEqual(len(runner.calls), 2)
        self.assertEqual([m["flags"] for m in inbox], [{"\\Answered"}, {"\\Answered"}])
        self.assertIn("covered", json.loads(out)["retries"][1]["outcome"])

    def test_a_balance_line_from_a_command_that_did_not_exit_3_is_a_stop(self):
        code, out, err, _ = self.respond([mail()], "--apply", runner=Runner(1, ["refund: balance-insufficient (sale sale-A)"]))
        self.assertEqual(code, 1)
        self.assertEqual(self.replies(), [])
        self.assertEqual(FakeIMAP.instances[0].store_ops, [])

    def test_a_balance_exit_without_a_sale_id_is_a_stop_not_a_wait(self):
        inbox = [mail()]
        code, out, err, _ = self.respond(inbox, "--apply", runner=Runner(brand_mail.BALANCE_EXIT, ["STOPPED: something"]))
        self.assertEqual(code, 1)
        self.assertEqual(self.replies(), [])
        self.assertEqual(FakeIMAP.instances[0].store_ops, [])
        self.assertEqual(inbox[0]["flags"], set())

    def test_the_holding_reply_states_facts_and_promises_no_date(self):
        s = brand_mail.HOLDING_REPLY
        self.assertIn("תשובה אוטומטית", s)
        self.assertIn("Mehudak (מהודק)", s)
        self.assertIn("התקבלה", s)
        self.assertIn("Gumroad", s)
        self.assertIn("דרך הקבלה", s)  # the buyer may also write to Gumroad through its receipt
        self.assertNotRegex(s, r"\d")
        for word in ("ימים", "שעות", "עד ה", "תוך", "מובטח", "בקרוב", "מיד", "יוחזר ב", "within", "days"):
            self.assertNotIn(word, s)
        self.assertNotEqual(s, brand_mail.REFUND_REPLY)


class RefundRunnerTests(unittest.TestCase):
    def test_runs_the_product_command_as_arguments_never_a_shell_with_only_the_token_and_path(self):
        seen = {}

        def fake_run(argv, **kw):
            seen["argv"], seen["kw"] = argv, kw
            return subprocess.CompletedProcess(argv, 0, stdout="refund: none\n", stderr="trace %s\n" % BUYER)

        with mock.patch.object(brand_mail.subprocess, "run", fake_run):
            code, lines = brand_mail.node_refund_runner(BUYER, days_ago(2), False, dict(MAIN, PATH="/usr/bin", OTHER="x"))
        self.assertEqual(code, 0)
        self.assertEqual(lines, ["refund: none"])  # stderr (a stack trace could quote anything) is not kept
        self.assertEqual(seen["argv"], ["node", brand_mail.PRODUCT_SCRIPT, "refund", "--email", BUYER,
                                        "--requested-at", "2026-10-18T12:00:00Z"])
        self.assertNotIn("shell", seen["kw"])
        self.assertEqual(seen["kw"]["env"], {"PATH": "/usr/bin", "GUMROAD_ACCESS_TOKEN": TOKEN})
        with mock.patch.object(brand_mail.subprocess, "run", fake_run):
            brand_mail.node_refund_runner(BUYER, days_ago(2), True, MAIN)
        self.assertEqual(seen["argv"][-1], "--apply")

    def test_a_command_that_hangs_is_a_failure(self):
        def slow(argv, **kw):
            raise subprocess.TimeoutExpired(argv, kw.get("timeout"))

        with mock.patch.object(brand_mail.subprocess, "run", slow):
            code, lines = brand_mail.node_refund_runner(BUYER, NOW, True, MAIN)
        self.assertNotEqual(code, 0)

    def test_the_site_json_is_the_one_the_refund_command_reads(self):
        self.assertEqual(brand_mail.SITE_JSON, os.path.join(REPO_ROOT, "products", "il-biz-tools", "src", "config", "site.json"))
        self.assertIsInstance(brand_mail.pro_product_id(), str)

    def test_the_product_script_is_the_il_biz_tools_one(self):
        self.assertEqual(brand_mail.PRODUCT_SCRIPT, os.path.join(REPO_ROOT, "products", "il-biz-tools", "scripts", "gumroad-pro-product.js"))
        self.assertTrue(os.path.isfile(brand_mail.PRODUCT_SCRIPT))


class ProbeRespondersTests(unittest.TestCase):
    """probe writes responders ["gumroad-refund"] only when respond-refunds exists and brand-mail.yml schedules it."""

    def workflow(self, text):
        fd, path = tempfile.mkstemp(suffix=".yml")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text)
        self.addCleanup(os.remove, path)
        return path

    def test_the_real_workflow_schedules_the_responder(self):
        self.assertTrue(brand_mail.refund_responder_scheduled())
        self.assertEqual(brand_mail.responders_in_force(), ["gumroad-refund"])

    REAL = open(brand_mail.WORKFLOW, encoding="utf-8").read()
    JOB_IF = "    if: github.event_name == 'schedule' || inputs.command == 'respond-refunds'\n"
    RESPOND = "      - name: Respond to refund requests (a dry run unless scheduled or really_refund)\n"
    GUARD_IF = "        if: github.event_name == 'workflow_dispatch' && inputs.really_refund\n"
    PERMISSIONS = "    permissions:\n      contents: read\n"
    # The condition of the balance-retries commit step that RULING-2026-10-05-refund-state (b) removed with the step.
    OLD_COMMIT_IF = "        if: always() && steps.respond.outcome != 'skipped'\n"

    def edited(self, old, new, after=None):
        """The real workflow with `old` replaced once - in the part from `after` on, when given."""
        at = self.REAL.index(after) if after else 0
        head, tail = self.REAL[:at], self.REAL[at:]
        self.assertEqual(tail.count(old), 1, old)
        return head + tail.replace(old, new)

    def scheduled(self, text):
        return brand_mail.refund_responder_scheduled(self.workflow(text))

    def test_the_pinned_lines_are_the_workflows_own(self):
        for line in (self.JOB_IF, self.RESPOND, self.GUARD_IF, self.PERMISSIONS):
            self.assertEqual(self.REAL.count(line), 1, line)
        self.assertTrue(self.scheduled(self.REAL))

    def test_a_job_that_no_longer_refunds_on_the_schedule_means_none(self):
        """Fixer review of 29.9, finding 2: each of these runs green and answers no one."""
        cases = {
            "job if always false": self.edited(self.JOB_IF, self.JOB_IF.replace("'respond-refunds'", "'respond-refunds' && false")),
            "job if schedule and false": self.edited(self.JOB_IF, "    if: github.event_name == 'schedule' && false\n"),
            "no --apply on the schedule": self.edited("then ARGS+=(--apply); fi", "then :; fi"),
            "probe instead": self.edited("ARGS=(respond-refunds)", "ARGS=(probe)"),
            "a step if skipping the respond step": self.edited(self.RESPOND, self.RESPOND + "        if: github.event_name != 'schedule'\n"),
            "the guard's if on the respond step": self.edited(self.RESPOND, self.RESPOND + self.GUARD_IF),
            "the guard's if loosened": self.edited(self.GUARD_IF, "        if: always()\n"),
            # RULING-2026-10-05-refund-state (b): the responder commits nothing, so the old commit step's condition is
            # allowed nowhere; and the job reads the repository only - its permissions are exactly contents: read, so a
            # write token put back beside the mailbox secrets stops the probe vouching for it, and enable refuses.
            "the old commit step's if on the respond step": self.edited(self.RESPOND, self.RESPOND + self.OLD_COMMIT_IF),
            "the old commit step's if in place of the guard's": self.edited(self.GUARD_IF, self.OLD_COMMIT_IF),
            "contents: write on the job": self.edited("      contents: read\n", "      contents: write\n"),
            "no permissions block on the job": self.edited(self.PERMISSIONS, ""),
            "write-all on the job": self.edited(self.PERMISSIONS, "    permissions: write-all\n"),
            "read-all on the job": self.edited(self.PERMISSIONS, "    permissions: read-all\n"),
            "a second scope beside contents: read": self.edited(self.PERMISSIONS, self.PERMISSIONS + "      actions: write\n"),
            "a dependency that is skipped": self.edited(self.JOB_IF, self.JOB_IF + "    needs: send\n"),
            "an environment without the secrets": self.edited("    environment: brand-mailbox\n", "    environment: brand-mailbox-old\n", after=self.JOB_IF),
            "no Gumroad token": self.edited("          GUMROAD_ACCESS_TOKEN: ${{ secrets.GUMROAD_ACCESS_TOKEN }}\n", ""),
            "no mailbox password": self.edited("          BRAND_MAIL_APP_PASSWORD: ${{ secrets.BRAND_MAIL_APP_PASSWORD }}\n", "", after=self.RESPOND),
            "no event": self.edited("          EVENT: ${{ github.event_name }}\n", "", after=self.RESPOND),
            "the script only echoed": self.edited('          python scripts/brand_mail.py "${ARGS[@]}"', '          echo python scripts/brand_mail.py "${ARGS[@]}"', after=self.RESPOND),
            "an exit before the call": self.edited("          ARGS=(respond-refunds)\n", "          ARGS=(respond-refunds)\n          exit 0\n"),
            "no schedule": self.edited('    - cron: "17 5,17 * * *"\n', ""),
            "the job renamed": self.edited("  respond-refunds:\n", "  respond-refunds-off:\n"),
            "empty": "",
        }
        self.assertNotIn(self.REAL, cases.values())
        for why, text in cases.items():
            self.assertFalse(self.scheduled(text), why)
        self.assertFalse(brand_mail.refund_responder_scheduled(os.path.join(tempfile.gettempdir(), "absent-workflow.yml")))

    def test_comments_blank_lines_and_the_order_of_the_env_do_not_matter(self):
        commented = self.edited(self.RESPOND, "      # a note\n\n" + self.RESPOND)
        reordered = self.edited("          EVENT: ${{ github.event_name }}\n          REALLY_REFUND: ${{ inputs.really_refund }}\n",
                                "          REALLY_REFUND: ${{ inputs.really_refund }}\n          EVENT: ${{ github.event_name }}\n",
                                after=self.RESPOND)
        noted = self.edited(self.PERMISSIONS, "    permissions:\n      # it commits nothing\n\n      contents: read\n")
        for text in (commented, reordered, noted):
            self.assertTrue(self.scheduled(text))

    def test_without_the_command_in_this_script_there_is_no_responder(self):
        with mock.patch.object(brand_mail, "COMMANDS", ("send", "probe")):
            self.assertFalse(brand_mail.refund_responder_scheduled())
            self.assertEqual(brand_mail.responders_in_force(), [])

    def test_the_probe_writes_the_list(self):
        with mock.patch.object(brand_mail, "responders_in_force", return_value=[]):
            reading = self.probe()
        self.assertEqual(reading["responders"], [])
        self.assertEqual(self.probe()["responders"], ["gumroad-refund"])

    def probe(self):
        empty = {"INBOX": [], "[Gmail]/All Mail": [], "[Gmail]/Sent Mail": []}
        lines = [b'(\\HasNoChildren) "/" "INBOX"', b'(\\All) "/" "[Gmail]/All Mail"', b'(\\Sent) "/" "[Gmail]/Sent Mail"']

        class Box:
            def __init__(self, *_a, **_k):
                self.current = None

            def login(self, *_a):
                pass

            def list(self, *_a):
                return "OK", lines

            def select(self, name, readonly=False):
                assert readonly
                return "OK", [b"0"]

            def search(self, *_a):
                return "OK", [b""]

            def logout(self):
                pass

        d = tempfile.mkdtemp()
        self.addCleanup(lambda: __import__("shutil").rmtree(d, ignore_errors=True))
        sent, questions = os.path.join(d, "sent.json"), os.path.join(d, "questions.json")
        with open(sent, "w") as f:
            json.dump({"sent": [], "repliesRecorded": []}, f)
        with open(questions, "w") as f:
            json.dump({"venues": []}, f)
        out = io.StringIO()
        code = brand_mail.main(["probe", "--questions", questions, "--sent", sent], env=ENV, stdout=out, stderr=io.StringIO(),
                               now=NOW, smtp_factory=refuse, imap_factory=Box)
        self.assertEqual(code, 0)
        return json.loads(out.getvalue())


if __name__ == "__main__":
    unittest.main()
