"""Tests for scripts/brand_mail.py. Standard library only; no network: SMTP and IMAP are fakes.

Run from the repository root or from scripts/:  python3 -m unittest -v

Addresses are placeholders on reserved example domains: the brand mailbox does not exist yet, and a real-looking
Gmail address here could be a stranger's.
"""

import datetime as dt
import email
import email.header
import email.policy
import email.utils
import hashlib
import imaplib
import io
import json
import os
import shutil
import smtplib
import ssl
import sys
import tempfile
import unittest
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
PERSONAL = "owner.personal@example.org"  # a stand-in for any non-brand address
REAL_QUESTIONS = os.path.join(REPO_ROOT, "research", "owner-asks", "questions.json")
FIRST_ID = "<first-crazygames@brand.example>"
CG_TO = "technical-support@crazygames.com"
CG_SUBJECT = "Question: automated submission through the Developer Portal"


def days_ago(n):
    return NOW - dt.timedelta(days=n)


# ---------------------------------------------------------------- fakes


class FakeSMTP:
    """Records what the script does with an SMTP_SSL connection. Class-level knobs set the failure mode."""

    instances = []
    fail_login = None
    fail_send = None
    on_send = None

    def __init__(self, host, port, timeout=None, context=None):
        self.host, self.port, self.timeout, self.context = host, port, timeout, context
        self.logins, self.sent, self.quit_called = [], [], False
        FakeSMTP.instances.append(self)

    def login(self, user, password):
        if FakeSMTP.fail_login:
            raise FakeSMTP.fail_login
        self.logins.append((user, password))

    def send_message(self, msg):
        if FakeSMTP.on_send:
            FakeSMTP.on_send(msg)
        if FakeSMTP.fail_send:
            raise FakeSMTP.fail_send
        self.sent.append(msg)
        return {}

    def quit(self):
        self.quit_called = True

    @classmethod
    def reset(cls):
        cls.instances, cls.fail_login, cls.fail_send, cls.on_send = [], None, None, None


def refuse_smtp(*_a, **_k):
    raise AssertionError("SMTP must not be opened here")


def refuse_imap(*_a, **_k):
    raise AssertionError("IMAP must not be opened here")


def header_block(**headers):
    """A raw header block as a server returns it for BODY.PEEK[HEADER.FIELDS (...)]. Keys use _ for -."""
    lines = []
    for key, value in headers.items():
        name = key.replace("_", "-")
        if any(ord(c) > 127 for c in value):
            value = email.header.Header(value, "utf-8").encode()
        lines.append("%s: %s" % (name, value))
    return ("\r\n".join(lines) + "\r\n\r\n").encode("ascii")


def fake_message(received, seen=True, body="BODY-SECRET text nobody may print", raw=None, **headers):
    return {"received": received, "seen": seen, "headers": raw if raw is not None else header_block(**headers), "body": body}


def imap_date(when):
    return when.strftime("%d-%b-%Y %H:%M:%S +0000")


class FakeIMAP:
    """A read-only-checking IMAP4_SSL stand-in. Anything that could change the mailbox raises."""

    instances = []
    fail_login = None
    fail_examine = ()  # mailbox names whose EXAMINE answers NO
    fail_fetch = False  # True: every FETCH answers NO; a string: only a FETCH whose parts contain it
    fail_search = False
    fail_list = False

    def __init__(self, mailboxes, list_lines, host=None, port=None, ssl_context=None, timeout=None):
        self.mailboxes, self.list_lines = mailboxes, list_lines
        self.host, self.port, self.ssl_context, self.timeout = host, port, ssl_context, timeout
        self.current, self.selects, self.fetches, self.logged_out = None, [], [], False
        FakeIMAP.instances.append(self)

    def login(self, user, password):
        if FakeIMAP.fail_login:
            raise FakeIMAP.fail_login
        self.user = user

    def select(self, mailbox="INBOX", readonly=False):
        if not readonly:
            raise AssertionError("SELECT would open the mailbox read-write; the script must EXAMINE")
        name = mailbox[1:-1] if mailbox.startswith('"') else mailbox
        self.selects.append(name)
        if name not in self.mailboxes or name in FakeIMAP.fail_examine:
            return "NO", [b"no such mailbox"]
        self.current = name
        return "OK", [str(len(self.mailboxes[name])).encode()]

    def search(self, charset, *criteria):
        if FakeIMAP.fail_search:
            return "NO", [b"search failed"]
        msgs = self.mailboxes[self.current]
        if criteria == ("UNSEEN",):
            ids = [str(i + 1).encode() for i, m in enumerate(msgs) if not m["seen"]]
        else:
            raise AssertionError("unexpected SEARCH %r" % (criteria,))
        return "OK", [b" ".join(ids)]

    def fetch(self, message_set, parts):
        self.fetches.append(parts)
        upper = parts.upper()
        if ("BODY[" in upper and "BODY.PEEK[" not in upper) or "RFC822" in upper or "BODY.PEEK[]" in upper or "TEXT]" in upper:
            raise AssertionError("fetch %r would read a body or set \\Seen" % parts)
        if FakeIMAP.fail_fetch is True or (isinstance(FakeIMAP.fail_fetch, str) and FakeIMAP.fail_fetch in upper):
            return "NO", [b"fetch failed"]
        msgs = self.mailboxes[self.current]
        lo, hi = message_set.split(":")
        data = []
        for n in range(int(lo), int(hi) + 1):
            m = msgs[n - 1]
            if upper == "(INTERNALDATE)":
                if m["received"] is not None:  # a server that sends no INTERNALDATE for a message
                    data.append(('%d (INTERNALDATE "%s")' % (n, imap_date(m["received"]))).encode())
            elif "BODY.PEEK[HEADER.FIELDS" in upper:
                data.append((("%d (BODY[HEADER.FIELDS (...)] {%d}" % (n, len(m["headers"]))).encode(), m["headers"]))
                data.append(b")")
            else:
                raise AssertionError("unexpected FETCH %r" % parts)
        return "OK", data

    def list(self, directory='""', pattern="*"):
        if FakeIMAP.fail_list:
            return "NO", [b"list failed"]
        return "OK", list(self.list_lines)

    def logout(self):
        self.logged_out = True
        return "BYE", [b""]

    def _forbidden(self, *_a, **_k):
        raise AssertionError("the script must never change the mailbox")

    store = copy = move = expunge = append = create = delete = rename = subscribe = uid = close = _forbidden

    @classmethod
    def reset(cls):
        cls.instances, cls.fail_login = [], None
        cls.fail_examine, cls.fail_fetch, cls.fail_search, cls.fail_list = (), False, False, False


LIST_INBOX = b'(\\HasNoChildren) "/" "INBOX"'
LIST_ALL = b'(\\All \\HasNoChildren) "/" "[Gmail]/All Mail"'
LIST_SPAM = b'(\\HasNoChildren \\Junk) "/" "[Gmail]/Spam"'
LIST_SENT = b'(\\HasNoChildren \\Sent) "/" "[Gmail]/Sent Mail"'
LIST_TRASH = b'(\\HasNoChildren \\Trash) "/" "[Gmail]/Trash"'
GMAIL_LIST = [LIST_INBOX, LIST_ALL, LIST_SPAM, LIST_SENT, LIST_TRASH]


