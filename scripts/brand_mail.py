#!/usr/bin/env python3
"""The brand mailbox (owner step 8): send the drafted venue questions (seven on 28.9.2026), probe the mailbox for numbers,
and answer Pro refund requests (RULING-2026-09-29-lines (h)).

WHY. research/breadth/BOARD.md Q2 admitted step 8 so the colony can ask the written yes/no questions that decide
CrazyGames, Wix, Spreadshirt and n8n (research/owner-asks/brand-mailbox-questions.md), and read the brand's
accessibility contact without the owner ever answering anyone. This environment's Gmail tools can draft but not send,
so a message leaves over SMTP from CI with the brand app password; .github/workflows/brand-mail.yml runs this script.

Standard library only (smtplib, imaplib, email): no dependency, nothing to install on the runner.

COMMANDS
  send --venue <id> [--really-send --message-sha256 <hex>]
      Builds the message for <id> from research/owner-asks/questions.json. By default it only prints the message, the
      record it would write and the message's messageSha256 (a dry run). --really-send sends it over SMTP SSL, and only
      when --message-sha256 equals the digest a dry run printed, so what leaves is what was read. Refused (exit 2) when:
        - BRAND_MAIL_ADDRESS is not the brand mailbox (its local part must contain "mehudak"; never a personal one);
        - --really-send is used anywhere but GITHUB_REF=refs/heads/main, or without the dry run's digest;
        - the venue is unknown, or has no recorded email address (a form route is not this script's to use);
        - the message breaks a rule every message keeps: each disclosure phrase and the brand signature in the body;
          no "@", link, phone number or street address in the subject or body; followUpAfterDays of 7 or more;
        - the Sent folder holds a message to the venue (its address or its subject) that sent.json does not record, or
          no Sent folder is found to check: a send whose record never reached the repository must not go twice;
        - the venue already has a message in sent.json, unless it is the ONE follow-up the note allows: at least
          followUpAfterDays after the first send, no follow-up yet, no YES/NO reading recorded, no "uncertain" send,
          and no message since the first send that may be the venue's reply and that no recorded reading lists in its
          coveredMessageIds. "May be a reply" is wide on purpose: threaded to our message, from the venue's domain,
          or carrying our subject; looked for in All Mail (so archived mail counts) and in Spam.
      Held questions are never sent by this command: each goes only after a recorded written yes.
      The record is written ahead: it goes into sent.json as "uncertain" before the message is handed to the server,
      becomes "sent" when the server accepts it, and is removed only when the server refuses it outright. A dropped
      connection, a timeout or a cancelled run leaves it "uncertain", and that blocks the venue.
  probe [--out <file>]
      IMAP SSL, read-only: every mailbox is opened with EXAMINE and every fetch is BODY.PEEK of a few header fields or
      INTERNALDATE, so no flag ever changes. Prints (and with --out writes) numbers only: messages and unread in the
      inbox, possible replies per venue (as above, since that venue's first send), and accessibility-contact mail
      received, unanswered, unanswered for 7+ days, and the oldest unanswered one's age. No body, sender, address or
      subject is printed or written, ever. It also writes "responders": ["gumroad-refund"] - and [] otherwise - only
      when this script has the respond-refunds command AND .github/workflows/brand-mail.yml runs it for real on a
      schedule: a cron under `on: schedule:` and a `respond-refunds` job that is word for word the pinned one (its
      `if:`, its environment, no `needs:`, no step `if:` but the main-ref guard's, and a respond step whose env and run
      add --apply on the schedule; refund_job_runs_on_schedule). il-biz-tools' `enable` refuses without it: a refund
      window on the page is honest only while something answers the requests.
  respond-refunds [--apply] [--questions <file>] [--sent <file>]
      The Pro refund responder. A DRY RUN unless --apply (the schedule passes it; a manual dispatch does only when
      really_refund is ticked), and --apply runs only from refs/heads/main. Reads unanswered INBOX mail of the last
      REFUND_LOOKBACK_DAYS days (UID SEARCH NOT ANSWERED SINCE, FETCH BODY.PEEK[]: reading never sets \\Seen; a dry run
      opens the inbox with EXAMINE) - and none at all while products/il-biz-tools/src/config/site.json has no
      gumroad.productId: then nothing can have been sold, and it prints {"configured": false} and exits 0. It acts on
      a message only when all of these hold:
        - it is not the brand's own mail, not accessibility mail, not mail that may belong to a venue question's
          thread (threaded to a sent.json message, from a venue's domain, or carrying a venue question's subject), not
          automated or list mail (Auto-Submitted, Precedence bulk/list/junk, List-Id or List-Unsubscribe) and not from
          a no-reply, mailer-daemon or gumroad.com address: an automatic answer to an automatic message is how mail
          loops start;
        - the sender's own words - the subject, or the body above the quoted message ("> " lines and everything from
          a reply header down; <blockquote> and Gmail's quote block in HTML-only mail) - ask for a refund, the money
          back or the cancellation of the purchase, as whole words and phrases, never a bare verb (REFUND_REQUEST,
          after NOT_A_REFUND_REQUEST - a tax, expense or customer refund, the policy, a refund the sender does not
          want - is cut out). A receipt reply that asks something else is not a refund request;
        - the topmost Authentication-Results header - the one the receiving server prepends; anything below it came
          with the message and proves nothing - is the receiving server's own (authserv-id BRAND_MAIL_AUTHSERV_ID,
          default mx.google.com) and shows dkim=pass or spf=pass for a domain aligned with the one From address (the
          From domain or a parent of it). A spoofed From never gets a refund, and never gets an answer either.
      For such a message it runs products/il-biz-tools/scripts/gumroad-pro-product.js refund --email <From>
      --requested-at <the server's INTERNALDATE> [--apply] - that command alone decides which sale, if any: this
      product, this buyer, inside the window in force, once - and then, only if the command did not stop, replies to
      the From address (never Reply-To) with REFUND_REPLY, one fixed sentence that is the same whatever the command
      found, so it never says whether the address bought anything; and marks the request \\Answered, so the next run
      leaves it alone. One answer per sender per run, at most MAX_REFUND_REQUESTS_PER_RUN per run. A command that stops
      or a reply that cannot be sent leaves the request unanswered for the next run and exits 1. Prints counts, IMAP
      UIDs and the command's own lines (sale ids and counts; any address redacted) - never an address, subject or body.

  All three exit 0 with {"configured": false, ...} while BRAND_MAIL_ADDRESS or BRAND_MAIL_APP_PASSWORD is unset (and
  respond-refunds while GUMROAD_ACCESS_TOKEN or site.json's gumroad.productId is), so CI stays green before step 8
  exists and before the Pro product does.

WHICH MAIL IS READ
  Headers are parsed with the lenient compat32 parser: email.policy.default raises on some malformed address and
  Message-ID headers (fuzzed 28.9.2026 on Python 3.11), and one such message would stop every later probe. A message
  that still cannot be read is kept and counted on the safe side: as unanswered accessibility mail, as a possible reply.
  Mail is read from All Mail (the \\All special-use mailbox: every label, archived mail included, Spam and Trash not),
  or from the inbox where the server has no \\All. Messages the brand sent itself (From the brand address, or a
  Message-ID in the Sent folder or in sent.json) are left out. [INFERENCE: Gmail's LIST flags "[Gmail]/All Mail" \\All,
  "[Gmail]/Spam" \\Junk and "[Gmail]/Sent Mail" \\Sent; the probe reports allMailFound and sentFolderFound.]

HOW ACCESSIBILITY MAIL IS RECOGNISED
  A message is accessibility-contact mail when either holds:
    - a To, Cc or Delivered-To header carries a plus tag "+accessibility@" or "+a11y@" (any case), i.e. mail sent to
      <brand-local>+accessibility@<brand-domain>, the address to publish as il-biz-tools' accessibility contact once
      step 8 exists. Gmail delivers plus-addressed mail to the same mailbox [INFERENCE: and keeps the tag in these
      headers; check with one test mail after step 8];
    - its Subject contains "accessibility", "a11y" or "נגישות" (any case), which catches mail sent to the bare address.
  It counts as answered when a message in the Sent folder carries its Message-ID in In-Reply-To or References, i.e.
  the brand replied in that thread. Without a Sent folder, or without a Message-ID to match, it counts as unanswered,
  and archiving it answers nothing: a missed answer shows as a blocker, never the reverse. Spam is not read for it.

ENVIRONMENT
  BRAND_MAIL_ADDRESS, BRAND_MAIL_APP_PASSWORD   the secrets step 8 creates (read only from the environment)
  BRAND_MAIL_SMTP_HOST / _PORT                  default smtp.gmail.com:465
  BRAND_MAIL_IMAP_HOST / _PORT                  default imap.gmail.com:993
  GUMROAD_ACCESS_TOKEN                          respond-refunds only: handed to the refund command, nothing else
  BRAND_MAIL_AUTHSERV_ID                        respond-refunds: the receiving server's authserv-id (mx.google.com)
  GITHUB_REF                                    must be refs/heads/main for --really-send and for respond-refunds --apply

EXIT CODES  0 done (or not configured) · 1 the mail server failed, or an unexpected error · 2 refused by a guard
"""

