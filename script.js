// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    
    // Inisialisasi semua fitur
    initWaterTracker();
    initFiturCepatMVP();
    initRekomendasiTabs();
    initProfileEdit();
    initBookmarkFeature();
    initNotificationFeature();
    
    // Fitur Gamifikasi Baru
    initKantinScanner();

    // Fitur Detail Target Harian (Baru Ditambahkan)
    initLihatDetail();
});

// --- FITUR 1: WATER INTAKE TRACKER (DENGAN GAMIFIKASI STREAK & POIN) ---
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

            // LOGIKA GAMIFIKASI: Jika berhasil capai target 8 gelas
            if (currentAmount === maxAmount) {
                let streak = parseInt(localStorage.getItem('nutrikos_streak') || 0);
                let points = parseInt(localStorage.getItem('nutrikos_points') || 0);
                let lastCompleted = localStorage.getItem('nutrikos_last_completed');
                
                // Cek agar poin tidak spam jika diklik berkali-kali di hari yang sama
                if (lastCompleted !== today) {
                    streak++;
                    points += 50; // Bonus 50 poin
                    
                    localStorage.setItem('nutrikos_streak', streak);
                    localStorage.setItem('nutrikos_points', points);
                    localStorage.setItem('nutrikos_last_completed', today);

                    setTimeout(async () => {
                        await createCustomModal({
                            type: 'alert',
                            icon: '<i class="fa-solid fa-fire" style="color: #f59e0b; font-size: 40px;"></i>',
                            title: 'Target Air Tercapai!',
                            text: `Luar biasa! Kamu menyelesaikan target minum hari ini.<br><br>🔥 <b>Streak: ${streak} Hari</b><br>⭐ <b>+50 NutriPoin</b><br><br><i>Kumpulkan poin untuk ditukar diskon di Kantin Mitra!</i>`
                        });
                    }, 400);
                }
            }

        } else {
            createCustomModal({
                type: 'alert',
                icon: '<i class="fa-solid fa-check-circle" style="color: #439b46;"></i>',
                title: 'Target Sudah Tercapai',
                text: 'Hebat! Kamu sudah memenuhi target minum air harianmu. Lanjutkan besok untuk mempertahankan Streak-mu!'
            });
        }
    });
}

