#!/usr/bin/env node

const path = require('path');

const command = process.argv[2];

// When installed via npm, files are in the package directory
const packageRoot = path.join(__dirname, '..');
const agentPath = path.join(packageRoot, 'agent', 'agent.js');
const backendPath = path.join(packageRoot, 'backend', 'server.js');

function showHelp() {
    console.log(`
Vortix - AI OS Control CLI

Usage:
  vortix login              Login and authenticate device
  vortix start              Start the agent
  vortix backend            Start the backend server
  vortix help               Show this help message

Examples:
  vortix login              # Authenticate your device
  vortix start              # Start agent on this machine
  vortix backend            # Start backend server
  `);
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

    case 'backend':
        runBackend();
        break;

    case 'help':
    case '--help':
    case '-h':
        showHelp();
        break;

    default:
        console.log('Unknown command:', command);
        showHelp();
        process.exit(1);
}
