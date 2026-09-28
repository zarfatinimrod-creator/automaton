#!/usr/bin/env python3
"""The brand mailbox (owner step 8): send the four drafted venue questions, and probe the inbox for numbers.

WHY. research/breadth/BOARD.md Q2 admitted step 8 so the colony can ask the written yes/no questions that decide
CrazyGames, Wix, Spreadshirt and n8n (research/owner-asks/brand-mailbox-questions.md), and read the brand's
accessibility contact without the owner ever answering anyone. This environment's Gmail tools can draft but not send,
so a message leaves over SMTP from CI with the brand app password; .github/workflows/brand-mail.yml runs this script.

Standard library only (smtplib, imaplib, email): no dependency, nothing to install on the runner.

COMMANDS
  send --venue <id> [--really-send]
      Builds the message for <id> from research/owner-asks/questions.json and, by default, only prints it with the
      record it would write (a dry run). --really-send sends it over SMTP SSL and appends the record to
      research/owner-asks/sent.json, which the workflow commits. Refused (exit 2) when:
        - BRAND_MAIL_ADDRESS is not the brand mailbox (its local part must contain "mehudak"; never a personal one);
        - --really-send is used anywhere but GITHUB_REF=refs/heads/main;
        - the venue is unknown, or has no recorded email address (a form route is not this script's to use);
        - the venue already has a message in sent.json, unless it is the ONE follow-up the note allows: at least
          followUpAfterDays after the first send, no follow-up yet, no YES/NO reading recorded, no "uncertain" send,
          and no reply in the inbox that a NOT ANSWERED reading has not already accounted for (checked live, read-only).
      Held questions are never sent by this command: each goes only after a recorded written yes.
  probe [--out <file>]
      IMAP SSL, read-only: every mailbox is opened with EXAMINE and every fetch is BODY.PEEK of a few header fields or
      INTERNALDATE, so no flag ever changes. Prints (and with --out writes) numbers only: messages and unread in the
      inbox, replies per venue to the Message-IDs in sent.json, and accessibility-contact mail received, unanswered,
      unanswered for 7+ days, and the oldest unanswered one's age. No body, sender, address or subject is printed or
      written, ever.

  Both exit 0 with {"configured": false, ...} while BRAND_MAIL_ADDRESS or BRAND_MAIL_APP_PASSWORD is unset, so CI stays
  green before step 8 exists.

HOW ACCESSIBILITY MAIL IS RECOGNISED
  A message in the inbox is accessibility-contact mail when either holds:
    - a To, Cc or Delivered-To address has a plus tag "+accessibility" or "+a11y" (any case), e.g.
      mehudak+accessibility@gmail.com. This is the address to publish as il-biz-tools' accessibility contact: Gmail
      delivers plus-addressed mail to the same inbox, and the tag survives in the headers;
    - its Subject contains "accessibility", "a11y" or "נגישות" (any case), which catches mail sent to the bare address.
  It counts as answered when a message in the Sent folder (found by its \\Sent special-use flag) carries its
  Message-ID in In-Reply-To or References, i.e. the brand replied in that thread. Without a Sent folder, or without a
  Message-ID to match, it counts as unanswered: a missed answer shows as a blocker, never the reverse.

ENVIRONMENT
  BRAND_MAIL_ADDRESS, BRAND_MAIL_APP_PASSWORD   the secrets step 8 creates (read only from the environment)
  BRAND_MAIL_SMTP_HOST / _PORT                  default smtp.gmail.com:465
  BRAND_MAIL_IMAP_HOST / _PORT                  default imap.gmail.com:993
  GITHUB_REF                                    must be refs/heads/main for --really-send

EXIT CODES  0 done (or not configured) · 1 the mail server failed · 2 refused by a guard or bad input
"""

import argparse
import datetime as dt
import email
import email.policy
import email.utils
import imaplib
import json
import os
import re
import smtplib
import ssl
import sys
import tempfile
from email.headerregistry import Address
from email.message import EmailMessage

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUESTIONS = os.path.join(REPO_ROOT, "research", "owner-asks", "questions.json")
SENT = os.path.join(REPO_ROOT, "research", "owner-asks", "sent.json")

BRAND_MARK = "mehudak"
BRAND_DISPLAY_NAME = "Mehudak (מהודק)"
SECRETS = ("BRAND_MAIL_ADDRESS", "BRAND_MAIL_APP_PASSWORD")
MAIN_REF = "refs/heads/main"
DEFAULT_SMTP = ("smtp.gmail.com", 465)
DEFAULT_IMAP = ("imap.gmail.com", 993)
TIMEOUT_SECONDS = 30

