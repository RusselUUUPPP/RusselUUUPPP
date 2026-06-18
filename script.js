// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    
    // Panggil fungsi Water Tracker
    initWaterTracker();

    // Panggil fungsi Interaksi Fitur Cepat (Sesuai Proposal NutriKos)
    initFiturCepatMVP();

});

// --- FITUR 1: WATER INTAKE TRACKER ---
function initWaterTracker() {
    // Ambil elemen-elemen dari HTML
    const btnAddWater = document.querySelector('.btn-add-water');
    const waterCountText = document.querySelector('.water-count');
    const glassesContainer = document.querySelector('.glasses');

    // Jika elemen tidak ditemukan (misal sedang di halaman profil), hentikan fungsi
    if (!btnAddWater || !waterCountText || !glassesContainer) return;

    // Ambil semua elemen gelas
    const glasses = glassesContainer.querySelectorAll('.glass');
    const maxAmount = glasses.length;
    
    // 1. Fitur Reset Harian & Ambil data dari localStorage
    const today = new Date().toDateString();
    let savedDate = localStorage.getItem('nutrikos_water_date');
    let savedAmount = localStorage.getItem('nutrikos_water_count');
    
    let currentAmount = 0;

    // Cek apakah tanggal tersimpan sama dengan hari ini
    if (savedDate === today && savedAmount) {
        currentAmount = parseInt(savedAmount);
    } else {
        currentAmount = 0;
        localStorage.setItem('nutrikos_water_date', today);
        localStorage.setItem('nutrikos_water_count', 0);
    }

    if (currentAmount > maxAmount) currentAmount = maxAmount;

    // 2. Reset semua gelas agar kosong saat awal dimuat
    glasses.forEach(glass => glass.classList.remove('filled'));

    // 3. Isi gelas sesuai dengan jumlah data yang tersimpan
    for (let i = 0; i < currentAmount; i++) {
        glasses[i].classList.add('filled');
    }

    // 4. Perbarui teks awal
    waterCountText.textContent = `${currentAmount} / ${maxAmount} gelas`;

    // 5. Event ketika tombol + diklik
    btnAddWater.addEventListener('click', function() {
        if (currentAmount < maxAmount) {
            glasses[currentAmount].classList.add('filled');
            currentAmount++;
            waterCountText.textContent = `${currentAmount} / ${maxAmount} gelas`;

            localStorage.setItem('nutrikos_water_count', currentAmount);
            localStorage.setItem('nutrikos_water_date', new Date().toDateString());

            btnAddWater.style.transform = 'scale(0.85)';
            setTimeout(() => {
                btnAddWater.style.transform = 'scale(1)';
            }, 150);
        } else {
            createCustomModal({
                type: 'alert',
                icon: '<i class="fa-solid fa-check-circle" style="color: #439b46;"></i>',
                title: 'Target Tercapai!',
                text: 'Selamat! Kamu sudah memenuhi target minum 8 gelas air hari ini.'
            });
        }
    });
}


