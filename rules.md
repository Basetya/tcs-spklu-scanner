# Aturan Kerja Vibe Coder (Proyek: Web App Kemitraan SPKLU PT TCS)

## 1. Filosofi Pengembangan
- **Keterbacaan Utama:** Tulis kode yang mudah dipahami manusia. Gunakan penamaan variabel yang deskriptif dalam bahasa Inggris/Indonesia yang baku.
- **Modularitas:** Pecah kode besar menjadi bagian-bagian kecil (komponen). Pisahkan antara komponen visual (UI) dan logika backend (API).
- **Error-First:** Jika terjadi error, jangan menebak-nebak atau menulis ulang kode secara acak. Berhenti, analisis pesan error-nya, jelaskan kepada saya, baru perbaiki jika saya izinkan.

## 2. Cara Berkomunikasi dengan Saya
- **Jelaskan Rencana:** Sebelum mulai menulis kode yang kompleks, berikan ringkasan rencana dalam 3 poin besar.
- **Kontekstual:** Jika Anda melakukan perubahan pada file yang sudah ada, beri tahu saya mengapa perubahan itu dilakukan.
- **Keamanan:** Jangan pernah mengekspos API Keys, password, atau kredensial database ke dalam repositori publik. Gunakan file `.env`.

## 3. Standar Coding & UI/UX
- **Styling:** Gunakan Tailwind CSS untuk tampilan yang bersih, mewah, dan modern (Gunakan aksen warna hijau neon/cyan untuk melambangkan EV/Masa depan, dikombinasikan dengan warna korporat gelap).
- **Komponen:** Gunakan Shadcn/ui untuk komponen interaktif seperti Form, Dialog, Tabs, dan Cards.
- **Dokumentasi:** Setiap fungsi utama harus memiliki komentar singkat di atasnya: "Fungsi ini digunakan untuk [tujuan]."

## 4. Prosedur Perbaikan (Debugging)
1. Jika ada error, berikan format:
   - **Apa yang salah:** (penjelasan singkat).
   - **Solusi yang ditawarkan:** (pendekatan perbaikan).
   - **Tindakan:** (tunggu konfirmasi saya untuk eksekusi).

   # ROADMAP: Sub-Page & Web App Kemitraan SPKLU (PT TCS)

## 🎯 Visi Proyek
Membangun web app interaktif (sub-domain terpisah: `kemitraan.pttcs.com`) sebagai *funneling tool* otomatis tingkat lanjut untuk menyaring, mengedukasi, dan mengonversi calon investor yang tertarik membuka bisnis SPKLU bersama PT TCS.

---

## 🗺️ Fase Pengembangan (Milestones)

### Fase 1: Landing Page, Visual Trust, & Lead Capture (MVP) 🔴 [To Do]
*Fokus: Membangun kepercayaan lewat visual dan mengumpulkan data kontak awal.*
- [ ] **Hero Section:** Judul memikat tentang pasif inkam dari aset tanah kosong + Slot pemutar video **Timelapse Eksklusif** (Transformasi lahan kosong menjadi SPKLU PT TCS menghasilkan Rp).
- [ ] **Live Revenue Simulator Counter:** Komponen angka animasi yang menunjukkan total pendapatan kumulatif jaringan SPKLU PT TCS secara nasional untuk memicu FOMO.
- [ ] **Lead Magnet Form:** Form unduh proposal kemitraan (Input: Nama, Email, WhatsApp).
- [ ] **Integrasi Tracker:** Memasang Meta Pixel dan Google Analytics untuk kebutuhan iklan *retargeting*.

### Fase 2: Kualifikasi Canggih & Interaktif ⚪ [Backlog]
*Fokus: Mengurangi beban survei manual dengan menyaring lahan investor secara otomatis.*
- [ ] **Interactive Feasibility Scanner:** Fitur peta interaktif di mana investor menjatuhkan PIN lokasi lahan mereka, lalu sistem menampilkan animasi pemindaian kelayakan radius 5KM (skor potensi profit).
- [ ] **Modul Upload Lahan:** Fitur unggah foto lokasi, sertifikat/bukti kepemilikan, dan estimasi luas lahan ke Supabase Storage.
- [ ] **Live Dashboard Mockup:** Tombol "Intip Mesin Uang Anda" yang membuka halaman demo dasbor pendapatan SPKLU untuk memberikan *ownership experience*.

### Fase 3: AI Consultant & Otomatisasi Penjualan ⚪ [Backlog]
*Fokus: Otomatisasi CS dan penutupan kesepakatan (Closing).*
- [ ] **SPKLU AI Chatbot (Gemini Powered):** Chatbot konsultasi dengan strategi *Consultative Selling* yang diletakkan di pojok bawah halaman.
- [ ] **WhatsApp Automation:** Integrasi API WhatsApp untuk mengirimkan notifikasi instan begitu investor mengunggah data lahan atau menjadwalkan pertemuan.
- [ ] **Scheduler (Janji Temu):** Integrasi sistem kalender bagi investor dengan skor kelayakan lahan tinggi untuk langsung *booking* jadwal survei fisik oleh tim PT TCS.

---

## 📈 Status Fitur (Kanban Board)
- **[Backlog]:** Interactive Scanner, Live Dashboard Mockup, AI Chatbot, WhatsApp API, Scheduler.
- **[In Progress]:** Inisialisasi struktur folder proyek di Antigravity.
- **[Done]:** Pembuatan dokumen arsitektur dan perencanaan (.md).