A11Y_PLUS_TAGS = ("+accessibility@", "+a11y@")
A11Y_SUBJECT_WORDS = ("accessibility", "a11y", "נגישות")
A11Y_ANSWER_DAYS = 7
HEADER_FIELDS = "(TO CC DELIVERED-TO SUBJECT MESSAGE-ID IN-REPLY-TO REFERENCES)"

# SMTP errors raised by send_message that mean the server refused the message outright: nothing was delivered.
# Anything else during send_message (a dropped connection, a timeout) leaves delivery unknown.
REFUSED_BEFORE_DELIVERY = (smtplib.SMTPRecipientsRefused, smtplib.SMTPSenderRefused, smtplib.SMTPDataError)

ADDR_SPEC = re.compile(r"^[^@\s<>\"(),;:]+@[^@\s<>\"(),;:]+\.[^@\s<>\"(),;:]+$")
MSGID = re.compile(r"<[^<>\s]+>")


class Refused(Exception):
    """A guard said no. The message never names the address or the password."""


# ---------------------------------------------------------------- small helpers


def iso_z(when):
    return when.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(text):
    return dt.datetime.fromisoformat(text.replace("Z", "+00:00"))


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write_json_atomic(path, data):
    directory = os.path.dirname(os.path.abspath(path))
    os.makedirs(directory, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=directory, prefix=".brand-mail-", suffix=".json")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    os.replace(tmp, path)


def is_brand_address(address):
    """True only for a bare addr-spec whose local part contains "mehudak". The domain does not count."""
    if not isinstance(address, str) or not ADDR_SPEC.match(address):
        return False
    local = address.rsplit("@", 1)[0]
    return BRAND_MARK in local.lower()


def brand_config(env):
    """None when a secret is missing; raises Refused when the address is not the brand's."""
    missing = [name for name in SECRETS if not env.get(name)]
    if missing:
        return None, missing
    address = env["BRAND_MAIL_ADDRESS"]
    if not is_brand_address(address):
        raise Refused(
            "BRAND_MAIL_ADDRESS is not the brand mailbox: it must be a bare address whose local part contains "
            "'%s'. Nothing was sent or read." % BRAND_MARK
        )
    return {
        "address": address,
        "password": env["BRAND_MAIL_APP_PASSWORD"],
        "smtp": (env.get("BRAND_MAIL_SMTP_HOST") or DEFAULT_SMTP[0], int(env.get("BRAND_MAIL_SMTP_PORT") or DEFAULT_SMTP[1])),
        "imap": (env.get("BRAND_MAIL_IMAP_HOST") or DEFAULT_IMAP[0], int(env.get("BRAND_MAIL_IMAP_PORT") or DEFAULT_IMAP[1])),
    }, []


def message_ids(value):
    return MSGID.findall(value or "")


# ---------------------------------------------------------------- send


def find_venue(questions, venue_id):
    for venue in questions["venues"]:
        if venue["venue"] == venue_id:
            return venue
    raise Refused("unknown venue %r; known: %s" % (venue_id, ", ".join(v["venue"] for v in questions["venues"])))


def plan_send(venue, sent, now):
    """Decide first / follow-up / refuse from sent.json alone. Returns (kind, first_record_or_None)."""
    vid = venue["venue"]
    if not venue.get("to"):
        raise Refused("%s has no recorded email address; its route is: %s" % (vid, venue.get("route", "unknown")))
    mine = [r for r in sent.get("sent", []) if r.get("venue") == vid]
    if not mine:
        return "first", None
    if any(r.get("status") != "sent" for r in mine):
        raise Refused(
            "%s has an uncertain send in sent.json (the connection failed mid-send, so it may have been delivered). "
            "Check the Sent folder, set its status to \"sent\" or remove the record, then decide." % vid
        )
    readings = [r for r in sent.get("repliesRecorded", []) if r.get("venue") == vid]
    if any(r.get("reading") in ("YES", "NO") for r in readings):
        raise Refused("%s has a YES/NO reply recorded; this script sends nothing more there." % vid)
    if any(r.get("kind") == "follow-up" for r in mine):
        raise Refused("%s already has its first message and its one follow-up; record UNANSWERED instead." % vid)
    first = min(mine, key=lambda r: r["sentAt"])
    age_days = (now - parse_iso(first["sentAt"])).total_seconds() / 86400
    wait = venue.get("followUpAfterDays", 7)
    if age_days < wait:
        raise Refused(
            "%s was sent %.1f days ago: one message per venue, and a single follow-up only after %d days with no reply."
            % (vid, age_days, wait)
        )
    return "follow-up", first


