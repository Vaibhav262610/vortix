const fs = require("fs");
const path = require("path");
const readline = require("readline");

const CONFIG_PATH = path.join(__dirname, "config.json");

function login() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Enter device token: ", (token) => {
    const config = { token: token.trim() };

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

    console.log("Token saved successfully.");
    rl.close();
  });
}

function getToken() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return null;
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH));
  return config.token;
}

module.exports = { login, getToken };
