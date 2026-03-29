#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const os = require('os');

const command = process.argv[2];

// When installed via npm, files are in the package directory
const packageRoot = path.join(__dirname, '..');
const agentPath = path.join(packageRoot, 'agent', 'agent.js');
const backendPath = path.join(packageRoot, 'backend', 'server.js');

// Check if this is first run
const configPath = path.join(os.homedir(), '.vortix-config.json');
const firstRunFlagPath = path.join(os.homedir(), '.vortix-first-run');

function showWelcome() {
    const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        green: '\x1b[32m',
        cyan: '\x1b[36m',
        yellow: '\x1b[33m',
        magenta: '\x1b[35m',
    };

    console.log('\n');
    console.log(colors.bright + colors.green + '  ╦  ╦┌─┐┬─┐┌┬┐┬─┐ ┬' + colors.reset);
    console.log(colors.bright + colors.green + '  ╚╗╔╝│ │├┬┘ │ │┌┴┬┘' + colors.reset);
    console.log(colors.bright + colors.green + '   ╚╝ └─┘┴└─ ┴ ┴┴ └─' + colors.reset);
    console.log('\n');
    console.log(colors.bright + colors.cyan + '  🚀 Welcome to Vortix!' + colors.reset);
    console.log(colors.yellow + '  AI-Powered Remote OS Control' + colors.reset);
    console.log('\n');
    console.log(colors.bright + '  📖 Quick Start:' + colors.reset);
    console.log('');
    console.log('     ' + colors.cyan + '1.' + colors.reset + ' Set device password:');
    console.log('        ' + colors.green + 'vortix login' + colors.reset);
    console.log('');
    console.log('     ' + colors.cyan + '2.' + colors.reset + ' Start the agent:');
    console.log('        ' + colors.green + 'vortix start' + colors.reset);
    console.log('');
    console.log('     ' + colors.cyan + '3.' + colors.reset + ' Open dashboard:');
    console.log('        ' + colors.magenta + colors.bright + 'https://vortixai.vercel.app' + colors.reset);
    console.log('');
    console.log(colors.yellow + '  ⚡ Pro Tip: ' + colors.reset + 'Use AI commands in the dashboard for natural language control!');
    console.log('');
}

function showHelp() {
    showWelcome();
    console.log('  📚 Available Commands:\n');
    console.log('     vortix login              Set device password');
    console.log('     vortix start              Start the agent');
    console.log('     vortix enable-autostart   Enable auto-start on system boot');
    console.log('     vortix disable-autostart  Disable auto-start');
    console.log('     vortix status             Check agent and auto-start status');
    console.log('     vortix help               Show this help message');
    console.log('');
    console.log('  ☁️  Cloud Backend:');
    console.log('     Backend runs automatically in the cloud - no setup required!');
    console.log('');
    console.log('  📖 Documentation:');
    console.log('     https://github.com/Vaibhav262610/vortix');
    console.log('');
}

// Show welcome message on first run or if no command provided
if (!command || command === 'help' || command === '--help' || command === '-h') {
    if (!fs.existsSync(firstRunFlagPath) && !command) {
        // First run without command
        showWelcome();
        fs.writeFileSync(firstRunFlagPath, Date.now().toString());
        process.exit(0);
    } else if (command === 'help' || command === '--help' || command === '-h') {
        showHelp();
        process.exit(0);
    } else if (!command) {
        showHelp();
        process.exit(0);
    }
}

function runAgent(cmd) {
    // Set the command argument for the agent
    process.argv[2] = cmd;

    // Change to agent directory
    process.chdir(path.dirname(agentPath));

    // Require and run the agent
    try {
        require(agentPath);
    } catch (err) {
        console.error('Failed to start agent:', err.message);
        process.exit(1);
    }
}

function runBackend() {
    console.log('Starting Vortix backend server...');

    // Change to backend directory
    process.chdir(path.dirname(backendPath));

    // Require and run the backend
    try {
        require(backendPath);
    } catch (err) {
        console.error('Failed to start backend:', err.message);
        process.exit(1);
    }
}

switch (command) {
    case 'login':
        runAgent('login');
        break;

    case 'start':
        runAgent('start');
        break;

    case 'enable-autostart':
        runAgent('enable-autostart');
        break;

    case 'disable-autostart':
        runAgent('disable-autostart');
        break;

    case 'status':
        runAgent('status');
        break;

    case 'backend':
        console.log('');
        console.log('🚀 Backend is now cloud-hosted!');
        console.log('');
        console.log('The Vortix backend runs automatically in the cloud.');
        console.log('No need to start it manually - just use:');
        console.log('');
        console.log('  vortix login    # Set up your device');
        console.log('  vortix start    # Start the agent');
        console.log('');
        console.log('Then visit: https://vortixai.vercel.app');
        console.log('');
        break;

    default:
        console.log('Unknown command:', command);
        showHelp();
        process.exit(1);
}
