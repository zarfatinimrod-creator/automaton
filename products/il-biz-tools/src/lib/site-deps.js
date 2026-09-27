// What a shipped page actually loads.
//
// The build used to copy src/lib/ and src/config/ into _site/ whole, so
// tax-2026.json ("verified": false) and the unverified registrar-fee amounts
// were reachable by URL even though no published page rendered them. The honest
// answer to "which files does the public site need" is the one the shipped
// pages give themselves: follow every local reference from each page -
// <script src>, <link href>, <img src>, imports inside an inline module - then
// every import and every fetch('literal') in the modules those load, and ship
// exactly that set. A withheld page ships as a notice that loads nothing but
// the stylesheet, so nothing its real page would have loaded is reached.
//
// Fail closed: a reference that climbs out of the product, points at a file
// that does not exist, or a dynamic import() whose target is not a string
// literal is an error, and the build stops. A fetch() with a computed URL is
// not followed - whatever it would load is simply not shipped.
//
// Build-time only. No shipped page imports this module, so it does not ship.

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

const STATIC_IMPORT = /\bimport\s+(?:[\w$*{}\s,]+?\s+from\s+)?(['"])([^'"\n]+)\1/g;
const EXPORT_FROM = /\bexport\s+(?:\*(?:\s+as\s+[\w$]+)?|\{[^}]*\})\s+from\s+(['"])([^'"\n]+)\1/g;
const DYNAMIC_IMPORT = /\bimport\s*\(([^)]*)\)/g;
const STRING_LITERAL = /^\s*(['"`])([^'"`$]*)\1\s*$/;
const FETCH_LITERAL = /\bfetch\s*\(\s*(['"`])([^'"`$\n]*)\1/g;

/** Directory part of a root-relative path ('' for a file at the root). */
export function dirOf(path) {
  const i = path.lastIndexOf('/');
  return i < 0 ? '' : path.slice(0, i);
}

/**
 * Resolve a reference against a root-relative directory.
 * @returns {string|null} a root-relative path; null for external URLs and in-page anchors
 * @throws when the reference climbs above the product root
 */
export function resolveRef(baseDir, spec) {
  const clean = String(spec ?? '').trim().split(/[?#]/)[0];
  if (!clean || EXTERNAL.test(clean)) return null;
  const parts = clean.startsWith('/') ? [] : baseDir.split('/').filter(Boolean);
  for (const seg of clean.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      if (!parts.length) throw new Error(`reference climbs out of the product: ${spec}`);
      parts.pop();
    } else {
      parts.push(seg);
    }
  }
  return parts.length ? parts.join('/') : null;
}

const attr = (tag, name) => {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
};

const RUNS_AS_SCRIPT = new Set(['', 'module', 'text/javascript', 'application/javascript']);

/**
 * Local references made by an HTML page, relative to the page itself.
 * @returns {{assets: string[], inlineModules: string[]}}
 */
export function htmlReferences(html) {
  const text = String(html ?? '').replace(/<!--[\s\S]*?-->/g, '');
  const assets = [];
  const inlineModules = [];
  for (const m of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src = attr(m[1], 'src');
    if (src !== undefined) assets.push(src);
    else if (RUNS_AS_SCRIPT.has((attr(m[1], 'type') ?? '').toLowerCase())) inlineModules.push(m[2]);
  }
  const markup = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  for (const m of markup.matchAll(/<(img|source|iframe|audio|video|embed|track|input)\b[^>]*>/gi)) {
    const src = attr(m[0], 'src');
    if (src !== undefined) assets.push(src);
  }
  for (const m of markup.matchAll(/<link\b[^>]*>/gi)) {
    const href = attr(m[0], 'href');
    if (href !== undefined) assets.push(href);
  }
  return { assets, inlineModules };
}

/**
 * What a JavaScript module loads.
 * imports resolve against the module; fetches resolve against the page (the document URL).
 * @returns {{imports: string[], fetches: string[], computedImports: string[]}}
 */
export function moduleReferences(js) {
  const source = String(js ?? '');
  const imports = [];
  const computedImports = [];
  for (const m of source.matchAll(STATIC_IMPORT)) imports.push(m[2]);
  for (const m of source.matchAll(EXPORT_FROM)) imports.push(m[2]);
  for (const m of source.matchAll(DYNAMIC_IMPORT)) {
    const literal = STRING_LITERAL.exec(m[1]);
    if (literal) imports.push(literal[2]);
    else computedImports.push(m[0]);
  }
  const fetches = [...source.matchAll(FETCH_LITERAL)].map((m) => m[2]);
  return { imports, fetches, computedImports };
}

/** url(...) and @import in a stylesheet, relative to the stylesheet. */
export function cssReferences(css) {
  const source = String(css ?? '').replace(/\/\*[\s\S]*?\*\//g, '');
  const refs = [];
  for (const m of source.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) refs.push(m[2]);
  for (const m of source.matchAll(/@import\s+(['"])([^'"]+)\1/gi)) refs.push(m[2]);
  return refs.filter((r) => !/^data:/i.test(r.trim()));
}

/**
 * Every local file the given pages load, transitively.
 *
 * @param {{path: string, html: string}[]} pages  the HTML that will ship, root-relative paths
 * @param {(path: string) => string|null|undefined} read  file text, or null/undefined if it does not exist
 * @returns {{files: string[], errors: string[]}}  files sorted; errors mean the build must stop
 */
export function collectDependencies(pages, read) {
  const files = new Set();
  const errors = [];
  const seen = new Set();
  const queue = [];

  const enqueue = (baseDir, spec, docDir, from) => {
    let path;
    try {
      path = resolveRef(baseDir, spec);
    } catch (e) {
      errors.push(`${from}: ${e.message}`);
      return;
    }
    if (path) queue.push({ path, docDir, from });
  };

  const followModule = (source, moduleDir, docDir, from) => {
    const { imports, fetches, computedImports } = moduleReferences(source);
    for (const spec of imports) {
      if (!EXTERNAL.test(spec) && !/^\.{0,2}\//.test(spec)) {
        errors.push(`${from}: bare module specifier "${spec}" cannot load in a browser`);
        continue;
      }
      enqueue(moduleDir, spec, docDir, from);
    }
    for (const spec of fetches) enqueue(docDir, spec, docDir, from);
    for (const expr of computedImports) errors.push(`${from}: ${expr} has a computed target the build cannot follow`);
  };

  for (const { path, html } of pages) {
    const pageDir = dirOf(path);
    const { assets, inlineModules } = htmlReferences(html);
    for (const spec of assets) enqueue(pageDir, spec, pageDir, path);
    for (const source of inlineModules) followModule(source, pageDir, pageDir, `${path} (inline script)`);
  }

  while (queue.length) {
    const { path, docDir, from } = queue.shift();
    const key = `${path}\u0000${docDir}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const text = read(path);
    if (text === null || text === undefined) {
      errors.push(`${from}: references ${path}, which does not exist`);
      continue;
    }
    files.add(path);
    if (/\.m?js$/i.test(path)) followModule(text, dirOf(path), docDir, path);
    else if (/\.css$/i.test(path)) for (const spec of cssReferences(text)) enqueue(dirOf(path), spec, docDir, path);
  }

  return { files: [...files].sort(), errors };
}
