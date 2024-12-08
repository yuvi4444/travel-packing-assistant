const mysql = require('mysql2');

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost',       // Database host (use 'localhost' for local development)
  user: 'root',            // Your MySQL username (use 'root' or whatever your username is)
  password: 'admin',            // Your MySQL password (leave empty if none)
  database: 'travel_assistant'    // The name of the database (change this if needed)
});

// Establish the connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Export the db connection to be used in other files
module.exports = db;