import argparse
import datetime as dt
import email
import email.header
import email.policy
import email.utils
import hashlib
import html as html_lib
import imaplib
import json
import os
import re
import smtplib
import ssl
import subprocess
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
MIN_FOLLOW_UP_DAYS = 7

A11Y_PLUS_TAGS = ("+accessibility@", "+a11y@")
A11Y_SUBJECT_WORDS = ("accessibility", "a11y", "נגישות")
A11Y_ANSWER_DAYS = 7
HEADER_FIELDS = "(FROM TO CC DELIVERED-TO SUBJECT MESSAGE-ID IN-REPLY-TO REFERENCES)"

# SMTP errors raised by send_message that mean the server refused the message outright: nothing was delivered.
# Anything else during send_message (a dropped connection, a timeout) leaves delivery unknown.
REFUSED_BEFORE_DELIVERY = (smtplib.SMTPRecipientsRefused, smtplib.SMTPSenderRefused, smtplib.SMTPDataError)

ADDR_SPEC = re.compile(r"^[^@\s<>\"(),;:]+@[^@\s<>\"(),;:]+\.[^@\s<>\"(),;:]+$")
MSGID = re.compile(r"<[^<>\s]+>")

# What no message may carry: the rules src/__tests__/revenue/owner-asks.test.ts pins on questions.json, enforced again
# here because the send job runs these unit tests, not vitest, before a message leaves.
FORBIDDEN_IN_MESSAGE = (
    ("an email address", re.compile(r"@")),
    ("a link", re.compile(r"https?://", re.IGNORECASE)),
    ("a phone number", re.compile(r"\+?\d[\d ().-]{6,}\d")),
    ("a street address", re.compile(r"\b(street|st\.|road|rd\.|avenue|ave\.|p\.?\s?o\.?\s?box|suite|apt\.?)\b", re.IGNORECASE)),
    ("a street address", re.compile(r"רחוב|ת\.ד|שדרות|דירה")),
)

SPECIAL_USE = ("\\sent", "\\all", "\\junk")

# ---- the refund responder (RULING-2026-09-29-lines (h))
COMMANDS = ("send", "probe", "respond-refunds")
WORKFLOW = os.path.join(REPO_ROOT, ".github", "workflows", "brand-mail.yml")
PRODUCT_SCRIPT = os.path.join(REPO_ROOT, "products", "il-biz-tools", "scripts", "gumroad-pro-product.js")
SITE_JSON = os.path.join(REPO_ROOT, "products", "il-biz-tools", "src", "config", "site.json")
REFUND_RESPONDER = "gumroad-refund"
DEFAULT_AUTHSERV_ID = "mx.google.com"
REFUND_LOOKBACK_DAYS = 60
MAX_REFUND_REQUESTS_PER_RUN = 20
REFUND_COMMAND_TIMEOUT_SECONDS = 180
# What makes a message a refund request: the sender's own words (own_words, lower case) name a refund, the money back
# or the cancellation of the purchase itself ("ביטול עסקה" is the consumer-law term). Whole words and whole phrases,
# never a bare verb: "איך להחזיר את הלוגו", "לבטל את צבע המותג", "cancel the logo on one invoice" and "the payment was
# cancelled" ask for no refund, and a match here refunds a buyer inside the window (fixer review of 29.9, finding 1).
# The product makes receipts and invoices, so a buyer's own bookkeeping names refunds too; NOT_A_REFUND_REQUEST is
# cut out of the text first. A request these miss is left unanswered, never refunded unasked.
HE = "א-ת"  # the Hebrew letters: a Hebrew word ends where none follows
REFUND_REQUEST = (
    re.compile(r"\brefund(?:s|ed|ing)?\b"),
    re.compile(r"\bmoney[\s-]+back\b"),
    re.compile(r"\bcancel(?:l?ed|l?ing|lation)?\s+(?:of\s+)?(?:my|the|this|our)\s+(?:purchase|order|payment)s?\b"),
    # החזר as a word, with its prefixes (להחזר, ההחזר, וההחזר) - not החזרה or החזרים, and never inside להחזיר.
    re.compile(r"(?<![%s])[ובלשה]{0,2}החזר(?![%s])" % (HE, HE)),
    re.compile(r"(?<![%s])ה?כסף(?:\s+שלי)?\s+בחזרה(?![%s])" % (HE, HE)),
    re.compile(r"(?<![%s])(?:להחזיר|תחזירו|החזירו|תחזיר|תחזירי|יחזירו)\s+(?:לי\s+|לנו\s+)?את\s+הכסף(?![%s])" % (HE, HE)),
    re.compile(r"(?<![%s])ו?ה?ביטול\s+ה?(?:עסקה|רכישה|הזמנה)(?![%s])" % (HE, HE)),
    re.compile(r"(?<![%s])ו?(?:לבטל|בטלו|תבטלו|תבטל|תבטלי)\s+(?:לי\s+)?(?:את\s+)?ה?(?:עסקה|רכישה|הזמנה)(?![%s])" % (HE, HE)),
)
NOT_A_REFUND_REQUEST = (
    # Someone else's refund, or no request: a tax or expense refund, the policy or a document about refunds, a refund
    # to the buyer's own customer, how to record one, the guarantee's name, and a refund the sender says they do not want.
    re.compile(r"\b(?:tax|vat|income[\s-]+tax|expenses?)\s+refunds?\b"),
    re.compile(r"\brefunds?\s+(?:policy|policies|period|window|terms|receipts?|invoices?|notes?|documents?|forms?)\b"),
    re.compile(r"\b(?:receipts?|invoices?|credit\s+notes?)\s+(?:for|of)\s+(?:a\s+|the\s+)?refunds?\b"),
    re.compile(r"\brefunds?\s+(?:to|for)\s+(?:my|a|an|the|our|his|her|their)\s+(?:customers?|clients?)\b"),
    re.compile(r"\bhow\s+(?:do|can|should|would|to)\s+(?:i\s+|we\s+)?(?:issue|record|document|create|make|enter|add|show|write|register|log|process)\s+(?:a\s+|the\s+)?refunds?\b"),
    re.compile(r"\bmoney[\s-]+back\s+guarantee\b"),
    re.compile(r"\b(?:not|don['’]?t|do\s+not|never|no)\s+(?:(?:want|need|asking|ask|looking|requesting|request|expecting|expect|interested|seeking)\s+)?(?:(?:for|in)\s+)?(?:a\s+|any\s+)?refunds?\b"),
    re.compile(r"(?<![%s])[ובלשה]{0,2}החזר\s+ה?(?:הוצאות|מס|מע\"מ|מע״מ|מעמ|נסיעות|הלוואה|הלוואות|חוב|חובות|ביטוח|דמי)(?![%s])" % (HE, HE)),
    re.compile(r"(?<![%s])מדיניות\s+(?:ה)?החזר(?:ים|ות)?(?![%s])" % (HE, HE)),
    re.compile(r"(?<![%s])(?:קבלה|קבלת|קבלות|חשבונית|חשבוניות|מסמך|זיכוי)\s+(?:על\s+|של\s+|ל)?ה?החזר(?![%s])" % (HE, HE)),
    re.compile(r"(?<![%s])[ובלשה]{0,2}החזר\s+(?:ל|לה)?לקוח(?:ות|ה)?(?![%s])" % (HE, HE)),
    re.compile(r"(?<![%s])(?:לא|בלי|ללא)\s+(?:(?:צריך|צריכה|רוצה|רוצים|מבקש|מבקשת|מבקשים|מעוניין|מעוניינת|מחפש|מחפשת)\s+)?[בל]?ה?החזר(?![%s])" % (HE, HE)),
)
# The whole answer. The same whatever the refund command found, so it never says whether this address bought
# anything; it states the rule the responder applies, and that it is automatic.
REFUND_REPLY = ("תשובה אוטומטית מ-Mehudak (מהודק): לפי מדיניות ההחזרים של Gumroad, רכישת Pro מהכתובת הזו בתוך "
                "תקופת ההחזר מוחזרת במלואה דרך Gumroad.")
