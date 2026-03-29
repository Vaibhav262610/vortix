# Changelog

## [1.2.0] - 2024-03-21

### 🎨 Major UI/UX Overhaul

- **Redesigned Dashboard** - New "Command Center" interface with modern styling
- **Mobile Optimization** - Complete mobile experience with responsive design
- **Enhanced Navigation** - Streamlined top navigation with rounded buttons
- **Improved Layout** - Wider containers for better content visibility
- **Modern Header** - Dynamic header with live status indicators and gradient
  icons

### ☁️ Cloud-First Architecture

- **No Backend Setup Required** - Fully cloud-hosted backend (always online)
- **Simplified Installation** - Just install CLI and start using
- **Production-Ready** - Backend runs on reliable cloud infrastructure
- **Zero Configuration** - Works out of the box with cloud services

### 📱 Mobile Experience

- **Mobile Command Input** - Dedicated command interface for mobile devices
- **Touch-Optimized UI** - Perfect touch interactions and gestures
- **Responsive Design** - Seamless experience across all screen sizes
- **Mobile Menu** - Clean slide-down navigation menu
- **Single Interface** - No duplicate elements, clean mobile layout

### ✨ Enhanced Features

- **Improved File Transfer** - Better mobile support with download buttons
- **Real-time Updates** - Faster system stats with 1-second intervals
- **Better Animations** - Smooth framer-motion animations throughout
- **Enhanced Security** - Improved authentication and connection handling
- **Performance Boost** - Optimized rendering and data updates

### 🔧 Technical Improvements

- **TypeScript Fixes** - Resolved all compilation errors
- **Build Optimization** - Faster builds and better error handling
- **Code Cleanup** - Removed duplicate code and improved structure
- **Better Error Handling** - More informative error messages
- **Improved Diagnostics** - Better debugging and monitoring

### 🚀 Developer Experience

- **Updated Documentation** - Comprehensive README with examples
- **Better CLI Help** - Improved command descriptions and usage
- **Enhanced Keywords** - Better npm discoverability
- **Modern Stack** - Latest React, Next.js, and Framer Motion

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
