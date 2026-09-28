"""Tests for scripts/brand_mail.py. Standard library only; no network: SMTP and IMAP are fakes.

Run from the repository root or from scripts/:  python3 -m unittest -v
"""

import datetime as dt
import email
import email.header
import email.policy
import imaplib
import io
import json
import os
import shutil
import smtplib
import sys
import tempfile
import unittest

SCRIPTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO_ROOT = os.path.dirname(SCRIPTS_DIR)
if SCRIPTS_DIR not in sys.path:
    sys.path.insert(0, SCRIPTS_DIR)

import brand_mail  # noqa: E402

UTC = dt.timezone.utc
NOW = dt.datetime(2026, 10, 20, 12, 0, 0, tzinfo=UTC)
BRAND = "mehudak@gmail.com"
PASSWORD = "abcd efgh ijkl mnop"
PERSONAL = "owner.personal@example.org"  # a stand-in for any non-brand address
REAL_QUESTIONS = os.path.join(REPO_ROOT, "research", "owner-asks", "questions.json")
FIRST_ID = "<first-crazygames@gmail.com>"


# ---------------------------------------------------------------- fakes


class FakeSMTP:
    """Records what the script does with an SMTP_SSL connection. Class-level knobs set the failure mode."""

    instances = []
    fail_login = None
    fail_send = None

    def __init__(self, host, port, timeout=None, context=None):
        self.host, self.port, self.timeout, self.context = host, port, timeout, context
        self.logins, self.sent, self.quit_called = [], [], False
        FakeSMTP.instances.append(self)

    def login(self, user, password):
        if FakeSMTP.fail_login:
            raise FakeSMTP.fail_login
        self.logins.append((user, password))

    def send_message(self, msg):
        if FakeSMTP.fail_send:
            raise FakeSMTP.fail_send
        self.sent.append(msg)
        return {}

    def quit(self):
        self.quit_called = True

    @classmethod
    def reset(cls):
        cls.instances, cls.fail_login, cls.fail_send = [], None, None


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


def fake_message(received, seen=True, body="BODY-SECRET text nobody may print", **headers):
    return {"received": received, "seen": seen, "headers": header_block(**headers), "body": body}


def imap_date(when):
    return when.strftime("%d-%b-%Y %H:%M:%S +0000")


class FakeIMAP:
    """A read-only-checking IMAP4_SSL stand-in. Anything that could change the mailbox raises."""

    instances = []
    fail_login = None

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
            raise AssertionError("SELECT would open the mailbox read-write; the probe must EXAMINE")
        name = mailbox[1:-1] if mailbox.startswith('"') else mailbox
        self.selects.append(name)
        if name not in self.mailboxes:
            return "NO", [b"no such mailbox"]
        self.current = name
        return "OK", [str(len(self.mailboxes[name])).encode()]

    def search(self, charset, *criteria):
        msgs = self.mailboxes[self.current]
        if criteria == ("UNSEEN",):
            ids = [str(i + 1).encode() for i, m in enumerate(msgs) if not m["seen"]]
        elif criteria == ("ALL",):
            ids = [str(i + 1).encode() for i in range(len(msgs))]
        else:
            raise AssertionError("unexpected SEARCH %r" % (criteria,))
        return "OK", [b" ".join(ids)]

    def fetch(self, message_set, parts):
        self.fetches.append(parts)
        upper = parts.upper()
        if ("BODY[" in upper and "BODY.PEEK[" not in upper) or "RFC822" in upper or "BODY.PEEK[]" in upper or "TEXT]" in upper:
            raise AssertionError("fetch %r would read a body or set \\Seen" % parts)
        msgs = self.mailboxes[self.current]
        lo, hi = message_set.split(":")
        seqs = range(int(lo), int(hi) + 1)
        data = []
        for n in seqs:
            m = msgs[n - 1]
            if upper == "(INTERNALDATE)":
                data.append(('%d (INTERNALDATE "%s")' % (n, imap_date(m["received"]))).encode())
            elif "BODY.PEEK[HEADER.FIELDS" in upper:
                data.append(("%d (BODY[HEADER.FIELDS (...)] {%d}" % (n, len(m["headers"]))).encode())
                data[-1] = (data[-1], m["headers"])
                data.append(b")")
            else:
                raise AssertionError("unexpected FETCH %r" % parts)
        return "OK", data

    def list(self, directory='""', pattern="*"):
        return "OK", list(self.list_lines)

    def logout(self):
        self.logged_out = True
        return "BYE", [b""]

    def _forbidden(self, *_a, **_k):
        raise AssertionError("the probe must never change the mailbox")

    store = copy = move = expunge = append = create = delete = rename = subscribe = uid = _forbidden

    @classmethod
    def reset(cls):
        cls.instances, cls.fail_login = [], None


