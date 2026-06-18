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
            inputHtml = `<input type="number" id="nutrikos-modal-input" placeholder="${options.placeholder || ''}" style="width: 100%; padding: 14px; borde