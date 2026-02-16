const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes if any
      process.env[key] = value;
    }
  });
}

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

async function testConnection() {
  try {
    console.log('Testing connection to database...');
    console.log(`Host: ${process.env.DB_HOST}, User: ${process.env.DB_USER}, DB: ${process.env.DB_NAME}`);
    
    // First test simple connection
    const client = await pool.connect();
    console.log('Connected successfully!');
    client.release();

    // Now test the specific query
    console.log('Testing query: SELECT * FROM gdc_stockagrotipostock');
    const res = await pool.query('SELECT * FROM gdc_stockagrotipostock');
    console.log(`Query successful! Row count: ${res.rowCount}`);
    console.log('Rows:', res.rows);
  } catch (err) {
    console.error('Database Error:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