// --- FITUR GAMIFIKASI BARU: SCAN QR KANTIN MITRA ---
function initKantinScanner() {
    const scanBtns = document.querySelectorAll('.center-btn');
    
    scanBtns.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            this.style.transform = 'scale(0.9)';
            setTimeout(() => this.style.transform = 'scale(1)', 150);

            await createCustomModal({
                type: 'alert',
                icon: '<i class="fa-solid fa-qrcode fa-fade" style="color: #439b46; font-size: 46px;"></i>',
                title: 'Scan QR Kantin',
                text: 'Arahkan kamera ke QR Code NutriKos di meja warteg atau kantin mitra...<br><br><span style="color: var(--primary); font-weight: 600;">[Mendeteksi Menu...]</span>',
                confirmText: 'Deteksi'
            });

            setTimeout(async () => {
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-solid fa-utensils" style="color: #f59e0b;"></i>',
                    title: 'Menu Terdeteksi!',
                    text: `
                        <div style="text-align: left; background: #f8f9fa; padding: 12px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 12px;">
                            <p style="font-size: 13px; margin-bottom: 4px;"><b>📍 Warteg Bahari (Mitra)</b></p>
                            <p style="font-size: 14px; font-weight: 700; color: var(--primary);">Paket Nasi Telur Sayur</p>
                            <p style="font-size: 12px; color: var(--text-gray); margin-top: 4px;">Harga: Rp 10.000 | Skor Gizi: <b>82/100</b></p>
                        </div>
                        ⭐ <b>+20 NutriPoin</b> berhasil ditambahkan karena kamu memilih menu berserat tinggi!
                    `
                });
            }, 300);
        });
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
            max-height: 80vh; display: flex; flex-direction: column;
        `;

        let iconHtml = options.icon ? `<div style="font-size: 36px; margin-bottom: 16px; flex-shrink: 0;">${options.icon}</div>` : '';
        let titleHtml = `<h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; flex-shrink: 0;">${options.title}</h3>`;
        // Bungkus text dalam scrollable div jika kontennya panjang
        let textHtml = `<div style="font-size: 13px; color: #7a7a7a; margin-bottom: 24px; line-height: 1.6; overflow-y: auto; text-align: left; padding-right: 4px;">${options.text}</div>`;
        
        let inputHtml = '';
        if (options.type === 'prompt') {
            inputHtml = `<input type="number" id="nutrikos-modal-input" placeholder="${options.placeholder || ''}" style="width: 100%; padding: 14px; border: 2px solid #e5e7eb; border-radius: 12px; margin-bottom: 24px; font-size: 15px; text-align: center; outline: none; transition: border-color 0.2s; flex-shrink: 0;">`;
        }

        let buttonsHtml = `<div style="display: flex; gap: 12px; flex-shrink: 0;">`;
        if (options.type === 'confirm' || options.type === 'prompt') {
            buttonsHtml += `<button id="btn-modal-cancel" style="flex: 1; padding: 12px; background: #f3f4f6; color: #4b5563; border: none; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer;">Tidak</button>`;
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

// --- FITUR 8: DETAIL TARGET NUTRISI (MAKRO & MIKRO) ---
function initLihatDetail() {
    // Ambil tautan "Lihat Detail >" di bagian Target Hari Ini
    const detailBtns = document.querySelectorAll('.target-header a');
    
    detailBtns.forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            const text = this.textContent.trim().toLowerCase();

            // Jika yang diklik adalah "Lihat Detail"
            if (text.includes('detail')) {
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-solid fa-chart-pie" style="color: #439b46;"></i>',
                    title: 'Status Nutrisi Harian',
                    text: `
                        <!-- Bagian Makronutrien -->
                        <h4 style="color: var(--primary); margin-top: 5px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; font-size: 14px;">Makronutrien</h4>
                        
                        <div style="margin-bottom: 10px;">
                            <div style="display:flex; justify-content: space-between; font-weight: 600;"><span>Karbohidrat</span><span>210 / 300g</span></div>
                            <div style="background: #e5e7eb; height: 6px; border-radius: 3px; margin-top: 4px;"><div style="background: #3b82f6; width: 70%; height: 100%; border-radius: 3px;"></div></div>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <div style="display:flex; justify-content: space-between; font-weight: 600;"><span>Protein</span><span>62 / 80g</span></div>
                            <div style="background: #e5e7eb; height: 6px; border-radius: 3px; margin-top: 4px;"><div style="background: #10b981; width: 77%; height: 100%; border-radius: 3px;"></div></div>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <div style="display:flex; justify-content: space-between; font-weight: 600;"><span>Lemak</span><span>45 / 65g</span></div>
                            <div style="background: #e5e7eb; height: 6px; border-radius: 3px; margin-top: 4px;"><div style="background: #f59e0b; width: 69%; height: 100%; border-radius: 3px;"></div></div>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <div style="display:flex; justify-content: space-between; font-weight: 600;"><span>Serat</span><span>18 / 25g</span></div>
                            <div style="background: #e5e7eb; height: 6px; border-radius: 3px; margin-top: 4px;"><div style="background: #8b5cf6; width: 72%; height: 100%; border-radius: 3px;"></div></div>
                        </div>

                        <!-- Bagian Mikronutrien -->
                        <h4 style="color: var(--primary); margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; font-size: 14px;">Mikronutrien (Perhatian Khusus)</h4>
                        
                        <div style="margin-bottom: 10px;">
                            <div style="display:flex; justify-content: space-between; font-weight: 600;"><span>Zat Besi (Cegah Anemia)</span><span>12 / 15mg</span></div>
                            <div style="background: #e5e7eb; height: 6px; border-radius: 3px; margin-top: 4px;"><div style="background: #ef4444; width: 80%; height: 100%; border-radius: 3px;"></div></div>
                        </div>
                        <div style="margin-bottom: 10px; background: #fff5f5; padding: 6px; border-radius: 8px; border: 1px solid #fecaca;">
                            <div style="display:flex; justify-content: space-between;"><span style="color: #dc2626; font-weight:700;">Vitamin D</span><span style="color: #dc2626; font-weight:700;">4 / 15mcg</span></div>
                            <div style="background: #fca5a5; height: 6px; border-radius: 3px; margin-top: 4px;"><div style="background: #dc2626; width: 26%; height: 100%; border-radius: 3px;"></div></div>
                            <p style="font-size: 10px; color: #dc2626; margin-top: 6px; margin-bottom: 0;"><i>*Masih kurang! Yuk berjemur sebentar atau makan telur/ikan hari ini.</i></p>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <div style="display:flex; justify-content: space-between; font-weight: 600;"><span>Kalsium</span><span>600 / 1000mg</span></div>
                            <div style="background: #e5e7eb; height: 6px; border-radius: 3px; margin-top: 4px;"><div style="background: #06b6d4; width: 60%; height: 100%; border-radius: 3px;"></div></div>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <div style="display:flex; justify-content: space-between; font-weight: 600;"><span>Natrium (Garam)</span><span>1500 / 2000mg</span></div>
                            <div style="background: #e5e7eb; height: 6px; border-radius: 3px; margin-top: 4px;"><div style="background: #64748b; width: 75%; height: 100%; border-radius: 3px;"></div></div>
                        </div>
                    `,
                    confirmText: 'Tutup'
                });
            }
        });
    });
}

