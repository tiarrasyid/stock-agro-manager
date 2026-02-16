const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Parse .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^['"]|['"]$/g, '');
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

async function setupDB() {
  try {
    console.log('Setting up database tables...');
    
    // Create gdc_stockagrotipostock
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gdc_stockagrotipostock (
        tipostockcod VARCHAR(50) PRIMARY KEY,
        tipostockdesc VARCHAR(255) NOT NULL,
        tipostockunidad VARCHAR(50) NOT NULL
      );
    `);
    console.log('Created table gdc_stockagrotipostock');

    // Create gdc_stockagrotipomov
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gdc_stockagrotipomov (
        tipomovid SERIAL PRIMARY KEY,
        tipomovdesc VARCHAR(255) NOT NULL,
        tipomovab CHAR(1) NOT NULL
      );
    `);
    console.log('Created table gdc_stockagrotipomov');

    // Insert dummy data for gdc_stockagrotipostock if empty
    const resStock = await pool.query('SELECT COUNT(*) FROM gdc_stockagrotipostock');
    if (parseInt(resStock.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO gdc_stockagrotipostock (tipostockcod, tipostockdesc, tipostockunidad) VALUES
        ('STK001', 'Benih Jagung', 'kg'),
        ('STK002', 'Pupuk Urea', 'sak'),
        ('STK003', 'Pesticide X', 'liter')
      `);
      console.log('Inserted dummy data into gdc_stockagrotipostock');
    }

    // Insert dummy data for gdc_stockagrotipomov if empty
    const resMov = await pool.query('SELECT COUNT(*) FROM gdc_stockagrotipomov');
    if (parseInt(resMov.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO gdc_stockagrotipomov (tipomovid, tipomovdesc, tipomovab) VALUES
        (1, 'Masuk Pembelian', 'A'),
        (2, 'Keluar Penjualan', 'B'),
        (3, 'Masuk Retur', 'A'),
        (4, 'Keluar Rusak', 'B')
      `);
      console.log('Inserted dummy data into gdc_stockagrotipomov');
    }

  } catch (err) {
    console.error('Database Setup Error:', err);
  } finally {
    await pool.end();
  }
}

setupDB();
