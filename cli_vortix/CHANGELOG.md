# Changelog

## [1.1.0] - 2024-03-14

### Added

- Real-time system stats monitoring (CPU, Memory, Disk)
- Improved CPU measurement accuracy for Windows using wmic
- Platform detection sent immediately on connection
- Better error logging with close codes and reasons
- Auto-start status now loads automatically for authenticated devices

### Changed

- Default backend URL now points to production (wss://vortix.onrender.com)
- Reduced system stats measurement time from 1s to 500ms for faster response
- System stats update interval changed from 3s to 1s for real-time feel
- Removed verbose console logs for cleaner output

### Fixed

- Fixed platform detection for AI command generation
- Fixed WebSocket connection state tracking in dashboard
- Fixed file transfer not showing files on initial load
- Fixed auto-start toggle not reflecting correct state
- Fixed "notepad" command on Windows (AI now generates correct commands)
- Fixed system stats showing 0% in production

### Backend

- Added HTTP server for health checks (/health endpoint)
- Improved WebSocket upgrade handling for better cloud platform compatibility
- Better error handling and connection stability

## [1.0.5] - Previous Release

- Initial stable release
