# Auto Input WD E-Wallet (Private Edition)

**Auto Input WD E-Wallet** adalah ekstensi peramban (*browser extension*) yang dirancang khusus untuk mengotomatiskan proses rekapitulasi data penarikan (*withdrawal*) dari panel target ke Google Sheets secara *real-time*.

## 🚀 Fitur Utama

* **Deteksi Otomatis:** Memantau tabel penarikan di panel dan mengidentifikasi transaksi E-Wallet (DANA, OVO, GOPAY, LINKAJA, SHOPEEPAY).
* **Sistem Prioritas:** Mendukung pemisahan data prioritas (manual) dan data yang diproses sistem tanpa mengganggu integritas baris.
* **Anti-Duplikasi:** Dilengkapi dengan mekanisme pengecekan data ganda untuk memastikan setiap transaksi hanya tercatat sekali di Google Sheets.
* **Sistem Tahan (WatchList):** Transaksi yang memiliki status "Merah" tidak akan diproses oleh robot, memberikan Anda kendali penuh untuk penginputan manual.
* **Notifikasi Real-time:** Memberikan umpan balik visual langsung di peramban setiap kali data berhasil tercatat.

## 🛠️ Arsitektur Integrasi



Ekstensi ini bekerja dengan integrasi dua arah antara *browser* (sisi klien) dan Google Apps Script (sisi server) untuk memastikan keamanan dan kecepatan data.

## 📋 Panduan Instalasi (Development Mode)

Berikut adalah langkah-langkah untuk memuat ekstensi ini ke peramban Anda:

### Untuk Google Chrome:
1. Simpan folder ekstensi di komputer Anda.
2. Buka Chrome dan ketik `chrome://extensions/` di *address bar*.
3. Di pojok kanan atas, aktifkan **"Developer mode"** (saklar ke posisi ON).
4. Klik tombol **"Load unpacked"**.
5. Pilih folder tempat Anda menyimpan kode ekstensi.

### Untuk Mozilla Firefox:
1. Simpan folder ekstensi di komputer Anda.
2. Buka Firefox dan ketik `about:debugging#/runtime/this-firefox` di *address bar*.
3. Klik tombol **"Load Temporary Add-on..."**.
4. Cari dan pilih file `manifest.json` di dalam folder ekstensi Anda.
5. Ekstensi sekarang aktif dan siap digunakan hingga peramban ditutup.

## ⚙️ Integrasi Google Sheets

Untuk mencegah tabrakan data (*race condition*), kode Google Apps Script (GAS) menggunakan `LockService` untuk mengelola antrean.

### Konfigurasi Baris:
* **Baris 11-19:** Area khusus untuk penginputan manual (tidak akan diganggu oleh robot).
* **Baris 20 ke bawah:** Area otomatis di mana robot akan mencatat transaksi baru secara berurutan.

## 🛡️ Keamanan

* **Sistem Pengaman:** Ekstensi hanya akan berjalan pada halaman dengan teks verifikasi login yang valid.
* **Data Privasi:** Ekstensi tidak menyimpan kredensial login atau data sensitif lainnya di luar interaksi transaksi yang diperlukan.

## 📝 Catatan Perubahan (v1.4)

* **Peningkatan Stabilitas:** Menghapus fungsi *sorting* otomatis pada Google Sheets untuk mencegah baris bergeser secara tiba-tiba.
* **Optimasi Manifest V3:** Penyesuaian izin (*permissions*) agar sesuai dengan standar keamanan peramban modern.

---
*Dibuat dengan sepenuh hati oleh Lord Ozai.*
