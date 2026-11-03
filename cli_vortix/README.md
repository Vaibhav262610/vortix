# Vortix device package

This package runs the Vortix agent on a computer you own or administer. The maintained agent source is in `../agent/`; `npm pack` copies its runtime files here before building the package. The Windows tray and installer are in this directory.

## Windows setup

Install Node.js, then download the matching [Vortix 1.2.14 installer](https://vortixai.vercel.app/downloads/VortixSetup-1.2.14.exe). Sign in to the [dashboard](https://vortixai.vercel.app/dashboard), choose **Add device → Create code**, set a password in the tray app, and enter the code there. The tray shows whether the agent is connected and can pause or quit it.

The npm registry may still serve an older version. To install this source version, clone the repository and run:

```bash
cd cli_vortix
npm ci
npm run build:tray
npm pack
npm install -g ./vortix-1.2.14.tgz
vortix enable-autostart
vortix tray
```

For a terminal-only setup, use `vortix login`, `vortix pair`, then `vortix start`. Paste the code at the prompt. A pairing code is single-use and expires after ten minutes. Existing paired devices reconnect without a new code.

## Commands

| Command | Purpose |
| --- | --- |
| `vortix login` | Set the local device password |
| `vortix pair` | Associate this installation with the signed-in dashboard account |
| `vortix start` | Run the agent in the current terminal |
| `vortix tray` | Open the Windows status window |
| `vortix status` | Inspect local setup and startup status |
| `vortix enable-autostart` | Start quietly at Windows sign-in |
| `vortix disable-autostart` | Remove the sign-in launcher |

Build the Windows download with `npm run build:tray` followed by `npm run build:installer`. The installer and checksum are written under `../dashboard/public/downloads/`.

The agent accepts remote shell commands and desktop actions. Run it with a low-privilege OS account and read [the security policy](../SECURITY.md) before using it with sensitive data.
