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


class FakeIMAP:
    """IMAP4_SSL for respond-refunds: UID SEARCH/FETCH/STORE on INBOX; records selects and stores."""

    instances = []

    def __init__(self, inbox, host=None, port=None, ssl_context=None, timeout=None):
        self.inbox = inbox  # [message dict], uid = index + 1
        self.selects, self.stores, self.fetches, self.searches, self.logged_out = [], [], [], [], False
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
            assert args[:3] == ("NOT", "ANSWERED", "SINCE") or args[:2] == ("ANSWERED", "SINCE"), args
            answered = args[0] == "ANSWERED"
            since = dt.datetime.strptime(args[-1], "%d-%b-%Y").replace(tzinfo=UTC)
            uids = [str(i + 1).encode() for i, m in enumerate(self.inbox)
                    if ("\\Answered" in m["flags"]) == answered and m["received"] >= since]
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
            assert (op, flags) == ("+FLAGS", "(\\Answered)"), (op, flags)
            self.stores.append(int(uid))
            self.inbox[int(uid) - 1]["flags"].add("\\Answered")
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
    """The refund command, faked: records every call; `code` and `lines` say what it answers."""

    def __init__(self, code=0, lines=("refund: none",)):
        self.calls, self.code, self.lines = [], code, list(lines)

    def __call__(self, sender, requested_at, apply, env):
        self.calls.append((sender, requested_at, apply))
        return self.code, list(self.lines)


