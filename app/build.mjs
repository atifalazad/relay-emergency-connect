import { build } from 'esbuild';
import { cp, copyFile, mkdir, writeFile } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
const result = await build({
  entryPoints: ['src/app.jsx'],
  bundle: true,
  minify: true,
  legalComments: 'inline',
  format: 'esm',
  target: ['es2022'],
  outfile: 'dist/app.js',
  write: false,
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
});
if (process.argv.includes('--check')) {
  console.log('PASS: Najda production bundle compiles (' + result.outputFiles[0].contents.length + ' bytes).');
  process.exit(0);
}
await writeFile('dist/app.js', result.outputFiles[0].contents);
await cp('public', 'dist', { recursive: true });
await copyFile('src/style.css', 'dist/style.css');
await copyFile('src/index.html', 'dist/index.html');
console.log('Najda built: dist/index.html');
