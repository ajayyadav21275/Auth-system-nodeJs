const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'testdb',
  password: 'Ajay@21275',
  port: 5432,
});

// Connection check
pool.connect()
  .then(() => {
    console.log("Connected to the PostgreSQL database");
  })
  .catch((err) => {
    console.error("Error connecting to the database", err);
  });

module.exports = { pool };