// --- HELPER: CUSTOM MODAL (POP-UP) ---
// Fungsi ini membuat pop-up cantik secara dinamis tanpa butuh HTML/CSS tambahan
function createCustomModal(options) {
    return new Promise((resolve) => {
        // Hapus modal lama jika ada
        const oldModal = document.getElementById('nutrikos-custom-modal');
        if (oldModal) oldModal.remove();

        // Buat background gelap (overlay)
        const overlay = document.createElement('div');
        overlay.id = 'nutrikos-custom-modal';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s ease;
        `;

        // Buat kotak pop-up
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #fff; border-radius: 24px; padding: 24px;
            width: 85%; max-width: 340px; text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transform: translateY(20px) scale(0.95); transition: all 0.3s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        // Konten Pop-up
        let iconHtml = options.icon ? `<div style="font-size: 36px; margin-bottom: 16px;">${options.icon}</div>` : '';
        let titleHtml = `<h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px;">${options.title}</h3>`;
        let textHtml = `<p style="font-size: 13px; color: #7a7a7a; margin-bottom: 24px; line-height: 1.6;">${options.text}</p>`;
        
        let inputHtml = '';
        if (options.type === 'prompt') {
            inputHtml = `<input type="number" id="nutrikos-modal-input" placeholder="${options.placeholder || ''}" style="width: 100%; padding: 14px; border: 2px solid #e5e7eb; border-radius: 12px; margin-bottom: 24px; font-size: 15px; text-align: center; outline: none; transition: border-color 0.2s;">`;
        }

        let buttonsHtml = `<div style="display: flex; gap: 12px;">`;
        if (options.type === 'confirm' || options.type === 'prompt') {
            buttonsHtml += `<button id="btn-modal-cancel" style="flex: 1; padding: 12px; background: #f3f4f6; color: #4b5563; border: none; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer;">Tidak</button>`;
        }
        buttonsHtml += `<button id="btn-modal-confirm" style="flex: 1; padding: 12px; background: #439b46; color: #fff; border: none; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer;">${options.confirmText || 'Oke'}</button>`;
        buttonsHtml += `</div>`;

        modal.innerHTML = iconHtml + titleHtml + textHtml + inputHtml + buttonsHtml;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Styling input saat di-klik (focus)
        if (options.type === 'prompt') {
            const inputEl = document.getElementById('nutrikos-modal-input');
            inputEl.addEventListener('focus', () => inputEl.style.borderColor = '#439b46');
            inputEl.addEventListener('blur', () => inputEl.style.borderColor = '#e5e7eb');
            setTimeout(() => inputEl.focus(), 100);
        }

        // Animasi muncul
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0) scale(1)';
        }, 10);

        // Fungsi tutup modal
        const closeAndResolve = (val) => {
            overlay.style.opacity = '0';
            modal.style.transform = 'translateY(20px) scale(0.95)';
            setTimeout(() => {
                overlay.remove();
                resolve(val);
            }, 300);
        };

        // Event Listener Tombol
        document.getElementById('btn-modal-confirm').addEventListener('click', () => {
            if (options.type === 'prompt') {
                const val = document.getElementById('nutrikos-modal-input').value;
                closeAndResolve(val);
            } else {
                closeAndResolve(true);
            }
        });

        if (options.type === 'confirm' || options.type === 'prompt') {
            document.getElementById('btn-modal-cancel').addEventListener('click', () => {
                closeAndResolve(options.type === 'prompt' ? null : false);
            });
        }
    });
}


