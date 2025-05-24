if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = window.location.hostname === 'localhost' ? './sw.js' : '/Proyek-Akhir-tambahCerita/sw.js';
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('ServiceWorker registration successful');
      })
      .catch((err) => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
} 