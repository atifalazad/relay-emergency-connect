import { readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const appPath = (name) => path.join(appRoot, name);
const sitePath = (name) => path.join(appRoot, '..', name);

const assets = [
  ['manrope.woff2', 'font/woff2'],
  ['relay-waves.webp', 'image/webp'],
  ['school-doodles-mono.webp', 'image/webp'],
  ['favicon.svg', 'image/svg+xml'],
  ['favicon.ico', 'image/x-icon'],
  ['apple-touch-icon.png', 'image/png'],
];
const urls = {};
for (const [name, mime] of assets) {
  urls['/' + name] = 'data:' + mime + ';base64,' + (await readFile(appPath('public/' + name))).toString('base64');
}
let css = await readFile(appPath('src/style.css'), 'utf8');
for (const [name, data] of Object.entries(urls)) css = css.replaceAll(name, data);
const js = (await readFile(appPath('dist/app.js'), 'utf8')).replaceAll('</script', '<\\/script');
let html = (await readFile(appPath('src/index.html'), 'utf8'))
  .replace('<link rel="stylesheet" href="/style.css">', () => '<style>' + css + '</style>')
  .replace('<script type="module" src="/app.js"></script>', () => '<script type="module">' + js + '</script>');
for (const [name, data] of Object.entries(urls)) html = html.replaceAll('"' + name + '"', '"' + data + '"');
if ((html.match(/<script type="module">/g) || []).length !== 1 || (html.match(/<\/script>/g) || []).length !== 1) {
  throw new Error('Packaged app has invalid script boundaries');
}
await writeFile(sitePath('index.html'), html);
for (const name of ['manifest.webmanifest', 'sw.js', 'app-icon-192.png', 'app-icon-512.png', 'apple-touch-icon.png', 'favicon.svg', 'favicon.ico']) {
  await copyFile(appPath('public/' + name), sitePath(name));
}
console.log('Published app refreshed in the repository root.');
