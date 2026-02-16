import { NextResponse } from 'next/server';
import { query } from '../../../lib/db'; 

export async function GET() {
  try {
    const sql = `
      SELECT 
        m.movimientoid, m.movimientofecha, m.movimientocantfisica,
        m.movimientovalortotal, tm.tipomovdesc, tm.tipomovab,
        ts.tipostockdesc, ts.tipostockunidad
      FROM gdc_stockagromovimiento m
      JOIN gdc_stockagrotipomov tm ON m.movimientotipomov = tm.tipomovid
      JOIN gdc_stockagrotipostock ts ON m.movimientotipostock = ts.tipostockcod
      ORDER BY m.movimientoid DESC
    `;
    const result = await query(sql);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = [
      1, body.date, parseInt(body.moveTypeId), body.stockTypeCode,
      parseFloat(body.quantity) || 0, parseFloat(body.unitPrice) || 0, parseFloat(body.totalValue) || 0
    ];
    const sql = `
      INSERT INTO gdc_stockagromovimiento (
        empcodigo, movimientofecha, movimientotipomov, movimientotipostock, 
        movimientocantfisica, movimientopreciounit, movimientovalortotal, movimientoorigen
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'M') RETURNING movimientoid
    `;
    const result = await query(sql, values);
    return NextResponse.json({ success: true, id: result.rows[0].movimientoid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- FITUR HAPUS ---
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error("ID tidak ditemukan");

    await query('DELETE FROM gdc_stockagromovimiento WHERE movimientoid = $1', [id]);
    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}