// RULING-2026-09-30-documents (b), fold action 7: consumer-protection law 14ט(ב) wants a dedicated, prominent link on
// the home page through which a cancellation notice is sent. Here it is a mailto: to the brand mailbox with the
// subject "ביטול עסקה – Pro", with a one-paragraph disclosure beside it in the home page footer. The address is never
// typed into a page: the build fills it from the accessibility statement's own contact (data-a11y-contact), so nothing
// new becomes public, and the publish gate that refuses the statement while its contact is a placeholder refuses the
// link too - its marker, and a check of the link itself, so deleting the marker clears nothing.
import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CANCEL_LINK_ATTR,
  CANCEL_LINK_PAGE,
  CANCEL_SUBJECT,
  cancelHref,
  statementAddress,
  withCancelLinks,
  cancelLinkProblems,
  publishBlockers,
} from '../src/lib/publish-gate.js';
import { textOf } from './helpers/html.js';
import {
  copyProduct,
  removeCopy,
  runBuild,
  readIn,
  editIn,
  fillContact,
  statementWithContact,
  TEST_CONTACT_ADDRESS,
  TEST_CONTACT_LINK,
} from './helpers/product-copy.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');
const index = read('index.html');
const invoice = read('invoice.html');
const STATEMENT = read('accessibility.html');
const FILLED = statementWithContact(STATEMENT, `<p>פניות בנושא נגישות: ${TEST_CONTACT_LINK}</p>`);
const HREF = `mailto:${TEST_CONTACT_ADDRESS}?subject=%D7%91%D7%99%D7%98%D7%95%D7%9C%20%D7%A2%D7%A1%D7%A7%D7%94%20%E2%80%93%20Pro`;

const footerOf = (html) => /<footer class="site-footer">[\s\S]*?<\/footer>/.exec(html)[0];
/** Every <a ...> start tag that carries the link's marker. */
const cancelTags = (html) => [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]).filter((t) => t.includes(CANCEL_LINK_ATTR));
const hrefOf = (tag) => /\shref="([^"]*)"/.exec(tag)?.[1];

describe('the link and its subject', () => {
  it('is a mailto: to the brand address with the subject "ביטול עסקה – Pro", encoded', () => {
    expect(CANCEL_SUBJECT).toBe('ביטול עסקה – Pro');
    expect(CANCEL_LINK_PAGE).toBe('index.html');
    expect(cancelHref(TEST_CONTACT_ADDRESS)).toBe(HREF);
    const url = new URL(HREF);
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe(TEST_CONTACT_ADDRESS);
    expect(url.searchParams.get('subject')).toBe(CANCEL_SUBJECT);
  });

  it('takes its address from the accessibility statement\'s contact - and there is none while that is a placeholder', () => {
    expect(statementAddress(STATEMENT)).toBeNull();
    expect(statementAddress(FILLED)).toBe(TEST_CONTACT_ADDRESS);
    // Only a real mailto: contact gives an address; a form or a phone number does not.
    expect(statementAddress(statementWithContact(STATEMENT, '<p>פניות: <a data-a11y-contact href="https://il-biz-tools.netlify.app/contact">טופס</a></p>'))).toBeNull();
    expect(statementAddress(statementWithContact(STATEMENT, '<p>פניות: <a data-a11y-contact href="mailto:someone@example.com">x</a></p>'))).toBeNull();
    expect(statementAddress(statementWithContact(STATEMENT, '<p>פניות: <a href="mailto:test-only@il-biz-tools.netlify.app">x</a></p>'))).toBeNull();
  });
});

describe('the home page, in the source', () => {
  it('carries the link once, in the site footer, marked as a placeholder until the build fills it, with no address typed', () => {
    const tags = cancelTags(index);
    expect(tags).toHaveLength(1);
    expect(cancelTags(footerOf(index))).toEqual(tags);
    expect(tags[0]).toContain('data-publish-blocker="cancel-link"');
    expect(hrefOf(tags[0])).not.toContain('@');
    const link = /<a\b[^>]*data-cancel-link[^>]*>([\s\S]*?)<\/a>/.exec(index);
    expect(textOf(link[1])).toBe('ביטול עסקה (Pro)');
  });

  it('says beside it, in one paragraph: the ways to cancel, what the notice carries, and how the refund is paid', () => {
    const p = /<p\b[^>]*id="cancel-pro"[^>]*>([\s\S]*?)<\/p>/.exec(footerOf(index));
    expect(p).not.toBeNull();
    const text = textOf(p[1]);
    expect(text.startsWith('ביטול עסקה (Pro)')).toBe(true);
    for (const phrase of ['בקישור הזה', 'משיבים למייל הקבלה מ-Gumroad', 'שם ומספר תעודת זהות', 'דרך Gumroad', 'במטבע שבו חויבתם']) {
      expect(text, phrase).toContain(phrase);
    }
    expect(p[1]).toContain(CANCEL_LINK_ATTR);
  });

  it('no page in the source carries an address: the only one the site ever shows is the statement\'s, filled at build', () => {
    for (const page of [index, invoice]) expect(page.replace(/"@(context|type|graph|id)"/g, '')).not.toContain('@');
  });
});