class RetryRunner:
    """`refund --sale`, faked: records (sale id, requested at, apply); `answers` pops one (code, lines) per call."""

    def __init__(self, *answers):
        self.calls, self.answers = [], list(answers) or [(0, ["refund: refunded (sale sale-A)"])]

    def __call__(self, sale_id, requested_at, apply, env):
        self.calls.append((sale_id, requested_at, apply))
        return self.answers.pop(0) if len(self.answers) > 1 else self.answers[0]


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
        # The balance retries live in a scratch file, never the repository's state/colony/refund-retries.json.
        self.retries = os.path.join(self.dir, "refund-retries.json")
        patcher = mock.patch.object(brand_mail, "REFUND_RETRIES", self.retries)
        patcher.start()
        self.addCleanup(patcher.stop)

    def site(self, product_id):
        path = write_json(self.dir, "site.json", {"gumroad": {"productId": product_id, "productUrl": ""}})
        patcher = mock.patch.object(brand_mail, "SITE_JSON", path)
        patcher.start()
        self.addCleanup(patcher.stop)

    def respond(self, inbox, *flags, env=None, runner=None, smtp=FakeSMTP, retry_runner=None, now=NOW):
        out, err = io.StringIO(), io.StringIO()
        runner = runner or Runner()
        code = brand_mail.main(
            ["respond-refunds", *flags], env=MAIN if env is None else env, stdout=out, stderr=err, now=now,
            smtp_factory=smtp, imap_factory=lambda host, port, ssl_context=None, timeout=None: FakeIMAP(inbox),
            refund_runner=runner, retry_runner=retry_runner or refuse,
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

    def test_the_reply_is_one_fixed_sentence_that_says_nothing_about_a_purchase(self):
        s = brand_mail.REFUND_REPLY
        self.assertEqual(s.count("."), 1)
        self.assertTrue(s.endswith("."))
        self.assertIn("Mehudak (מהודק)", s)
        self.assertIn("תשובה אוטומטית", s)  # an automated answer says it is one
        self.assertIn("Gumroad", s)
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
        (search,) = FakeIMAP.instances[0].searches
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


BALANCE_LINES = ["STOPPED: Gumroad refused the refund of sale sale-A for balance", "refund: balance-insufficient (sale sale-A)"]


class BalanceRetryTests(RespondHarness):
    """RULING-2026-09-30-documents (d), fold action 5: a refund Gumroad refuses for balance (the refund command's exit 3)
    gets one facts-only holding reply, is marked answered, and is retried by sale id at the start of every run until it
    goes through; then the ordinary REFUND_REPLY goes out and the retry is dropped. The state holds sale ids and times,
    never an address or a name."""

    def state(self):
        if not os.path.exists(self.retries):
            return None
        with open(self.retries, encoding="utf-8") as f:
            return json.load(f)

    def refused(self, inbox=None, **kw):
        inbox = inbox if inbox is not None else [mail(received=days_ago(2))]
        return inbox, self.respond(inbox, "--apply", runner=Runner(brand_mail.BALANCE_EXIT, BALANCE_LINES), **kw)

    def test_a_balance_refusal_gets_the_holding_reply_once_is_marked_answered_and_leaves_a_retry(self):
        inbox, (code, out, err, runner) = self.refused()
        self.assertEqual(code, 0, err)  # a known wait, not a failure
        (reply,) = self.replies()
        self.assertEqual(reply["To"], BUYER)
        self.assertEqual(reply["In-Reply-To"], "<req-1@example.org>")
        self.assertEqual(reply["Auto-Submitted"], "auto-replied")
        self.assertEqual(reply.get_content().strip(), brand_mail.HOLDING_REPLY)
        self.assertEqual(FakeIMAP.instances[0].stores, [1])
        self.assertEqual(self.state(), [{"saleId": "sale-A", "requestedAt": "2026-10-18T12:00:00Z", "holdingReplySentAt": "2026-10-20T12:00:00Z"}])
        self.assertIn("holding reply", json.loads(out)["handled"][0]["outcome"])
        # Once: the next run finds the request answered and sends nothing new; the retry is what runs.
        FakeSMTP.instances = []
        still = RetryRunner((brand_mail.BALANCE_EXIT, BALANCE_LINES))
        code, out, err, runner = self.respond(inbox, "--apply", retry_runner=still)
        self.assertEqual(code, 0, err)
        self.assertEqual(runner.calls, [])
        self.assertEqual(still.calls, [("sale-A", days_ago(2), True)])
        self.assertEqual(self.replies(), [])
        self.assertEqual(len(self.state()), 1)

    def test_a_later_success_sends_the_refund_reply_in_the_request_thread_and_clears_the_retry(self):
        inbox, _ = self.refused()
        FakeSMTP.instances = []
        later = NOW + dt.timedelta(days=5)
        ok = RetryRunner((0, ["refund: refunded (sale sale-A)"]))
        code, out, err, runner = self.respond(inbox, "--apply", retry_runner=ok, now=later)
        self.assertEqual(code, 0, err)
        # The window is measured at the original request, not at this run.
        self.assertEqual(ok.calls, [("sale-A", days_ago(2), True)])
        (reply,) = self.replies()
        self.assertEqual(reply["To"], BUYER)
        self.assertEqual(reply["In-Reply-To"], "<req-1@example.org>")
        self.assertEqual(reply.get_content().strip(), brand_mail.REFUND_REPLY)
        self.assertEqual(self.state(), [])
        self.assertIn("answered", json.loads(out)["retries"][0]["outcome"])
        # Nothing left to retry.
        FakeSMTP.instances = []
        code, out, err, _ = self.respond(inbox, "--apply", retry_runner=refuse, now=later)
        self.assertEqual(code, 0, err)
        self.assertEqual(self.replies(), [])

    def test_the_state_file_never_holds_an_address_or_a_name(self):
        inbox = [mail(received=days_ago(2)),
                 mail(sender="b2@example.org", auth=(GOOD_AR.replace(BUYER, "b2@example.org"),), message_id="<r2@example.org>",
                      received=days_ago(1))]
        def runner(sender, requested_at, apply, env):
            return brand_mail.BALANCE_EXIT, ["refund: balance-insufficient (sale %s)" % ("sale-A" if sender == BUYER else "sale-B")]

        code, out, err, _ = self.respond(inbox, "--apply", runner=runner)
        self.assertEqual(code, 0, err)
        self.assertEqual(len(self.replies()), 2)
        with open(self.retries, encoding="utf-8") as f:
            text = f.read()
        self.assertNotIn("@", text)
        for leak in (BUYER, "buyer.one", "b2@", BRAND, "Mehudak", "מהודק"):
            self.assertNotIn(leak, text)
        for entry in json.loads(text):
            self.assertEqual(sorted(entry), ["holdingReplySentAt", "requestedAt", "saleId"])

    def test_a_second_request_for_a_sale_already_waiting_is_covered_without_a_second_holding_reply(self):
        inbox, _ = self.refused()
        FakeSMTP.instances = []
        inbox.append(mail(message_id="<req-2@example.org>", body="still waiting for my refund", received=days_ago(0.5)))
        code, out, err, runner = self.respond(inbox, "--apply", runner=Runner(brand_mail.BALANCE_EXIT, BALANCE_LINES),
                                               retry_runner=RetryRunner((brand_mail.BALANCE_EXIT, BALANCE_LINES)))
        self.assertEqual(code, 0, err)
        self.assertEqual(self.replies(), [])
        self.assertEqual(FakeIMAP.instances[-1].stores, [2])
        self.assertEqual(len(self.state()), 1)

    def test_a_retry_the_refund_command_cannot_decide_is_kept_and_fails_the_run(self):
        inbox, _ = self.refused()
        FakeSMTP.instances = []
        code, out, err, _ = self.respond(inbox, "--apply", retry_runner=RetryRunner((1, ["STOPPED: GET /v2/sales/sale-A was refused live"])))
        self.assertEqual(code, 1)
        self.assertEqual(self.replies(), [])
        self.assertEqual(len(self.state()), 1)

    def test_an_answer_that_cannot_be_sent_keeps_the_retry_so_the_next_run_answers(self):
        inbox, _ = self.refused()
        FakeSMTP.instances = []
        FakeSMTP.fail = OSError("connection reset")
        code, out, err, _ = self.respond(inbox, "--apply", retry_runner=RetryRunner((0, ["refund: refunded (sale sale-A)"])))
        self.assertEqual(code, 1)
        self.assertEqual(len(self.state()), 1)
        FakeSMTP.fail = None
        code, out, err, _ = self.respond(inbox, "--apply", retry_runner=RetryRunner((0, ["refund: none"])))
        self.assertEqual(code, 0, err)
        self.assertEqual([r.get_content().strip() for r in self.replies()], [brand_mail.REFUND_REPLY])
        self.assertEqual(self.state(), [])

    def test_a_holding_reply_that_cannot_be_sent_records_nothing_and_leaves_the_request_unanswered(self):
        FakeSMTP.fail = OSError("connection reset")
        inbox, (code, out, err, runner) = self.refused()
        self.assertEqual(code, 1)
        self.assertEqual(FakeIMAP.instances[0].stores, [])
        self.assertIsNone(self.state())

    def test_a_retry_whose_request_is_gone_from_the_inbox_is_cleared_without_an_answer(self):
        inbox, _ = self.refused()
        FakeSMTP.instances = []
        del inbox[0]  # archived or deleted since
        code, out, err, _ = self.respond(inbox, "--apply", retry_runner=RetryRunner((0, ["refund: refunded (sale sale-A)"])))
        self.assertEqual(code, 0, err)
        self.assertEqual(self.replies(), [])
        self.assertEqual(self.state(), [])
        self.assertIn("no longer", json.loads(out)["retries"][0]["outcome"])

    def test_the_answer_goes_to_the_request_received_at_the_retrys_time_and_to_no_other_answered_mail(self):
        inbox, _ = self.refused()
        FakeSMTP.instances = []
        other = "other@example.net"
        other_ar = (GOOD_AR.replace(BUYER, other).replace("example.org", "example.net"),)
        # Answered mail beside it: another buyer's refund request a day later, and at the very same second a message that
        # asks for no refund - neither is the request this retry answers.
        inbox.append(dict(mail(sender=other, auth=other_ar, message_id="<o1@example.net>", received=days_ago(1)), flags={"\\Answered"}))
        inbox.append(dict(mail(sender=other, auth=other_ar, message_id="<o2@example.net>", body="How do I activate?",
                               subject="Pro", received=days_ago(2)), flags={"\\Answered"}))
        code, out, err, _ = self.respond(inbox, "--apply", retry_runner=RetryRunner((0, ["refund: refunded (sale sale-A)"])))
        self.assertEqual(code, 0, err)
        (reply,) = self.replies()
        self.assertEqual(reply["To"], BUYER)
        self.assertEqual(reply["In-Reply-To"], "<req-1@example.org>")

    def test_two_requests_received_the_same_second_from_two_senders_answer_no_one(self):
        inbox, _ = self.refused()
        FakeSMTP.instances = []
        other = "other@example.net"
        other_ar = (GOOD_AR.replace(BUYER, other).replace("example.org", "example.net"),)
        inbox.append(dict(mail(sender=other, auth=other_ar, message_id="<o3@example.net>", received=days_ago(2)), flags={"\\Answered"}))
        code, out, err, _ = self.respond(inbox, "--apply", retry_runner=RetryRunner((0, ["refund: refunded (sale sale-A)"])))
        self.assertEqual(code, 0, err)
        self.assertEqual(self.replies(), [])
        self.assertEqual(self.state(), [])

    def test_the_same_buyer_writing_from_two_addresses_gets_one_holding_reply_for_the_one_sale(self):
        account = "account@example.org"
        inbox = [mail(received=days_ago(2)),
                 mail(sender=account, auth=(GOOD_AR.replace(BUYER, account),), message_id="<r2@example.org>", received=days_ago(1))]
        inbox, (code, out, err, runner) = self.refused(inbox)
        self.assertEqual(code, 0, err)
        self.assertEqual(len(runner.calls), 2)
        self.assertEqual([r.get_content().strip() for r in self.replies()], [brand_mail.HOLDING_REPLY])
        self.assertEqual(sorted(FakeIMAP.instances[0].stores), [1, 2])
        self.assertEqual(len(self.state()), 1)

    def test_a_balance_line_from_a_command_that_did_not_exit_3_is_a_stop(self):
        code, out, err, _ = self.respond([mail()], "--apply", runner=Runner(1, ["refund: balance-insufficient (sale sale-A)"]))
        self.assertEqual(code, 1)
        self.assertEqual(self.replies(), [])
        self.assertIsNone(self.state())

    def test_retries_are_bounded_per_run_and_their_lines_carry_no_address(self):
        entries = [{"saleId": "sale-%d" % i, "requestedAt": "2026-10-18T12:00:00Z", "holdingReplySentAt": "2026-10-18T12:00:00Z"}
                   for i in range(brand_mail.MAX_REFUND_REQUESTS_PER_RUN + 2)]
        with open(self.retries, "w", encoding="utf-8") as f:
            json.dump(entries, f)
        still = RetryRunner((brand_mail.BALANCE_EXIT, ["STOPPED: echo %s" % BUYER, "refund: balance-insufficient (sale sale-0)"]))
        code, out, err, _ = self.respond([], "--apply", retry_runner=still)
        self.assertEqual(code, 0, err)
        self.assertEqual(len(still.calls), brand_mail.MAX_REFUND_REQUESTS_PER_RUN)
        report = json.loads(out)
        self.assertEqual(report["left"], 2)
        self.assertEqual(report["waiting"], brand_mail.MAX_REFUND_REQUESTS_PER_RUN + 2)
        self.assertNotIn(BUYER, out + err)
        self.assertIn("[address]", out)

    def test_a_dry_run_retries_as_a_dry_run_and_changes_nothing(self):
        inbox, _ = self.refused()
        FakeSMTP.instances = []
        before = self.state()
        dry = RetryRunner((0, ["dry run: would refund sale sale-A"]))
        code, out, err, _ = self.respond(inbox, retry_runner=dry)
        self.assertEqual(code, 0, err)
        self.assertEqual(dry.calls, [("sale-A", days_ago(2), False)])
        self.assertEqual(self.replies(), [])
        self.assertEqual(self.state(), before)
        # And a balance refusal in a dry run records nothing and sends nothing.
        os.remove(self.retries)
        code, out, err, _ = self.respond([mail(message_id="<d@example.org>")], runner=Runner(brand_mail.BALANCE_EXIT, BALANCE_LINES))
        self.assertEqual(code, 0, err)
        self.assertIsNone(self.state())
        self.assertEqual(FakeSMTP.instances, [])

    def test_a_balance_exit_without_a_sale_id_is_a_stop_not_a_wait(self):
        inbox = [mail()]
        code, out, err, _ = self.respond(inbox, "--apply", runner=Runner(brand_mail.BALANCE_EXIT, ["STOPPED: something"]))
        self.assertEqual(code, 1)
        self.assertEqual(self.replies(), [])
        self.assertEqual(FakeIMAP.instances[0].stores, [])
        self.assertIsNone(self.state())

    def test_an_unreadable_retries_file_fails_the_run_before_any_mail_is_read(self):
        for text in ("{not json", '{"retries": []}', "{}", '[{"saleId": "x@y", "requestedAt": "2026-10-18T12:00:00Z", "holdingReplySentAt": "2026-10-18T12:00:00Z"}]',
                     '[{"saleId": "sale-A", "requestedAt": "yesterday", "holdingReplySentAt": "2026-10-18T12:00:00Z"}]'):
            with open(self.retries, "w", encoding="utf-8") as f:
                f.write(text)
            FakeIMAP.instances = []
            out = io.StringIO()
            code = brand_mail.main(["respond-refunds", "--apply"], env=MAIN, stdout=out, stderr=io.StringIO(), now=NOW,
                                   smtp_factory=refuse, imap_factory=refuse, refund_runner=refuse, retry_runner=refuse)
            self.assertEqual(code, 1, text)
            self.assertIn("error", json.loads(out.getvalue()))

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

    def test_the_retries_file_is_the_state_colony_one(self):
        self.assertEqual(brand_mail.REFUND_RETRIES, os.path.join(REPO_ROOT, "state", "colony", "refund-retries.json"))

    def test_the_retry_runs_refund_by_sale_id_with_the_original_request_time_and_no_address(self):
        seen = {}

        def fake_run(argv, **kw):
            seen["argv"], seen["kw"] = argv, kw
            return subprocess.CompletedProcess(argv, 3, stdout="refund: balance-insufficient (sale sale-A)\n", stderr="")

        with mock.patch.object(brand_mail.subprocess, "run", fake_run):
            code, lines = brand_mail.node_retry_runner("sale-A", days_ago(2), True, dict(MAIN, PATH="/usr/bin"))
        self.assertEqual(code, 3)
        self.assertEqual(lines, ["refund: balance-insufficient (sale sale-A)"])
        self.assertEqual(seen["argv"], ["node", brand_mail.PRODUCT_SCRIPT, "refund", "--sale", "sale-A",
                                        "--requested-at", "2026-10-18T12:00:00Z", "--apply"])
        self.assertEqual(seen["kw"]["env"], {"PATH": "/usr/bin", "GUMROAD_ACCESS_TOKEN": TOKEN})
        self.assertEqual(brand_mail.BALANCE_EXIT, 3)

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
    COMMIT_IF = "        if: always() && steps.respond.outcome != 'skipped'\n"

    def edited(self, old, new, after=None):
        """The real workflow with `old` replaced once - in the part from `after` on, when given."""
        at = self.REAL.index(after) if after else 0
        head, tail = self.REAL[:at], self.REAL[at:]
        self.assertEqual(tail.count(old), 1, old)
        return head + tail.replace(old, new)

    def scheduled(self, text):
        return brand_mail.refund_responder_scheduled(self.workflow(text))

    def test_the_pinned_lines_are_the_workflows_own(self):
        for line in (self.JOB_IF, self.RESPOND, self.GUARD_IF, self.COMMIT_IF):
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
            # RULING-2026-09-30-documents (d): the balance-retries commit step may carry its one pinned condition, and
            # only on itself - never another one, and never on the respond step.
            "the commit step's if loosened": self.edited(self.COMMIT_IF, "        if: always()\n"),
            "the commit step's if on the respond step": self.edited(self.RESPOND, self.RESPOND + self.COMMIT_IF),
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
        for text in (commented, reordered):
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