// --- FITUR SEBELUMNYA TETAP ADA DI BAWAH INI ---

function initFiturCepatMVP() {
    const featureItems = document.querySelectorAll('.feature-item');
    if (featureItems.length < 4) return;

    featureItems[0].addEventListener('click', async function(e) {
        e.preventDefault(); 
        const q1 = await createCustomModal({
            type: 'confirm', icon: '<i class="fa-solid fa-droplet" style="color: #ef4444;"></i>',
            title: 'Skrining Anemia', text: 'Apakah kamu sering merasa cepat lelah, letih, atau lesu akhir-akhir ini?', confirmText: 'Ya',
        });
        
        let risk = false;
        if (q1) { risk = true; } 
        else {
            const q2 = await createCustomModal({
                type: 'confirm', icon: '<i class="fa-solid fa-droplet" style="color: #ef4444;"></i>',
                title: 'Skrining Anemia', text: 'Apakah kamu sering merasa pusing atau kunang-kunang saat bangkit dari duduk atau jongkok?', confirmText: 'Ya'
            });
            risk = q2;
        }

        if (risk) {
            await createCustomModal({
                type: 'alert', icon: '<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>',
                title: 'Risiko Anemia', text: 'Kamu mungkin memiliki risiko anemia.<br><br><b>NutriKos merekomendasikan:</b> Perbanyak makanan tinggi zat besi (sayur bayam, ati ayam) dan disarankan konsultasi ke klinik kampus bila gejala berlanjut.'
            });
        } else {
            await createCustomModal({
                type: 'alert', icon: '<i class="fa-solid fa-check-circle" style="color: #439b46;"></i>',
                title: 'Kondisi Baik', text: 'Kondisimu sepertinya baik! Tetap jaga pola makan bergizi seimbang ya.'
            });
        }
    });

    featureItems[1].addEventListener('click', async function(e) {
        e.preventDefault();
        const q1 = await createCustomModal({
            type: 'confirm', icon: '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>',
            title: 'Skrining Vitamin D', text: 'Apakah kamu sangat jarang terkena paparan sinar matahari pagi (kurang dari 15 menit/hari)?', confirmText: 'Ya, Jarang'
        });
        
        if (q1) {
            await createCustomModal({
                type: 'alert', icon: '<i class="fa-solid fa-triangle-exclamation" style="color: #f59e0b;"></i>',
                title: 'Risiko Defisiensi Vit D', text: '<b>Tips NutriKos:</b> Sempatkan berjemur 10-15 menit di pagi hari sebelum kuliah dan perbanyak konsumsi makanan seperti telur ayam, tempe, atau ikan lele.'
            });
        } else {
            await createCustomModal({
                type: 'alert', icon: '<i class="fa-solid fa-check-circle" style="color: #439b46;"></i>',
                title: 'Paparan Sinar Baik', text: 'Keren! Paparan sinar mataharimu sudah cukup baik hari ini.'
            });
        }
    });

    featureItems[2].addEventListener('click', async function(e) {
        e.preventDefault();
        await createCustomModal({
            type: 'alert', icon: '<i class="fa-regular fa-calendar-check" style="color: #3b82f6;"></i>',
            title: 'Coming Soon!', text: 'Fitur Meal Planner Mingguan sedang dalam pengembangan untuk pengguna NutriKos Premium.'
        });
    });

    featureItems[3].addEventListener('click', async function(e) {
        e.preventDefault();
        let userBudget = await createCustomModal({
            type: 'prompt', icon: '<i class="fa-solid fa-wallet" style="color: #439b46;"></i>',
            title: 'Budget Meal Optimizer', text: 'Berapa batas budget makan kamu untuk menu kali ini?', placeholder: 'Contoh: 15000', confirmText: 'Cari Menu'
        });
        
        if (userBudget) {
            let budgetNum = parseInt(userBudget);
            if (isNaN(budgetNum) || budgetNum <= 0) return;

            if (budgetNum < 5000) {
                await createCustomModal({ type: 'alert', icon: '<i class="fa-solid fa-utensils" style="color: #439b46;"></i>', title: `Budget: Rp ${budgetNum.toLocaleString('id-ID')}`, text: '<b>Rekomendasi:</b> Beli nasi putih dan tempe/tahu bacem di warteg terdekat.<br><br><i>Saran NutriKos: Tetap usahakan tambah porsi sayur agar berserat!</i>' });
            } else if (budgetNum >= 5000 && budgetNum <= 10000) {
                await createCustomModal({ type: 'alert', icon: '<i class="fa-solid fa-utensils" style="color: #439b46;"></i>', title: `Budget: Rp ${budgetNum.toLocaleString('id-ID')}`, text: '<b>Rekomendasi:</b> Tumis Tahu Sayur atau Nasi Telur Kecap.<br><br>Sangat pas di kantong anak kos dan sudah mengandung cukup protein serta serat.' });
            }else if (budgetNum >= 100000) {
                await createCustomModal({ type: 'alert', icon: '<i class="fa-solid fa-utensils" style="color: #439b46;"></i>', title: `Budget: Rp ${budgetNum.toLocaleString('id-ID')}`, text: '<b>Rekomendasi:</b> Kamu anak orang kaya ya?<br><br>Ini mah makan apa aja gapake mikir.' });
            } else {
                await createCustomModal({ type: 'alert', icon: '<i class="fa-solid fa-utensils" style="color: #439b46;"></i>', title: `Budget: Rp ${budgetNum.toLocaleString('id-ID')}`, text: '<b>Rekomendasi:</b> Nasi Tempe Tumis + Ayam Bakar, atau paket komplit Warteg dengan sayur bayam dan ikan.<br><br><i>Skor Gizi tinggi karena variasi lauk sangat baik!</i>' });
            }
        }
    });
}