def recorded_not_answered(sent, venue_id):
    """How many in-reply messages a NOT ANSWERED reading already accounted for (auto-acknowledgements and the like)."""
    counts = [r.get("inReplyCount", 0) for r in sent.get("repliesRecorded", [])
              if r.get("venue") == venue_id and r.get("reading") == "NOT ANSWERED"]
    return max(counts) if counts else 0


def build_message(venue, address, now, in_reply_to=None):
    msg = EmailMessage()
    msg["From"] = Address(display_name=BRAND_DISPLAY_NAME, addr_spec=address)
    msg["To"] = venue["to"]
    msg["Subject"] = venue["subject"]
    msg["Date"] = email.utils.format_datetime(now.astimezone(dt.timezone.utc))
    msg["Message-ID"] = email.utils.make_msgid(idstring=BRAND_MARK, domain=address.rsplit("@", 1)[1])
    if in_reply_to:
        msg["In-Reply-To"] = in_reply_to
        msg["References"] = in_reply_to
    msg.set_content(venue["body"], cte="quoted-printable")
    return msg


def make_record(venue, kind, msg, now, status, in_reply_to=None):
    record = {
        "venue": venue["venue"],
        "kind": kind,
        "status": status,
        "sentAt": iso_z(now),
        "messageId": msg["Message-ID"],
        "subject": venue["subject"],
        "to": venue["to"],
    }
    if in_reply_to:
        record["inReplyTo"] = in_reply_to
    return record


def append_record(sent_path, record):
    data = load_json(sent_path)
    data.setdefault("sent", []).append(record)
    write_json_atomic(sent_path, data)


def cmd_send(args, env, out, now, smtp_factory, imap_factory):
    cfg, missing = brand_config(env)
    if cfg is None:
        return done(out, {"configured": False, "missing": missing}, 0)
    if args.really_send and env.get("GITHUB_REF") != MAIN_REF:
        raise Refused("a real send runs only from %s (the brand-mail workflow on main); this is a dry-run branch." % MAIN_REF)
    questions = load_json(args.questions)
    sent = load_json(args.sent)
    venue = find_venue(questions, args.venue)
    kind, first = plan_send(venue, sent, now)
    in_reply_to = first["messageId"] if first else None
    if kind == "follow-up":
        live = count_replies_live(cfg, [first["messageId"]], imap_factory)
        if live > recorded_not_answered(sent, venue["venue"]):
            raise Refused(
                "%d message(s) in the inbox reply to %s's first message and are not recorded. Read them and record the "
                "reading in the venue's note and sent.json's repliesRecorded before any follow-up." % (live, venue["venue"])
            )

    msg = build_message(venue, cfg["address"], now, in_reply_to)
    if not args.really_send:
        return done(out, {
            "configured": True,
            "dryRun": True,
            "kind": kind,
            "preSend": venue.get("preSend", ""),
            "record": make_record(venue, kind, msg, now, "sent", in_reply_to),
            "message": msg.as_string(),
        }, 0)

    host, port = cfg["smtp"]
    try:
        smtp = smtp_factory(host, port, timeout=TIMEOUT_SECONDS, context=ssl.create_default_context())
    except (OSError, smtplib.SMTPException) as exc:
        return done(out, {"configured": True, "sent": False, "error": type(exc).__name__}, 1)
    try:
        try:
            smtp.login(cfg["address"], cfg["password"])
        except (OSError, smtplib.SMTPException) as exc:
            return done(out, {"configured": True, "sent": False, "error": type(exc).__name__}, 1)
        try:
            smtp.send_message(msg)
        except REFUSED_BEFORE_DELIVERY as exc:
            return done(out, {"configured": True, "sent": False, "error": type(exc).__name__}, 1)
        except (OSError, smtplib.SMTPException) as exc:
            record = make_record(venue, kind, msg, now, "uncertain", in_reply_to)
            append_record(args.sent, record)
            return done(out, {"configured": True, "sent": None, "error": type(exc).__name__, "record": record}, 1)
    finally:
        try:
            smtp.quit()
        except Exception:  # noqa: BLE001 - a failed QUIT after a completed send changes nothing
            pass
    record = make_record(venue, kind, msg, now, "sent", in_reply_to)
    append_record(args.sent, record)
    return done(out, {"configured": True, "sent": True, "record": record}, 0)


