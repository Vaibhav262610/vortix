# Publishing Vortix CLI to npm

## Prerequisites

1. You need an npm account
   - Sign up at: https://www.npmjs.com/signup
   - Or login if you have one

2. Login to npm from terminal:
   ```bash
   npm login
   ```

   - Enter your username
   - Enter your password
   - Enter your email

## Publishing Steps

### 1. Navigate to CLI directory

```bash
cd cli_vortix
```

### 2. Test the package locally (optional)

```bash
npm pack
```

This creates a `.tgz` file you can test with:

```bash
npm install -g vortix-1.0.1.tgz
```

### 3. Publish to npm

```bash
npm publish
```

If the package name is already taken, you'll need to either:

- Use a scoped package: `@yourusername/vortix`
- Choose a different name

### 4. Verify publication

Visit: https://www.npmjs.com/package/vortix

## Updating the Package

When you make changes:

1. Update version in `package.json`:

   ```json
   "version": "1.0.2"
   ```

2. Commit changes:

   ```bash
   git add .
   git commit -m "Update to version 1.0.2"
   git push
   ```

3. Publish update:
   ```bash
   cd cli_vortix
   npm publish
   ```

## Version Numbering

Follow semantic versioning (semver):

- **1.0.0** → **1.0.1**: Bug fixes (patch)
- **1.0.0** → **1.1.0**: New features (minor)
- **1.0.0** → **2.0.0**: Breaking changes (major)

## Current Version: 1.0.1

### Changes in 1.0.1:

- Fixed "spawn node ENOENT" error
- Removed authentication requirement
- Agent works without login
- Updated to use `require()` instead of `spawn()`

## After Publishing

Users can install/update with:

```bash
npm install -g vortix@latest
```

Or force reinstall:

```bash
npm uninstall -g vortix
npm install -g vortix
```

## Troubleshooting

### "Package name already exists"

Change the name in `package.json` or use a scoped package:

```json
{
	"name": "@vaibhavrajpoot/vortix",
	"version": "1.0.1"
}
```

### "You must be logged in"

Run `npm login` first

### "Permission denied"

You don't have permission to publish this package name. Choose a different name.

## Important Files

Make sure these are included (check `files` in package.json):

- ✅ bin/vortix.js
- ✅ agent/agent.js
- ✅ agent/package.json
- ✅ backend/server.js
- ✅ backend/package.json
- ✅ README.md

Files to exclude (add to `.npmignore`):

- node_modules/
- .git/
- \*.log
- .env

## Testing After Publish

On another computer:

```bash
npm install -g vortix
vortix start
```

Should work without errors!