// --- FITUR 2: MVP FITUR CEPAT (Menggunakan Custom Modal) ---
function initFiturCepatMVP() {
    const featureItems = document.querySelectorAll('.feature-item');
    if (featureItems.length < 4) return;

    // 1. Skrining Risiko Anemia
    featureItems[0].addEventListener('click', async function(e) {
        e.preventDefault(); 
        
        const q1 = await createCustomModal({
            type: 'confirm',
            icon: '<i class="fa-solid fa-droplet" style="color: #ef4444;"></i>',
            title: 'Skrining Anemia',
            text: 'Apakah kamu sering merasa cepat lelah, letih, atau lesu akhir-akhir ini?',
            confirmText: 'Ya',
        });
        
        let risk = false;
        if (q1) {
            risk = true;
        } else {
            const q2 = await createCustomModal({
                type: 'confirm',
                icon: '<i class="fa-solid fa-droplet" style="color: #ef4444;"></i>',
                title: 'Skrining Anemia',
                text: 'Apakah kamu sering merasa pusing atau kunang-kunang saat bangkit dari duduk atau jongkok?',
                confirmText: 'Ya'
            });
            risk = q2;
        }

        if (risk) {
            await createCustomModal({
                type: 'alert',
                icon: '<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>',
                title: 'Risiko Anemia',
                text: 'Kamu mungkin memiliki risiko anemia.<br><br><b>NutriKos merekomendasikan:</b> Perbanyak makanan tinggi zat besi (sayur bayam, ati ayam) dan disarankan konsultasi ke klinik kampus bila gejala berlanjut.'
            });
        } else {
            await createCustomModal({
                type: 'alert',
                icon: '<i class="fa-solid fa-check-circle" style="color: #439b46;"></i>',
                title: 'Kondisi Baik',
                text: 'Kondisimu sepertinya baik! Tetap jaga pola makan bergizi seimbang ya.'
            });
        }
    });

    // 2. Skrining Vitamin D
    featureItems[1].addEventListener('click', async function(e) {
        e.preventDefault();
        const q1 = await createCustomModal({
            type: 'confirm',
            icon: '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>',
            title: 'Skrining Vitamin D',
            text: 'Apakah kamu sangat jarang terkena paparan sinar matahari pagi (kurang dari 15 menit/hari)?',
            confirmText: 'Ya, Jarang'
        });
        
        if (q1) {
            await createCustomModal({
                type: 'alert',
                icon: '<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>',
                title: 'Risiko Defisiensi Vit D',
                text: '<b>Tips NutriKos:</b> Sempatkan berjemur 10-15 menit di pagi hari sebelum kuliah dan perbanyak konsumsi makanan seperti telur ayam, tempe, atau ikan lele.'
            });
        } else {
            await createCustomModal({
                type: 'alert',
                icon: '<i class="fa-solid fa-check-circle" style="color: #439b46;"></i>',
                title: 'Paparan Sinar Baik',
                text: 'Keren! Paparan sinar mataharimu sudah cukup baik hari ini.'
            });
        }
    });

    // 3. Meal Planner
    featureItems[2].addEventListener('click', async function(e) {
        e.preventDefault();
        await createCustomModal({
            type: 'alert',
            icon: '<i class="fa-regular fa-calendar-check" style="color: #3b82f6;"></i>',
            title: 'Coming Soon!',
            text: 'Fitur Meal Planner Mingguan sedang dalam pengembangan untuk pengguna NutriKos Premium sesuai rencana bisnis.'
        });
    });

    // 4. Budget Harian (Budget Meal Optimizer)
    featureItems[3].addEventListener('click', async function(e) {
        e.preventDefault();
        
        let userBudget = await createCustomModal({
            type: 'prompt',
            icon: '<i class="fa-solid fa-wallet" style="color: #439b46;"></i>',
            title: 'Budget Meal Optimizer',
            text: 'Berapa batas budget makan kamu untuk menu kali ini?',
            placeholder: 'Contoh: 15000',
            confirmText: 'Cari Menu'
        });
        
        if (userBudget) {
            let budgetNum = parseInt(userBudget);
            
            if (isNaN(budgetNum) || budgetNum <= 0) {
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-solid fa-circle-xmark" style="color: #ef4444;"></i>',
                    title: 'Input Tidak Valid',
                    text: 'Mohon masukkan angka budget yang valid ya.'
                });
                return;
            }

            if (budgetNum < 5000) {
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-solid fa-utensils" style="color: #439b46;"></i>',
                    title: `Budget: Rp ${budgetNum.toLocaleString('id-ID')}`,
                    text: '<b>Rekomendasi:</b> Beli nasi putih dan tempe/tahu bacem di warteg terdekat.<br><br><i>Saran NutriKos: Tetap usahakan tambah porsi sayur agar berserat!</i>'
                });
            } else if (budgetNum >= 5000 && budgetNum <= 10000) {
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-solid fa-utensils" style="color: #439b46;"></i>',
                    title: `Budget: Rp ${budgetNum.toLocaleString('id-ID')}`,
                    text: '<b>Rekomendasi:</b> Tumis Tahu Sayur atau Nasi Telur Kecap.<br><br>Sangat pas di kantong anak kos dan sudah mengandung cukup protein serta serat.'
               });
            } else if (budgetNum >=100000 ) {
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-solid fa-utensils" style="color: #439b46;"></i>',
                    title: `Budget: Rp ${budgetNum.toLocaleString('id-ID')}`,
                    text: '<b>Rekomendasi:</b> Kamu anak orang kaya ya?<br><br>Ini mah makan apa aja gausah mikir.'
                });
            } else {
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-solid fa-utensils" style="color: #439b46;"></i>',
                    title: `Budget: Rp ${budgetNum.toLocaleString('id-ID')}`,
                    text: '<b>Rekomendasi:</b> Nasi Tempe Tumis + Ayam Bakar, atau paket komplit Warteg dengan sayur bayam dan ikan.<br><br><i>Skor Gizi tinggi karena variasi lauk sangat baik!</i>'
                });
            }
        }
    });
}