# ---------------------------------------------------------------- IMAP (read-only)


class ProbeError(Exception):
    pass


def quote_mailbox(name):
    return '"%s"' % name.replace("\\", "\\\\").replace('"', '\\"')


def examine(imap, name):
    """Open a mailbox read-only (imaplib sends EXAMINE for readonly=True). Returns its message count."""
    typ, data = imap.select(quote_mailbox(name), readonly=True)
    if typ != "OK":
        raise ProbeError("EXAMINE failed")
    try:
        return int(data[0])
    except (TypeError, ValueError, IndexError):
        # imaplib returns [None] when the server sent no EXISTS line. Unknown is not zero: an "empty" inbox would
        # hide exactly the mail the probe exists to find.
        raise ProbeError("EXAMINE returned no message count") from None


LIST_LINE = re.compile(rb'^\((?P<flags>[^)]*)\) (?:"(?:[^"\\]|\\.)*"|NIL) (?P<name>.+)$')


def find_sent_mailbox(imap):
    typ, data = imap.list()
    if typ != "OK":
        return None
    for item in data or []:
        if not isinstance(item, bytes):
            continue
        m = LIST_LINE.match(item)
        if not m or b"\\sent" not in m.group("flags").lower():
            continue
        name = m.group("name").decode("ascii", "replace")
        if name.startswith('"') and name.endswith('"'):
            name = name[1:-1].replace('\\"', '"').replace("\\\\", "\\")
        return name
    return None


def parse_headers(raw):
    return email.message_from_bytes(raw, policy=email.policy.default)


INTERNALDATE = re.compile(rb'INTERNALDATE "([^"]+)"')


def fetch_mailbox(imap, count, with_dates):
    """[(received_or_None, headers)] for messages 1..count, by sequence number. Headers only, via BODY.PEEK."""
    if count == 0:
        return []
    span = "1:%d" % count
    headers = {}
    typ, data = imap.fetch(span, "(BODY.PEEK[HEADER.FIELDS %s])" % HEADER_FIELDS)
    if typ != "OK":
        raise ProbeError("FETCH failed")
    for item in data:
        if isinstance(item, tuple) and len(item) >= 2:
            headers[int(item[0].split(b" ", 1)[0])] = parse_headers(item[1])
    dates = {}
    if with_dates:
        typ, data = imap.fetch(span, "(INTERNALDATE)")
        if typ != "OK":
            raise ProbeError("FETCH failed")
        for item in data:
            raw = item[0] if isinstance(item, tuple) else item
            if not isinstance(raw, bytes):
                continue
            m = INTERNALDATE.search(raw)
            if m:
                try:
                    when = dt.datetime.strptime(m.group(1).decode("ascii"), "%d-%b-%Y %H:%M:%S %z")
                except ValueError:
                    continue
                dates[int(raw.split(b" ", 1)[0])] = when
    return [(dates.get(seq), headers[seq]) for seq in sorted(headers)]


def header_text(msg, name):
    values = msg.get_all(name) or []
    return " ".join(str(v) for v in values)


def refers_to(msg):
    return set(message_ids(header_text(msg, "In-Reply-To")) + message_ids(header_text(msg, "References")))


def is_accessibility_mail(msg):
    for name in ("To", "Cc", "Delivered-To"):
        for _display, addr in email.utils.getaddresses([header_text(msg, name)]):
            if any(tag in addr.lower() for tag in A11Y_PLUS_TAGS):
                return True
    subject = header_text(msg, "Subject").lower()
    return any(word in subject for word in A11Y_SUBJECT_WORDS)


def connect_imap(cfg, imap_factory):
    host, port = cfg["imap"]
    imap = imap_factory(host, port, ssl_context=ssl.create_default_context(), timeout=TIMEOUT_SECONDS)
    imap.login(cfg["address"], cfg["password"])
    return imap


def close_imap(imap):
    try:
        imap.logout()
    except Exception:  # noqa: BLE001 - logging out of a read-only session changes nothing
        pass


def count_replies(inbox, ids):
    wanted = set(ids)
    return sum(1 for _when, msg in inbox if refers_to(msg) & wanted)


def count_replies_live(cfg, ids, imap_factory):
    imap = connect_imap(cfg, imap_factory)
    try:
        return count_replies(fetch_mailbox(imap, examine(imap, "INBOX"), with_dates=False), ids)
    finally:
        close_imap(imap)