describe('withCancelLinks: the build fills the link from the statement, or leaves the placeholder', () => {
  it('without an address it changes nothing', () => {
    expect(withCancelLinks(index, null)).toBe(index);
    expect(withCancelLinks(invoice, null)).toBe(invoice);
  });

  it('with the statement\'s address every marked link gets the href and loses its placeholder marker, nothing else changes', () => {
    const out = withCancelLinks(index, TEST_CONTACT_ADDRESS);
    const tags = cancelTags(out);
    expect(tags).toEqual([`<a ${CANCEL_LINK_ATTR} href="${HREF}">`]);
    expect(out).not.toContain('data-publish-blocker');
    expect(out.replace(tags[0], '')).toBe(index.replace(cancelTags(index)[0], ''));
  });
});

describe('cancelLinkProblems: the gate', () => {
  const shipped = (statement, home = withCancelLinks(index, statementAddress(statement)), extra = []) => [
    { path: 'accessibility.html', html: statement },
    { path: 'index.html', html: home },
    ...extra,
  ];

  it('refuses while the statement has no mail contact: the link cannot be filled', () => {
    const found = cancelLinkProblems(shipped(STATEMENT));
    expect(found.length).toBeGreaterThan(0);
    expect(found.join('\n')).toMatch(/index\.html: .*accessibility statement/);
    // And the marker the source carries is a placeholder blocker of its own.
    expect(publishBlockers([{ path: 'index.html', html: index }, { path: 'accessibility.html', html: FILLED }]).map((b) => b.blocker))
      .toContain('placeholder "cancel-link" is still in the page');
  });

  it('is clear once the build filled the link from the statement\'s contact', () => {
    expect(cancelLinkProblems(shipped(FILLED))).toEqual([]);
    expect(publishBlockers(shipped(FILLED))).toEqual([]);
  });

  it('refuses a link that is not exactly the statement\'s address and subject, however it got there', () => {
    const hand = (href) => index.replace(cancelTags(index)[0], `<a ${CANCEL_LINK_ATTR} href="${href}">`);
    for (const [why, href] of [
      ['another address', HREF.replace(TEST_CONTACT_ADDRESS, 'someone.else@il-biz-tools.netlify.app')],
      ['no subject', `mailto:${TEST_CONTACT_ADDRESS}`],
      ['another subject', `mailto:${TEST_CONTACT_ADDRESS}?subject=Pro`],
      ['the marker deleted, the placeholder href kept', hrefOf(cancelTags(index)[0])],
      ['a web page', 'https://il-biz-tools.netlify.app/'],
    ]) {
      const found = cancelLinkProblems(shipped(FILLED, hand(href)));
      expect(found.length, why).toBeGreaterThan(0);
      expect(found.join('\n'), why).toMatch(/index\.html: /);
    }
  });

  it('refuses a home page without the link, a link outside the site footer, or one that is hidden', () => {
    const filled = withCancelLinks(index, TEST_CONTACT_ADDRESS);
    const tag = cancelTags(filled)[0];
    for (const [why, home] of [
      ['no link', filled.replace(tag, '<a href="accessibility.html">')],
      ['hidden', filled.replace(tag, tag.replace('<a ', '<a hidden '))],
      ['no link text', filled.replace(`${tag}ביטול עסקה (Pro)</a>`, `${tag}</a>`)],
      ['moved out of the footer', filled.replace(tag, '<a href="accessibility.html">').replace('<main class="container">', `<main class="container"><p>${tag}ביטול עסקה (Pro)</a></p>`)],
    ]) {
      expect(cancelLinkProblems(shipped(FILLED, home)).length, why).toBeGreaterThan(0);
    }
    expect(cancelLinkProblems([{ path: 'accessibility.html', html: FILLED }]).join('\n')).toMatch(/index\.html/);
  });

  it('checks the link on every page it appears on, not only the home page', () => {
    const other = { path: 'invoice.html', html: `<p><a ${CANCEL_LINK_ATTR} href="mailto:x@il-biz-tools.netlify.app?subject=Pro">ביטול עסקה (Pro)</a></p>` };
    expect(cancelLinkProblems(shipped(FILLED, undefined, [other])).join('\n')).toMatch(/invoice\.html: /);
  });
});

describe('the build, end to end', () => {
  const copies = [];
  afterAll(() => copies.forEach(removeCopy));
  const fresh = () => {
    const dir = copyProduct();
    copies.push(dir);
    return dir;
  };

  it('refuses to publish while the statement\'s contact is a placeholder, naming the cancellation link too', () => {
    const dir = fresh();
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/cancel-link|cancellation link/);
    expect(existsSync(join(dir, '_site'))).toBe(false);
  });

  it('publishes once the statement has its contact, with the link filled from it and no marker left', () => {
    const dir = fresh();
    fillContact(dir);
    const r = runBuild(dir);
    expect(r.status, r.stderr).toBe(0);
    const home = readIn(join(dir, '_site'), 'index.html');
    expect(cancelTags(home)).toEqual([`<a ${CANCEL_LINK_ATTR} href="${HREF}">`]);
    expect(home).not.toMatch(/data-publish-blocker/i);
    // No identifier but the brand address the statement already publishes.
    const addresses = home.match(/[^\s"'<>:?=@]+@[^\s"'<>?&]+/g) ?? [];
    expect(addresses.every((a) => a === TEST_CONTACT_ADDRESS)).toBe(true);
  });

  it('refuses when the link is deleted from the home page, even with the statement\'s contact in place', () => {
    const dir = fresh();
    fillContact(dir);
    editIn(dir, 'index.html', (h) => h.replace(/<a\b[^>]*data-cancel-link[^>]*>([\s\S]*?)<\/a>/, '$1'));
    const r = runBuild(dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/cancellation link/);
  });
});
