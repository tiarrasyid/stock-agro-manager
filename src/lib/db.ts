import { Pool } from 'pg';

// Konfigurasi koneksi mengambil dari .env.local
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
});

// Helper function untuk menjalankan query
// text: SQL query (misal: "SELECT * FROM users WHERE id = $1")
// params: Array parameter (misal: [1])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const query = (text: string, params?: any[]) => pool.query(text, params);