def gmail(inbox=(), archived=(), sent=(), spam=(), trash=()):
    """Mailboxes as Gmail shows them: All Mail holds the inbox, archived mail and sent mail, not Spam or Trash."""
    return {
        "INBOX": list(inbox),
        "[Gmail]/All Mail": list(inbox) + list(archived) + list(sent),
        "[Gmail]/Spam": list(spam),
        "[Gmail]/Sent Mail": list(sent),
        "[Gmail]/Trash": list(trash),
    }


def imap_factory_for(mailboxes, list_lines=GMAIL_LIST):
    def factory(host, port, ssl_context=None, timeout=None):
        return FakeIMAP(mailboxes, list_lines, host, port, ssl_context, timeout)

    return factory


def our_first_message(n_days_ago=10):
    return fake_message(days_ago(n_days_ago), From="Mehudak <%s>" % BRAND, To=CG_TO, Subject=CG_SUBJECT, Message_ID=FIRST_ID)


def assert_verified_tls(test, context):
    test.assertIsInstance(context, ssl.SSLContext)
    test.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)
    test.assertTrue(context.check_hostname)


# ---------------------------------------------------------------- harness


class Harness(unittest.TestCase):
    def setUp(self):
        FakeSMTP.reset()
        FakeIMAP.reset()
        self.dir = tempfile.mkdtemp(prefix="brand-mail-")
        self.questions = os.path.join(self.dir, "questions.json")
        shutil.copy(REAL_QUESTIONS, self.questions)
        self.sent = os.path.join(self.dir, "sent.json")
        self.write_sent([], [])
        self.env = {"BRAND_MAIL_ADDRESS": BRAND, "BRAND_MAIL_APP_PASSWORD": PASSWORD}

    def tearDown(self):
        shutil.rmtree(self.dir, ignore_errors=True)

    def write_sent(self, sent, replies):
        with open(self.sent, "w", encoding="utf-8") as f:
            json.dump({"sent": sent, "repliesRecorded": replies}, f)

    def read_sent(self):
        with open(self.sent, encoding="utf-8") as f:
            return json.load(f)

    def edit_questions(self, venue_id, **changes):
        with open(self.questions, encoding="utf-8") as f:
            q = json.load(f)
        for v in q["venues"]:
            if v["venue"] == venue_id:
                v.update(changes)
        with open(self.questions, "w", encoding="utf-8") as f:
            json.dump(q, f, ensure_ascii=False)
        return q

    def run_cli(self, *argv, env=None, smtp=refuse_smtp, imap=None, now=NOW):
        out, err = io.StringIO(), io.StringIO()
        args = list(argv) + ["--questions", self.questions, "--sent", self.sent]
        code = brand_mail.main(args, env=self.env if env is None else env, stdout=out, stderr=err, now=now,
                               smtp_factory=smtp, imap_factory=imap or imap_factory_for(gmail()))
        return code, out.getvalue(), err.getvalue()

    def first_record(self, days=10, venue="crazygames", status="sent", message_id=FIRST_ID, kind="first"):
        return {
            "venue": venue, "kind": kind, "status": status,
            "sentAt": days_ago(days).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "messageId": message_id, "subject": CG_SUBJECT, "to": CG_TO,
        }


# ---------------------------------------------------------------- configuration and the brand-address guard


class ConfigurationTests(Harness):
    def test_send_without_secrets_exits_0_and_says_not_configured(self):
        code, out, _ = self.run_cli("send", "--venue", "crazygames", env={}, imap=refuse_imap)
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)["configured"], False)

    def test_probe_without_secrets_exits_0_and_says_not_configured(self):
        code, out, _ = self.run_cli("probe", env={}, imap=refuse_imap)
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out), {"configured": False, "missing": ["BRAND_MAIL_ADDRESS", "BRAND_MAIL_APP_PASSWORD"]})

    def test_one_secret_alone_is_not_configured(self):
        code, out, _ = self.run_cli("probe", env={"BRAND_MAIL_ADDRESS": BRAND}, imap=refuse_imap)
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)["missing"], ["BRAND_MAIL_APP_PASSWORD"])

    def test_unconfigured_probe_writes_the_not_configured_reading_to_out(self):
        target = os.path.join(self.dir, "brand-mail.json")
        code, out, _ = self.run_cli("probe", "--out", target, env={}, imap=refuse_imap)
        self.assertEqual(code, 0)
        with open(target, encoding="utf-8") as f:
            written = json.load(f)
        self.assertEqual(written["configured"], False)
        self.assertEqual(written["measuredAt"], "2026-10-20T12:00:00Z")

    def test_a_personal_address_is_refused_for_send_and_never_echoed(self):
        env = {"BRAND_MAIL_ADDRESS": PERSONAL, "BRAND_MAIL_APP_PASSWORD": PASSWORD, "GITHUB_REF": "refs/heads/main"}
        code, out, err = self.run_cli("send", "--venue", "crazygames", "--really-send", env=env, smtp=FakeSMTP,
                                      imap=refuse_imap)
        self.assertEqual(code, 2)
        self.assertNotIn("owner.personal", out + err)
        self.assertNotIn(PASSWORD, out + err)
        self.assertEqual(FakeSMTP.instances, [])

    def test_a_personal_address_is_refused_for_probe(self):
        code, out, err = self.run_cli("probe", env={"BRAND_MAIL_ADDRESS": PERSONAL, "BRAND_MAIL_APP_PASSWORD": PASSWORD},
                                      imap=refuse_imap)
        self.assertEqual(code, 2)
        self.assertNotIn("owner.personal", out + err)

    def test_brand_address_rule(self):
        for ok in ["mehudak@brand.example", "Mehudak.IL@mail.example", "mehudak+a11y@brand.example", "mehudak.app@outlook.example"]:
            self.assertTrue(brand_mail.is_brand_address(ok), ok)
        for bad in ["owner@mail.example", "x@mehudak.example", "Mehudak <mehudak@brand.example>", "mehudak@",
                    "mehudak@@brand.example", "", "mehudak", "mehudak@brand", " mehudak@brand.example", "meh udak@brand.example"]:
            self.assertFalse(brand_mail.is_brand_address(bad), bad)


# ---------------------------------------------------------------- send


