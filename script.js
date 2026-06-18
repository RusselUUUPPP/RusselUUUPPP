// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    
    // Panggil fungsi Water Tracker
    initWaterTracker();

    // Panggil fungsi Interaksi Fitur Cepat (Sesuai Proposal NutriKos)
    initFiturCepatMVP();

    // Panggil fungsi Tab Filter Rekomendasi
    initRekomendasiTabs();

    // Panggil fungsi Edit Profil (Bottom Sheet)
    initProfileEdit();

    // Panggil fungsi Fitur Bookmark & Notifikasi (Baru)
    initBookmarkFeature();
    initNotificationFeature();

});

// --- FITUR 1: WATER INTAKE TRACKER ---
function initWaterTracker() {
    const btnAddWater = document.querySelector('.btn-add-water');
    const waterCountText = document.querySelector('.water-count');
    const glassesContainer = document.querySelector('.glasses');

    if (!btnAddWater || !waterCountText || !glassesContainer) return;

    const glasses = glassesContainer.querySelectorAll('.glass');
    const maxAmount = glasses.length;
    
    const today = new Date().toDateString();
    let savedDate = localStorage.getItem('nutrikos_water_date');
    let savedAmount = localStorage.getItem('nutrikos_water_count');
    
    let currentAmount = 0;

    if (savedDate === today && savedAmount) {
        currentAmount = parseInt(savedAmount);
    } else {
        currentAmount = 0;
        localStorage.setItem('nutrikos_water_date', today);
        localStorage.setItem('nutrikos_water_count', 0);
    }

    if (currentAmount > maxAmount) currentAmount = maxAmount;

    glasses.forEach(glass => glass.classList.remove('filled'));

    for (let i = 0; i < currentAmount; i++) {
        glasses[i].classList.add('filled');
    }

    waterCountText.textContent = `${currentAmount} / ${maxAmount} gelas`;

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
function createCustomModal(options) {
    return new Promise((resolve) => {
        const oldModal = document.getElementById('nutrikos-custom-modal');
        if (oldModal) oldModal.remove();

        const overlay = document.createElement('div');
        overlay.id = 'nutrikos-custom-modal';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s ease;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #fff; border-radius: 24px; padding: 24px;
            width: 85%; max-width: 340px; text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            transform: translateY(20px) scale(0.95); transition: all 0.3s ease;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        let iconHtml = options.icon ? `<div style="font-size: 36px; margin-bottom: 16px;">${options.icon}</div>` : '';
        let titleHtml = `<h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px;">${options.title}</h3>`;
        let textHtml = `<p style="font-size: 13px; color: #7a7a7a; margin-bottom: 24px; line-height: 1.6;">${options.text}</p>`;
        
        let inputHtml = '';
        if (options.type === 'prompt') {
            inputHtml = `<input type="number" id="nutrikos-modal-input" placeholder="${options.placeholder || ''}" style="width: 100%; padding: 14px; border: 2px solid #e5e7eb; border-radius: 12px; margin-bottom: 24px; font-size: 15px; text-align: center; outline: none; transition: border-color 0.2s;">`;
        }

        let buttonsHtml = `<div style="display: flex; gap: 12px;">`;
        if (options.type === 'confirm' || options.type === 'prompt') {
            buttonsHtml += `<button id="btn-modal-cancel" style="flex: 1; padding: 12px; background: #f3f4f6; color: #4b5563; border: none; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer;">Batal</button>`;
        }
        buttonsHtml += `<button id="btn-modal-confirm" style="flex: 1; padding: 12px; background: #439b46; color: #fff; border: none; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer;">${options.confirmText || 'Oke'}</button>`;
        buttonsHtml += `</div>`;

        modal.innerHTML = iconHtml + titleHtml + textHtml + inputHtml + buttonsHtml;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        if (options.type === 'prompt') {
            const inputEl = document.getElementById('nutrikos-modal-input');
            inputEl.addEventListener('focus', () => inputEl.style.borderColor = '#439b46');
            inputEl.addEventListener('blur', () => inputEl.style.borderColor = '#e5e7eb');
            setTimeout(() => inputEl.focus(), 100);
        }

        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0) scale(1)';
        }, 10);

        const closeAndResolve = (val) => {
            overlay.style.opacity = '0';
            modal.style.transform = 'translateY(20px) scale(0.95)';
            setTimeout(() => {
                overlay.remove();
                resolve(val);
            }, 300);
        };

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
    // Cek jika kita di halaman dashboard (ada fitur item)
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

// --- FITUR 3: TAB FILTER REKOMENDASI MENU ---
function initRekomendasiTabs() {
    const tabs = document.querySelectorAll('.tab-pill');
    const foodCards = document.querySelectorAll('.food-list-card');
    
    // Pastikan kita berada di halaman rekomendasi
    if (tabs.length === 0 || foodCards.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Ubah gaya tab yang aktif
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.textContent.trim();

            // Sembunyikan atau tampilkan makanan berdasarkan kategori simulasi
            foodCards.forEach(card => {
                const title = card.querySelector('.food-list-title').textContent;
                
                // Animasi sederhana
                card.style.opacity = '0';
                
                setTimeout(() => {
                    if (category === 'Semua' || category === 'Hemat') {
                        // Semua menu di mockup saat ini adalah hemat
                        card.style.display = 'flex';
                    } else if (category === 'Tinggi Protein') {
                        // Simulasi: Tampilkan hanya yang ada "Tempe" atau "Telur"
                        if (title.includes('Tempe') || title.includes('Telur')) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    } else if (category === 'Cepat') {
                        // Simulasi: Tampilkan hanya "Mie" atau "Tumis"
                        if (title.includes('Mie') || title.includes('Tumis')) {
                            card.style.display = 'flex';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                    
                    // Kembalikan opacity
                    if (card.style.display === 'flex') {
                        setTimeout(() => { card.style.opacity = '1'; }, 50);
                    }
                }, 200);
            });
        });
    });
}