function initRekomendasiTabs() {
    const tabs = document.querySelectorAll('.tab-pill');
    const foodCards = document.querySelectorAll('.food-list-card');
    if (tabs.length === 0 || foodCards.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.textContent.trim();

            foodCards.forEach(card => {
                const title = card.querySelector('.food-list-title').textContent;
                card.style.opacity = '0';
                setTimeout(() => {
                    if (category === 'Semua' || category === 'Hemat') { card.style.display = 'flex'; } 
                    else if (category === 'Tinggi Protein') {
                        card.style.display = (title.includes('Tempe') || title.includes('Telur')) ? 'flex' : 'none';
                    } else if (category === 'Cepat') {
                        card.style.display = (title.includes('Mie') || title.includes('Tumis')) ? 'flex' : 'none';
                    }
                    if (card.style.display === 'flex') { setTimeout(() => { card.style.opacity = '1'; }, 50); }
                }, 200);
            });
        });
    });
}

function initProfileEdit() {
    const btnEdit = document.querySelector('.btn-edit-profile');
    const statValues = document.querySelectorAll('.stat-value');
    if (!btnEdit || statValues.length < 3) return;

    btnEdit.addEventListener('click', (e) => {
        e.preventDefault();
        let currentBB = parseInt(statValues[0].textContent);
        let currentTB = parseInt(statValues[1].textContent);

        const overlay = document.createElement('div');
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 9999; display: flex; flex-direction: column; justify-content: flex-end; opacity: 0; transition: opacity 0.3s ease;`;
        
        const sheet = document.createElement('div');
        sheet.style.cssText = `background: #fff; width: 100%; max-width: 420px; margin: 0 auto; border-radius: 28px 28px 0 0; padding: 24px; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1); box-shadow: 0 -5px 20px rgba(0,0,0,0.1); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`;

        sheet.innerHTML = `
            <div style="width: 40px; height: 5px; background: #e5e7eb; border-radius: 4px; margin: 0 auto 20px auto;"></div>
            <h3 style="font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 24px; text-align: center;">Edit Data Fisik</h3>
            <div style="margin-bottom: 16px;"><label style="font-size: 13px; color: #7a7a7a; font-weight: 600;">Berat Badan (kg)</label><input type="number" id="input-bb" value="${currentBB}" style="width: 100%; padding: 14px; border: 2px solid #e5e7eb; border-radius: 12px; margin-top: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;"></div>
            <div style="margin-bottom: 32px;"><label style="font-size: 13px; color: #7a7a7a; font-weight: 600;">Tinggi Badan (cm)</label><input type="number" id="input-tb" value="${currentTB}" style="width: 100%; padding: 14px; border: 2px solid #e5e7eb; border-radius: 12px; margin-top: 8px; font-size: 16px; outline: none; transition: border-color 0.2s;"></div>
            <div style="display: flex; gap: 12px; margin-bottom: 10px;">
                <button id="btn-cancel-edit" style="flex: 1; padding: 14px; background: #f3f4f6; color: #4b5563; border: none; border-radius: 14px; font-weight: 600; font-size: 14px; cursor: pointer;">Tidak</button>
                <button id="btn-save-edit" style="flex: 1; padding: 14px; background: #439b46; color: #fff; border: none; border-radius: 14px; font-weight: 600; font-size: 14px; cursor: pointer;">Simpan Data</button>
            </div>
        `;
        overlay.appendChild(sheet);
        document.body.appendChild(overlay);

        setTimeout(() => { overlay.style.opacity = '1'; sheet.style.transform = 'translateY(0)'; }, 10);
        const closeSheet = () => { overlay.style.opacity = '0'; sheet.style.transform = 'translateY(100%)'; setTimeout(() => overlay.remove(), 300); };
        
        document.getElementById('btn-cancel-edit').addEventListener('click', closeSheet);
        document.getElementById('btn-save-edit').addEventListener('click', () => {
            const newBB = parseFloat(document.getElementById('input-bb').value);
            const newTB = parseFloat(document.getElementById('input-tb').value);
            if (newBB && newTB) {
                statValues[0].innerHTML = `${newBB} <span>kg</span>`; statValues[1].innerHTML = `${newTB} <span>cm</span>`;
                const tbMeter = newTB / 100; const imt = (newBB / (tbMeter * tbMeter)).toFixed(1);
                let statusIMT = "Ideal"; let statusColor = "var(--text-gray)";
                if (imt < 18.5) { statusIMT = "Kurang"; statusColor = "#ef4444"; } else if (imt >= 25) { statusIMT = "Berlebih"; statusColor = "#f59e0b"; }
                statValues[2].innerHTML = `${imt} <span style="color: ${statusColor}; font-weight: 700;">(${statusIMT})</span>`;
                closeSheet();
            }
        });
    });
}

