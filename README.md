# Autopilot Input WD ALL BANK (Non-E-Wallet)
> **Sistem Otomatisasi Input Data Penarikan Dana (Withdrawal) Real-Time** > Dikembangkan oleh **Lord Ozai** untuk mengotomatiskan pencatatan transaksi penarikan dana dari dasbor admin langsung ke Google Sheets.

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

```mermaid
flowchart TD
    %% Styling
    classDef default fill:#1e1e2e,stroke:#cdd6f4,stroke-width:1px,color:#cdd6f4;
    classDef success fill:#a6e3a1,stroke:#a6e3a1,stroke-width:1px,color:#11111b;
    classDef danger fill:#f38ba8,stroke:#f38ba8,stroke-width:1px,color:#11111b;
    classDef warning fill:#f9e2af,stroke:#f9e2af,stroke-width:1px,color:#11111b;

    A[Dasbor Admin] --> B{Verifikasi Otoritas:<br/>'ALVIN CS'}
    B -- Gagal --> C[Script Berhenti]:::danger
    B -- Lolos --> D[Memuat main_allbank.js dari GitHub]
    
    D --> E[Proses Pemindaian<br/>Tiap 3 Detik]
    E --> F[Ambil Baris Tabel]
    
    F --> G{Filter E-Wallet<br/>DANA, OVO, GOPAY, dll.}
    G -- Ya --> H[Lewati/Abaikan]:::warning
    G -- Tidak --> I{SeaBank Aktif<br/>& Di-skip?}
    
    I -- Ya --> H
    I -- Tidak --> J{Deteksi Status Tahan<br/>Warna Merah / Pink?}
    
    J -- Ya --> K[Tampilkan Notif Watchlist & Lewati]:::danger
    J -- Tidak --> L[Kirim Data JSON via Fetch POST]
    
    L --> M[doPost.gs di Google Sheets]
    M --> N[Aktifkan Lock Service<br/>Maksimal antrean 30 detik]
    N --> O{Cek Duplikat:<br/>Username + Waktu}
    
    O -- Ada --> P[Return status: DUPLICATE]:::warning
    O -- Tidak Ada --> Q{Cari Celah Kosong<br/>Kolom K-O Mulai Baris 20}
    
    Q -- Ada Celah --> R[Tulis di Baris Kosong Tersebut]
    Q -- Penuh --> S[Tulis di Baris Paling Bawah<br/>getLastRow + 1]
    
    R --> T[Lepas Lock & Kirim Respon SUCCESS]:::success
    S --> T



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