GMAIL_LIST = [
    b'(\\HasNoChildren) "/" "INBOX"',
    b'(\\All \\HasNoChildren) "/" "[Gmail]/All Mail"',
    b'(\\HasNoChildren \\Sent) "/" "[Gmail]/Sent Mail"',
]


def imap_factory_for(mailboxes, list_lines=GMAIL_LIST):
    def factory(host, port, ssl_context=None, timeout=None):
        return FakeIMAP(mailboxes, list_lines, host, port, ssl_context, timeout)

    return factory


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

    def run_cli(self, *argv, env=None, smtp=refuse_smtp, imap=refuse_imap, now=NOW):
        out, err = io.StringIO(), io.StringIO()
        args = list(argv) + ["--questions", self.questions, "--sent", self.sent]
        code = brand_mail.main(args, env=self.env if env is None else env, stdout=out, stderr=err, now=now,
                               smtp_factory=smtp, imap_factory=imap)
        return code, out.getvalue(), err.getvalue()

    def first_record(self, days_ago, venue="crazygames", status="sent", message_id=FIRST_ID, kind="first"):
        return {
            "venue": venue, "kind": kind, "status": status,
            "sentAt": (NOW - dt.timedelta(days=days_ago)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "messageId": message_id, "subject": "s", "to": "technical-support@crazygames.com",
        }


# ---------------------------------------------------------------- configuration and the brand-address guard


class ConfigurationTests(Harness):
    def test_send_without_secrets_exits_0_and_says_not_configured(self):
        code, out, _ = self.run_cli("send", "--venue", "crazygames", env={})
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)["configured"], False)

    def test_probe_without_secrets_exits_0_and_says_not_configured(self):
        code, out, _ = self.run_cli("probe", env={})
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out), {"configured": False, "missing": ["BRAND_MAIL_ADDRESS", "BRAND_MAIL_APP_PASSWORD"]})

    def test_one_secret_alone_is_not_configured(self):
        code, out, _ = self.run_cli("probe", env={"BRAND_MAIL_ADDRESS": BRAND})
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)["missing"], ["BRAND_MAIL_APP_PASSWORD"])

    def test_unconfigured_probe_writes_the_not_configured_reading_to_out(self):
        target = os.path.join(self.dir, "brand-mail.json")
        code, out, _ = self.run_cli("probe", "--out", target, env={})
        self.assertEqual(code, 0)
        with open(target, encoding="utf-8") as f:
            written = json.load(f)
        self.assertEqual(written["configured"], False)
        self.assertEqual(written["measuredAt"], "2026-10-20T12:00:00Z")

    def test_a_personal_address_is_refused_for_send_and_never_echoed(self):
        env = {"BRAND_MAIL_ADDRESS": PERSONAL, "BRAND_MAIL_APP_PASSWORD": PASSWORD}
        code, out, err = self.run_cli("send", "--venue", "crazygames", "--really-send",
                                      env=dict(env, GITHUB_REF="refs/heads/main"))
        self.assertEqual(code, 2)
        self.assertNotIn("owner.personal", out + err)
        self.assertNotIn(PASSWORD, out + err)
        self.assertEqual(FakeSMTP.instances, [])

    def test_a_personal_address_is_refused_for_probe(self):
        code, out, err = self.run_cli("probe", env={"BRAND_MAIL_ADDRESS": PERSONAL, "BRAND_MAIL_APP_PASSWORD": PASSWORD})
        self.assertEqual(code, 2)
        self.assertNotIn("owner.personal", out + err)

    def test_brand_address_rule(self):
        for ok in ["mehudak@gmail.com", "Mehudak.IL@gmail.com", "mehudak+a11y@gmail.com", "mehudak.app@outlook.com"]:
            self.assertTrue(brand_mail.is_brand_address(ok), ok)
        for bad in ["owner@gmail.com", "x@mehudak.com", "Mehudak <mehudak@gmail.com>", "mehudak@", "mehudak@@gmail.com",
                    "", "mehudak", "mehudak@gmail", " mehudak@gmail.com", "meh udak@gmail.com"]:
            self.assertFalse(brand_mail.is_brand_address(bad), bad)


