#!/usr/bin/env node

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    magenta: '\x1b[35m',
};

const box = {
    topLeft: '╔',
    topRight: '╗',
    bottomLeft: '╚',
    bottomRight: '╝',
    horizontal: '═',
    vertical: '║',
};

function printBox(lines, width = 60) {
    console.log('\n');
    console.log(colors.green + box.topLeft + box.horizontal.repeat(width) + box.topRight + colors.reset);

    lines.forEach(line => {
        const padding = width - line.length;
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        console.log(
            colors.green + box.vertical + colors.reset +
            ' '.repeat(leftPad) + line + ' '.repeat(rightPad) +
            colors.green + box.vertical + colors.reset
        );
    });

    console.log(colors.green + box.bottomLeft + box.horizontal.repeat(width) + box.bottomRight + colors.reset);
    console.log('\n');
}

console.log('\n');
console.log(colors.bright + colors.green + '  ╦  ╦┌─┐┬─┐┌┬┐┬─┐ ┬' + colors.reset);
console.log(colors.bright + colors.green + '  ╚╗╔╝│ │├┬┘ │ │┌┴┬┘' + colors.reset);
console.log(colors.bright + colors.green + '   ╚╝ └─┘┴└─ ┴ ┴┴ └─' + colors.reset);
console.log('\n');

printBox([
    colors.bright + colors.cyan + '🚀 Installation Successful!' + colors.reset,
    '',
    colors.yellow + 'AI-Powered Remote OS Control' + colors.reset,
]);

console.log(colors.bright + '  📖 Quick Start:' + colors.reset);
console.log('');
console.log('     ' + colors.cyan + '1.' + colors.reset + ' Set device password:');
console.log('        ' + colors.green + 'vortix login' + colors.reset);
console.log('');
console.log('     ' + colors.cyan + '2.' + colors.reset + (process.platform === 'win32' ? ' Start the tray app at sign-in:' : ' Start the agent:'));
console.log('        ' + colors.green + (process.platform === 'win32' ? 'vortix enable-autostart' : 'vortix start') + colors.reset);
console.log('');
console.log('     ' + colors.cyan + '3.' + colors.reset + ' Open dashboard:');
console.log('        ' + colors.magenta + colors.bright + 'https://vortixai.vercel.app' + colors.reset);
console.log('');

console.log(colors.bright + '  📚 Documentation:' + colors.reset);
console.log('     ' + colors.cyan + 'https://github.com/Vaibhav262610/vortix' + colors.reset);
console.log('');

console.log(colors.bright + '  💡 Need Help?' + colors.reset);
console.log('     ' + colors.cyan + 'Run:' + colors.reset + ' ' + colors.green + 'vortix help' + colors.reset);
console.log('');

console.log(colors.yellow + '  ⚡ Pro Tip: ' + colors.reset + 'Use AI commands in the dashboard for natural language control!');
console.log('');
