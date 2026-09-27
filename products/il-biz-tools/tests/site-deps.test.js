import { describe, it, expect } from 'vitest';
import {
  dirOf,
  resolveRef,
  htmlReferences,
  moduleReferences,
  cssReferences,
  collectDependencies,
} from '../src/lib/site-deps.js';

describe('resolving a reference', () => {
  it('resolves page- and module-relative paths to root-relative ones', () => {
    expect(resolveRef('', 'assets/page-vat.js')).toBe('assets/page-vat.js');
    expect(resolveRef('', './assets/common.js')).toBe('assets/common.js');
    expect(resolveRef('assets', '../src/lib/vat.js')).toBe('src/lib/vat.js');
    expect(resolveRef('src/lib', '../config/vat.json')).toBe('src/config/vat.json');
    expect(resolveRef('assets', '/src/config/site.json')).toBe('src/config/site.json');
    expect(resolveRef('', 'src/config/x.json?v=2#top')).toBe('src/config/x.json');
  });

  it('ignores external urls and anchors', () => {
    expect(resolveRef('', 'https://il-biz-tools.netlify.app/')).toBeNull();
    expect(resolveRef('', '//cdn.example/x.js')).toBeNull();
    expect(resolveRef('', 'data:image/png;base64,AAAA')).toBeNull();
    expect(resolveRef('', '#faq')).toBeNull();
  });

  it('refuses a reference that climbs out of the product', () => {
    expect(() => resolveRef('', '../README.md')).toThrow(/climbs out/);
    expect(() => resolveRef('assets', '../../secret.json')).toThrow(/climbs out/);
  });

  it('knows the directory of a path', () => {
    expect(dirOf('index.html')).toBe('');
    expect(dirOf('src/lib/vat.js')).toBe('src/lib');
  });
});

describe('what a page references', () => {
  const html = `<!doctype html><html><head>
    <link rel="canonical" href="https://example.com/x.html">
    <link rel="stylesheet" href="assets/style.css">
    <script type="application/ld+json">{"import": "not code"}</script>
    <!-- <script src="assets/commented-out.js"></script> -->
  </head><body>
    <img src="assets/logo.png" alt="">
    <a href="vat.html">not a dependency</a>
    <script type="module" src="assets/page-vat.js"></script>
    <script type="module">import { initPage } from './assets/common.js'; initPage();</script>
  </body></html>`;

  it('collects script, stylesheet and image references, and inline module code', () => {
    const refs = htmlReferences(html);
    expect(refs.assets).toEqual(['assets/page-vat.js', 'assets/logo.png', 'https://example.com/x.html', 'assets/style.css']);
    expect(refs.inlineModules).toHaveLength(1);
    expect(refs.inlineModules[0]).toContain('./assets/common.js');
  });
});

describe('what a module references', () => {
  it('finds static imports, re-exports, literal dynamic imports and literal fetches', () => {
    const js = `
      import site from '../src/config/site.json' with { type: 'json' };
      import {
        a,
        $b,
      } from "./two.js";
      import './side-effect.js';
      export { x } from './three.js';
      export * from './four.js';
      const m = await import('./five.js');
      const config = await fetch('src/config/allocation-number.json').then((r) => r.json());
      const other = fetch(url, init);
      const templated = fetch(\`src/config/\${name}.json\`);
    `;
    const refs = moduleReferences(js);
    expect(refs.imports).toEqual([
      '../src/config/site.json',
      './two.js',
      './side-effect.js',
      './three.js',
      './four.js',
      './five.js',
    ]);
    expect(refs.fetches).toEqual(['src/config/allocation-number.json']);
    expect(refs.computedImports).toEqual([]);
  });

  it('flags a dynamic import whose target is computed', () => {
    expect(moduleReferences('const m = await import(`./${name}.js`);').computedImports).toHaveLength(1);
    expect(moduleReferences('const m = await import(path);').computedImports).toHaveLength(1);
  });

  it('reads url() and @import out of a stylesheet, skipping data urls and comments', () => {
    const css = `@import "base.css"; /* url(ignored.png) */ .a { background: url('img/bg.png'); } .b { background: url(data:image/png;base64,AA); }`;
    expect(cssReferences(css)).toEqual(['img/bg.png', 'base.css']);
  });
});

describe('the dependency walk', () => {
  const tree = {
    'assets/style.css': '.x { color: red; }',
    'assets/common.js': "import site from '../src/config/site.json' with { type: 'json' };",
    'assets/page-a.js': "import { initPage } from './common.js'; import { f } from '../src/lib/a.js'; const c = await fetch('src/config/a-rates.json');",
    'src/lib/a.js': "import cfg from '../config/a.json' with { type: 'json' };",
    'src/lib/unused.js': "import cfg from '../config/secret.json' with { type: 'json' };",
    'src/config/site.json': '{}',
    'src/config/a.json': '{}',
    'src/config/a-rates.json': '{}',
    'src/config/secret.json': '{}',
  };
  const read = (p) => tree[p] ?? null;
  const page = (html) => ({ path: 'a.html', html });

  it('reaches exactly what the pages load, transitively, and nothing else', () => {
    const { files, errors } = collectDependencies(
      [page('<link rel="stylesheet" href="assets/style.css"><script type="module" src="assets/page-a.js"></script>')],
      read,
    );
    expect(errors).toEqual([]);
    expect(files).toEqual([
      'assets/common.js',
      'assets/page-a.js',
      'assets/style.css',
      'src/config/a-rates.json',
      'src/config/a.json',
      'src/config/site.json',
      'src/lib/a.js',
    ]);
    expect(files).not.toContain('src/config/secret.json');
    expect(files).not.toContain('src/lib/unused.js');
  });

  it('a page that loads only the stylesheet pulls in nothing else', () => {
    const { files } = collectDependencies([page('<link rel="stylesheet" href="assets/style.css">')], read);
    expect(files).toEqual(['assets/style.css']);
  });

  it('fails closed: a missing file, an escape, a bare specifier and a computed import are errors', () => {
    const missing = collectDependencies([page('<script type="module" src="assets/nope.js"></script>')], read);
    expect(missing.errors.join('\n')).toMatch(/assets\/nope\.js, which does not exist/);

    const escape = collectDependencies([page('<script src="../outside.js"></script>')], read);
    expect(escape.errors.join('\n')).toMatch(/climbs out/);

    const bare = collectDependencies([page("<script type=\"module\">import x from 'lodash';</script>")], read);
    expect(bare.errors.join('\n')).toMatch(/bare module specifier "lodash"/);

    const computed = collectDependencies([page('<script type="module">const m = await import(name);</script>')], read);
    expect(computed.errors.join('\n')).toMatch(/computed target/);
  });
});
