"use client";

import { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// --- Interface untuk TypeScript (Zero Error) ---
interface Movement {
  movimientoid: number;
  movimientofecha: string;
  movimientocantfisica: number;
  movimientovalortotal: number;
  tipomovdesc: string;
  tipomovab: string;
  tipostockdesc: string;
  tipostockunidad: string;
}

interface StockType { tipostockcod: string; tipostockdesc: string; }
interface MoveType { tipomovid: number; tipomovdesc: string; }
interface Balance { item: string; unit: string; balance: number; }

export default function Home() {
  const [stockTypes, setStockTypes] = useState<StockType[]>([]);
  const [moveTypes, setMoveTypes] = useState<MoveType[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    moveTypeId: "",
    stockTypeCode: "",
    quantity: 0,
    unitPrice: 0,
    totalValue: 0,
  });

  const loadAllData = async () => {
    try {
      const [resStock, resMoveType, resHistory, resBalance] = await Promise.all([
        fetch("/api/stock-types"),
        fetch("/api/movement-types"),
        fetch("/api/movements"),
        fetch("/api/stock-balance")
      ]);
      setStockTypes(await resStock.json());
      setMoveTypes(await resMoveType.json());
      setMovements(await resHistory.json());
      setBalances(await resBalance.json());
    } catch (err) { console.error("Load Error:", err); }
  };

  useEffect(() => { loadAllData(); }, []);
  useEffect(() => { setForm(prev => ({ ...prev, totalValue: prev.quantity * prev.unitPrice })); }, [form.quantity, form.unitPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal simpan");
      setForm(prev => ({ ...prev, quantity: 0, unitPrice: 0 }));
      loadAllData();
    } catch (err: any) { alert(err.message); } finally { setIsLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus transaksi ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/movements?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadAllData();
    } catch (err: any) { alert(err.message); }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text("STOCK AGRO MANAGER - LAPORAN INVENTARIS", 14, 15);
    autoTable(doc, {
      head: [['Tanggal', 'Item', 'Keterangan', 'Jumlah', 'Total']],
      body: movements.map(m => [
        new Date(m.movimientofecha).toLocaleDateString('id-ID'),
        m.tipostockdesc, m.tipomovdesc,
        m.tipomovab === 'B' ? `-${m.movimientocantfisica}` : `+${m.movimientocantfisica}`,
        `Rp ${Number(m.movimientovalortotal).toLocaleString()}`
      ]),
      startY: 25,
      theme: 'grid',
      headStyles: { fillColor: [67, 56, 202] }
    });
    doc.save(`Laporan_Agro_${Date.now()}.pdf`);
  };

  const filteredMovements = movements.filter(m => 
    m.tipostockdesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.tipomovdesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Konfigurasi Area Chart (Modern) ---
  const chartData = {
    labels: balances.map(b => b.item),
    datasets: [{
      fill: true,
      label: 'Volume Stok',
      data: balances.map(b => b.balance),
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      tension: 0.4, // Membuat garis melengkung smooth
      pointBackgroundColor: 'rgb(99, 102, 241)',
    }]
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
      {/* HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-black text-xl italic">N</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-800 leading-none">STOCK AGRO</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Management System v1.0</p>
            </div>
          </div>
          <button onClick={downloadPDF} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-xl shadow-slate-200 active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Export PDF
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* TOP ROW: STATS & CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-slate-800 flex items-center gap-2 italic">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> VISUALISASI STOK
              </h2>
            </div>
            <div className="h-[280px]">
              <Line data={chartData} options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { grid: { display: false } }, x: { grid: { display: false } } }
              }} />
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-4">
            {balances.map((b, i) => (
              <div key={i} className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-md cursor-default">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.item}</p>
                    <h3 className="text-2xl font-black text-slate-800 mt-1">{Number(b.balance).toLocaleString()}</h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-md font-bold text-slate-500 uppercase">{b.unit}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[65%] rounded-full group-hover:w-[70%] transition-all duration-700"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ROW: FORM & TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM CARD */}
          <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-fit">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="text-indigo-500 font-normal">📝</span> Tambah Data
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tanggal Transaksi</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required />
              </div>
              <select value={form.moveTypeId} onChange={e => setForm({...form, moveTypeId: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" required>
                <option value="">Pilih Tipe Pergerakan</option>
                {moveTypes.map(t => <option key={t.tipomovid} value={t.tipomovid}>{t.tipomovdesc}</option>)}
              </select>
              <select value={form.stockTypeCode} onChange={e => setForm({...form, stockTypeCode: e.target.value})} className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" required>
                <option value="">Pilih Item Stok</option>
                {stockTypes.map(s => <option key={s.tipostockcod} value={s.tipostockcod}>{s.tipostockdesc}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Qty" value={form.quantity || ""} onChange={e => setForm({...form, quantity: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="number" placeholder="Harga" value={form.unitPrice || ""} onChange={e => setForm({...form, unitPrice: Number(e.target.value)})} className="w-full bg-slate-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Estimasi Total</p>
                <p className="text-2xl font-black mt-1">Rp {form.totalValue.toLocaleString()}</p>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {isLoading ? "PROSES..." : "SIMPAN TRANSAKSI"}
              </button>
            </form>
          </div>

          {/* TABLE CARD */}
          <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span className="text-indigo-500 font-normal">📊</span> Riwayat Aktivitas
              </h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Cari transaksi..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-slate-50 border-none rounded-xl py-2 px-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                />
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item & Keterangan</th>
                    <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah</th>
                    <th className="pb-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMovements.map((m) => (
                    <tr key={m.movimientoid} className="group hover:bg-slate-50/50 transition-all">
                      <td className="py-4 text-sm text-slate-500 font-medium">
                        {new Date(m.movimientofecha).toLocaleDateString('id-ID', { day:'2-digit', month:'short' })}
                      </td>
                      <td className="py-4">
                        <div className="text-sm font-black text-slate-700">{m.tipostockdesc}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{m.tipomovdesc}</div>
                      </td>
                      <td className={`py-4 text-right font-black text-sm ${m.tipomovab === 'B' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {m.tipomovab === 'B' ? '-' : '+'} {Number(m.movimientocantfisica).toLocaleString()}
                      </td>
                      <td className="py-4 text-center">
                        <button onClick={() => handleDelete(m.movimientoid)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}