NO_REPLY_LOCAL = re.compile(r"^(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounces?)([+.-]|$)", re.IGNORECASE)
NEVER_ANSWERED_DOMAINS = ("gumroad.com",)
MONTHS = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")


class Refused(Exception):
    """A guard said no. The message never names the address or the password."""


class ProbeError(Exception):
    pass


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


def tls_context():
    """Certificate and host name verified (CERT_REQUIRED, check_hostname): the password goes over this."""
    return ssl.create_default_context()


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


def domain_of(address):
    return address.rsplit("@", 1)[-1].lower() if "@" in address else ""


def base_domain(address):
    """The last two labels of an address's domain: support.developers@in.wixanswers.com -> wixanswers.com."""
    return ".".join(domain_of(address).split(".")[-2:])


def mailbox_key(address):
    """An address as a mailbox: lower case, without a +tag."""
    local, _, domain = address.lower().rpartition("@")
    return "%s@%s" % (local.split("+", 1)[0], domain)


# ---------------------------------------------------------------- header reading (lenient; a message may be None)


def parse_headers(raw):
    """compat32, the lenient legacy parser: header values stay raw strings and are decoded only where compared."""
    return email.message_from_bytes(raw, policy=email.policy.compat32)


def raw_values(msg, name):
    out = []
    for value in (msg.get_all(name) or []) if msg is not None else []:
        try:
            out.append(str(value))
        except Exception:  # noqa: BLE001 - a header that cannot even be stringified is skipped, not fatal
            continue
    return out


def decoded(msg, name):
    out = []
    for value in raw_values(msg, name):
        try:
            out.append(str(email.header.make_header(email.header.decode_header(value))))
        except Exception:  # noqa: BLE001 - an unknown charset or a broken encoded-word: compare the raw text
            out.append(value)
    return " ".join(out)


def addresses(msg, *names):
    values = [v for name in names for v in raw_values(msg, name)]
    return [addr.lower() for _display, addr in email.utils.getaddresses(values) if "@" in addr]


def own_id(msg):
    ids = message_ids(" ".join(raw_values(msg, "Message-ID")))
    return ids[0] if ids else None


def refers_to(msg):
    return set(message_ids(" ".join(raw_values(msg, "In-Reply-To") + raw_values(msg, "References"))))


def is_accessibility_mail(msg):
    for name in ("To", "Cc", "Delivered-To"):
        text = " ".join(raw_values(msg, name)).lower()
        if any(tag in text for tag in A11Y_PLUS_TAGS):
            return True
    subject = decoded(msg, "Subject").lower()
    return any(word in subject for word in A11Y_SUBJECT_WORDS)


def is_own(msg, brand, own_ids):
    """Mail the brand sent itself: its Message-ID is ours, or it is From the brand address."""
    if msg is None:
        return False
    try:
        if own_id(msg) in own_ids:
            return True
        return any(mailbox_key(a) == mailbox_key(brand) for a in addresses(msg, "From"))
    except Exception:  # noqa: BLE001 - unknown is not ours: it stays in, where it is counted
        return False


def may_be_venue_reply(when, msg, venue, ids, since):
    """True when a message received since our first send to a venue may be that venue's answer.

    Wide on purpose, because a missed reply is what lets a second message go out: threaded to one of our Message-IDs,
    from the venue's domain or a subdomain of it (a helpdesk opening its own ticket thread), or with our subject inside
    its own ("[Ticket #1] Re: <subject>"). Unknown date or unreadable headers count as a possible reply."""
    if when is not None and when < since:
        return False
    if msg is None:
        return True
    try:
        if refers_to(msg) & ids:
            return True
        to = (venue or {}).get("to")
        if to:
            base = base_domain(to)
            if any(domain_of(a) == base or domain_of(a).endswith("." + base) for a in addresses(msg, "From")):
                return True
        subject = (venue or {}).get("subject")
        return bool(subject) and subject.lower() in decoded(msg, "Subject").lower()
    except Exception:  # noqa: BLE001
        return True


def sent_to_venue(msg, venue):
    """A Sent-folder message addressed to the venue or carrying its subject. Unreadable counts as yes."""
    if msg is None:
        return True
    try:
        if venue["to"].lower() in addresses(msg, "To", "Cc"):
            return True
        return venue["subject"].lower() in decoded(msg, "Subject").lower()
    except Exception:  # noqa: BLE001
        return True


def unique(mails):
    """Messages counted once by Message-ID; a message without one is counted on its own."""
    seen, out = set(), []
    for when, msg in mails:
        mid = own_id(msg)
        if mid is not None:
            if mid in seen:
                continue
            seen.add(mid)
        out.append((when, msg))
    return out


# ---------------------------------------------------------------- IMAP (read-only)


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
        # imaplib returns [None] when the server sent no EXISTS line. Unknown is not zero: an "empty" mailbox would
        # hide exactly the mail the probe exists to find.
        raise ProbeError("EXAMINE returned no message count") from None


LIST_LINE = re.compile(rb'^\((?P<flags>[^)]*)\) (?:"(?:[^"\\]|\\.)*"|NIL) (?P<name>.+)$')


def special_mailboxes(imap):
    """{"\\sent": name, "\\all": name, "\\junk": name}, for the special-use flags the server's LIST shows."""
    typ, data = imap.list()
    if typ != "OK":
        raise ProbeError("LIST failed")
    found = {}
    for item in data or []:
        if not isinstance(item, bytes):
            continue
        m = LIST_LINE.match(item)
        if not m:
            continue
        flags = set(m.group("flags").decode("ascii", "replace").lower().split())
        name = m.group("name").decode("ascii", "replace")
        if name.startswith('"') and name.endswith('"'):
            name = name[1:-1].replace('\\"', '"').replace("\\\\", "\\")
        for flag in SPECIAL_USE:
            if flag in flags and flag not in found:
                found[flag] = name
    return found


