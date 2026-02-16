import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const result = await query('SELECT tipomovid, tipomovdesc, tipomovab FROM gdc_stockagrotipomov ORDER BY tipomovid ASC');
    return NextResponse.json(result.rows);
  } catch (error) { // Hapus ': any' di sini
    // Cek apakah error ini object Error beneran?
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}