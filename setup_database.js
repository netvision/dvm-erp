// Legacy database setup script - Use scripts/migrate-database.js for production
const { runMigration } = require('./scripts/migrate-database.js');

console.log('⚠️  This script is deprecated. Using the new migration system...');
console.log('For production deployment, use: node scripts/migrate-database.js');
console.log('');

// Run the new migration system
runMigration();