class SendTests(Harness):
    def main_env(self):
        return dict(self.env, GITHUB_REF="refs/heads/main")

    def dry_run(self, venue="crazygames", imap=None):
        code, out, err = self.run_cli("send", "--venue", venue, imap=imap)
        self.assertEqual(code, 0, err)
        return json.loads(out)

    def real_send(self, venue="crazygames", imap=None, digest=None):
        digest = digest or self.dry_run(venue, imap)["messageSha256"]
        return self.run_cli("send", "--venue", venue, "--really-send", "--message-sha256", digest, env=self.main_env(),
                            smtp=FakeSMTP, imap=imap)

    # -- the dry run

    def test_dry_run_prints_the_full_message_the_record_and_its_digest_and_sends_nothing(self):
        result = self.dry_run()
        self.assertTrue(result["dryRun"])
        self.assertEqual(result["kind"], "first")
        self.assertRegex(result["messageSha256"], r"^[0-9a-f]{64}$")
        rec = result["record"]
        self.assertEqual(rec["venue"], "crazygames")
        self.assertEqual(rec["to"], CG_TO)
        self.assertEqual(rec["subject"], CG_SUBJECT)
        self.assertEqual(rec["sentAt"], "2026-10-20T12:00:00Z")
        msg = email.message_from_string(result["message"], policy=email.policy.default)
        self.assertEqual(msg["Message-ID"], rec["messageId"])
        self.assertEqual(msg["To"], CG_TO)
        self.assertEqual(msg["From"].addresses[0].addr_spec, BRAND)
        self.assertIn("this message was written and sent by that agent", msg.get_content())
        self.assertIn("preSend", result)
        self.assertEqual(FakeSMTP.instances, [])
        self.assertEqual(self.read_sent()["sent"], [])
        self.assertNotIn(PASSWORD, json.dumps(result))
        # The dry run makes the same read-only Sent-folder check a real send makes.
        (imap,) = FakeIMAP.instances
        self.assertEqual(imap.selects, ["[Gmail]/Sent Mail"])
        self.assertTrue(imap.logged_out)
        assert_verified_tls(self, imap.ssl_context)

    def test_the_message_id_carries_the_venue_and_never_the_brand_address(self):
        rec = self.dry_run()["record"]
        self.assertRegex(rec["messageId"], r"^<[^<>\s]+\.crazygames@brand\.example>$")
        self.assertNotIn(BRAND, rec["messageId"])
        self.assertNotIn("mehudak", rec["messageId"])

    def test_the_date_header_is_now_in_utc(self):
        msg = email.message_from_string(self.dry_run()["message"], policy=email.policy.compat32)
        self.assertTrue(msg["Date"].endswith("+0000"), msg["Date"])
        self.assertEqual(email.utils.parsedate_to_datetime(msg["Date"]), NOW)

    def test_the_body_goes_out_exactly_as_written_with_the_hebrew_signature_intact(self):
        with open(self.questions, encoding="utf-8") as f:
            body = json.load(f)["venues"][0]["body"]
        result = self.dry_run()
        msg = email.message_from_string(result["message"], policy=email.policy.default)
        self.assertEqual(msg.get_content(), body)
        self.assertTrue(msg.get_content().rstrip().endswith("Thank you,\nMehudak (מהודק)"))
        self.assertEqual(str(msg["From"].addresses[0].display_name), "Mehudak (מהודק)")
        self.assertTrue(all(ord(c) < 128 for c in result["message"]), "headers and body are 7-bit encoded")

    def test_the_digest_covers_kind_recipient_subject_body_and_thread(self):
        with open(self.questions, encoding="utf-8") as f:
            venue = json.load(f)["venues"][0]
        canonical = json.dumps({"kind": "first", "to": venue["to"], "subject": venue["subject"], "body": venue["body"],
                                "inReplyTo": None}, ensure_ascii=False, sort_keys=True)
        self.assertEqual(self.dry_run()["messageSha256"], hashlib.sha256(canonical.encode("utf-8")).hexdigest())
        self.assertNotEqual(brand_mail.message_digest("first", venue, None), brand_mail.message_digest("follow-up", venue, FIRST_ID))

    # -- a real send

    def test_a_real_send_needs_the_main_branch(self):
        digest = self.dry_run()["messageSha256"]
        for ref in [None, "refs/heads/claude/some-branch", "refs/pull/3/merge"]:
            env = dict(self.env)
            if ref:
                env["GITHUB_REF"] = ref
            code, _, err = self.run_cli("send", "--venue", "crazygames", "--really-send", "--message-sha256", digest,
                                        env=env, smtp=FakeSMTP)
            self.assertEqual(code, 2, ref)
            self.assertIn("refs/heads/main", err)
        self.assertEqual(FakeSMTP.instances, [])

    def test_a_real_send_needs_the_digest_of_the_dry_run_that_was_read(self):
        code, _, err = self.run_cli("send", "--venue", "crazygames", "--really-send", env=self.main_env(), smtp=FakeSMTP)
        self.assertEqual(code, 2)
        self.assertIn("missing", err)
        code, _, err = self.run_cli("send", "--venue", "crazygames", "--really-send", "--message-sha256", "0" * 64,
                                    env=self.main_env(), smtp=FakeSMTP)
        self.assertEqual(code, 2)
        self.assertIn("not the one that was read", err)
        self.assertEqual(FakeSMTP.instances, [])
        self.assertEqual(self.read_sent()["sent"], [])

    def test_a_message_edited_after_its_dry_run_does_not_go(self):
        digest = self.dry_run()["messageSha256"]
        with open(self.questions, encoding="utf-8") as f:
            body = json.load(f)["venues"][0]["body"]
        self.edit_questions("crazygames", body=body.replace("Hello CrazyGames team,", "Hello CrazyGames developer team,"))
        code, _, err = self.real_send(digest=digest)
        self.assertEqual(code, 2)
        self.assertIn("not the one that was read", err)
        self.assertEqual(FakeSMTP.instances, [])

    def test_a_real_send_logs_in_as_the_brand_over_verified_tls_sends_once_and_records_it(self):
        code, out, err = self.real_send()
        self.assertEqual(code, 0, err)
        (smtp,) = FakeSMTP.instances
        self.assertEqual((smtp.host, smtp.port), ("smtp.gmail.com", 465))
        assert_verified_tls(self, smtp.context)
        self.assertEqual(smtp.timeout, 30)
        self.assertEqual(smtp.logins, [(BRAND, PASSWORD)])
        (msg,) = smtp.sent
        self.assertTrue(smtp.quit_called)
        result = json.loads(out)
        self.assertTrue(result["sent"])
        rec = result["record"]
        self.assertEqual(msg["Message-ID"], rec["messageId"])
        self.assertEqual(rec["status"], "sent")
        self.assertEqual(rec["kind"], "first")
        self.assertEqual(self.read_sent()["sent"], [rec])
        self.assertNotIn(PASSWORD, out + err)

    def test_the_record_is_written_as_uncertain_before_the_message_is_handed_over(self):
        seen = []
        FakeSMTP.on_send = lambda msg: seen.append([(r["messageId"], r["status"]) for r in self.read_sent()["sent"]])
        code, _, err = self.real_send()
        self.assertEqual(code, 0, err)
        (rec,) = self.read_sent()["sent"]
        self.assertEqual(seen, [[(rec["messageId"], "uncertain")]])
        self.assertEqual(rec["status"], "sent")

    def test_smtp_host_and_port_are_overridable(self):
        self.env.update(BRAND_MAIL_SMTP_HOST="smtp.example.net", BRAND_MAIL_SMTP_PORT="2465")
        code, _, err = self.real_send()
        self.assertEqual(code, 0, err)
        self.assertEqual((FakeSMTP.instances[0].host, FakeSMTP.instances[0].port), ("smtp.example.net", 2465))

    # -- one message per venue, and the Sent folder as the last word

    def test_one_message_per_venue(self):
        self.write_sent([self.first_record(days=1)], [])
        code, _, err = self.run_cli("send", "--venue", "crazygames", "--really-send", "--message-sha256", "0" * 64,
                                    env=self.main_env(), smtp=FakeSMTP)
        self.assertEqual(code, 2)
        self.assertIn("follow-up", err)
        self.assertEqual(FakeSMTP.instances, [])
        self.assertEqual(len(self.read_sent()["sent"]), 1)

    def test_other_venues_are_not_blocked_by_one_venues_send(self):
        self.write_sent([self.first_record(days=1)], [])
        self.assertEqual(self.dry_run("wix", imap=imap_factory_for(gmail(sent=[our_first_message(1)])))["kind"], "first")

    def test_a_send_the_sent_folder_holds_but_sent_json_does_not_is_never_repeated(self):
        # A real send whose record never reached the repository (every push failed): sent.json is empty, but the
        # Sent folder has the message. Matched by the venue's address, or by its subject alone.
        lost_by_address = fake_message(days_ago(1), From=BRAND, To=CG_TO, Subject="something else", Message_ID="<lost@brand.example>")
        lost_by_subject = fake_message(days_ago(1), From=BRAND, To="other@venue.example", Subject=CG_SUBJECT,
                                       Message_ID="<lost2@brand.example>")
        for lost in (lost_by_address, lost_by_subject):
            FakeSMTP.reset()
            imap = imap_factory_for(gmail(sent=[lost]))
            code, _, err = self.run_cli("send", "--venue", "crazygames", imap=imap)
            self.assertEqual(code, 2)
            self.assertIn("Sent folder holds 1 message(s) to crazygames", err)
            code, _, err = self.run_cli("send", "--venue", "crazygames", "--really-send", "--message-sha256",
                                        brand_mail.message_digest("first", self.venue(), None), env=self.main_env(),
                                        smtp=FakeSMTP, imap=imap)
            self.assertEqual(code, 2)
            self.assertEqual(FakeSMTP.instances, [])
        # Another venue's mail in the Sent folder does not block this one.
        self.dry_run(imap=imap_factory_for(gmail(sent=[fake_message(days_ago(1), From=BRAND, To="x@wix.example",
                                                                      Subject="Other", Message_ID="<w@brand.example>")])))

    def test_an_unreadable_message_in_the_sent_folder_blocks_the_send(self):
        marker = b"X-Unparseable: yes"
        real = brand_mail.parse_headers

        def parse(raw):
            if marker in raw:
                raise ValueError("unreadable")
            return real(raw)

        broken = fake_message(days_ago(1), raw=marker + b"\r\nSubject: x\r\n\r\n")
        with mock.patch.object(brand_mail, "parse_headers", parse):
            code, _, err = self.run_cli("send", "--venue", "crazygames", imap=imap_factory_for(gmail(sent=[broken])))
        self.assertEqual(code, 2)
        self.assertIn("Sent folder holds 1 message(s)", err)

    def test_without_a_sent_folder_nothing_is_sent(self):
        code, _, err = self.run_cli("send", "--venue", "crazygames", imap=imap_factory_for(gmail(), [LIST_INBOX, LIST_ALL]))
        self.assertEqual(code, 2)
        self.assertIn("no Sent folder", err)

    def venue(self, venue_id="crazygames"):
        with open(self.questions, encoding="utf-8") as f:
            return next(v for v in json.load(f)["venues"] if v["venue"] == venue_id)

    # -- the one follow-up

    def test_follow_up_is_refused_before_the_delay(self):
        self.write_sent([self.first_record(days=6.9)], [])
        code, _, err = self.run_cli("send", "--venue", "crazygames")
        self.assertEqual(code, 2)
        self.assertIn("7", err)

    def test_one_follow_up_after_the_delay_same_text_same_thread(self):
        self.write_sent([self.first_record(days=7.1)], [])
        imap = imap_factory_for(gmail(sent=[our_first_message(7.1)]))
        code, out, err = self.real_send(imap=imap)
        self.assertEqual(code, 0, err)
        (msg,) = FakeSMTP.instances[0].sent
        self.assertEqual(msg["In-Reply-To"], FIRST_ID)
        self.assertEqual(msg["References"], FIRST_ID)
        venue = self.venue()
        self.assertEqual(msg.get_content(), venue["body"])
        self.assertEqual(msg["Subject"], venue["subject"])
        rec = json.loads(out)["record"]
        self.assertEqual(rec["kind"], "follow-up")
        self.assertEqual(rec["inReplyTo"], FIRST_ID)
        self.assertEqual(len(self.read_sent()["sent"]), 2)
        # Our own first message (in Sent and All Mail, with the venue subject) is not taken for a reply; every
        # mailbox was opened read-only.
        self.assertEqual(FakeIMAP.instances[-1].selects, ["[Gmail]/Sent Mail", "[Gmail]/All Mail", "[Gmail]/Spam"])

    def test_never_a_second_follow_up(self):
        follow = self.first_record(days=1, kind="follow-up", message_id="<f2@brand.example>")
        self.write_sent([self.first_record(days=20), follow], [])
        code, _, err = self.run_cli("send", "--venue", "crazygames")
        self.assertEqual(code, 2)
        self.assertIn("record NOT ANSWERED", err)

    def test_no_follow_up_once_a_yes_or_no_is_recorded(self):
        for reading in ["YES", "NO"]:
            self.write_sent([self.first_record(days=10)],
                            [{"venue": "crazygames", "recordedAt": "2026-10-15T00:00:00Z", "reading": reading,
                              "coveredMessageIds": ["<r0@crazygames.com>"]}])
            code, _, err = self.run_cli("send", "--venue", "crazygames")
            self.assertEqual(code, 2, reading)
            self.assertIn("recorded", err)

    def refused_follow_up(self, mailboxes, replies=()):
        self.write_sent([self.first_record(days=10)], list(replies))
        code, out, err = self.run_cli("send", "--venue", "crazygames", imap=imap_factory_for(mailboxes))
        self.assertEqual(code, 2, "follow-up was allowed: %s" % out)
        self.assertIn("may be its reply", err)
        self.assertNotIn("desk", (out + err).lower())
        return err

    def test_no_follow_up_while_a_threaded_reply_sits_in_the_inbox(self):
        reply = fake_message(days_ago(3), In_Reply_To=FIRST_ID, Subject="Re: q", Message_ID="<r1@venue.example>",
                             From="Venue Desk <desk@venue.example>")
        self.refused_follow_up(gmail(inbox=[reply], sent=[our_first_message()]))

    def test_no_follow_up_over_a_helpdesk_ticket_that_opened_its_own_thread(self):
        # The code review's case: no In-Reply-To or References, a ticket subject, from the venue's own domain.
        ticket = fake_message(days_ago(2), seen=False, From="CrazyGames Desk <desk@crazygames.com>",
                              Subject="[Ticket #4411] We received your request", Message_ID="<t4411@crazygames.com>")
        self.refused_follow_up(gmail(inbox=[ticket], sent=[our_first_message()]))
        # A helpdesk on a subdomain of the venue's domain counts too.
        ticket_sub = fake_message(days_ago(2), From="Desk <desk@support.crazygames.com>", Subject="Request received",
                                  Message_ID="<t2@support.crazygames.com>")
        self.refused_follow_up(gmail(inbox=[ticket_sub], sent=[our_first_message()]))

    def test_no_follow_up_over_a_reply_carrying_our_subject_from_another_domain(self):
        hosted = fake_message(days_ago(2), From="Desk <desk@helpdesk-host.example>",
                              Subject="[#12] Re: " + CG_SUBJECT, Message_ID="<h1@helpdesk-host.example>")
        self.refused_follow_up(gmail(inbox=[hosted], sent=[our_first_message()]))

    def test_no_follow_up_over_a_reply_filed_in_spam_or_archived(self):
        reply = fake_message(days_ago(2), From="Desk <desk@crazygames.com>", Subject="Re: " + CG_SUBJECT,
                             Message_ID="<r2@crazygames.com>")
        self.refused_follow_up(gmail(spam=[reply], sent=[our_first_message()]))
        self.refused_follow_up(gmail(archived=[reply], sent=[our_first_message()]))

    def test_mail_from_the_venue_before_our_first_send_is_not_a_reply(self):
        self.write_sent([self.first_record(days=10)], [])
        newsletter = fake_message(days_ago(30), From="News <news@crazygames.com>", Subject="Monthly developer news",
                                  Message_ID="<n1@crazygames.com>")
        code, out, err = self.run_cli("send", "--venue", "crazygames",
                                      imap=imap_factory_for(gmail(archived=[newsletter], sent=[our_first_message()])))
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out)["kind"], "follow-up")

    def test_follow_up_allowed_only_when_a_not_answered_reading_lists_every_possible_reply(self):
        ack = fake_message(days_ago(9), From="Desk <desk@crazygames.com>", Subject="[Ticket #1] Received",
                           Message_ID="<ack@crazygames.com>")
        staff = fake_message(days_ago(1), From="Staff <staff@crazygames.com>", Subject="[Ticket #1] Update",
                             Message_ID="<staff@crazygames.com>")
        covered = [{"venue": "crazygames", "recordedAt": "2026-10-12T00:00:00Z", "reading": "NOT ANSWERED",
                    "coveredMessageIds": ["<ack@crazygames.com>"]}]
        self.write_sent([self.first_record(days=10)], covered)
        code, out, err = self.run_cli("send", "--venue", "crazygames",
                                      imap=imap_factory_for(gmail(archived=[ack], sent=[our_first_message()])))
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out)["kind"], "follow-up")
        # The review's case: the acknowledgement is gone (trashed) and a real staff reply arrived. The count is the same
        # as when the reading was recorded, but the message is not the one it covers.
        self.refused_follow_up(gmail(inbox=[staff], sent=[our_first_message()]), covered)
        # A reply with no Message-ID can never be covered by a reading.
        anonymous = fake_message(days_ago(1), From="Staff <staff@crazygames.com>", Subject="Update")
        self.refused_follow_up(gmail(inbox=[anonymous], sent=[our_first_message()]), covered)

    def test_an_undated_or_unreadable_message_counts_as_a_possible_reply(self):
        undated = fake_message(None, From="Desk <desk@crazygames.com>", Subject="Update", Message_ID="<u@crazygames.com>")
        self.refused_follow_up(gmail(inbox=[undated], sent=[our_first_message()]))
        marker = b"X-Unparseable: yes"
        real = brand_mail.parse_headers

        def parse(raw):
            if marker in raw:
                raise ValueError("unreadable")
            return real(raw)

        broken = fake_message(days_ago(2), raw=marker + b"\r\nSubject: x\r\n\r\n")
        with mock.patch.object(brand_mail, "parse_headers", parse):
            self.refused_follow_up(gmail(inbox=[broken], sent=[our_first_message()]))

    def test_an_uncertain_send_blocks_the_venue_until_resolved(self):
        self.write_sent([self.first_record(days=30, status="uncertain")], [])
        code, _, err = self.run_cli("send", "--venue", "crazygames")
        self.assertEqual(code, 2)
        self.assertIn("uncertain", err)
        self.assertIn("Sent folder", err)

    # -- the venue and its text

    def test_a_venue_with_no_recorded_address_is_refused(self):
        for venue in ["n8n"]:
            code, _, err = self.run_cli("send", "--venue", venue)
            self.assertEqual(code, 2, venue)
            self.assertIn("no recorded email address", err)

    def test_the_venues_addressed_in_tick_8_dry_run_to_their_recorded_address_with_hebrew_intact(self):
        # Spreadshirt got contact@spreadshop.com and Indiebook office@indiebook.co.il from captures on 28.9.2026.
        # Indiebook's subject and most of its body are Hebrew: both must come back exactly, 7-bit on the wire.
        with open(self.questions, encoding="utf-8") as f:
            venues = {v["venue"]: v for v in json.load(f)["venues"]}
        for vid, to in [("spreadshirt", "contact@spreadshop.com"), ("indiebook", "office@indiebook.co.il")]:
            result = self.dry_run(vid)
            self.assertEqual(result["record"]["to"], to, vid)
            msg = email.message_from_string(result["message"], policy=email.policy.default)
            self.assertEqual(msg["To"], to, vid)
            self.assertEqual(str(msg["Subject"]), venues[vid]["subject"], vid)
            self.assertEqual(msg.get_content(), venues[vid]["body"], vid)
            self.assertTrue(all(ord(c) < 128 for c in result["message"]), vid)
        self.assertEqual(FakeSMTP.instances, [])

    def test_an_unknown_venue_is_refused(self):
        code, _, err = self.run_cli("send", "--venue", "paypal")
        self.assertEqual(code, 2)
        self.assertIn("unknown venue", err)

    def test_the_rules_every_message_keeps_are_enforced_on_the_text_about_to_leave(self):
        body = self.venue()["body"]
        # Each break, and the refusal that must name it. A dry run, so no other guard (the digest) can refuse first.
        breaks = {
            "no disclosure": (dict(body=body.replace("this message was written and sent by that agent", "we wrote this")), "lacks the disclosure"),
            "a phone number": (dict(body=body.replace("Thank you,", "Call +972 50 123 4567. Thank you,")), "body carries a phone number"),
            "an address in the subject": (dict(subject=CG_SUBJECT + " (reply to x@y.example)"), "subject carries an email address"),
            "a link": (dict(body=body.replace("Thank you,", "See https://example.org. Thank you,")), "body carries a link"),
            "a street address": (dict(body=body.replace("Thank you,", "We sit on 5 Main Street. Thank you,")), "body carries a street address"),
            "another signature": (dict(body=body.replace("Mehudak (מהודק)\n", "Dana\n")), "is not signed"),
            "a one-day follow-up": (dict(followUpAfterDays=1), "followUpAfterDays"),
            "a six-day follow-up": (dict(followUpAfterDays=6), "followUpAfterDays"),
            "a follow-up delay that is not a number": (dict(followUpAfterDays="7"), "followUpAfterDays"),
        }
        for label, (change, reason) in breaks.items():
            shutil.copy(REAL_QUESTIONS, self.questions)
            self.edit_questions("crazygames", **change)
            code, _, err = self.run_cli("send", "--venue", "crazygames", imap=refuse_imap)
            self.assertEqual(code, 2, label)
            self.assertIn(reason, err, label)
            self.assertIn("Nothing was sent", err, label)
        self.assertEqual(FakeSMTP.instances, [])

    def test_an_empty_disclosure_list_or_a_changed_signature_is_refused(self):
        with open(self.questions, encoding="utf-8") as f:
            q = json.load(f)
        for change in ({"disclosure": []}, {"signature": "Someone"}):
            with open(self.questions, "w", encoding="utf-8") as f:
                json.dump(dict(q, **change), f, ensure_ascii=False)
            code, _, _ = self.run_cli("send", "--venue", "crazygames", imap=refuse_imap)
            self.assertEqual(code, 2, change)

    # -- the server's answer

    def test_a_failed_login_sends_nothing_records_nothing_and_leaks_nothing(self):
        digest = self.dry_run()["messageSha256"]
        FakeSMTP.fail_login = smtplib.SMTPAuthenticationError(535, b"5.7.8 Username and Password not accepted " + PASSWORD.encode())
        code, out, err = self.real_send(digest=digest)
        self.assertEqual(code, 1)
        self.assertEqual(self.read_sent()["sent"], [])
        self.assertNotIn(PASSWORD, out + err)
        self.assertEqual(json.loads(out)["error"], "SMTPAuthenticationError")

    def test_a_message_the_server_refused_outright_leaves_no_record(self):
        digest = self.dry_run()["messageSha256"]
        refusals = [
            smtplib.SMTPRecipientsRefused({CG_TO: (550, b"no")}),
            smtplib.SMTPSenderRefused(553, b"no", BRAND),
            smtplib.SMTPDataError(554, b"rejected"),
        ]
        for exc in refusals:
            FakeSMTP.fail_send = exc
            code, out, _ = self.real_send(digest=digest)
            self.assertEqual(code, 1, type(exc).__name__)
            self.assertEqual(self.read_sent()["sent"], [], type(exc).__name__)
            self.assertEqual(json.loads(out), {"configured": True, "sent": False, "error": type(exc).__name__})

    def test_a_connection_lost_mid_send_is_recorded_uncertain_so_it_cannot_go_twice(self):
        digest = self.dry_run()["messageSha256"]
        FakeSMTP.fail_send = smtplib.SMTPServerDisconnected("Connection unexpectedly closed")
        code, out, _ = self.real_send(digest=digest)
        self.assertEqual(code, 1)
        (rec,) = self.read_sent()["sent"]
        self.assertEqual(rec["status"], "uncertain")
        self.assertEqual(json.loads(out)["record"], rec)
        code, _, _ = self.real_send(digest=digest)
        self.assertEqual(code, 2)
        self.assertEqual(len(FakeSMTP.instances), 1)

    def test_a_run_cancelled_mid_send_leaves_the_uncertain_record(self):
        digest = self.dry_run()["messageSha256"]
        FakeSMTP.fail_send = KeyboardInterrupt()
        with self.assertRaises(KeyboardInterrupt):
            self.real_send(digest=digest)
        (rec,) = self.read_sent()["sent"]
        self.assertEqual(rec["status"], "uncertain")

    def test_held_questions_are_never_sent_by_this_command(self):
        result = self.dry_run()
        msg = email.message_from_string(result["message"], policy=email.policy.default)
        self.assertNotIn("Tipalti", msg.get_content())
        self.assertNotIn("finance@", result["message"])


