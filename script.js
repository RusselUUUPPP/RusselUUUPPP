// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    
    // Panggil fungsi Water Tracker
    initWaterTracker();

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
    const today = new Date().toDateString(); // Mendapatkan tanggal hari ini (contoh: "Fri Jun 19 2026")
    let savedDate = localStorage.getItem('nutrikos_water_date');
    let savedAmount = localStorage.getItem('nutrikos_water_count');
    
    let currentAmount = 0;

    // Cek apakah tanggal tersimpan sama dengan hari ini
    if (savedDate === today && savedAmount) {
        // Jika masih di hari yang sama, gunakan memori terakhir
        currentAmount = parseInt(savedAmount);
    } else {
        // Jika hari berganti (atau baru pertama kali pakai), reset mulai dari 0
        currentAmount = 0;
        localStorage.setItem('nutrikos_water_date', today);
        localStorage.setItem('nutrikos_water_count', 0);
    }

    // Pastikan currentAmount tidak lebih besar dari jumlah maksimal gelas
    if (currentAmount > maxAmount) currentAmount = maxAmount;

    // 2. Reset semua gelas agar kosong saat awal dimuat (menimpa bawaan HTML)
    glasses.forEach(glass => glass.classList.remove('filled'));

    // 3. Isi gelas sesuai dengan jumlah data yang tersimpan untuk hari ini
    for (let i = 0; i < currentAmount; i++) {
        glasses[i].classList.add('filled');
    }

    // 4. Perbarui teks awal menjadi "0 / 8 gelas" (atau sesuai memori hari ini)
    waterCountText.textContent = `${currentAmount} / ${maxAmount} gelas`;

    // 5. Event ketika tombol + diklik
    btnAddWater.addEventListener('click', function() {
        if (currentAmount < maxAmount) {
            // Ubah gelas kosong berikutnya menjadi terisi (tambah class 'filled')
            glasses[currentAmount].classList.add('filled');
            
            // Tambah jumlah air saat ini
            currentAmount++;
            
            // Perbarui teks "X / 8 gelas"
            waterCountText.textContent = `${currentAmount} / ${maxAmount} gelas`;

            // Simpan jumlah terbaru dan pastikan tanggalnya diset ke hari ini
            localStorage.setItem('nutrikos_water_count', currentAmount);
            localStorage.setItem('nutrikos_water_date', new Date().toDateString());

            // Efek animasi klik kecil pada tombol
            btnAddWater.style.transform = 'scale(0.85)';
            setTimeout(() => {
                btnAddWater.style.transform = 'scale(1)';
            }, 150);
        } else {
            // Jika sudah 8 gelas
            console.log('Target minum air hari ini sudah tercapai!');
        }
    });
}