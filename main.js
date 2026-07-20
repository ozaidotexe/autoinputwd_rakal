(function() {
    'use strict';

    // =========================================================================
    // --- SISTEM PENGAMAN ---
    // =========================================================================
    function isAuthorized() {
        return document.body.innerText.replace(/\s+/g, ' ').includes("Login sebagai: ALVIN CS");
    }

    if (!isAuthorized()) return; 
    // =========================================================================    

    const GOOGLE_SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwTOg5RYUNW53TNB3hhjqF8UZ4cxgHKNVdAkNcNJA90X5b-kVsMQB11ehC2eFQxez7x-g/exec";

    const diprosesSesiIni = new Set();
    let notifikasiAktif = [];
  
    function buatNotif(pesan, warna = "#17a2b8") {
        let notif = document.createElement("div");
        notif.style.position = "fixed";
        notif.style.left = "20px";
        notif.style.backgroundColor = warna;
        notif.style.color = "white";
        notif.style.padding = "10px 20px";
        notif.style.borderRadius = "5px";
        notif.style.zIndex = "99999";
        notif.style.fontFamily = "Arial, sans-serif";
        notif.style.fontSize = "14px";
        notif.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.2)";
        notif.style.transition = "all 0.3s ease";
        notif.innerHTML = pesan;
        document.body.appendChild(notif);
        notifikasiAktif.push(notif);
        susunUlangNotifikasi();
        setTimeout(() => {
            notif.style.opacity = "0";
            notif.style.transform = "translateX(-20px)";
            setTimeout(() => {
                notif.remove();
                notifikasiAktif = notifikasiAktif.filter(n => n !== notif);
                susunUlangNotifikasi();
            }, 300);
        }, 4000);
    }

    function susunUlangNotifikasi() {
        let batasBawahMulai = 85;
        let celahAntarNotif = 10;
        notifikasiAktif.forEach((notif, index) => {
            let posisiBottom = batasBawahMulai;
            for (let i = index + 1; i < notifikasiAktif.length; i++) {
                posisiBottom += notifikasiAktif[i].offsetHeight + celahAntarNotif;
            }
            notif.style.bottom = posisiBottom + "px";
        });
    }
    
    buatNotif("🔄<b>AUTO ON !!</b> Checking Withdraw <b>E-WALLET !!</b>", "#173ab8");

    // =========================================================================
    // --- FITUR BARU: MEMBUAT TOMBOL SAKELAR DI EKSTENSI ---
    // =========================================================================
    // Ambil status terakhir dari memori browser, defaultnya "SEMUA" jika belum pernah diklik
    let modeSakelar = localStorage.getItem("mode_ewallet") || "SEMUA";

    // Membuat elemen tombol secara visual di layar
    let btnSakelar = document.createElement("button");
    btnSakelar.style.position = "fixed";
        btnSakelar.style.top = "12px";
        btnSakelar.style.right = "700px"; // Ubah angka ini untuk pasin posisi (Naik = Kiri, Turun = Kanan)
        btnSakelar.style.left = "auto";
        btnSakelar.style.zIndex = "999999";
        btnSakelar.style.padding = "8px 12px";
        btnSakelar.style.fontSize = "14px";
        btnSakelar.style.fontWeight = "bold";
        btnSakelar.style.color = "white";
        btnSakelar.style.border = "none";
        btnSakelar.style.borderRadius = "5px";
        btnSakelar.style.cursor = "pointer";
        btnSakelar.style.boxShadow = "0px 2px 5px rgba(0,0,0,0.2)";
        btnSakelar.style.fontFamily = "Arial, sans-serif";
        btnSakelar.style.transition = "all 0.2s ease";

    // Fungsi untuk memperbarui tampilan warna & teks tombol
    function updateTampilanTombol() {
        if (modeSakelar === "ALLBANK") {
            btnSakelar.innerHTML = "🚫 MODE: ALL BANK (DANA OFF)";
            btnSakelar.style.backgroundColor = "#e67e22"; // Warna Oranye (Peringatan DANA Libur)
        } else {
            btnSakelar.innerHTML = "✅ MODE: SEMUA (DANA ON)";
            btnSakelar.style.backgroundColor = "#552ecc"; // Warna Hijau (Semua Masuk)
        }
    }

    // Efek ketika tombol diklik
    btnSakelar.addEventListener("click", function() {
        if (modeSakelar === "SEMUA") {
            modeSakelar = "ALLBANK";
            buatNotif("⚠️ <b>Mode ALLBANK Aktif:</b> Transaksi DANA akan dilewati!", "#e67e22");
        } else {
            modeSakelar = "SEMUA";
            buatNotif("✅ <b>Mode SEMUA Aktif:</b> Semua E-Wallet termasuk DANA akan diproses!", "#074f17");
        }
        localStorage.setItem("mode_ewallet", modeSakelar); // Simpan status agar tidak hilang saat di-refresh
        updateTampilanTombol();
    });

    // Pasang tombol ke halaman web
    updateTampilanTombol();
    document.body.appendChild(btnSakelar);
    // =========================================================================

    function jalankanAutopilot() {
        const tbody = document.querySelector("table tbody");
        if (!tbody) return;
            
        let rows = Array.from(tbody.querySelectorAll("tr")).filter(row => row.offsetParent !== null);
        if (rows.length === 0) return;

        let promises = [];

        rows.forEach((row) => {
            let cells = row.querySelectorAll("td");
            if (cells.length < 6) return;

            let tdNo = cells[1];
            let tdUsername = cells[2];
            let tdTotal = cells[3];
            let tdKeBank = cells[4];
            let tdWaktu = cells[5];

            if (!tdUsername || !tdTotal || !tdKeBank || !tdWaktu) return;

            let teksBankRaw = tdKeBank.innerText.trim().toUpperCase();
            
            // --- LOGIKA PENYARINGAN BERDASARKAN TOMBOL EKSTENSI ---
            let listEwallet = [];
            
            if (modeSakelar === "ALLBANK") {
                // Jika mode ALLBANK aktif, DANA sengaja dihilangkan dari daftar cek
                listEwallet = ["OVO", "GOPAY", "LINKAJA", "SHOPEEPAY"];
            } else {
                // Jika mode SEMUA, masukkan lengkap beserta DANA
                listEwallet = ["DANA", "OVO", "GOPAY", "LINKAJA", "SHOPEEPAY"];
            }
            
            let apakahEwallet = listEwallet.some(ewallet => teksBankRaw.includes(ewallet));
            
            // Jika tidak cocok dengan list e-wallet aktif saat ini, abaikan baris ini
            if (!apakahEwallet) return; 

            let adaTeksMerah = tdKeBank.querySelector("[style*='color: red']") ||
                               tdKeBank.querySelector("[style*='color: rgb(255, 0, 0)']") ||
                               window.getComputedStyle(tdKeBank).color === "rgb(255, 0, 0)";

            let bgUsername = window.getComputedStyle(tdUsername).backgroundColor;
            let apakahUsernamePink = bgUsername.includes("255") && bgUsername.includes("204") ||
                                     tdUsername.querySelector("[style*='background']") !== null;

            if (adaTeksMerah || apakahUsernamePink) {
                let idTransaksiMerah = tdUsername.innerText.trim() + "_" + tdWaktu.innerText.trim();
                if (!diprosesSesiIni.has(idTransaksiMerah)) {
                    buatNotif("🛑 <b>WatchList :</b> ID " + tdUsername.innerText.trim() + " sedang di <b>TAHAN!</b>", "#dc3545");
                    diprosesSesiIni.add(idTransaksiMerah);
                }
                return;
            }

            let dataWD = {
                "target_sheet": "AUTOWDEWALLET",
                "no": tdNo ? tdNo.innerText.trim() : "",
                "username": tdUsername.innerText.trim(),
                "total": tdTotal.innerText.trim(),
                "ke_bank": tdKeBank.innerText.trim().replace(/\n/g, " "),
                "waktu": tdWaktu.innerText.trim()
            };

            if (dataWD.username === "" || dataWD.username === "Username" || dataWD.username.includes("Total")) return;

            let idTransaksi = dataWD.username + "_" + dataWD.waktu;
            if (diprosesSesiIni.has(idTransaksi)) return;

            diprosesSesiIni.add(idTransaksi);

            let request = fetch(GOOGLE_SHEET_WEBAPP_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataWD)
            })
            .then(() => {
                buatNotif("✅ <b>TERCATAT :</b> ID " + dataWD.username + " (" + dataWD.total + ")");
            })
            .catch(() => {
                diprosesSesiIni.delete(idTransaksi);
            });

            promises.push(request);
        });

        if (promises.length > 0) {
            Promise.all(promises).catch(err => console.error("Gagal mengirim beberapa data", err));
        }
    }

    setTimeout(jalankanAutopilot, 500);
    setInterval(jalankanAutopilot, 3000);
})();
