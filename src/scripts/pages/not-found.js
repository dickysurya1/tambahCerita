const NotFound = {
  async render() {
    return `
      <div class="not-found-container">
        <h1>404</h1>
        <h2>Halaman Tidak Ditemukan</h2>
        <p>Maaf, halaman yang Anda cari tidak dapat ditemukan.</p>
        <a href="#/" class="back-home-btn">Kembali ke Beranda</a>
      </div>
    `;
  },

  async afterRender() {
    // Add any additional functionality here if needed
  },
};

export default NotFound; 