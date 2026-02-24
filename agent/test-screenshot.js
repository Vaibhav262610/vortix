// Test script to verify screenshot-desktop works
const screenshot = require('screenshot-desktop');

console.log('Testing screenshot capture...');

screenshot({ format: 'jpg' })
    .then((img) => {
        console.log('✅ Screenshot captured successfully!');
        console.log(`   Size: ${img.length} bytes`);
        console.log(`   Base64 length: ${img.toString('base64').length} characters`);
        console.log('\nScreen sharing should work! 🎉');
    })
    .catch((err) => {
        console.error('❌ Screenshot failed:', err.message);
        console.error('\nTroubleshooting:');
        console.error('- Windows: Make sure you have permissions');
        console.error('- macOS: Grant Screen Recording permission in System Preferences');
        console.error('- Linux: Install scrot or imagemagick');
    });
