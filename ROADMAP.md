# ROADMAP: Sub-Page & Web App Kemitraan SPKLU (PT TCS)

## 🎯 Visi Proyek
Membangun web app interaktif sebagai *funneling tool* otomatis untuk menyaring, mengedukasi, dan mengonversi calon investor yang tertarik membuka bisnis SPKLU bersama PT TCS (Skema: Investor menyediakan lahan/modal, PT TCS menyediakan alat/pemasangan).

---

## 🗺️ Fase Pengembangan (Milestones)

### Fase 1: Landing Page & Lead Capture (MVP - Minimum Viable Product) 🎉 [SELESAI]
*Fokus: Mengumpulkan data email calon investor secepat mungkin.*
- `[x]` **Hero Section:** Judul yang memikat tentang potensi bisnis SPKLU bersama PT TCS.
- `[x]` **Skema Bisnis Visual:** Penjelasan singkat bagi hasil (Lahan Prospek + Alat PT TCS).
- `[x]` **Lead Magnet:** Tombol "Download Proposal Kemitraan" (Wajib memasukkan Nama, Email, & No. WhatsApp).
- `[x]` **Form Validasi Awal:** Input alamat/koordinat lahan yang diajukan investor.

### Fase 2: Fitur Interaktif & Kualifikasi Prospek 🎉 [SELESAI]
*Fokus: Menyaring investor yang benar-benar serius.*
- `[x]` **SPKLU Calculator (Simulasi ROI):** Alat hitung interaktif di mana investor memasukkan parameter operasional, lalu sistem secara dinamis memperkirakan pendapatan bulanan dan payback period (PBP) lengkap dengan bagan Chart.js.
- `[x]` **Interactive Feasibility Scanner (Radar Audit):** Pemindaian lokasi secara *real-time* berbasis **Leaflet.js**, **CartoDB Dark Matter**, dan **Nominatim Geocoding API** untuk memeriksa:
  - `[x]` **Grid Capacity Simulator:** Pengecekan sisa beban gardu PLN terdekat (+197 kVA).
  - `[x]` **Competitor Radius Detector:** Audit radius 3KM untuk mendeteksi sebaran kompetitor SPKLU dan status "Peluang Monopoli".
  - `[x]` **Amenities Nearby Analyzer:** Deteksi otomatis tempat keramaian (kafe, restoran, ritel) untuk estimasi dwell-time pengisian daya.

### Fase 3: AI Consultant & Otomatisasi ⚪ [Backlog]
*Fokus: Mengurangi beban kerja tim CS menggunakan AI.*
- `[ ]` **SPKLU AI Chatbot:** Chatbot yang dilatih khusus dengan dokumen internal PT TCS untuk menjawab pertanyaan investor seputar legalitas, pasokan listrik PLN, jenis mesin (AC/DC Fast Charging), dan estimasi balik modal.
- `[ ]` **Email Automation:** Pengiriman proposal otomatis ke email pendaftar, diikuti dengan email *follow-up* berseri.

---

## 📈 Status Fitur (Kanban Board)
- **[Backlog]:** SPKLU AI Chatbot, Email Automation.
- **[Done]:**
  - Desain Landing Page SPKLU PT TCS (Mewah & Glassmorphic).
  - Interactive 3D BIM Isometric Clash Detection Simulator (Halaman Utama).
  - Centralized Dual-Language (ID/EN) Toggle System (Alih bahasa instan tanpa refresh).
  - Live Net Revenue SPKLU Transaction Ticker (Format mata uang dinamis Rp/IDR).
  - Interactive Leaflet Feasibility Scanner & Geocoding API.
  - SPKLU ROI Simulator & Chart.js Integration.

---

## 📣 Strategi Pemasaran & Pelacakan (Digital Marketing)
- `[x]` **Integrasi Meta Pixel & Google Analytics:** Terpasang pada bagian `<head>` untuk melacak perilaku calon investor di dalam web app.
- `[x]` **Fitur Live Dashboard Mockup:** Tampilan digital visual pendapatan live SPKLU yang berputar 24 jam.