def accessibility_counts(inbox, sent_folder, now):
    answered_ids = set()
    for _when, msg in sent_folder:
        answered_ids |= refers_to(msg)
    received = unanswered = over = 0
    ages = []
    for when, msg in inbox:
        if not is_accessibility_mail(msg):
            continue
        received += 1
        own = message_ids(header_text(msg, "Message-ID"))
        if own and own[0] in answered_ids:
            continue
        unanswered += 1
        if when is None:
            over += 1  # no INTERNALDATE: its age is unknown, so it is counted as overdue rather than hidden
            continue
        age = (now - when).total_seconds() / 86400
        ages.append(age)
        if age >= A11Y_ANSWER_DAYS:
            over += 1
    oldest = round(max(ages), 1) if ages else None
    return {"received": received, "unanswered": unanswered, "unansweredOver7Days": over, "oldestUnansweredAgeDays": oldest}


def cmd_probe(args, env, out, now, imap_factory):
    cfg, missing = brand_config(env)
    if cfg is None:
        reading = {"configured": False, "missing": missing}
        if args.out:
            write_json_atomic(args.out, {"configured": False, "measuredAt": iso_z(now)})
        return done(out, reading, 0)
    sent = load_json(args.sent)
    try:
        imap = connect_imap(cfg, imap_factory)
    except (OSError, imaplib.IMAP4.error, ssl.SSLError) as exc:
        return done(out, {"configured": True, "error": type(exc).__name__}, 1)
    try:
        total = examine(imap, "INBOX")
        typ, data = imap.search(None, "UNSEEN")
        if typ != "OK":
            raise ProbeError("SEARCH failed")
        unread = len((data[0] or b"").split()) if data else 0
        inbox = fetch_mailbox(imap, total, with_dates=True)
        sent_name = find_sent_mailbox(imap)
        sent_folder = fetch_mailbox(imap, examine(imap, sent_name), with_dates=False) if sent_name else []
    except (OSError, imaplib.IMAP4.error, ProbeError) as exc:
        return done(out, {"configured": True, "error": type(exc).__name__}, 1)
    finally:
        close_imap(imap)

    by_venue = {}
    for record in sent.get("sent", []):
        by_venue.setdefault(record["venue"], []).append(record["messageId"])
    reading = {
        "configured": True,
        "measuredAt": iso_z(now),
        "inbox": total,
        "unread": unread,
        "repliesByVenue": {venue: count_replies(inbox, ids) for venue, ids in by_venue.items()},
        "accessibility": accessibility_counts(inbox, sent_folder, now),
        "sentFolderFound": sent_name is not None,
    }
    if args.out:
        write_json_atomic(args.out, reading)
    return done(out, reading, 0)


# ---------------------------------------------------------------- CLI


def done(out, data, code):
    """Print the command's one JSON document and hand back its exit code."""
    out.write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    return code


def parse_args(argv):
    parser = argparse.ArgumentParser(prog="brand_mail.py", description=__doc__.split("\n\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("send", "probe"):
        p = sub.add_parser(name)
        p.add_argument("--questions", default=QUESTIONS)
        p.add_argument("--sent", default=SENT)
        if name == "send":
            p.add_argument("--venue", required=True)
            p.add_argument("--really-send", action="store_true", help="send for real (default: dry run)")
        else:
            p.add_argument("--out", help="also write the reading here (e.g. state/colony/brand-mail.json)")
    return parser.parse_args(argv)


def main(argv=None, env=None, stdout=None, stderr=None, now=None, smtp_factory=None, imap_factory=None):
    env = os.environ if env is None else env
    out = stdout or sys.stdout
    err = stderr or sys.stderr
    now = now or dt.datetime.now(dt.timezone.utc)
    smtp_factory = smtp_factory or smtplib.SMTP_SSL
    imap_factory = imap_factory or imaplib.IMAP4_SSL
    args = parse_args(argv)
    try:
        if args.command == "send":
            return cmd_send(args, env, out, now, smtp_factory, imap_factory)
        return cmd_probe(args, env, out, now, imap_factory)
    except Refused as exc:
        err.write("refused: %s\n" % exc)
        return 2
    except (OSError, imaplib.IMAP4.error, ProbeError) as exc:
        # Only reachable from the live reply check before a follow-up; the message of an IMAP error can carry server
        # text, so only its type is printed.
        err.write("mail server error: %s\n" % type(exc).__name__)
        return 1


if __name__ == "__main__":
    sys.exit(main())