function initBookmarkFeature() {
    const bookmarks = document.querySelectorAll('.btn-bookmark');
    if (bookmarks.length === 0) return;

    bookmarks.forEach(icon => {
        icon.addEventListener('click', async function(e) {
            e.preventDefault(); e.stopPropagation(); 
            const isSaved = this.classList.contains('fa-solid');
            const foodCard = this.closest('.food-list-card') || this.closest('.food-card');
            let foodName = "Menu ini";
            if (foodCard) { const titleElement = foodCard.querySelector('.food-list-title') || foodCard.querySelector('h3'); if (titleElement) foodName = titleElement.textContent; }

            if (!isSaved) {
                this.classList.remove('fa-regular'); this.classList.add('fa-solid'); this.style.color = '#439b46';
                await createCustomModal({ type: 'alert', icon: '<i class="fa-solid fa-bookmark" style="color: #439b46;"></i>', title: 'Berhasil Disimpan!', text: `<b>${foodName}</b> berhasil ditambahkan ke daftar favorit kamu.` });
            } else {
                this.classList.remove('fa-solid'); this.classList.add('fa-regular'); this.style.color = '#9ca3af'; 
                await createCustomModal({ type: 'alert', icon: '<i class="fa-regular fa-bookmark" style="color: #ef4444;"></i>', title: 'Dihapus', text: `<b>${foodName}</b> telah dihapus dari daftar favorit.` });
            }
        });
    });
}

