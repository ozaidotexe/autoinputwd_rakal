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
    
    buatNotif("🔄<b>AUTO ON !!</b> Checking Withdraw <b>E-WALLET !!</b>", "#17a2b8");

    // Fungsi utama kontrol alur filter
    function jalankanAutopilot() {
        // Step 1: Ambil status mode dari Google Sheet dulu
        fetch(GOOGLE_SHEET_WEBAPP_URL)
        .then(res => res.json())
        .then(config => {
            let modeSekarang = config.mode; // Hasilnya: "ALLBANK" atau "SEMUA"
            prosesDataTabel(modeSekarang);
        })
        .catch(err => {
            console.error("Gagal mengambil konfigurasi sakelar dari Sheet", err);
            // Jika gagal koneksi status tombol, default aman: proses semua saja
            prosesDataTabel("SEMUA");
        });
    }

    function prosesDataTabel(mode) {
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
            
            // --- FITUR BARU: LOGIKA PENYARINGAN BERDASARKAN TOMBOL ---
            let listEwallet = [];
            
            if (mode === "ALLBANK") {
                // Jika mode ALLBANK aktif, DANA di-exclude (tidak dimasukkan ke list)
                listEwallet = ["OVO", "GOPAY", "LINKAJA", "SHOPEEPAY"];
            } else {
                // Jika mode SEMUA (atau selain ALLBANK), masukkan semua termasuk DANA
                listEwallet = ["DANA", "OVO", "GOPAY", "LINKAJA", "SHOPEEPAY"];
            }
            
            let apakahEwallet = listEwallet.some(ewallet => teksBankRaw.includes(ewallet));
            
            // Jika tidak cocok dengan list e-wallet aktif saat ini, abaikan row ini
            if (!apakahEwallet) return; 

            // Sisanya tetap berjalan seperti logic awal kamu...
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