// --- FITUR 4: MODAL EDIT PROFIL (BOTTOM SHEET) ---
function initProfileEdit() {
    const btnEdit = document.querySelector('.btn-edit-profile');
    const statValues = document.querySelectorAll('.stat-value');
    
    // Pastikan kita berada di halaman profil (elemen ditemukan minimal 3 kotak stat)
    if (!btnEdit || statValues.length < 3) return;

    btnEdit.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Ambil nilai saat ini dari card (mengubah "55 kg" menjadi angka "55" saja)
        let currentBB = parseInt(statValues[0].textContent);
        let currentTB = parseInt(statValues[1].textContent);

        // Buat overlay background
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 9999;
            display: flex; flex-direction: column; justify-content: flex-end;
            opacity: 0; transition: opacity 0.3s ease;
        `;

        // Buat kotak Bottom Sheet
        const sheet = document.createElement('div');
        sheet.style.cssText = `
            background: #fff; width: 100%; max-width: 420px; margin: 0 auto;
            border-radius: 28px 28px 0 0; padding: 24px;
            transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1);
            box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;

        sheet.innerHTML = `
            <div style="width: 40px; height: 5px; background: #e5e7eb; border-radius: 4px; margin: 0 auto 20px auto;"></div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 24px; text-align: center;">Edit Data Fisik</h3>
            
            <div style="margin-bottom: 16px;">
                <label style="font-size: 13px; color: #7a7a7a; font-weight: 600;">Berat Badan (kg)</label>
                <input type="number" id="input-bb" value="${currentBB}" style="width: 100%; padding: 14px; border: 2px solid #e5e7eb; border-radius: 12px; margin-top: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;">
            </div>

            <div style="margin-bottom: 32px;">
                <label style="font-size: 13px; color: #7a7a7a; font-weight: 600;">Tinggi Badan (cm)</label>
                <input type="number" id="input-tb" value="${currentTB}" style="width: 100%; padding: 14px; border: 2px solid #e5e7eb; border-radius: 12px; margin-top: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;">
            </div>

            <div style="display: flex; gap: 12px; margin-bottom: 10px;">
                <button id="btn-cancel-edit" style="flex: 1; padding: 14px; background: #f3f4f6; color: #4b5563; border: none; border-radius: 14px; font-weight: 600; font-size: 14px; cursor: pointer;">Batal</button>
                <button id="btn-save-edit" style="flex: 1; padding: 14px; background: #439b46; color: #fff; border: none; border-radius: 14px; font-weight: 600; font-size: 14px; cursor: pointer;">Simpan Data</button>
            </div>
        `;

        overlay.appendChild(sheet);
        document.body.appendChild(overlay);

        // Styling focus state untuk input
        const inputs = [document.getElementById('input-bb'), document.getElementById('input-tb')];
        inputs.forEach(input => {
            input.addEventListener('focus', () => input.style.borderColor = '#439b46');
            input.addEventListener('blur', () => input.style.borderColor = '#e5e7eb');
        });

        // Animasi pop-up muncul dari bawah
        setTimeout(() => {
            overlay.style.opacity = '1';
            sheet.style.transform = 'translateY(0)';
        }, 10);

        // Fungsi tutup modal
        const closeSheet = () => {
            overlay.style.opacity = '0';
            sheet.style.transform = 'translateY(100%)';
            setTimeout(() => overlay.remove(), 300);
        };

        document.getElementById('btn-cancel-edit').addEventListener('click', closeSheet);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeSheet();
        });

        // Aksi saat klik simpan
        document.getElementById('btn-save-edit').addEventListener('click', () => {
            const newBB = parseFloat(document.getElementById('input-bb').value);
            const newTB = parseFloat(document.getElementById('input-tb').value);

            if (newBB && newTB) {
                // 1. Update teks BB dan TB di UI HTML
                statValues[0].innerHTML = `${newBB} <span>kg</span>`;
                statValues[1].innerHTML = `${newTB} <span>cm</span>`;

                // 2. Hitung Ulang Skor IMT secara otomatis = BB(kg) / (TB(m) * TB(m))
                const tbMeter = newTB / 100;
                const imt = (newBB / (tbMeter * tbMeter)).toFixed(1);
                
                // Tentukan status IMT
                let statusIMT = "Ideal";
                let statusColor = "var(--text-gray)";

                if (imt < 18.5) {
                    statusIMT = "Kurang";
                    statusColor = "#ef4444"; // merah
                } else if (imt >= 25) {
                    statusIMT = "Berlebih";
                    statusColor = "#f59e0b"; // orange/kuning
                }

                // Update teks IMT di UI HTML
                statValues[2].innerHTML = `${imt} <span style="color: ${statusColor}; font-weight: 700;">(${statusIMT})</span>`;

                // Tutup Bottom Sheet
                closeSheet();
            }
        });
    });
}

