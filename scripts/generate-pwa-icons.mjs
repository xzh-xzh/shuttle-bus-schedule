import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';

const source = await readFile(new URL('../assets/icon.svg', import.meta.url), 'utf8');
const inner = source.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#0f172a"/><g transform="translate(40 40) scale(0.9375)">${inner}</g></svg>`;
const directory = new URL('../public/icons/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const [name, size, svg] of [
  ['icon-192.png', 192, source],
  ['icon-512.png', 512, source],
  ['apple-touch-icon.png', 180, source],
  ['maskable-512.png', 512, maskable]
]) {
  const renderer = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: '#0f172a'
  });
  await writeFile(new URL(name, directory), renderer.render().asPng());
}
console.log('Generated PWA icons from assets/icon.svg.');
