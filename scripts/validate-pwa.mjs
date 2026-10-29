import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../dist/', import.meta.url));
const manifest = JSON.parse(readFileSync(join(directory, 'manifest.webmanifest'), 'utf8'));
const html = readFileSync(join(directory, 'index.html'), 'utf8');
const worker = readFileSync(join(directory, 'sw.js'), 'utf8');
const site = new URL('https://example.com/shuttle-bus-schedule/');
for (const property of ['id', 'start_url', 'scope']) {
  assert.equal(new URL(manifest[property], site).href, site.href, `${property} must stay inside the project path`);
}
assert.equal(manifest.display, 'standalone');
assert.match(html, /rel="manifest"/);
assert.match(html, /rel="apple-touch-icon"/);
for (const icon of [...manifest.icons, { src: 'icons/apple-touch-icon.png', sizes: '180x180' }]) {
  const png = readFileSync(join(directory, icon.src));
  assert.equal(png.subarray(1, 4).toString(), 'PNG', `${icon.src} must be a PNG`);
  assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes, `Invalid icon size: ${icon.src}`);
  assert.ok(worker.includes(icon.src), `Icon missing from offline cache: ${icon.src}`);
}
assert.ok(worker.includes('index.html'), 'App shell missing from offline cache');
for (const name of readdirSync(join(directory, 'assets'))) {
  if (/\.(js|css|svg|png)$/.test(name)) {
    assert.ok(worker.includes(`assets/${name}`), `Asset missing from offline cache: ${name}`);
  }
}
for (const platform of ['mobile', 'desktop']) {
  assert.ok(worker.includes(`App.${platform}-`), `${platform} layout must be cached before first use`);
}
console.log('PWA manifest, project subpath, icon sizes and complete offline asset coverage passed.');
