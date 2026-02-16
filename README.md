# 🚜 Stock Agro Manager

**Stock Agro Manager** adalah aplikasi manajemen inventaris modern yang dirancang khusus untuk operasional peternakan dan pertanian. Aplikasi ini memungkinkan pelacakan stok secara real-time, visualisasi tren data, dan manajemen transaksi yang aman.

![Dashboard Preview](https://img.shields.io/badge/UI-Modern_Minimalist-indigo)
![Tech Stack](https://img.shields.io/badge/Tech-Next.js_|_PostgreSQL-blue)

## ✨ Fitur Utama

* **Dashboard Interaktif**: Ringkasan saldo stok otomatis untuk setiap item (Sapi, Pakan, Obat, dll).
* **Visualisasi Data**: Grafik Area Chart yang modern untuk memantau volume stok secara visual.
* **Manajemen CRUD**: Input, Edit, dan Hapus transaksi pergerakan stok dengan mudah.
* **Sistem Filter & Cari**: Pencarian transaksi secara instan berdasarkan keterangan atau jenis stok.
* **Export Laporan PDF**: Cetak laporan transaksi profesional dalam format PDF hanya dengan satu klik.
* **Responsive Design**: Tampilan optimal baik di desktop maupun perangkat mobile.

## 🛠️ Tech Stack

* **Frontend**: Next.js 15+, Tailwind CSS (Modern Slate & Indigo Theme)
* **Backend**: Next.js API Routes (Serverless)
* **Database**: PostgreSQL
* **Visualization**: Chart.js & React-Chartjs-2
* **Reporting**: jsPDF & jsPDF-AutoTable

## 🚀 Cara Menjalankan Proyek

### 1. Persiapan Database
Pastikan PostgreSQL sudah berjalan dan buat tabel-tabel berikut melalui DBeaver atau terminal SQL:
- `gdc_stockagromovimiento` (Tabel Transaksi)
- `gdc_stockagrotipomov` (Master Tipe Gerak)
- `gdc_stockagrotipostock` (Master Jenis Stok)

### 2. Konfigurasi Environment
Buat file `.env.local` di root folder dan masukkan kredensial database kamu:
```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=postgres
DB_PASSWORD=password_kamu
DB_PORT=5432