function initNotificationFeature() {
    document.body.addEventListener('click', async function(e) {
        const targetBtn = e.target.closest('.bell-btn') || (e.target.closest('.icon-btn') && e.target.closest('.icon-btn').querySelector('.fa-bell'));
        if (targetBtn) {
            e.preventDefault();
            const dot = targetBtn.querySelector('.dot'); if (dot) dot.style.display = 'none';
            await createCustomModal({
                type: 'alert', icon: '<i class="fa-solid fa-bell" style="color: #f59e0b;"></i>',
                title: 'Notifikasi Terbaru',
                text: `<div style="text-align: left;"><p style="margin-bottom: 12px; font-size: 13px;"><b>💧 Jangan Lupa Minum!</b><br>Cuaca sedang panas, pastikan target 8 gelas airmu tercapai hari ini.</p><p style="font-size: 13px;"><b>🥗 Promo Kantin Mitra</b><br>Diskon Rp 2.000 untuk Nasi Telur Kecap di Warteg Bahari (Khusus pengguna NutriKos).</p></div>`
            });
        }
    });
}

// --- FITUR 8: DETAIL TARGET HARIAN (MAKRO & MIKRO NUTRIEN) ---
function initLihatDetail() {
    // Cari semua link di bagian header section (seperti "Lihat Detail >" atau "Lihat Semua >")
    const sectionLinks = document.querySelectorAll('.target-header a, .section-header a');
    
    sectionLinks.forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();
            const text = this.textContent.toLowerCase();

            if (text.includes('detail')) {
                // Pop-up Lengkap Makro dan Mikro Nutrien
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-solid fa-chart-pie" style="color: #439b46;"></i>',
                    title: 'Rincian Gizi Harian',
                    text: `
                        <div style="text-align: left; margin-top: 10px;">
                            <!-- MAKRONUTRIEN -->
                            <h4 style="font-size: 14px; color: #1a1a1a; margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px;">Makronutrien</h4>
                            
                            <div style="font-size: 12px; margin-bottom: 4px; display: flex; justify-content: space-between;"><span>Karbohidrat</span> <b>200 / 250g</b></div>
                            <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 4px; margin-bottom: 12px;"><div style="width: 80%; height: 100%; background: #f59e0b; border-radius: 4px;"></div></div>

                            <div style="font-size: 12px; margin-bottom: 4px; display: flex; justify-content: space-between;"><span>Protein</span> <b>62 / 80g</b></div>
                            <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 4px; margin-bottom: 12px;"><div style="width: 77%; height: 100%; background: #3b82f6; border-radius: 4px;"></div></div>

                            <div style="font-size: 12px; margin-bottom: 4px; display: flex; justify-content: space-between;"><span>Lemak</span> <b>45 / 60g</b></div>
                            <div style="width: 100%; height: 6px; background: #e5e7eb; border-radius: 4px; margin-bottom: 20px;"><div style="width: 75%; height: 100%; background: #ef4444; border-radius: 4px;"></div></div>

                            <!-- MIKRONUTRIEN (Fokus Anemia & Tulang/Vit D) -->
                            <h4 style="font-size: 14px; color: #1a1a1a; margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px;">Mikronutrien & Serat</h4>
                            
                            <div style="font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                    <span style="color: #ef4444;"><i class="fa-solid fa-droplet"></i> Zat Besi</span><br>
                                    <b style="font-size: 13px; color: #1a1a1a;">12 / 18 mg</b>
                                </div>
                                <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                    <span style="color: #f59e0b;"><i class="fa-solid fa-sun"></i> Vitamin D</span><br>
                                    <b style="font-size: 13px; color: #1a1a1a;">400 / 600 IU</b>
                                </div>
                                <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                    <span style="color: #3b82f6;"><i class="fa-solid fa-bone"></i> Kalsium</span><br>
                                    <b style="font-size: 13px; color: #1a1a1a;">800 / 1000 mg</b>
                                </div>
                                <div style="background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                    <span style="color: #10b981;"><i class="fa-solid fa-leaf"></i> Serat</span><br>
                                    <b style="font-size: 13px; color: #1a1a1a;">18 / 25 g</b>
                                </div>
                            </div>
                        </div>
                    `
                });
            } else if (text.includes('semua')) {
                // Untuk tombol "Lihat Semua >" pada Rekomendasi Hari Ini
                await createCustomModal({
                    type: 'alert',
                    icon: '<i class="fa-solid fa-list" style="color: #439b46;"></i>',
                    title: 'Daftar Menu',
                    text: 'Katalog Menu Lengkap akan mengarahkan kamu ke halaman Rekomendasi Menu di mana kamu bisa memfilter makanan berdasarkan budget!'
                });
            }
        });
    });
}