INTERNALDATE = re.compile(rb'INTERNALDATE "([^"]+)"')


def fetch_mailbox(imap, count):
    """[(received_or_None, headers_or_None)] for messages 1..count of the selected mailbox. Headers via BODY.PEEK."""
    if count == 0:
        return []
    span = "1:%d" % count
    headers = {}
    typ, data = imap.fetch(span, "(BODY.PEEK[HEADER.FIELDS %s])" % HEADER_FIELDS)
    if typ != "OK":
        raise ProbeError("FETCH failed")
    for item in data:
        if isinstance(item, tuple) and len(item) >= 2:
            seq = int(item[0].split(b" ", 1)[0])
            try:
                headers[seq] = parse_headers(item[1])
            except Exception:  # noqa: BLE001 - kept as None and counted on the safe side
                headers[seq] = None
    dates = {}
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


def read_mailbox(imap, name):
    return fetch_mailbox(imap, examine(imap, name))


def connect_imap(cfg, imap_factory):
    host, port = cfg["imap"]
    imap = imap_factory(host, port, ssl_context=tls_context(), timeout=TIMEOUT_SECONDS)
    imap.login(cfg["address"], cfg["password"])
    return imap


def close_imap(imap):
    try:
        imap.logout()
    except Exception:  # noqa: BLE001 - logging out of a read-only session changes nothing
        pass


def reply_scope(imap, boxes):
    """Where a venue's reply may sit: All Mail (or the inbox, without one) and Spam."""
    mails = read_mailbox(imap, boxes.get("\\all") or "INBOX")
    if boxes.get("\\junk"):
        mails = mails + read_mailbox(imap, boxes["\\junk"])
    return mails


def ids_of(mails):
    return {own_id(msg) for _when, msg in mails} - {None}


# ---------------------------------------------------------------- send


def find_venue(questions, venue_id):
    for venue in questions["venues"]:
        if venue["venue"] == venue_id:
            return venue
    raise Refused("unknown venue %r; known: %s" % (venue_id, ", ".join(v["venue"] for v in questions["venues"])))


def check_message_rules(questions, venue):
    """The rules every message keeps (the note's §"When and how to send"), checked on the text about to leave."""
    vid = venue["venue"]
    subject, body = venue.get("subject") or "", venue.get("body") or ""
    disclosure = questions.get("disclosure") or []
    if not disclosure:
        raise Refused("questions.json lists no disclosure phrases; every message discloses the AI agent. Nothing was sent.")
    for phrase in disclosure:
        if phrase not in body:
            raise Refused("%s's body lacks the disclosure %r (research/breadth/BOARD.md Q2). Nothing was sent." % (vid, phrase))
    if questions.get("signature") != BRAND_DISPLAY_NAME or not body.rstrip().endswith("\n" + BRAND_DISPLAY_NAME):
        raise Refused("%s's body is not signed %r, by the brand alone. Nothing was sent." % (vid, BRAND_DISPLAY_NAME))
    for what, pattern in FORBIDDEN_IN_MESSAGE:
        for part, text in (("subject", subject), ("body", body)):
            if pattern.search(text):
                raise Refused("%s's %s carries %s; no message may (PUBLISH-9). Nothing was sent." % (vid, part, what))
    days = venue.get("followUpAfterDays")
    if isinstance(days, bool) or not isinstance(days, int) or days < MIN_FOLLOW_UP_DAYS:
        raise Refused("%s's followUpAfterDays must be a whole number of at least %d. Nothing was sent." % (vid, MIN_FOLLOW_UP_DAYS))


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
            "%s has an \"uncertain\" send in sent.json: the run stopped between handing the message to the server and "
            "the server's answer. Look for its Message-ID in the Sent folder: if it is there, set the status to "
            "\"sent\"; if it is not, it did not leave and the record may go (every send checks the Sent folder "
            "again first). Nothing was sent." % vid
        )
    readings = [r for r in sent.get("repliesRecorded", []) if r.get("venue") == vid]
    if any(r.get("reading") in ("YES", "NO") for r in readings):
        raise Refused("%s has a YES/NO reply recorded; this script sends nothing more there." % vid)
    if any(r.get("kind") == "follow-up" for r in mine):
        raise Refused("%s already has its first message and its one follow-up; record NOT ANSWERED instead." % vid)
    first = min(mine, key=lambda r: r["sentAt"])
    age_days = (now - parse_iso(first["sentAt"])).total_seconds() / 86400
    wait = venue["followUpAfterDays"]
    if age_days < wait:
        raise Refused(
            "%s was sent %.1f days ago: one message per venue, and a single follow-up only after %d days with no reply."
            % (vid, age_days, wait)
        )
    return "follow-up", first


def covered_ids(sent, venue_id):
    """The Message-IDs NOT ANSWERED readings already account for (auto-acknowledgements, ticket numbers and the like)."""
    out = set()
    for r in sent.get("repliesRecorded", []):
        if r.get("venue") == venue_id and r.get("reading") == "NOT ANSWERED":
            out |= {i for i in r.get("coveredMessageIds") or [] if isinstance(i, str)}
    return out


def check_mailbox_before_send(cfg, imap_factory, venue, sent, kind):
    """The live, read-only checks before any send, dry or real. Raises Refused; never changes the mailbox."""
    vid = venue["venue"]
    mine = [r for r in sent.get("sent", []) if r.get("venue") == vid]
    recorded = {r.get("messageId") for r in mine} - {None}
    imap = connect_imap(cfg, imap_factory)
    try:
        boxes = special_mailboxes(imap)
        if not boxes.get("\\sent"):
            raise Refused("no Sent folder was found, so it cannot be checked that nothing already went to %s. Nothing was sent." % vid)
        sent_folder = read_mailbox(imap, boxes["\\sent"])
        unrecorded = sum(1 for _when, msg in sent_folder if sent_to_venue(msg, venue) and own_id(msg) not in recorded)
        if unrecorded:
            raise Refused(
                "the Sent folder holds %d message(s) to %s (its address or its subject) that sent.json does not record: "
                "a send whose record never reached the repository, or one sent by hand. Add its record to sent.json from "
                "the Sent folder (Message-ID, UTC time, kind) before anything else goes there. Nothing was sent." % (unrecorded, vid)
            )
        if kind != "follow-up":
            return
        since = parse_iso(min(mine, key=lambda r: r["sentAt"])["sentAt"])
        own = recorded | ids_of(sent_folder)
        covered = covered_ids(sent, vid)
        uncovered = 0
        for when, msg in unique(reply_scope(imap, boxes)):
            if is_own(msg, cfg["address"], own) or not may_be_venue_reply(when, msg, venue, recorded, since):
                continue
            if own_id(msg) not in covered:
                uncovered += 1
        if uncovered:
            raise Refused(
                "%d message(s) since %s's first send may be its reply (threaded to it, from its domain, or with its "
                "subject; All Mail and Spam included), and no recorded reading lists them. Read them; record the reading "
                "in the venue's note and in sent.json's repliesRecorded with their Message-IDs in coveredMessageIds "
                "before any follow-up. Nothing was sent." % (uncovered, vid)
            )
    finally:
        close_imap(imap)


