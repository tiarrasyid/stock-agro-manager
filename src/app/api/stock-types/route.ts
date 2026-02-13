import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';

export async function GET() {
  try {
    // Jalankan query SQL
    // Ingat: Postgres otomatis mengubah nama tabel jadi lowercase
    const result = await query('SELECT * FROM gdc_stockagrotipostock');
    
    // Kembalikan data dalam format JSON
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data stok' },
      { status: 500 }
    );
  }
}