const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'FitManager_Backend', '.env') });
const sequelize = require('./FitManager_Backend/src/config/database');
const Member = require('./FitManager_Backend/src/models/Member');

async function testDB() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Check if table exists by trying a simple query
    try {
      const count = await Member.count();
      console.log(`Table 'miembros' exists and has ${count} records.`);
    } catch (err) {
      console.error('Error querying table:', err.message);
      if (err.message.includes("doesn't exist")) {
        console.log('The table "miembros" does not exist in the database.');
      }
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDB();
