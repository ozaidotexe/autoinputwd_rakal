# Auto Input WD E-Wallet (Private Edition)

Auto Input WD E-Wallet adalah ekstensi peramban yang dirancang khusus untuk mengotomatiskan proses rekapitulasi data penarikan dari panel target ke Google Sheets secara real-time.

## 🚀 Fitur Utama

* **Deteksi Otomatis:** Memantau tabel penarikan di panel dan mengidentifikasi transaksi E-Wallet (DANA, OVO, GOPAY, LINKAJA, SHOPEEPAY).
* **Sistem Prioritas:** Mendukung pemisahan data prioritas (manual) dan data yang diproses sistem tanpa mengganggu integritas baris.
* **Anti-Duplikasi:** Dilengkapi dengan mekanisme pengecekan data ganda untuk memastikan setiap transaksi hanya tercatat sekali di Google Sheets.
* **Sistem Tahan (WatchList):** Transaksi yang memiliki status "Merah" tidak akan diproses oleh robot.
* **Notifikasi Real-time:** Memberikan umpan balik visual langsung di peramban setiap kali data berhasil tercatat.

## 🛠️ Arsitektur Sistem


Ekstensi ini bekerja dengan integrasi dua arah antara browser dan Google Apps Script untuk memastikan keamanan dan kecepatan data.

## 📋 Panduan Instalasi (Development Mode)

1. Clone atau Download repositori ini.
2. Buka halaman pengaturan ekstensi browser Anda.
3. Klik **"Load Temporary Add-on"** (Firefox) atau aktifkan **"Developer mode"** lalu klik **"Load unpacked"** (Chrome).
4. Pilih folder ekstensi ini.

## ⚙️ Integrasi Google Sheets

* **Baris 11-19:** Area khusus untuk penginputan manual (tidak akan diganggu oleh robot).
* **Baris 20 ke bawah:** Area otomatis di mana robot akan mencatat transaksi baru secara berurutan.

## 🛡️ Keamanan

* **Sistem Pengaman:** Ekstensi hanya berjalan pada halaman dengan teks verifikasi login yang valid ("Login sebagai: ALVIN CS").
* **Data Privasi:** Tidak menyimpan kredensial atau data sensitif di luar interaksi transaksi.

---
*Dibuat dengan sepenuh hati oleh Lord Ozai.*
