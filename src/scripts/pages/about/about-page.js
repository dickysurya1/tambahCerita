// src/scripts/pages/about/about-page.js
export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <div class="about-container">
          <h1 class="form-title">Tentang StoryApp</h1>
          
          <div class="logo-container">
            <img src="images/logo.png" alt="StoryApp Logo" class="about-logo">
          </div>
          
          <div class="about-content">
            <p>StoryApp adalah platform berbagi cerita yang memungkinkan pengguna untuk berbagi momen dan pengalaman mereka dengan komunitas.</p>
            
            <p>Aplikasi ini dikembangkan sebagai bagian dari tugas kursus Dicoding - Belajar Membuat Aplikasi Web dengan JavaScript, menggunakan teknologi berikut:</p>
            
            <p>Aplikasi ini memungkinkan Anda untuk:</p>
            
            <ul class="feature-list">
              <li>Mendaftar dan login ke akun Anda</li>
              <li>Melihat cerita dari pengguna lain</li>
              <li>Menambahkan cerita baru dengan foto dan lokasi</li>
              <li>Mengambil foto langsung dari kamera perangkat</li>
              <li>Memilih lokasi pada peta untuk cerita Anda</li>
            </ul>
            
            <p>StoryApp dibuat dengan fokus pada aksesibilitas dan pengalaman pengguna yang mulus.</p>
            
            <div class="btn-container">
              <a href="#/" class="btn">Kembali ke Beranda</a>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Tidak ada kode tambahan yang diperlukan untuk halaman ini
  }
}