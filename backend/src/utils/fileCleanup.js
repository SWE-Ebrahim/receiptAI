/**
 * File Cleanup Utility
 * 
 * Automatically removes old temporary upload files to prevent disk space issues
 */

const fs = require('fs');
const path = require('path');

const TEMP_UPLOAD_DIR = path.join(__dirname, '../uploads/temp');
const MAX_AGE_HOURS = 24; // Delete files older than 24 hours

/**
 * Clean up old temporary files
 */
function cleanupTempFiles() {
  try {
    if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
      return;
    }

    const now = Date.now();
    const maxAge = MAX_AGE_HOURS * 60 * 60 * 1000; // Convert to milliseconds

    const files = fs.readdirSync(TEMP_UPLOAD_DIR);
    let deletedCount = 0;

    files.forEach(file => {
      const filePath = path.join(TEMP_UPLOAD_DIR, file);
      
      try {
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtimeMs;

        // Delete if older than max age
        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`🗑️ Deleted old temp file: ${file}`);
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err.message);
      }
    });

    if (deletedCount > 0) {
      console.log(`✅ Cleanup complete: ${deletedCount} old files removed`);
    }
  } catch (error) {
    console.error('❌ Error during temp file cleanup:', error.message);
  }
}

/**
 * Schedule automatic cleanup every hour
 */
function scheduleCleanup() {
  // Run cleanup immediately on startup
  cleanupTempFiles();

  // Then run every hour
  setInterval(cleanupTempFiles, 60 * 60 * 1000);
  
  console.log('⏰ Scheduled temp file cleanup every hour');
}

module.exports = {
  cleanupTempFiles,
  scheduleCleanup,
};