# ---------------------------------------------------------------- probe


def gmail_fixture():
    inbox = [
        # 1: a staff reply to the CrazyGames question, threaded; unseen.
        fake_message(days_ago(2), seen=False, From="Sender Alpha <alpha@crazygames.com>", To=BRAND,
                     Subject="Re: Question: automated submission", Message_ID="<rep1@crazygames.com>",
                     In_Reply_To=FIRST_ID, References=FIRST_ID),
        # 2: accessibility mail to the plus-address, 10 days old, never answered.
        fake_message(days_ago(10), From="Sender Bravo <bravo@example.org>", To="mehudak+accessibility@brand.example",
                     Subject="שאלה", Message_ID="<a11y-1@example.org>"),
        # 3: accessibility mail recognised by its Hebrew subject, 9 days old, answered from Sent.
        fake_message(days_ago(9), From="Sender Charlie <charlie@example.org>", To=BRAND,
                     Subject="בעיית נגישות באתר", Message_ID="<a11y-2@example.org>"),
        # 4: accessibility mail recognised by its English subject, 2 days old, unanswered.
        fake_message(days_ago(2), From="Sender Delta <delta@example.org>", To=BRAND,
                     Subject="Accessibility problem on the VAT page", Message_ID="<a11y-3@example.org>"),
        # 5: a newsletter; unseen; nothing to do with anything.
        fake_message(days_ago(1), seen=False, From="News <news@example.org>", To=BRAND,
                     Subject="Weekly digest", Message_ID="<n1@example.org>"),
    ]
    archived = [
        # 6: accessibility mail archived without an answer, 8 days old: archiving answers nothing.
        fake_message(days_ago(8), From="Sender Echo <echo@example.org>", To="mehudak+a11y@brand.example",
                     Subject="hello", Message_ID="<a11y-4@example.org>"),
        # 7: a helpdesk ticket about our question: its own thread, from a subdomain of the venue's domain.
        fake_message(days_ago(5), From="Help Desk <help@support.crazygames.com>", To=BRAND,
                     Subject="[Ticket #4411] Received", Message_ID="<t1@support.crazygames.com>"),
    ]
    spam = [
        # 8: accessibility-subject spam: Spam is not read for accessibility mail.
        fake_message(days_ago(20), From="Spammer <s@spam.example>", To=BRAND,
                     Subject="Accessibility audit for your site", Message_ID="<spam1@spam.example>"),
        # 9: a venue reply Gmail filed as spam: still a possible reply.
        fake_message(days_ago(1), From="Sender Foxtrot <f@crazygames.com>", To=BRAND, Subject="Re: " + CG_SUBJECT,
                     Message_ID="<rep2@crazygames.com>"),
    ]
    sent = [
        our_first_message(12),
        fake_message(days_ago(8), From=BRAND, To="charlie@example.org", Subject="Re: accessibility",
                     Message_ID="<ans@brand.example>", In_Reply_To="<a11y-2@example.org>", References="<a11y-2@example.org>"),
    ]
    return gmail(inbox=inbox, archived=archived, sent=sent, spam=spam)