def message_digest(kind, venue, in_reply_to):
    """sha256 of what a dry run shows and a real send must match: kind, recipient, subject, body, thread. Not the Date
    or Message-ID, which are new on every run."""
    canonical = json.dumps(
        {"kind": kind, "to": venue["to"], "subject": venue["subject"], "body": venue["body"], "inReplyTo": in_reply_to},
        ensure_ascii=False, sort_keys=True,
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def build_message(venue, address, now, in_reply_to=None):
    msg = EmailMessage()
    msg["From"] = Address(display_name=BRAND_DISPLAY_NAME, addr_spec=address)
    msg["To"] = venue["to"]
    msg["Subject"] = venue["subject"]
    msg["Date"] = email.utils.format_datetime(now.astimezone(dt.timezone.utc))
    # The venue id, not the brand's local part: "<...mehudak@gmail.com>" would contain BRAND_MAIL_ADDRESS verbatim,
    # which Actions masks in the log, and sent.json would carry the address.
    msg["Message-ID"] = email.utils.make_msgid(idstring=venue["venue"], domain=domain_of(address))
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


def remove_record(sent_path, message_id):
    data = load_json(sent_path)
    data["sent"] = [r for r in data.get("sent", []) if r.get("messageId") != message_id]
    write_json_atomic(sent_path, data)


def set_record_status(sent_path, message_id, status):
    data = load_json(sent_path)
    found = None
    for r in data.get("sent", []):
        if r.get("messageId") == message_id:
            r["status"] = status
            found = r
    write_json_atomic(sent_path, data)
    return found


def cmd_send(args, env, out, now, smtp_factory, imap_factory):
    cfg, missing = brand_config(env)
    if cfg is None:
        return done(out, {"configured": False, "missing": missing}, 0)
    if args.really_send and env.get("GITHUB_REF") != MAIN_REF:
        raise Refused("a real send runs only from %s (the brand-mail workflow on main); this is a dry-run branch." % MAIN_REF)
    questions = load_json(args.questions)
    sent = load_json(args.sent)
    venue = find_venue(questions, args.venue)
    check_message_rules(questions, venue)
    kind, first = plan_send(venue, sent, now)
    in_reply_to = first["messageId"] if first else None
    digest = message_digest(kind, venue, in_reply_to)
    if args.really_send and (args.message_sha256 or "").strip().lower() != digest:
        raise Refused(
            "a real send needs --message-sha256 equal to the messageSha256 a dry run printed for this message; it is %s. "
            "Dry-run it, read it, then send with that digest. Nothing was sent."
            % ("missing" if not args.message_sha256 else "different, so the message is not the one that was read")
        )
    check_mailbox_before_send(cfg, imap_factory, venue, sent, kind)

    msg = build_message(venue, cfg["address"], now, in_reply_to)
    if not args.really_send:
        return done(out, {
            "configured": True,
            "dryRun": True,
            "kind": kind,
            "messageSha256": digest,
            "preSend": venue.get("preSend", ""),
            "record": make_record(venue, kind, msg, now, "sent", in_reply_to),
            "message": msg.as_string(),
        }, 0)

    host, port = cfg["smtp"]
    try:
        smtp = smtp_factory(host, port, timeout=TIMEOUT_SECONDS, context=tls_context())
    except (OSError, smtplib.SMTPException) as exc:
        return done(out, {"configured": True, "sent": False, "error": type(exc).__name__}, 1)
    record = make_record(venue, kind, msg, now, "uncertain", in_reply_to)
    try:
        try:
            smtp.login(cfg["address"], cfg["password"])
        except (OSError, smtplib.SMTPException) as exc:
            return done(out, {"configured": True, "sent": False, "error": type(exc).__name__}, 1)
        # Written ahead: from here until the server answers, delivery is unknown, so the record must already exist
        # whatever stops the run (a dropped connection, a timeout, a cancelled job's SIGINT or SIGTERM).
        append_record(args.sent, record)
        try:
            smtp.send_message(msg)
        except REFUSED_BEFORE_DELIVERY as exc:
            remove_record(args.sent, record["messageId"])
            return done(out, {"configured": True, "sent": False, "error": type(exc).__name__}, 1)
        except Exception as exc:  # noqa: BLE001 - delivery unknown: the "uncertain" record stays and blocks the venue
            return done(out, {"configured": True, "sent": None, "error": type(exc).__name__, "record": record}, 1)
        # KeyboardInterrupt and SystemExit propagate, with the "uncertain" record already on disk.
    finally:
        try:
            smtp.quit()
        except Exception:  # noqa: BLE001 - a failed QUIT after a completed send changes nothing
            pass
    record = set_record_status(args.sent, record["messageId"], "sent")
    return done(out, {"configured": True, "sent": True, "record": record}, 0)


# ---------------------------------------------------------------- probe


def accessibility_counts(mails, sent_folder, now):
    answered_ids = set()
    for _when, msg in sent_folder:
        answered_ids |= refers_to(msg)
    received = unanswered = over = 0
    ages = []
    for when, msg in mails:
        try:
            a11y = msg is None or is_accessibility_mail(msg)
            answered = msg is not None and own_id(msg) in answered_ids
        except Exception:  # noqa: BLE001 - unreadable: counted as unanswered accessibility mail, never dropped
            a11y, answered = True, False
        if not a11y:
            continue
        received += 1
        if answered:
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


def replies_by_venue(mails, questions, sent):
    venues = {v["venue"]: v for v in questions.get("venues", [])}
    records = {}
    for r in sent.get("sent", []):
        records.setdefault(r["venue"], []).append(r)
    counts = {}
    for vid, rs in records.items():
        ids = {r["messageId"] for r in rs}
        since = min(parse_iso(r["sentAt"]) for r in rs)
        counts[vid] = sum(1 for when, msg in mails if may_be_venue_reply(when, msg, venues.get(vid), ids, since))
    return counts


def cmd_probe(args, env, out, now, imap_factory):
    cfg, missing = brand_config(env)
    if cfg is None:
        reading = {"configured": False, "missing": missing}
        if args.out:
            write_json_atomic(args.out, {"configured": False, "measuredAt": iso_z(now)})
        return done(out, reading, 0)
    sent = load_json(args.sent)
    questions = load_json(args.questions)
    try:
        imap = connect_imap(cfg, imap_factory)
    except (OSError, imaplib.IMAP4.error) as exc:
        return done(out, {"configured": True, "error": type(exc).__name__}, 1)
    try:
        boxes = special_mailboxes(imap)
        total = examine(imap, "INBOX")
        typ, data = imap.search(None, "UNSEEN")
        if typ != "OK":
            raise ProbeError("SEARCH failed")
        unread = len((data[0] or b"").split()) if data else 0
        scope = read_mailbox(imap, boxes["\\all"]) if boxes.get("\\all") else fetch_mailbox(imap, total)
        sent_folder = read_mailbox(imap, boxes["\\sent"]) if boxes.get("\\sent") else []
        junk = read_mailbox(imap, boxes["\\junk"]) if boxes.get("\\junk") else []
    except (OSError, imaplib.IMAP4.error, ProbeError) as exc:
        return done(out, {"configured": True, "error": type(exc).__name__}, 1)
    finally:
        close_imap(imap)

    own = ({r.get("messageId") for r in sent.get("sent", [])} - {None}) | ids_of(sent_folder)
    theirs = [(w, m) for w, m in unique(scope) if not is_own(m, cfg["address"], own)]
    theirs_junk = [(w, m) for w, m in unique(junk) if not is_own(m, cfg["address"], own)]
    reading = {
        "configured": True,
        "measuredAt": iso_z(now),
        "inbox": total,
        "unread": unread,
        "repliesByVenue": replies_by_venue(unique(theirs + theirs_junk), questions, sent),
        "accessibility": accessibility_counts(theirs, sent_folder, now),
        "sentFolderFound": bool(boxes.get("\\sent")),
        "allMailFound": bool(boxes.get("\\all")),
        "responders": responders_in_force(),
    }
    if args.out:
        write_json_atomic(args.out, reading)
    return done(out, reading, 0)


# ---------------------------------------------------------------- the refund responder (RULING-2026-09-29-lines (h))


# What brand-mail.yml's respond-refunds job must say, word for word, for the probe to report the responder in force.
# Pinned, not pattern-matched: a job that still names the script but no longer applies anything on the schedule - a
# job `if:` that is always false, a step `if:` that skips the respond step, a run without --apply, another command, an
# environment without the secrets - runs green and answers no one, and enable would open the sale on it (fixer review
# of 29.9, finding 2). A change to any of these lines needs the same change here; test_the_real_workflow_schedules_the_
# responder fails until it is made. What is not pinned fails loudly instead (a step that exits 1 turns every run red).
REFUND_JOB = "respond-refunds"
REFUND_JOB_IF = "github.event_name == 'schedule' || inputs.command == 'respond-refunds'"
REFUND_JOB_ENVIRONMENT = "brand-mailbox"
REFUND_GUARD_IF = "github.event_name == 'workflow_dispatch' && inputs.really_refund"
REFUND_STEP_ENV = (
    "BRAND_MAIL_ADDRESS: ${{ secrets.BRAND_MAIL_ADDRESS }}",
    "BRAND_MAIL_APP_PASSWORD: ${{ secrets.BRAND_MAIL_APP_PASSWORD }}",
    "GUMROAD_ACCESS_TOKEN: ${{ secrets.GUMROAD_ACCESS_TOKEN }}",
    "EVENT: ${{ github.event_name }}",
    "REALLY_REFUND: ${{ inputs.really_refund }}",
)
REFUND_STEP_RUN = (
    "set -euo pipefail",
    "ARGS=(respond-refunds)",
    'if [ "${EVENT:-}" = "schedule" ] || [ "${REALLY_REFUND:-}" = "true" ]; then ARGS+=(--apply); fi',
    'python scripts/brand_mail.py "${ARGS[@]}"',
)


def indent_of(line):
    return len(line) - len(line.lstrip(" "))


def yaml_lines(lines):
    """Lines that carry YAML: no blank lines, no comment lines."""
    return [line for line in lines if line.strip() and not line.lstrip().startswith("#")]


def block_under(lines, key_at):
    """The stripped lines nested under the key on lines[key_at] ("- key:" puts the key two columns right of the dash)."""
    column = indent_of(lines[key_at]) + (2 if lines[key_at].lstrip().startswith("- ") else 0)
    out = []
    for line in lines[key_at + 1:]:
        if indent_of(line) <= column:
            break
        out.append(line.strip())
    return out


def has_schedule(lines):
    """A cron under the top-level `on: schedule:`."""
    if "on:" not in lines:
        return False
    on_block = []
    for line in lines[lines.index("on:") + 1:]:
        if line and not line.startswith(" "):
            break
        on_block.append(line)
    try:
        at = [line.strip() for line in on_block].index("schedule:")
    except ValueError:
        return False
    for line in on_block[at + 1:]:
        if indent_of(line) <= indent_of(on_block[at]):
            break
        if re.match(r"^\s+- cron:\s*[\"']?[0-9*]", line):
            return True
    return False


def refund_job_runs_on_schedule(text):
    """True only when brand-mail.yml has a cron and its respond-refunds job is exactly the pinned one: the job `if:`
    REFUND_JOB_IF, the environment holding the secrets, no `needs:` (a skipped dependency skips the job), no step `if:`
    but the main-ref guard's, and one step that runs brand_mail.py - with no `if:` of its own, the pinned env (the
    secrets, the event) and the pinned run, which adds --apply on the schedule. Line-based on purpose: standard library
    only; the same shape is pinned from the other side by src/__tests__/revenue/brand-mail-workflow.test.ts."""
    lines = yaml_lines(text.splitlines())
    if not has_schedule(lines) or "jobs:" not in lines:
        return False
    body, inside = [], False
    for line in lines[lines.index("jobs:") + 1:]:
        if not line.startswith(" "):
            break
        if re.match(r"^  [A-Za-z0-9_-]+:\s*$", line):
            inside = line.strip() == "%s:" % REFUND_JOB
            continue
        if inside:
            body.append(line)
    job = {}  # a key twice (two jobs of this name, say) is refused below
    for line in body:
        m = re.match(r"^    ([A-Za-z_-]+):\s*(.*)$", line)
        if m:
            if m.group(1) in job:
                return False
            job[m.group(1)] = m.group(2).strip()
    if job.get("if") != REFUND_JOB_IF or job.get("environment") != REFUND_JOB_ENVIRONMENT or "needs" in job or "steps" not in job:
        return False
    steps, at = [], [i for i, line in enumerate(body) if line.startswith("    steps:")][0]
    for line in body[at + 1:]:
        if indent_of(line) <= 4:
            break
        if line.startswith("      - "):
            steps.append([line])
        elif steps:
            steps[-1].append(line)
        else:
            return False
    respond = [st for st in steps if any("scripts/brand_mail.py" in line for line in st)]
    if len(respond) != 1:
        return False
    for st in steps:
        ifs = [line.split("if:", 1)[1].strip() for line in st if re.match(r"^      (- |  )if:", line)]
        if st is respond[0] and ifs:
            return False
        if any(value != REFUND_GUARD_IF for value in ifs):
            return False
    (st,) = respond
    keys = {}
    for i, line in enumerate(st):
        m = re.match(r"^      (?:- |  )([A-Za-z_-]+):\s*(.*)$", line)
        if m:
            keys[m.group(1)] = i
    if "env" not in keys or "run" not in keys or st[keys["run"]].split("run:", 1)[1].strip() != "|":
        return False
    return (sorted(block_under(st, keys["env"])) == sorted(REFUND_STEP_ENV)
            and tuple(block_under(st, keys["run"])) == REFUND_STEP_RUN)


def refund_responder_scheduled(workflow_path=None):
    """The probe's evidence that refund requests are answered: this script has the command, and the workflow runs it."""
    if "respond-refunds" not in COMMANDS:
        return False
    try:
        with open(workflow_path or WORKFLOW, encoding="utf-8") as f:
            text = f.read()
    except OSError:
        return False
    return refund_job_runs_on_schedule(text)


def responders_in_force():
    return [REFUND_RESPONDER] if refund_responder_scheduled() else []


def imap_since(when):
    """An IMAP date (01-Sep-2026) without the locale: strftime's %b is not English everywhere."""
    return "%02d-%s-%04d" % (when.day, MONTHS[when.month - 1], when.year)


def strip_comments(text):
    """RFC 5322 comments out of a header value, innermost first: "spf=pass (google.com: ...) smtp.mailfrom=a@b"."""
    previous = None
    while previous != text:
        previous, text = text, re.sub(r"\([^()]*\)", " ", text)
    return text


def aligned(domain, from_domain):
    """DMARC-style relaxed alignment, conservatively: the From domain is the authenticated domain or a subdomain of it."""
    domain = (domain or "").strip().strip(".").lower()
    return "." in domain and (from_domain == domain or from_domain.endswith("." + domain))


def authenticated_sender(msg, authserv_id):
    """The one From address, in lower case, when the receiving server's own Authentication-Results - the topmost one -
    show dkim=pass or spf=pass for a domain aligned with it; None otherwise. Never raises."""
    try:
        froms = addresses(msg, "From")
        if len(froms) != 1 or not ADDR_SPEC.match(froms[0]):
            return None
        sender = froms[0]
        from_domain = domain_of(sender)
        results = raw_values(msg, "Authentication-Results")
        if not results:
            return None
        parts = [part.strip() for part in strip_comments(" ".join(results[0].split())).split(";")]
        if not parts[0] or parts[0].split()[0].lower() != authserv_id.lower():
            return None
        for part in parts[1:]:
            m = re.match(r"(dkim|spf)\s*=\s*([a-z]+)\b(.*)$", part, re.IGNORECASE)
            if not m or m.group(2).lower() != "pass":
                continue
            props = {k.lower(): v for k, v in re.findall(r"([a-z]+\.[a-z-]+)\s*=\s*(\S+)", m.group(3), re.IGNORECASE)}
            if m.group(1).lower() == "dkim":
                domain = props.get("header.d") or props.get("header.i", "").rpartition("@")[2]
            else:
                domain = props.get("smtp.mailfrom", "").rpartition("@")[2]
            if aligned(domain, from_domain):
                return sender
        return None
    except Exception:  # noqa: BLE001 - unreadable authentication is no authentication
        return None


def automated(msg, sender):
    """Mail no automatic answer may go to: automated, list or bulk mail, a no-reply address, or Gumroad itself."""
    auto = " ".join(raw_values(msg, "Auto-Submitted")).strip().lower()
    if auto and auto != "no":
        return True
    if " ".join(raw_values(msg, "Precedence")).strip().lower() in ("bulk", "list", "junk"):
        return True
    if raw_values(msg, "List-Id") or raw_values(msg, "List-Unsubscribe"):
        return True
    local, _, domain = sender.rpartition("@")
    if NO_REPLY_LOCAL.match(local):
        return True
    return any(domain == d or domain.endswith("." + d) for d in NEVER_ANSWERED_DOMAINS)


QUOTE_HEADER = re.compile(
    r"^\s*(‫)?(on\b.*\bwrote:\s*$|בתאריך\b|-{2,}\s*(original message|forwarded message)|from:\s|מאת:\s)",
    re.IGNORECASE,
)


def text_parts(msg):
    """The message's text: its text/plain parts, or its text/html parts when it has no plain text, decoded."""
    plain, rich = [], []
    for part in msg.walk():
        if part.is_multipart() or part.get_filename():
            continue
        kind = part.get_content_type()
        if kind not in ("text/plain", "text/html"):
            continue
        payload = part.get_payload(decode=True) or b""
        try:
            text = payload.decode(part.get_content_charset() or "utf-8", "replace")
        except LookupError:
            text = payload.decode("utf-8", "replace")
        (plain if kind == "text/plain" else rich).append(text)
    if plain:
        return plain
    out = []
    for text in rich:
        text = re.sub(r"(?is)<blockquote\b.*?</blockquote>", " ", text)
        text = re.sub(r"(?is)<div\b[^>]*class=\"[^\"]*gmail_quote[^\"]*\".*", " ", text)
        text = re.sub(r"(?i)<br\s*/?>|</p>|</div>", "\n", text)
        out.append(html_lib.unescape(re.sub(r"<[^>]+>", " ", text)))
    return out


def own_words(msg):
    """The subject and the body above the quoted message: what the sender wrote, not the receipt they reply to."""
    kept = []
    for text in text_parts(msg):
        for line in text.splitlines():
            if QUOTE_HEADER.match(line):
                break
            if not line.lstrip().startswith(">"):
                kept.append(line)
    return (decoded(msg, "Subject") + "\n" + "\n".join(kept)).lower()


def asks_for_refund(words):
    """True when these words (lower case) ask for a refund: a REFUND_REQUEST phrase outside every NOT_A_REFUND_REQUEST."""
    for pattern in NOT_A_REFUND_REQUEST:
        words = pattern.sub(" ", words)
    return any(pattern.search(words) for pattern in REFUND_REQUEST)


def names_refund(msg):
    try:
        return asks_for_refund(own_words(msg))
    except Exception:  # noqa: BLE001 - a body that cannot be read asks for nothing
        return False


def in_venue_thread(msg, questions, sent):
    """True for mail that may belong to a venue's thread: threaded to a message sent.json records, from a venue's domain
    (or a subdomain of it), or carrying a venue question's subject - may_be_venue_reply's test, at any date. A venue
    that writes "refund" or "cancel" is answering our question, not buying: it never gets the refund answer, and its
    mail is never marked answered. Unreadable counts as yes."""
    ids = {}
    for r in sent.get("sent", []):
        if r.get("messageId"):
            ids.setdefault(r.get("venue"), set()).add(r["messageId"])
    for venue in questions.get("venues", []):
        if may_be_venue_reply(None, msg, venue, ids.get(venue.get("venue"), set()), None):
            return True
    return False


def pro_product_id(path=None):
    """site.json's gumroad.productId, stripped: "" while there is none. Raises OSError or ValueError when unreadable."""
    site = load_json(path or SITE_JSON)
    gumroad = site.get("gumroad") if isinstance(site, dict) else None
    return str((gumroad or {}).get("productId") or "").strip()


def node_refund_runner(sender, requested_at, apply, env):
    """Run the product's refund command: arguments, never a shell; only PATH and the token in its environment. Returns
    (exit code, stdout lines). stderr is dropped: a stack trace could quote anything."""
    argv = ["node", PRODUCT_SCRIPT, "refund", "--email", sender, "--requested-at", iso_z(requested_at)]
    if apply:
        argv.append("--apply")
    child_env = {"PATH": env.get("PATH") or os.defpath, "GUMROAD_ACCESS_TOKEN": env["GUMROAD_ACCESS_TOKEN"]}
    try:
        proc = subprocess.run(argv, env=child_env, cwd=os.path.dirname(os.path.dirname(PRODUCT_SCRIPT)),
                              capture_output=True, text=True, timeout=REFUND_COMMAND_TIMEOUT_SECONDS, check=False)
    except subprocess.TimeoutExpired:
        return 124, ["the refund command did not finish in %d seconds" % REFUND_COMMAND_TIMEOUT_SECONDS]
    return proc.returncode, (proc.stdout or "").splitlines()


def redacted(lines, address):
    pattern = re.compile(re.escape(address), re.IGNORECASE)
    return [pattern.sub("[address]", line) for line in lines]


def reply_subject(msg):
    subject = " ".join(decoded(msg, "Subject").split())[:150]
    return subject if subject.lower().startswith("re:") else ("Re: " + subject).strip()


def build_refund_reply(msg, sender, brand, now):
    reply = EmailMessage()
    reply["From"] = Address(display_name=BRAND_DISPLAY_NAME, addr_spec=brand)
    reply["To"] = sender
    reply["Subject"] = reply_subject(msg)
    reply["Date"] = email.utils.format_datetime(now.astimezone(dt.timezone.utc))
    reply["Message-ID"] = email.utils.make_msgid(idstring="refund", domain=domain_of(brand))
    reply["Auto-Submitted"] = "auto-replied"  # RFC 3834: other responders must not answer this one
    request_id = own_id(msg)
    if request_id:
        reply["In-Reply-To"] = request_id
        reply["References"] = " ".join(message_ids(" ".join(raw_values(msg, "References"))) + [request_id])
    reply.set_content(REFUND_REPLY, cte="quoted-printable")
    return reply


def close_smtp(smtp):
    try:
        smtp.quit()
    except Exception:  # noqa: BLE001 - a failed QUIT changes nothing already sent
        pass


FETCH_HEAD = re.compile(rb'INTERNALDATE "([^"]+)"')


def fetch_whole(imap, uid):
    """(received_or_None, message) for one UID. BODY.PEEK[]: reading never sets \\Seen."""
    typ, data = imap.uid("FETCH", uid, "(INTERNALDATE BODY.PEEK[])")
    if typ != "OK":
        raise ProbeError("FETCH failed")
    for item in data or []:
        if isinstance(item, tuple) and len(item) >= 2:
            when = None
            m = FETCH_HEAD.search(item[0])
            if m:
                try:
                    when = dt.datetime.strptime(m.group(1).decode("ascii"), "%d-%b-%Y %H:%M:%S %z")
                except ValueError:
                    when = None
            return when, email.message_from_bytes(item[1], policy=email.policy.compat32)
    return None, None


def cmd_respond_refunds(args, env, out, now, smtp_factory, imap_factory, refund_runner):
    cfg, missing = brand_config(env)
    if cfg is None:
        return done(out, {"configured": False, "missing": missing}, 0)
    if not env.get("GUMROAD_ACCESS_TOKEN"):
        return done(out, {"configured": False, "missing": ["GUMROAD_ACCESS_TOKEN"]}, 0)
    if args.apply and env.get("GITHUB_REF") != MAIN_REF:
        raise Refused("a real refund run goes only from %s (the brand-mail workflow on main); run without --apply for a dry run." % MAIN_REF)
    # No product id, no product: nothing can have been sold (enable needs a deployed productId), so there is nothing to
    # refund and no mail is read. Without this, the refund command's "no productId" stop would fail every scheduled run
    # from step 8 until the product exists, over any mail that names a refund (fixer review of 29.9, finding 5).
    try:
        product = pro_product_id()
        sent = load_json(args.sent)
        questions = load_json(args.questions)
    except (OSError, ValueError) as exc:
        return done(out, {"configured": True, "error": "unreadable repository file (%s)" % type(exc).__name__}, 1)
    if not product:
        return done(out, {"configured": False, "missing": ["gumroad.productId"]}, 0)
    authserv = env.get("BRAND_MAIL_AUTHSERV_ID") or DEFAULT_AUTHSERV_ID
    report = {"configured": True, "dryRun": not args.apply, "requests": 0, "unauthenticated": 0, "left": 0, "handled": []}
    failed = False
    smtp = None
    try:
        imap = connect_imap(cfg, imap_factory)
    except (OSError, imaplib.IMAP4.error) as exc:
        return done(out, {"configured": True, "error": type(exc).__name__}, 1)
    try:
        typ, _data = imap.select(quote_mailbox("INBOX"), readonly=not args.apply)
        if typ != "OK":
            raise ProbeError("SELECT failed")
        since = imap_since(now - dt.timedelta(days=REFUND_LOOKBACK_DAYS))
        # NOT ANSWERED is IMAP4rev1's spelling of the unanswered search key (RFC 3501 6.4.4).
        typ, data = imap.uid("SEARCH", "NOT", "ANSWERED", "SINCE", since)
        if typ != "OK":
            raise ProbeError("SEARCH failed")
        answered_senders = set()
        attempts = 0
        for uid in (data[0] or b"").split() if data else []:
            uid = uid.decode("ascii")
            received, msg = fetch_whole(imap, uid)
            if msg is None or is_own(msg, cfg["address"], set()) or is_accessibility_mail(msg) or not names_refund(msg):
                continue
            if in_venue_thread(msg, questions, sent):
                continue
            report["requests"] += 1
            sender = authenticated_sender(msg, authserv)
            if sender is None:
                report["unauthenticated"] += 1
                continue
            if automated(msg, sender):
                continue
            entry = {"uid": uid}
            if sender in answered_senders:
                # Already answered in this run: one answer per sender per run; this one is covered by it.
                if args.apply:
                    imap.uid("STORE", uid, "+FLAGS", "(\\Answered)")
                entry["outcome"] = "covered by this run's answer to the same sender" if args.apply else "dry run: covered by this run's answer"
                report["handled"].append(entry)
                continue
            if attempts >= MAX_REFUND_REQUESTS_PER_RUN:  # bounded even when every attempt fails
                report["left"] += 1
                continue
            attempts += 1
            requested = min(received or now, now)
            code, lines = refund_runner(sender, requested, args.apply, env)
            entry["refundExit"] = code
            entry["refundLog"] = redacted(lines, sender)
            if code != 0:
                failed = True
                entry["outcome"] = "the refund command stopped: not answered, left for the next run"
                report["handled"].append(entry)
                continue
            answered_senders.add(sender)
            if not args.apply:
                entry["outcome"] = "dry run: would answer"
                report["handled"].append(entry)
                continue
            try:
                if smtp is None:
                    host, port = cfg["smtp"]
                    conn = smtp_factory(host, port, timeout=TIMEOUT_SECONDS, context=tls_context())
                    try:
                        conn.login(cfg["address"], cfg["password"])
                    except (OSError, smtplib.SMTPException):
                        close_smtp(conn)
                        raise
                    smtp = conn  # kept only once logged in, so a failed login is retried for the next answer
                smtp.send_message(build_refund_reply(msg, sender, cfg["address"], now))
            except (OSError, smtplib.SMTPException) as exc:
                failed = True
                entry["outcome"] = "the answer could not be sent (%s): not marked answered, left for the next run" % type(exc).__name__
                report["handled"].append(entry)
                answered_senders.discard(sender)
                continue
            imap.uid("STORE", uid, "+FLAGS", "(\\Answered)")
            entry["outcome"] = "answered"
            report["handled"].append(entry)
    except (OSError, imaplib.IMAP4.error, ProbeError) as exc:
        report["error"] = type(exc).__name__
        failed = True
    finally:
        close_imap(imap)
        if smtp is not None:
            close_smtp(smtp)
    return done(out, report, 1 if failed else 0)


# ---------------------------------------------------------------- CLI


def done(out, data, code):
    """Print the command's one JSON document and hand back its exit code."""
    out.write(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    return code


def parse_args(argv):
    parser = argparse.ArgumentParser(prog="brand_mail.py", description=__doc__.split("\n\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    refunds = sub.add_parser("respond-refunds")
    refunds.add_argument("--apply", action="store_true", help="refund and answer for real (default: dry run); main only")
    refunds.add_argument("--questions", default=QUESTIONS)
    refunds.add_argument("--sent", default=SENT)
    for name in ("send", "probe"):
        p = sub.add_parser(name)
        p.add_argument("--questions", default=QUESTIONS)
        p.add_argument("--sent", default=SENT)
        if name == "send":
            p.add_argument("--venue", required=True)
            p.add_argument("--really-send", action="store_true", help="send for real (default: dry run)")
            p.add_argument("--message-sha256", help="the messageSha256 a dry run printed; required with --really-send")
        else:
            p.add_argument("--out", help="also write the reading here (e.g. state/colony/brand-mail.json)")
    return parser.parse_args(argv)


def main(argv=None, env=None, stdout=None, stderr=None, now=None, smtp_factory=None, imap_factory=None, refund_runner=None):
    env = os.environ if env is None else env
    out = stdout or sys.stdout
    err = stderr or sys.stderr
    now = now or dt.datetime.now(dt.timezone.utc)
    smtp_factory = smtp_factory or smtplib.SMTP_SSL
    imap_factory = imap_factory or imaplib.IMAP4_SSL
    refund_runner = refund_runner or node_refund_runner
    args = parse_args(argv)
    try:
        if args.command == "send":
            return cmd_send(args, env, out, now, smtp_factory, imap_factory)
        if args.command == "respond-refunds":
            return cmd_respond_refunds(args, env, out, now, smtp_factory, imap_factory, refund_runner)
        return cmd_probe(args, env, out, now, imap_factory)
    except Refused as exc:
        err.write("refused: %s\n" % exc)
        return 2
    except (OSError, imaplib.IMAP4.error, ProbeError) as exc:
        # The message of a mail-server error can carry server text, so only its type is printed.
        err.write("mail server error: %s\n" % type(exc).__name__)
        return 1
    except Exception as exc:  # noqa: BLE001 - never a traceback: it could quote a header or a server line
        err.write("error: %s\n" % type(exc).__name__)
        return 1


if __name__ == "__main__":
    sys.exit(main())