# ---------------------------------------------------------------- send


class SendTests(Harness):
    def main_env(self):
        return dict(self.env, GITHUB_REF="refs/heads/main")

    def test_dry_run_prints_the_full_message_and_the_record_and_sends_nothing(self):
        code, out, _ = self.run_cli("send", "--venue", "crazygames")
        self.assertEqual(code, 0)
        result = json.loads(out)
        self.assertTrue(result["dryRun"])
        self.assertEqual(result["kind"], "first")
        rec = result["record"]
        self.assertEqual(rec["venue"], "crazygames")
        self.assertEqual(rec["to"], "technical-support@crazygames.com")
        self.assertEqual(rec["subject"], "Question: automated submission through the Developer Portal")
        self.assertEqual(rec["sentAt"], "2026-10-20T12:00:00Z")
        self.assertRegex(rec["messageId"], r"^<[^<>\s]+@gmail\.com>$")
        msg = email.message_from_string(result["message"], policy=email.policy.default)
        self.assertEqual(msg["Message-ID"], rec["messageId"])
        self.assertEqual(msg["To"], "technical-support@crazygames.com")
        self.assertEqual(msg["From"].addresses[0].addr_spec, BRAND)
        self.assertIn("this message was written and sent by that agent", msg.get_content())
        self.assertIn("preSend", result)
        self.assertEqual(FakeSMTP.instances, [])
        self.assertEqual(self.read_sent()["sent"], [])
        self.assertNotIn(PASSWORD, out)

    def test_the_body_goes_out_exactly_as_written_with_the_hebrew_signature_intact(self):
        with open(self.questions, encoding="utf-8") as f:
            body = json.load(f)["venues"][0]["body"]
        code, out, _ = self.run_cli("send", "--venue", "crazygames")
        msg = email.message_from_string(json.loads(out)["message"], policy=email.policy.default)
        self.assertEqual(msg.get_content(), body)
        self.assertTrue(msg.get_content().rstrip().endswith("Thank you,\nMehudak (מהודק)"))
        self.assertEqual(str(msg["From"].addresses[0].display_name), "Mehudak (מהודק)")
        self.assertTrue(all(ord(c) < 128 for c in json.loads(out)["message"]), "headers and body are 7-bit encoded")

    def test_a_real_send_needs_the_main_branch(self):
        for ref in [None, "refs/heads/claude/some-branch", "refs/pull/3/merge"]:
            env = dict(self.env)
            if ref:
                env["GITHUB_REF"] = ref
            code, _, err = self.run_cli("send", "--venue", "crazygames", "--really-send", env=env, smtp=FakeSMTP)
            self.assertEqual(code, 2, ref)
            self.assertIn("refs/heads/main", err)
        self.assertEqual(FakeSMTP.instances, [])

    def test_a_real_send_logs_in_as_the_brand_sends_once_and_appends_the_record(self):
        code, out, err = self.run_cli("send", "--venue", "crazygames", "--really-send", env=self.main_env(), smtp=FakeSMTP)
        self.assertEqual(code, 0, err)
        (smtp,) = FakeSMTP.instances
        self.assertEqual((smtp.host, smtp.port), ("smtp.gmail.com", 465))
        self.assertIsNotNone(smtp.context)
        self.assertIsNotNone(smtp.timeout)
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

    def test_smtp_host_and_port_are_overridable(self):
        env = dict(self.main_env(), BRAND_MAIL_SMTP_HOST="smtp.example.net", BRAND_MAIL_SMTP_PORT="2465")
        code, _, err = self.run_cli("send", "--venue", "crazygames", "--really-send", env=env, smtp=FakeSMTP)
        self.assertEqual(code, 0, err)
        self.assertEqual((FakeSMTP.instances[0].host, FakeSMTP.instances[0].port), ("smtp.example.net", 2465))

    def test_one_message_per_venue(self):
        self.write_sent([self.first_record(days_ago=1)], [])
        code, _, err = self.run_cli("send", "--venue", "crazygames", "--really-send", env=self.main_env(), smtp=FakeSMTP)
        self.assertEqual(code, 2)
        self.assertIn("follow-up", err)
        self.assertEqual(FakeSMTP.instances, [])
        self.assertEqual(len(self.read_sent()["sent"]), 1)

    def test_other_venues_are_not_blocked_by_one_venues_send(self):
        self.write_sent([self.first_record(days_ago=1)], [])
        code, out, err = self.run_cli("send", "--venue", "wix")
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out)["kind"], "first")

    def test_follow_up_is_refused_before_the_delay(self):
        self.write_sent([self.first_record(days_ago=6.9)], [])
        code, _, err = self.run_cli("send", "--venue", "crazygames", imap=imap_factory_for({"INBOX": [], "[Gmail]/Sent Mail": []}))
        self.assertEqual(code, 2)
        self.assertIn("7", err)

    def test_one_follow_up_after_the_delay_same_text_same_thread(self):
        self.write_sent([self.first_record(days_ago=7.1)], [])
        code, out, err = self.run_cli("send", "--venue", "crazygames", "--really-send", env=self.main_env(), smtp=FakeSMTP,
                                      imap=imap_factory_for({"INBOX": [], "[Gmail]/Sent Mail": []}))
        self.assertEqual(code, 0, err)
        (msg,) = FakeSMTP.instances[0].sent
        self.assertEqual(msg["In-Reply-To"], FIRST_ID)
        self.assertEqual(msg["References"], FIRST_ID)
        with open(self.questions, encoding="utf-8") as f:
            venue = json.load(f)["venues"][0]
        self.assertEqual(msg.get_content(), venue["body"])
        self.assertEqual(msg["Subject"], venue["subject"])
        rec = json.loads(out)["record"]
        self.assertEqual(rec["kind"], "follow-up")
        self.assertEqual(rec["inReplyTo"], FIRST_ID)
        self.assertEqual(len(self.read_sent()["sent"]), 2)
        # The live reply check opened the mailbox read-only.
        self.assertTrue(FakeIMAP.instances and FakeIMAP.instances[0].selects)

    def test_never_a_second_follow_up(self):
        follow = dict(self.first_record(days_ago=1, kind="follow-up", message_id="<f2@gmail.com>"))
        self.write_sent([self.first_record(days_ago=20), follow], [])
        code, _, err = self.run_cli("send", "--venue", "crazygames", imap=imap_factory_for({"INBOX": []}))
        self.assertEqual(code, 2)
        self.assertIn("follow-up", err)

    def test_no_follow_up_once_a_yes_or_no_is_recorded(self):
        for reading in ["YES", "NO"]:
            self.write_sent([self.first_record(days_ago=10)],
                            [{"venue": "crazygames", "recordedAt": "2026-10-15T00:00:00Z", "reading": reading, "inReplyCount": 1}])
            code, _, err = self.run_cli("send", "--venue", "crazygames", imap=imap_factory_for({"INBOX": []}))
            self.assertEqual(code, 2, reading)
            self.assertIn("recorded", err)

    def reply_inbox(self, count):
        return {
            "INBOX": [fake_message(NOW - dt.timedelta(days=3), In_Reply_To=FIRST_ID, Subject="Re: q",
                                   Message_ID="<r%d@crazygames.com>" % i, From="Venue Desk <desk@venue.example>")
                      for i in range(count)],
            "[Gmail]/Sent Mail": [],
        }

    def test_no_follow_up_while_an_unrecorded_reply_sits_in_the_inbox(self):
        self.write_sent([self.first_record(days_ago=10)], [])
        code, out, err = self.run_cli("send", "--venue", "crazygames", imap=imap_factory_for(self.reply_inbox(1)))
        self.assertEqual(code, 2)
        self.assertIn("reply", err)
        self.assertNotIn("desk", (out + err).lower())

    def test_follow_up_allowed_when_every_reply_was_read_and_recorded_not_answered(self):
        self.write_sent([self.first_record(days_ago=10)],
                        [{"venue": "crazygames", "recordedAt": "2026-10-15T00:00:00Z", "reading": "NOT ANSWERED", "inReplyCount": 1}])
        code, out, err = self.run_cli("send", "--venue", "crazygames", imap=imap_factory_for(self.reply_inbox(1)))
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out)["kind"], "follow-up")
        code, _, err = self.run_cli("send", "--venue", "crazygames", imap=imap_factory_for(self.reply_inbox(2)))
        self.assertEqual(code, 2, "a second, unread reply arrived after the NOT ANSWERED reading")

    def test_an_uncertain_send_blocks_the_venue_until_resolved(self):
        self.write_sent([self.first_record(days_ago=30, status="uncertain")], [])
        code, _, err = self.run_cli("send", "--venue", "crazygames", imap=imap_factory_for({"INBOX": []}))
        self.assertEqual(code, 2)
        self.assertIn("uncertain", err)

    def test_a_venue_with_no_recorded_address_is_refused(self):
        for venue in ["spreadshirt", "n8n"]:
            code, _, err = self.run_cli("send", "--venue", venue)
            self.assertEqual(code, 2, venue)
            self.assertIn("no recorded email address", err)

    def test_an_unknown_venue_is_refused(self):
        code, _, err = self.run_cli("send", "--venue", "paypal")
        self.assertEqual(code, 2)
        self.assertIn("unknown venue", err)

    def test_a_failed_login_sends_nothing_records_nothing_and_leaks_nothing(self):
        FakeSMTP.fail_login = smtplib.SMTPAuthenticationError(535, b"5.7.8 Username and Password not accepted " + PASSWORD.encode())
        code, out, err = self.run_cli("send", "--venue", "crazygames", "--really-send", env=self.main_env(), smtp=FakeSMTP)
        self.assertEqual(code, 1)
        self.assertEqual(self.read_sent()["sent"], [])
        self.assertNotIn(PASSWORD, out + err)
        self.assertEqual(json.loads(out)["error"], "SMTPAuthenticationError")

    def test_a_refused_recipient_records_nothing(self):
        FakeSMTP.fail_send = smtplib.SMTPRecipientsRefused({"technical-support@crazygames.com": (550, b"no")})
        code, out, _ = self.run_cli("send", "--venue", "crazygames", "--really-send", env=self.main_env(), smtp=FakeSMTP)
        self.assertEqual(code, 1)
        self.assertEqual(self.read_sent()["sent"], [])
        self.assertFalse(json.loads(out)["sent"])

    def test_a_connection_lost_mid_send_is_recorded_uncertain_so_it_cannot_go_twice(self):
        FakeSMTP.fail_send = smtplib.SMTPServerDisconnected("Connection unexpectedly closed")
        code, out, _ = self.run_cli("send", "--venue", "crazygames", "--really-send", env=self.main_env(), smtp=FakeSMTP)
        self.assertEqual(code, 1)
        (rec,) = self.read_sent()["sent"]
        self.assertEqual(rec["status"], "uncertain")
        self.assertEqual(json.loads(out)["record"], rec)
        code, _, _ = self.run_cli("send", "--venue", "crazygames", "--really-send", env=self.main_env(), smtp=FakeSMTP)
        self.assertEqual(code, 2)
        self.assertEqual(len(FakeSMTP.instances), 1)

    def test_held_questions_are_never_sent_by_this_command(self):
        code, out, _ = self.run_cli("send", "--venue", "crazygames")
        msg = email.message_from_string(json.loads(out)["message"], policy=email.policy.default)
        self.assertNotIn("Tipalti", msg.get_content())
        self.assertNotIn("finance@", json.loads(out)["message"])


