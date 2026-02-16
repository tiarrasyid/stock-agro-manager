import { NextResponse } from 'next/server';
import { query } from '../../../lib/db'; 

export async function GET() {
  try {
    const sql = `
      SELECT 
        ts.tipostockdesc as item,
        ts.tipostockunidad as unit,
        SUM(CASE WHEN tm.tipomovab = 'A' THEN m.movimientocantfisica ELSE 0 END) -
        SUM(CASE WHEN tm.tipomovab = 'B' THEN m.movimientocantfisica ELSE 0 END) as balance
      FROM gdc_stockagrotipostock ts
      LEFT JOIN gdc_stockagromovimiento m ON ts.tipostockcod = m.movimientotipostock
      LEFT JOIN gdc_stockagrotipomov tm ON m.movimientotipomov = tm.tipomovid
      GROUP BY ts.tipostockcod, ts.tipostockdesc, ts.tipostockunidad
      ORDER BY ts.tipostockdesc ASC
    `;

    const result = await query(sql);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}