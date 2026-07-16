Siap, Lord Ozai! Biar nggak ribet download, ini versi teks mentah (`README.md`) yang bisa langsung kamu salin lewat tombol **"Copy"** di pojok kanan atas kotak kode di bawah ini:

```markdown
# Autopilot Input WD ALL BANK (Non-E-Wallet)
> **Sistem Otomatisasi Input Data Penarikan Dana (Withdrawal) Real-Time**  
> Dikembangkan oleh **Lord Ozai** untuk mengotomatiskan pencatatan transaksi penarikan dana dari dasbor admin langsung ke Google Sheets.

Sistem ini terdiri dari dua komponen utama:
1. **Frontend (Chrome Extension / Content Script):** Berjalan di sisi browser dasbor admin untuk memindai tabel transaksi secara real-time, menyaring metode pembayaran (mengabaikan E-Wallet), menguji validitas akun, dan mengirimkannya ke Google Sheets.
2. **Backend (Google Apps Script):** Menerima data dari frontend, mencegah penulisan data ganda (*anti-duplicate*), mengelola antrean penginputan (*race condition prevention*), serta menyusun data secara rapi di dalam Google Sheets.

---

## 📂 Struktur File Proyek

Berikut adalah daftar file yang menyusun sistem ini beserta fungsinya masing-masing:

| Nama File | Jenis | Peran / Deskripsi |
| :--- | :--- | :--- |
| `manifest.json` | Konfigurasi | Manifest Ekstensi Chrome (Manifest V3) untuk mendaftarkan izin domain, tab aktif, dan mendefinisikan content script yang berjalan otomatis pada halaman target. |
| `content_allbank.js` | Loader Ekstensi | Script perantara yang memverifikasi otoritas pengguna ("ALVIN CS") dan mengunduh (fetch) script eksekusi utama secara dinamis dari repositori GitHub secara aman. |
| `main_allbank.js` *(Remote)* | Logika Utama | Script inti yang memproses pemindaian tabel, menyaring E-Wallet, menyediakan tombol toggle SeaBank, mendeteksi *Watchlist* (merah/pink), dan mengurus pengiriman data (*fetch*). |
| `doPost.gs` | Backend GAS | Script Google Apps Script yang dipasang pada Google Sheets sebagai Web App untuk menangani penyimpanan, pengecekan duplikat, pencarian celah baris kosong, dan penguncian antrean data. |

---

## 🛠️ Alur Kerja Sistem (Workflow)


```

[ Dasbor Admin ]
│
▼ (content_allbank.js)
[ Verifikasi Otoritas: "ALVIN CS" ] ───( Gagal )───► [ Script Berhenti ]
│
├─► Memuat `main_allbank.js` dari GitHub
│
▼ (Proses Pemindaian Tiap 3 Detik)
[ Ambil Baris Tabel ]
│
├──► [ Filter E-Wallet (DANA, OVO, GOPAY, dll.) ] ──► [ Lewati ]
├──► [ Jika SeaBank Aktif & Dilewati ] ─────────────► [ Lewati ]
├──► [ Deteksi Status "Tahan" (Merah / Pink) ] ────► [ Tampilkan Notif Watchlist & Lewati ]
│
▼ (Validasi Lolos)
[ Kirim Data JSON via Fetch POST ]
│
▼ (doPost.gs di Google Sheets)
[ Aktifkan Lock Service ] (Maksimal antrean 30 detik)
│
▼
[ Cek Duplikat: Kombinasi Username + Waktu ] ───( Ada )───► [ Return status: DUPLICATE ]
│
▼ (Tidak Ada Duplikat)
[ Cari Celah Kosong di Kolom K-O (Mulai Baris 20) ]
│
├───► (Ada Celah) ────► Tulis di Baris Kosong Tersebut
└───► (Penuh) ────────► Tulis di Baris Paling Bawah (getLastRow + 1)
│
▼
[ Lepas Lock & Kirim Respon SUCCESS ke Browser ]

