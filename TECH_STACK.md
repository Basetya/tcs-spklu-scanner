# TECH_STACK: Aplikasi Kemitraan SPKLU PT TCS

Dokumen ini mendefinisikan ekosistem teknologi yang digunakan agar AI tetap konsisten dalam menulis kode.

## 💻 Frontend (Tampilan)
- **Framework:** Next.js (React) - Standar terbaik untuk performa web app cepat.
- **Styling:** Tailwind CSS + Shadcn/ui - Untuk tampilan komponen (tombol, form, dashboard) yang profesional dan modern.

## 🗄️ Backend & Database (Penyimpanan Data)
- **Database & Auth:** Supabase - Digunakan untuk menyimpan data investor, link foto lahan yang di-upload, dan email pendaftar.
- **Penyimpanan File:** Supabase Storage - Folder khusus untuk menampung file proposal (PDF) dan foto lahan dari investor.

## 🤖 AI & Otomatisasi
- **Chatbot Core:** Google Gemini 1.5 Flash API (via Google AI Studio) - Cepat dan murah untuk menangani chat konsultasi investor.
- **Automasi Email:** Resend atau EmailJS - Untuk mengirim proposal otomatis setelah investor mengisi form.

# TECH_STACK: Aplikasi Kemitraan SPKLU PT TCS

Dokumen ini mengunci ekosistem teknologi yang digunakan agar semua agen AI menulis kode dengan pustaka (library) yang konsisten.

## 💻 Frontend (Tampilan & Interaksi)
- **Framework:** Next.js (React) - Struktur App Router untuk performa SEO dan kecepatan muat data yang maksimal.
- **Styling:** Tailwind CSS - Untuk kustomisasi desain yang cepat tanpa file CSS terpisah.
- **Komponen UI:** Shadcn/ui + Framer Motion (untuk animasi angka counter dan scanner).
- **Maps:** React Google Maps API atau Mapbox (untuk fitur Feasibility Scanner).

## 🗄️ Backend & Penyimpanan (Database & Cloud)
- **Database Utama:** Supabase (PostgreSQL) - Menyimpan data pendaftar, log chat, dan status kualifikasi lahan.
- **Storage:** Supabase Storage - Menampung dokumen proposal PDF dan aset foto lahan yang diunggah investor.

## 🤖 AI & Otomatisasi Alur Kerja
- **Engine Chatbot:** Google Gemini 1.5 Flash API - Dipilih karena memiliki latensi sangat rendah, hemat biaya, dan *context window* besar untuk membaca data bisnis.
- **Email Gateway:** Resend API - Mengirimkan file proposal secara otomatis ke email investor berbentuk *attachment* profesional.
- **WhatsApp Gateway:** Whapi.cloud / Foneapi (atau penyedia lokal yang stabil) - Mengirimkan notifikasi status pengecekan lahan langsung ke nomor WhatsApp investor.