# Auto Input WD E-Wallet (Private Edition)

**Auto Input WD E-Wallet** adalah ekstensi peramban yang dirancang khusus untuk mengotomatiskan proses rekapitulasi data penarikan (*withdrawal*) dari panel target ke Google Sheets secara *real-time*.

## 🚀 Fitur Utama

* **Deteksi Otomatis:** Memantau tabel penarikan di panel dan mengidentifikasi transaksi E-Wallet (DANA, OVO, GOPAY, LINKAJA, SHOPEEPAY).
* **Sistem Prioritas:** Mendukung pemisahan data prioritas (manual) dan data yang diproses sistem tanpa mengganggu integritas baris.
* **Anti-Duplikasi:** Dilengkapi dengan mekanisme pengecekan data ganda untuk memastikan setiap transaksi hanya tercatat sekali di Google Sheets.
* **Sistem Tahan (WatchList):** Transaksi yang memiliki status "Merah" atau ditandai khusus tidak akan diproses oleh robot, memberikan Anda kendali penuh untuk penginputan manual.
* **Notifikasi Real-time:** Memberikan umpan balik visual langsung di peramban setiap kali data berhasil tercatat.

## 🛠️ Arsitektur Sistem



Ekstensi ini bekerja dengan integrasi dua arah antara *browser* (sisi klien) dan Google Apps Script (sisi server) untuk memastikan keamanan dan kecepatan data.

## 📋 Panduan Instalasi (Development Mode)

1. **Clone** atau **Download** repositori ini ke komputer lokal Anda.
2. Buka halaman pengaturan ekstensi browser Anda:
   - **Firefox:** `about:debugging#/runtime/this-firefox`
   - **Chrome:** `chrome://extensions/`
3. Klik **"Load Temporary Add-on"** (Firefox) atau aktifkan **"Developer mode"** lalu klik **"Load unpacked"** (Chrome).
4. Pilih folder tempat Anda menyimpan kode ekstensi ini.
5. Ekstensi siap digunakan!

## ⚙️ Integrasi Google Sheets

Untuk mencegah tabrakan data (*race condition*), pastikan kode Google Apps Script (GAS) Anda menggunakan `LockService`.

### Konfigurasi Baris:
* **Baris 11-19:** Area khusus untuk penginputan manual (tidak akan diganggu oleh robot).
* **Baris 20 ke bawah:** Area otomatis di mana robot akan mencatat transaksi baru secara berurutan.

## 🛡️ Keamanan

* **Sistem Pengaman:** Ekstensi hanya akan berjalan pada halaman yang memiliki teks verifikasi login yang valid.
* **Data Privasi:** Ekstensi tidak menyimpan kredensial login atau data sensitif lainnya di luar interaksi transaksi yang diperlukan.

## 📝 Catatan Perubahan (v1.4)

* **Peningkatan Stabilitas:** Menghapus fungsi *sorting* otomatis pada Google Sheets untuk mencegah baris bergeser secara tiba-tiba.
* **Optimasi Manifest V3:** Penyesuaian izin (*permissions*) agar sesuai dengan standar keamanan browser modern.

---
*Dibuat dengan sepenuh hati oleh Lord Ozai.*