# ---------------------------------------------------------------- probe


def gmail_fixture():
    old = NOW - dt.timedelta(days=10)
    return {
        "INBOX": [
            # 1: a staff reply to the CrazyGames question; unseen.
            fake_message(NOW - dt.timedelta(days=2), seen=False, From="Sender Alpha <alpha@venue.example>",
                         To=BRAND, Subject="Re: Question: automated submission", Message_ID="<rep1@crazygames.com>",
                         In_Reply_To=FIRST_ID, References=FIRST_ID),
            # 2: accessibility mail to the plus-address, 10 days old, never answered.
            fake_message(old, From="Sender Bravo <bravo@example.org>", To="mehudak+accessibility@gmail.com",
                         Subject="שאלה", Message_ID="<a11y-1@example.org>"),
            # 3: accessibility mail recognised by its Hebrew subject, 9 days old, answered from Sent.
            fake_message(NOW - dt.timedelta(days=9), From="Sender Charlie <charlie@example.org>", To=BRAND,
                         Subject="בעיית נגישות באתר", Message_ID="<a11y-2@example.org>"),
            # 4: accessibility mail recognised by its English subject, 2 days old, unanswered.
            fake_message(NOW - dt.timedelta(days=2), From="Sender Delta <delta@example.org>", To=BRAND,
                         Subject="Accessibility problem on the VAT page", Message_ID="<a11y-3@example.org>"),
            # 5: a newsletter; unseen; nothing to do with anything.
            fake_message(NOW - dt.timedelta(days=1), seen=False, From="News <news@example.org>", To=BRAND,
                         Subject="Weekly digest", Message_ID="<n1@example.org>"),
        ],
        "[Gmail]/Sent Mail": [
            fake_message(NOW - dt.timedelta(days=12), From=BRAND, To="technical-support@crazygames.com",
                         Subject="Question", Message_ID=FIRST_ID),
            fake_message(NOW - dt.timedelta(days=8), From=BRAND, To="charlie@example.org", Subject="Re: accessibility",
                         Message_ID="<ans@gmail.com>", In_Reply_To="<a11y-2@example.org>",
                         References="<a11y-2@example.org>"),
        ],
    }