```

---

## ⚙️ Panduan Instalasi & Konfigurasi

### Langkah 1: Setup Backend (Google Sheets & Apps Script)
1. Buka spreadsheet Google Sheets target Anda.
2. Buat atau pastikan terdapat lembar kerja (*sheet*) bernama **`AUTOWD`**.
3. Atur format **Kolom O (Waktu)** sebagai **Format > Angka > Teks Biasa** guna mencegah inkonsistensi format penulisan tanggal antara web dan sheet (agar deteksi duplikat bekerja 100%).
4. Klik menu **Ekstensi > Apps Script**.
5. Hapus semua kode bawaan, lalu salin dan tempel isi file `doPost.gs` Anda ke sana.
6. Klik **Terapkan (Deploy) > Penerapan Baru (New Deployment)**.
7. Pilih jenis penerapan sebagai **Aplikasi Web (Web App)**.
8. Konfigurasikan:
   * **Jalankan sebagai:** *Diri Anda (Akun Google Anda)*.
   * **Siapa yang memiliki akses:** *Siapa saja (Anyone)*.
9. Salin **URL Aplikasi Web** yang dihasilkan (format URL: `https://script.google.com/macros/s/.../exec`).

### Langkah 2: Konfigurasi Frontend (`main_allbank.js`)
1. Buka file `main_allbank.js`.
2. Ganti nilai variabel `GOOGLE_SHEET_WEBAPP_URL` dengan URL Aplikasi Web yang Anda salin pada langkah sebelumnya:
   ```javascript
   const GOOGLE_SHEET_WEBAPP_URL = "URL_SAB_BARU_ANDA_DI_SINI";

```

3. Unggah (push) file `main_allbank.js` yang sudah diperbarui tersebut ke dalam repositori GitHub Anda di jalur:
`https://github.com/ozaidotexe/autoinputwd_rakal/blob/main/main_allbank.js`.

### Langkah 3: Pemasangan Ekstensi di Browser Chrome

1. Unduh atau simpan folder berisi file `manifest.json` dan `content_allbank.js` ke komputer lokal Anda.
2. Buka browser Google Chrome lalu akses halaman pengelolaan ekstensi di: `chrome://extensions/`.
3. Aktifkan mode pengembang dengan mencentang toggle **Developer Mode** di pojok kanan atas.
4. Klik tombol **Load unpacked** di pojok kiri atas.
5. Pilih folder lokal tempat Anda menyimpan file `manifest.json` dan `content_allbank.js` tadi.
6. Ekstensi **"Auto Input WD ALL BANK by Lord Ozai"** kini telah aktif dan siap digunakan.

---

## 💡 Fitur Unggulan & Analisis Optimasi Teknologinya

### 🔒 Sistem Pengaman Ganda

Ekstensi hanya akan memproses tabel jika halaman web mendeteksi string `"Login sebagai: ALVIN CS"`. Jika operator lain yang login, sistem secara otomatis melumpuhkan dirinya sendiri demi menjaga keamanan data transaksi.

### 🚦 Manajemen Antrean Berkecepatan Tinggi (Lock Service)

Pencatatan data otomatis dari browser rentan terhadap *race condition* (data bertubrukan karena masuk di milidetik yang sama). Kode backend kita dilengkapi dengan `LockService.getScriptLock()` yang memaksa request mengantre secara tertib hingga 30 detik sebelum diproses.

### 🧼 Smart Slot-Filling (Mengisi Baris Kosong)

Tidak seperti fungsi append baris konvensional yang selalu menambahkan data di paling bawah, script ini akan memindai baris kosong (mulai dari baris 20 ke bawah pada kolom K-O) dan mengisinya terlebih dahulu sebelum memutuskan membuat baris baru. Hal ini menjaga performa sheet tetap efisien dan rapi.

### 🛑 Deteksi Warna Watchlist

Sistem otomatis menghentikan proses pengiriman dan menerbitkan notifikasi visual berwarna merah di browser apabila mendeteksi baris transaksi dengan teks berwarna merah atau nama pengguna (*username*) berlatar belakang pink (indikator transaksi ditahan oleh tim CS).

---

## ⚠️ Informasi Penting untuk Pemeliharaan

* **Penanganan Duplikat:** Pengecekan duplikat dilakukan pada rentang kolom K-O mulai baris 20 ke bawah berdasarkan kecocokan string **Username** dan **Waktu**. Pastikan tidak ada data manual tak berformat yang merusak struktur baris di area ini.
* **Limitasi Apps Script:** Batas kuota eksekusi harian Google Apps Script gratis berkisar di antara 20.000 s.d. 100.000 request per hari. Optimalkan jeda pemindaian (`setInterval` pada frontend, saat ini diatur tiap 3000ms/3 detik) sesuai dengan intensitas transaksi harian Anda.

---

*Developed with ❤️ by Lord Ozai.*

```

```

# Auto Input WD E-Wallet (using at RAKAL)

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
