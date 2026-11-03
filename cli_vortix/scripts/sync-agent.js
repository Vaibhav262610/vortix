const fs = require('node:fs');
const path = require('node:path');

const packageRoot = path.resolve(__dirname, '..');
const source = path.resolve(packageRoot, '..', 'agent');
const output = path.join(packageRoot, 'agent');
const runtimeFiles = ['agent.js', 'storage-scan.js', 'desktop-control.js'];

if (path.dirname(path.resolve(output)) !== packageRoot || path.basename(output) !== 'agent') {
  throw new Error('Unexpected package agent directory');
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const name of runtimeFiles) {
  fs.copyFileSync(path.join(source, name), path.join(output, name));
}
console.log('Bundled agent source from', source);
