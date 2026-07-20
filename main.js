(function() {
    'use strict';

    // =========================================================================
    // --- SISTEM PENGAMAN REMOTE (GITHUB) ---
    // =========================================================================
    const REMOTE_SCRIPT_URL = "https://raw.githubusercontent.com/ozaidotexe/autoinputwd_rakal/main/main.js";

    function isAuthorized() {
        return document.body.innerText.replace(/\s+/g, ' ').includes("Login sebagai: ALVIN CS");
    }

    // Tunggu sampai halaman benar-benar siap
    function inisialisasi() {
        if (!isAuthorized()) return;

        // 1. BUAT TOMBOL MELAYANG LANGSUNG DARI CONTENT SCRIPT (Pasti Muncul)
        buatTombolEkstensi();

        // 2. FETCH KODE UTAMA DARI GITHUB
        fetch(REMOTE_SCRIPT_URL)
            .then(response => {
                if (!response.ok) throw new Error("Gagal memuat modul remote.");
                return response.text();
            })
            .then(code => {
                // Menyuntikkan kode ke halaman utama lewat tag script resmi
                const script = document.createElement('script');
                script.textContent = code;
                (document.head || document.documentElement).appendChild(script);
                script.remove(); // Bersihkan tag setelah dieksekusi
                console.log("Autopilot (Remote) berhasil disuntikkan.");
            })
            .catch(err => {
                console.error("Sistem Pengaman: Gagal memuat modul.", err);
            });
    }

    // Fungsi menggambar tombol melayang
    function buatTombolEkstensi() {
        // Cek jika tombol sudah ada agar tidak ganda
        if (document.getElementById("btn-sakelar-wd")) return;

        let modeSakelar = localStorage.getItem("mode_ewallet") || "SEMUA";

        let btnSakelar = document.createElement("button");
        btnSakelar.id = "btn-sakelar-wd";
        btnSakelar.style.position = "fixed";
        btnSakelar.style.right = "20px";
        btnSakelar.style.bottom = "20px";
        btnSakelar.style.padding = "12px 20px";
        btnSakelar.style.fontSize = "14px";
        btnSakelar.style.fontWeight = "bold";
        btnSakelar.style.color = "white";
        btnSakelar.style.border = "none";
        btnSakelar.style.borderRadius = "8px";
        btnSakelar.style.cursor = "pointer";
        btnSakelar.style.zIndex = "999999"; // Naikkan layer agar paling depan
        btnSakelar.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.3)";
        btnSakelar.style.fontFamily = "Arial, sans-serif";
        btnSakelar.style.transition = "all 0.2s ease";

        function updateTampilanTombol() {
            if (modeSakelar === "ALLBANK") {
                btnSakelar.innerHTML = "🚫 MODE: ALLBANK (DANA OFF)";
                btnSakelar.style.backgroundColor = "#e67e22";
            } else {
                btnSakelar.innerHTML = "✅ MODE: SEMUA (DANA ON)";
                btnSakelar.style.backgroundColor = "#2ecc71";
            }
        }

        btnSakelar.addEventListener("click", function() {
            if (modeSakelar === "SEMUA") {
                modeSakelar = "ALLBANK";
            } else {
                modeSakelar = "SEMUA";
            }
            localStorage.setItem("mode_ewallet", modeSakelar);
            updateTampilanTombol();
            
            // Reload halaman otomatis agar filter baru langsung bekerja setelah tombol ditekan
            window.location.reload();
        });

        updateTampilanTombol();
        document.body.appendChild(btnSakelar);
    }

    // Jalankan dengan safety delay jika DOM belum siap sepenuhnya
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(inisialisasi, 1000);
    } else {
        window.addEventListener("DOMContentLoaded", () => setTimeout(inisialisasi, 1000));
    }
})();