LEAKS = ["Sender", "Alpha", "alpha@", "Bravo", "bravo@", "Charlie", "charlie@", "Delta", "delta@", "Echo", "echo@",
         "Foxtrot", "example.org", "spam.example", "crazygames.com", "rep1@", "a11y-1@", "BODY-SECRET", "Weekly", "digest",
         "נגישות", "שאלה", "Accessibility", "audit", "Ticket", "4411", "Re:", "news@", BRAND, "mehudak", PASSWORD]


class ProbeTests(Harness):
    def setUp(self):
        super().setUp()
        self.write_sent([self.first_record(days=12)], [])

    def probe(self, mailboxes=None, list_lines=GMAIL_LIST, *extra):
        return self.run_cli("probe", *extra, imap=imap_factory_for(mailboxes or gmail_fixture(), list_lines))

    def test_counts_unread_possible_replies_and_accessibility_mail(self):
        code, out, err = self.probe()
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out), {
            "configured": True,
            "measuredAt": "2026-10-20T12:00:00Z",
            "inbox": 5,
            "unread": 2,
            # 1 threaded (inbox), 7 a ticket from a subdomain (archived), 9 in spam. Our own first message, though it
            # carries the venue subject, is not one.
            "repliesByVenue": {"crazygames": 3},
            # 2, 3, 4 and the archived 6; 3 was answered; 2 (10 days) and 6 (8 days) are overdue; the spam is not read.
            "accessibility": {"received": 4, "unanswered": 3, "unansweredOver7Days": 2, "oldestUnansweredAgeDays": 10.0},
            "sentFolderFound": True,
            "allMailFound": True,
        })

    def test_prints_numbers_only_never_a_sender_subject_or_body(self):
        code, out, err = self.probe()
        self.assertEqual(code, 0, err)
        for leak in LEAKS:
            self.assertNotIn(leak, out + err, leak)

    def test_writes_the_same_numbers_to_out_and_nothing_else(self):
        target = os.path.join(self.dir, "state", "brand-mail.json")
        code, out, err = self.run_cli("probe", "--out", target, imap=imap_factory_for(gmail_fixture()))
        self.assertEqual(code, 0, err)
        with open(target, encoding="utf-8") as f:
            text = f.read()
        self.assertEqual(json.loads(text), json.loads(out))
        for leak in LEAKS:
            self.assertNotIn(leak, text, leak)

    def test_is_read_only_examine_and_peek_only_over_verified_tls(self):
        self.probe()
        (imap,) = FakeIMAP.instances
        # Every one via EXAMINE (the fake raises otherwise); the inbox's own messages are read through All Mail.
        self.assertEqual(imap.selects, ["INBOX", "[Gmail]/All Mail", "[Gmail]/Sent Mail", "[Gmail]/Spam"])
        for parts in imap.fetches:
            self.assertTrue(parts == "(INTERNALDATE)" or parts.startswith("(BODY.PEEK[HEADER.FIELDS "), parts)
        self.assertTrue(imap.logged_out)
        self.assertEqual((imap.host, imap.port), ("imap.gmail.com", 993))
        assert_verified_tls(self, imap.ssl_context)
        self.assertEqual(imap.timeout, 30)

    def test_imap_host_and_port_are_overridable(self):
        self.env.update(BRAND_MAIL_IMAP_HOST="outlook.office365.com", BRAND_MAIL_IMAP_PORT="1993")
        self.probe()
        self.assertEqual((FakeIMAP.instances[0].host, FakeIMAP.instances[0].port), ("outlook.office365.com", 1993))

    def test_without_a_sent_folder_every_accessibility_mail_counts_as_unanswered(self):
        code, out, _ = self.probe(list_lines=[LIST_INBOX, LIST_ALL, LIST_SPAM])
        self.assertEqual(code, 0)
        reading = json.loads(out)
        self.assertFalse(reading["sentFolderFound"])
        self.assertEqual(reading["accessibility"]["unanswered"], 4)
        self.assertEqual(reading["accessibility"]["unansweredOver7Days"], 3)
        # Our own mail is still left out: From the brand address.
        self.assertEqual(reading["repliesByVenue"], {"crazygames": 3})

    def test_without_all_mail_it_reads_the_inbox_and_says_so(self):
        code, out, _ = self.probe(list_lines=[LIST_INBOX, LIST_SPAM, LIST_SENT])
        self.assertEqual(code, 0)
        reading = json.loads(out)
        self.assertFalse(reading["allMailFound"])
        self.assertEqual(reading["accessibility"], {"received": 3, "unanswered": 2, "unansweredOver7Days": 1,
                                                    "oldestUnansweredAgeDays": 10.0})
        self.assertEqual(reading["repliesByVenue"], {"crazygames": 2})

    def test_an_empty_mailbox_reads_as_zeros_without_fetching(self):
        code, out, _ = self.probe(gmail())
        self.assertEqual(code, 0)
        reading = json.loads(out)
        self.assertEqual((reading["inbox"], reading["unread"]), (0, 0))
        self.assertEqual(reading["accessibility"], {"received": 0, "unanswered": 0, "unansweredOver7Days": 0,
                                                     "oldestUnansweredAgeDays": None})
        self.assertEqual(reading["repliesByVenue"], {"crazygames": 0})
        self.assertEqual(FakeIMAP.instances[0].fetches, [])

    def test_a_message_without_internaldate_counts_as_overdue(self):
        undated = fake_message(None, From="Someone <someone@example.org>", To="mehudak+a11y@brand.example",
                               Subject="hi", Message_ID="<u1@example.org>")
        code, out, err = self.probe(gmail(inbox=[undated]))
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out)["accessibility"], {"received": 1, "unanswered": 1, "unansweredOver7Days": 1,
                                                            "oldestUnansweredAgeDays": None})

    def failed_probe(self, expected_error="ProbeError"):
        target = os.path.join(self.dir, "brand-mail.json")
        code, out, _ = self.run_cli("probe", "--out", target, imap=imap_factory_for(gmail_fixture()))
        self.assertEqual(code, 1)
        self.assertEqual(json.loads(out), {"configured": True, "error": expected_error})
        self.assertFalse(os.path.exists(target))

    def test_a_mailbox_count_the_server_did_not_send_is_an_error_not_zero(self):
        # imaplib returns [None] when EXAMINE brings no EXISTS line; reading that as an empty inbox would hide mail.
        class NoExists(FakeIMAP):
            def select(self, mailbox="INBOX", readonly=False):
                super().select(mailbox, readonly)
                return "OK", [None]

        target = os.path.join(self.dir, "brand-mail.json")
        code, out, _ = self.run_cli("probe", "--out", target,
                                    imap=lambda h, p, ssl_context=None, timeout=None: NoExists(gmail_fixture(), GMAIL_LIST, h, p, ssl_context, timeout))
        self.assertEqual(code, 1)
        self.assertEqual(json.loads(out)["error"], "ProbeError")
        self.assertFalse(os.path.exists(target))

    def test_a_refused_examine_of_any_mailbox_it_reads_is_an_error_not_an_empty_mailbox(self):
        for name in ["INBOX", "[Gmail]/All Mail", "[Gmail]/Sent Mail", "[Gmail]/Spam"]:
            FakeIMAP.reset()
            FakeIMAP.fail_examine = (name,)
            self.failed_probe()

    def test_a_refused_fetch_search_or_list_is_an_error(self):
        for knob, value in [("fail_fetch", True), ("fail_fetch", "INTERNALDATE"), ("fail_fetch", "HEADER.FIELDS"),
                            ("fail_search", True), ("fail_list", True)]:
            FakeIMAP.reset()
            setattr(FakeIMAP, knob, value)
            self.failed_probe()

    def test_our_own_mail_is_left_out_by_its_message_id_even_without_a_from_line(self):
        # A copy of our own message with no From header (a server that trims it, a send-as alias): its Message-ID is ours.
        ours = fake_message(days_ago(9), To="mehudak+a11y@brand.example", Subject="accessibility test",
                            Message_ID="<self@brand.example>")
        code, out, err = self.probe(gmail(archived=[ours], sent=[ours]))
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out)["accessibility"]["received"], 0)

    def test_a_message_listed_in_two_mailboxes_is_counted_once(self):
        # Not Gmail (its All Mail leaves Spam out), but a server may list one message in both.
        reply = fake_message(days_ago(2), From="Desk <desk@crazygames.com>", Subject="Re: " + CG_SUBJECT,
                             Message_ID="<twice@crazygames.com>")
        code, out, err = self.probe(gmail(archived=[reply], spam=[reply]))
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out)["repliesByVenue"], {"crazygames": 1})

    def test_a_failed_login_writes_nothing_and_leaks_nothing(self):
        FakeIMAP.fail_login = imaplib.IMAP4.error("[AUTHENTICATIONFAILED] Invalid credentials " + PASSWORD)
        target = os.path.join(self.dir, "brand-mail.json")
        code, out, err = self.run_cli("probe", "--out", target, imap=imap_factory_for(gmail_fixture()))
        self.assertEqual(code, 1)
        self.assertFalse(os.path.exists(target))
        self.assertNotIn(PASSWORD, out + err)
        self.assertEqual(json.loads(out)["error"], "error")

    def test_malformed_headers_never_stop_the_probe(self):
        # Each of these raised inside email.policy.default on Python 3.11 (the reviews' fuzzing): AttributeError,
        # IndexError, TypeError. One such spam message used to stop every later probe.
        raws = [
            b"To: a@[\r\nSubject: accessibility\r\nMessage-ID: <m1@x.example>\r\n\r\n",
            b"From: x@y.example\r\nMessage-ID: <<<>>\r\nSubject: a11y\r\n\r\n",
            b"To: >a<b, ...;(\r\nFrom: >a<b\r\nSubject: hello\r\n\r\n",
            b"To: b\\\xff@[ \r\nSubject: =?x-unknown?q?abc?=\r\n\r\n",
        ]
        mails = [fake_message(days_ago(8), raw=r) for r in raws]
        target = os.path.join(self.dir, "brand-mail.json")
        code, out, err = self.run_cli("probe", "--out", target, imap=imap_factory_for(gmail(inbox=mails)))
        self.assertEqual(code, 0, err)
        self.assertTrue(os.path.exists(target))
        reading = json.loads(out)
        # The first two are accessibility mail by subject; neither was answered; both are 8 days old.
        self.assertEqual(reading["accessibility"]["received"], 2)
        self.assertEqual(reading["accessibility"]["unansweredOver7Days"], 2)
        for leak in ["x.example", "y.example", "x-unknown", "hello"]:
            self.assertNotIn(leak, out + err)
        # The send-side reader copes with them too.
        for raw in raws:
            msg = brand_mail.parse_headers(raw)
            brand_mail.is_accessibility_mail(msg)
            brand_mail.may_be_venue_reply(NOW, msg, self_venue(), {FIRST_ID}, days_ago(10))
            brand_mail.sent_to_venue(msg, self_venue())

    def test_a_message_that_cannot_be_parsed_at_all_counts_as_unanswered_accessibility_mail(self):
        marker = b"X-Unparseable: yes"
        real = brand_mail.parse_headers

        def parse(raw):
            if marker in raw:
                raise ValueError("header text nobody may print: Sender Golf <golf@example.org>")
            return real(raw)

        broken = fake_message(days_ago(9), raw=marker + b"\r\nSubject: nothing\r\n\r\n")
        with mock.patch.object(brand_mail, "parse_headers", parse):
            code, out, err = self.probe(gmail(inbox=[broken]))
        self.assertEqual(code, 0, err)
        reading = json.loads(out)
        self.assertEqual(reading["accessibility"], {"received": 1, "unanswered": 1, "unansweredOver7Days": 1,
                                                    "oldestUnansweredAgeDays": 9.0})
        self.assertNotIn("Golf", out + err)

    def test_a_message_the_classifier_chokes_on_counts_as_unanswered_accessibility_mail(self):
        real = brand_mail.is_accessibility_mail

        def classify(msg):
            if "choke" in brand_mail.decoded(msg, "Subject"):
                raise UnicodeError("header text nobody may print")
            return real(msg)

        odd = fake_message(days_ago(8), From="Someone <someone@example.org>", To=BRAND, Subject="choke", Message_ID="<c@example.org>")
        with mock.patch.object(brand_mail, "is_accessibility_mail", classify):
            code, out, err = self.probe(gmail(inbox=[odd]))
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out)["accessibility"], {"received": 1, "unanswered": 1, "unansweredOver7Days": 1,
                                                            "oldestUnansweredAgeDays": 8.0})

    def test_an_unexpected_error_prints_its_type_only(self):
        def boom(*_a, **_k):
            raise ValueError("Subject: a header nobody may print")

        with mock.patch.object(brand_mail, "accessibility_counts", boom):
            code, out, err = self.probe()
        self.assertEqual(code, 1)
        self.assertEqual(err, "error: ValueError\n")
        self.assertNotIn("nobody may print", out + err)

    def test_accessibility_recognition(self):
        yes = [
            {"To": "mehudak+accessibility@brand.example"},
            {"To": "Someone <mehudak+A11Y@brand.example>"},
            {"Delivered-To": "mehudak+a11y@brand.example"},
            {"Cc": "mehudak+accessibility@brand.example"},
            {"Subject": "Accessibility statement question"},
            {"Subject": "a11y: contrast"},
            {"Subject": email.header.Header("פנייה בנושא נגישות", "utf-8").encode()},
        ]
        no = [
            {"To": BRAND, "Subject": "Invoice question"},
            {"To": "mehudak+billing@brand.example", "Subject": "Hello"},
            {"Subject": "Your account is now accessible"},
        ]
        for h in yes:
            self.assertTrue(brand_mail.is_accessibility_mail(brand_mail.parse_headers(header_block(**{k.replace("-", "_"): v for k, v in h.items()}))), h)
        for h in no:
            self.assertFalse(brand_mail.is_accessibility_mail(brand_mail.parse_headers(header_block(**{k.replace("-", "_"): v for k, v in h.items()}))), h)


def self_venue():
    with open(REAL_QUESTIONS, encoding="utf-8") as f:
        return json.load(f)["venues"][0]


class RepositoryFilesTests(unittest.TestCase):
    def test_every_venue_in_the_real_file_keeps_the_message_rules_and_every_addressed_one_builds(self):
        with open(REAL_QUESTIONS, encoding="utf-8") as f:
            questions = json.load(f)
        for v in questions["venues"]:
            brand_mail.check_message_rules(questions, v)
            if not v["to"]:
                continue
            msg = brand_mail.build_message(v, BRAND, NOW)
            self.assertEqual(msg["To"], v["to"])
            self.assertEqual(msg.get_content(), v["body"])

    def test_the_real_sent_json_records_no_brand_address(self):
        with open(os.path.join(REPO_ROOT, "research", "owner-asks", "sent.json"), encoding="utf-8") as f:
            data = json.load(f)
        for rec in data["sent"]:
            self.assertNotIn(brand_mail.BRAND_MARK, rec["messageId"].split("@", 1)[0].lower())


if __name__ == "__main__":
    unittest.main()
