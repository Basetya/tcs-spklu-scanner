# Protokol Anti-Regresi (Anti-Regression Protocol) PT TCS
Dokumen ini disusun untuk menjamin pemeliharaan fungsionalitas kritis dan visual tingkat tinggi situs web PT. Titis Cahaya Sejahtera (TCS) agar tidak mengalami kemunduran (regresi) pada proses pengembangan dan pembaruan berikutnya.

---

## 🎯 1. Penyelarasan Menu Navigasi & Animasi Denyut (Header Alignment & Pulse)

### Deskripsi Fitur:
Tautan navigasi menu "Kemitraan SPKLU" di navbar memiliki animasi denyut (*pulsing*) lembut yang membesar-mengecil untuk menarik perhatian calon investor. Semua tautan navigasi (`Beranda`, `Profil`, `Services`, `Klien`, `Kemitraan SPKLU`) dan tombol `Tanya MEP` wajib sejajar sempurna pada garis tengah vertikal (vertical axis) dan garis horizontal.

### 🛡️ Aturan Anti-Regresi CSS:
1. **Vertical Alignment Kontainer:**
   - Kontainer menu `.nav-menu` wajib memiliki `display: flex;` dan `align-items: center;` secara global di [CSS.html](file:///d:/TCS/CSS.html).
   - Seluruh elemen item daftar `.nav-menu li` wajib memiliki `display: flex;` dan `align-items: center;`.
   - Ini memastikan tinggi button `Tanya MEP` (yang memiliki padding lebih tinggi) tidak merusak garis baseline horizontal menu-menu lainnya.
2. **Model Box Tautan:**
   - Seluruh `.nav-link` harus disetel sebagai `display: inline-block;` dan `vertical-align: middle;` untuk konsistensi interpretasi tinggi elemen oleh browser.
3. **Pulsasi Tanpa Jitter (Layout Shift):**
   - Kelas khusus `.pulsing-menu-item` wajib disetel dengan `transform-origin: left center;` (atau `center center` jika disengaja) dan batasan skala maksimal `1.05`.
   - **PENTING:** Menggunakan origin `left center` menjaga sisi kiri teks tetap diam di posisinya (sejajar dengan menu sebelah kirinya) dan mengembang anggun ke arah kanan tanpa menciptakan lonjakan layout kiri-kanan (*horizontal layout jitter*).

---

## 📐 2. Dinamisasi Perencana Proyek Kontekstual ("Rancang Proyek" Wizard)

### Deskripsi Fitur:
Ketika pengguna mengeklik tombol "Rancang Proyek" atau "Tanya MEP", sistem memuat formulir interaktif (wizard) 4 langkah. Langkah 2 (pemilihan skala proyek) harus menyajikan pertanyaan dan kartu pilihan yang dinamis sesuai kategori jasa yang dipilih di Langkah 1.

### 🛡️ Aturan Anti-Regresi HTML & JS:
1. **Container Identifiers ([Index.html](file:///d:/TCS/Index.html)):**
   - Elemen penampung judul Langkah 2 harus mempertahankan ID `id="wizard-step-2-title"`.
   - Elemen grid pilihan Langkah 2 harus mempertahankan ID `id="wizard-step-2-grid"`.
   - Elemen masukan skala tersembunyi harus mempertahankan ID `id="wizard-input-scale"`.
2. **JavaScript Configuration Database ([JS.html](file:///d:/TCS/JS.html)):**
   - Wajib mempertahankan objek konfigurasi global `serviceWizardConfigs` yang memetakan setidaknya ke-8 bidang layanan MEP TCS.
   - Penambahan layanan baru di masa mendatang wajib diikutsertakan ke dalam objek ini dengan format:
     ```javascript
     "Nama Layanan Baru": {
       title: "Pertanyaan Kontekstual Baru?",
       options: [
         { val: "Nilai Database Pengiriman", icon: "🚀", title: "Judul Kartu", desc: "Deskripsi Kartu" },
         ...
       ]
     }
     ```
3. **Data Injection Flow:**
   - Setiap kali kategori jasa berubah, helper `updateStep2Questions(serviceName)` wajib dipicu untuk menggambar ulang Langkah 2.
   - Pemicu ini wajib aktif di kedua titik masuk:
     - Logika pemilihan kartu manual di wizard: `window.selectWizardCard(element, 'service')`.
     - Logika tombol tab navigasi utama: `window.selectWizardService(serviceName)`.
   - Nilai pilihan skala sebelumnya harus dihapus (`scaleInput.value = '';`) setiap kali jasa berganti demi integritas pengiriman prospek.

---

## 🖼️ 3. Manajemen Aset Visual & Keandalan Pemuatan Gambar (Visual Asset Integrity)

### Deskripsi Fitur:
Ilustrasi visual untuk setiap tab layanan dan profil harus 100% andal, tajam (beresolusi tinggi), dan bebas dari kegagalan pemuatan.

### 🛡️ Aturan Anti-Regresi Aset:
1. **Pencegahan CORS & Hotlinking Block:**
   - **DILARANG** menggunakan tautan aset gambar langsung dari server korporasi lama (`titiscahayasejahtera.co.id`) yang dilindungi proteksi *hotlink*. Hal ini memicu kesalahan 403 Forbidden di browser klien luar/lokal.
   - Gunakan tautan visual dari jaringan CDN publik bebas lisensi berkecepatan tinggi seperti **Unsplash** (menggunakan parameter optimasi Imgix seperti `?q=80&w=800&auto=format&fit=crop`) untuk mempercepat pemuatan gambar di bawah 200ms.
2. **Kekebalan Favicon & Gambar Lokal:**
   - Bila terdapat logo atau gambar eksternal yang kritis dan wajib ditampilkan, sertakan atribut `referrerpolicy="no-referrer"` pada tag `<img>` guna memotong transmisi referer eksternal yang memicu proteksi *hotlink*.

---

## 🧪 4. Prosedur Uji Regresi Mandiri (Verification Steps)
Setiap kali melakukan pembaruan kode pada `Index.html`, `CSS.html`, atau `JS.html`, lakukan verifikasi manual berikut:
1. **Navigasi Test:** Buka halaman di mode desktop & mobile, pastikan "Kemitraan SPKLU" tidak turun/naik dari garis horizontal menu navigasi lainnya.
2. **Wizard Context Test:** Buka perencana proyek, pilih kartu "EV Charging & SPKLU" -> pastikan Langkah 2 menanyakan kapasitas mobil & luas lahan (bukan dimensi ruko kantor). Kembalilah ke Langkah 1, pilih "HVAC System" -> pastikan judul Langkah 2 berganti ke sistem AC Split/VRF/Chiller.
3. **Visual Audit:** Pastikan tidak ada ikon gambar rusak (broken image) pada setiap tab layanan dari ke-8 bidang MEP yang disajikan.
