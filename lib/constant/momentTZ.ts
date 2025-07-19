// config/moment.js
const momentTZ = require('moment-timezone');
const DEFAULT_TIMEZONE = "Asia/Hong_Kong"
// Set the default timezone globally
momentTZ.tz.setDefault(DEFAULT_TIMEZONE);

// Export moment if needed elsewhere
export default momentTZ;