// --- FITUR 5: SIMPAN KE FAVORIT (BOOKMARK) ---
function initBookmarkFeature() {
    // Cari semua ikon bookmark di halaman (biasanya ada di halaman Rekomendasi)
    const bookmarks = document.querySelectorAll('.btn-bookmark');
    if (bookmarks.length === 0) return;

    bookmarks.forEach(icon => {
        icon.addEventListener('click', async function(e) {
            e.preventDefault(); 
            e.stopPropagation(); 
            
            const isSaved = this.classList.contains('fa-solid');
            // Coba ambil nama makanan dari card terdekat
            const foodCard = this.closest('.food-list-card') || this.closest('.food-card');
            let foodName = "Menu ini";
            
            if (foodCard) {
                const titleElement = foodCard.querySelector('.food-list-title') || foodCard.querySelector('h3');
                if (titleElement) foodName = titleElement.textContent;
            }

            if (!isSaved) {
                // Berubah jadi ikon solid hijau NutriKos
                this.classList.remove('fa-regular');
                this.classList.add('fa-solid');
                this.style.color = '#439b46';
                
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-solid fa-bookmark" style="color: #439b46;"></i>',
                    title: 'Berhasil Disimpan!',
                    text: `<b>${foodName}</b> berhasil ditambahkan ke daftar favorit kamu.`
                });
            } else {
                // Kembali ke ikon reguler abu-abu
                this.classList.remove('fa-solid');
                this.classList.add('fa-regular');
                this.style.color = '#9ca3af'; 
                
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-regular fa-bookmark" style="color: #ef4444;"></i>',
                    title: 'Dihapus',
                    text: `<b>${foodName}</b> telah dihapus dari daftar favorit.`
                });
            }
        });
    });
}

// --- FITUR 6: NOTIFIKASI LONCENG ---
function initNotificationFeature() {
    // Menggunakan event delegation agar klik di mana saja (icon, dot, tepi tombol) tertangkap
    document.body.addEventListener('click', async function(e) {
        // Cek apakah klik berada di dalam elemen ber-class 'bell-btn' atau '.fa-bell' di header profil
        const targetBtn = e.target.closest('.bell-btn') || 
                         (e.target.closest('.icon-btn') && e.target.closest('.icon-btn').querySelector('.fa-bell'));
        
        if (targetBtn) {
            e.preventDefault();
            
            // Hilangkan titik merah (notifikasi baru) jika ada
            const dot = targetBtn.querySelector('.dot');
            if (dot) dot.style.display = 'none';

            // Tampilkan isi notifikasi khusus anak kos
            await createCustomModal({
                type: 'alert',
                icon: '<i class="fa-solid fa-bell" style="color: #f59e0b;"></i>',
                title: 'Notifikasi Terbaru',
                text: `
                    <div style="text-align: left;">
                        <p style="margin-bottom: 14px; font-size: 13px;">
                            <b>💧 Jangan Lupa Minum!</b><br>
                            Cuaca sedang panas, pastikan target 8 gelas airmu tercapai hari ini.
                        </p>
                        <p style="font-size: 13px;">
                            <b>🥗 Promo Kantin Mitra</b><br>
                            Diskon Rp 2.000 untuk Nasi Telur Kecap di Warteg Bahari (Khusus pengguna NutriKos).
                        </p>
                    </div>
                `
            });
        }
    });
}