LEAKS = ["Sender", "Alpha", "alpha@", "Bravo", "bravo@", "Charlie", "charlie@", "Delta", "delta@", "example.org", "venue.example",
         "crazygames.com", "rep1@", "a11y-1@", "BODY-SECRET", "Weekly", "digest", "נגישות", "שאלה", "Accessibility problem", "Re:",
         "news@", PASSWORD]


class ProbeTests(Harness):
    def setUp(self):
        super().setUp()
        self.write_sent([self.first_record(days_ago=12)], [])

    def probe(self, mailboxes=None, list_lines=GMAIL_LIST, *extra):
        return self.run_cli("probe", *extra, imap=imap_factory_for(mailboxes or gmail_fixture(), list_lines))

    def test_counts_unread_replies_and_accessibility_mail(self):
        code, out, err = self.probe()
        self.assertEqual(code, 0, err)
        self.assertEqual(json.loads(out), {
            "configured": True,
            "measuredAt": "2026-10-20T12:00:00Z",
            "inbox": 5,
            "unread": 2,
            "repliesByVenue": {"crazygames": 1},
            "accessibility": {"received": 3, "unanswered": 2, "unansweredOver7Days": 1, "oldestUnansweredAgeDays": 10.0},
            "sentFolderFound": True,
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

    def test_is_read_only_examine_and_peek_only(self):
        self.probe()
        (imap,) = FakeIMAP.instances
        self.assertEqual(imap.selects, ["INBOX", "[Gmail]/Sent Mail"])  # every one via EXAMINE (the fake raises otherwise)
        for parts in imap.fetches:
            self.assertTrue(parts == "(INTERNALDATE)" or parts.startswith("(BODY.PEEK[HEADER.FIELDS "), parts)
        self.assertTrue(imap.logged_out)
        self.assertEqual((imap.host, imap.port), ("imap.gmail.com", 993))
        self.assertIsNotNone(imap.ssl_context)
        self.assertIsNotNone(imap.timeout)

    def test_imap_host_and_port_are_overridable(self):
        self.env.update(BRAND_MAIL_IMAP_HOST="outlook.office365.com", BRAND_MAIL_IMAP_PORT="1993")
        self.probe()
        self.assertEqual((FakeIMAP.instances[0].host, FakeIMAP.instances[0].port), ("outlook.office365.com", 1993))

    def test_without_a_sent_folder_every_accessibility_mail_counts_as_unanswered(self):
        code, out, _ = self.probe(list_lines=[b'(\\HasNoChildren) "/" "INBOX"'])
        self.assertEqual(code, 0)
        reading = json.loads(out)
        self.assertFalse(reading["sentFolderFound"])
        self.assertEqual(reading["accessibility"]["unanswered"], 3)
        self.assertEqual(reading["accessibility"]["unansweredOver7Days"], 2)

    def test_an_empty_mailbox_reads_as_zeros_without_fetching(self):
        code, out, _ = self.probe({"INBOX": [], "[Gmail]/Sent Mail": []})
        self.assertEqual(code, 0)
        reading = json.loads(out)
        self.assertEqual((reading["inbox"], reading["unread"]), (0, 0))
        self.assertEqual(reading["accessibility"], {"received": 0, "unanswered": 0, "unansweredOver7Days": 0,
                                                     "oldestUnansweredAgeDays": None})
        self.assertEqual(FakeIMAP.instances[0].fetches, [])

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

    def test_a_failed_login_writes_nothing_and_leaks_nothing(self):
        FakeIMAP.fail_login = imaplib.IMAP4.error("[AUTHENTICATIONFAILED] Invalid credentials " + PASSWORD)
        target = os.path.join(self.dir, "brand-mail.json")
        code, out, err = self.run_cli("probe", "--out", target, imap=imap_factory_for(gmail_fixture()))
        self.assertEqual(code, 1)
        self.assertFalse(os.path.exists(target))
        self.assertNotIn(PASSWORD, out + err)
        self.assertEqual(json.loads(out)["error"], "error")

    def test_accessibility_recognition(self):
        yes = [
            {"To": "mehudak+accessibility@gmail.com"},
            {"To": "Someone <mehudak+A11Y@gmail.com>"},
            {"Delivered-To": "mehudak+a11y@gmail.com"},
            {"Cc": "mehudak+accessibility@gmail.com"},
            {"Subject": "Accessibility statement question"},
            {"Subject": "a11y: contrast"},
            {"Subject": email.header.Header("פנייה בנושא נגישות", "utf-8").encode()},
        ]
        no = [
            {"To": BRAND, "Subject": "Invoice question"},
            {"To": "mehudak+billing@gmail.com", "Subject": "Hello"},
            {"Subject": "Your account is now accessible"},
        ]
        for h in yes:
            self.assertTrue(brand_mail.is_accessibility_mail(brand_mail.parse_headers(header_block(**{k.replace("-", "_"): v for k, v in h.items()}))), h)
        for h in no:
            self.assertFalse(brand_mail.is_accessibility_mail(brand_mail.parse_headers(header_block(**{k.replace("-", "_"): v for k, v in h.items()}))), h)


class RepositoryFilesTests(unittest.TestCase):
    def test_every_addressed_venue_in_the_real_file_builds_a_message(self):
        with open(REAL_QUESTIONS, encoding="utf-8") as f:
            venues = json.load(f)["venues"]
        for v in venues:
            if not v["to"]:
                continue
            msg = brand_mail.build_message(v, BRAND, NOW)
            self.assertEqual(msg["To"], v["to"])
            self.assertEqual(msg.get_content(), v["body"])


if __name__ == "__main__":
    unittest.main()
