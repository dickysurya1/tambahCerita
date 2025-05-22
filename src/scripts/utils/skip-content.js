export default class SkipContent {
  static init() {
    const mainContent = document.querySelector("#main-content");
    const skipLink = document.querySelector(".skip-link");
    
    if (skipLink && mainContent) {
      skipLink.addEventListener("click", function (event) {
        event.preventDefault(); // Mencegah refresh halaman
        skipLink.blur(); // Menghilangkan fokus skip to content
        mainContent.focus(); // Fokus ke konten utama
        mainContent.scrollIntoView({ behavior: 'smooth' }); // Halaman scroll ke konten utama dengan animasi smooth
      });
    }
  }
} 