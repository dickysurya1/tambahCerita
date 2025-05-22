// src/scripts/pages/home/home-page.js
import { getAllStories } from '../../network/api';
import { showFormattedDate } from '../../utils/index';

export default class HomePage {
  async render() {
    return `
      <section class="container">   
        <div class="story-header">
          <h2>Jelajahi Cerita</h2>
          <p>Temukan berbagai cerita menarik dari seluruh pengguna</p>
        </div>
        
        <div id="story-list" class="story-list">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const storyListElement = document.getElementById('story-list');
    
    try {
      const response = await getAllStories();
      
      if (response.error) {
        storyListElement.innerHTML = `
          <div class="alert alert-error">
            Error: ${response.message}
          </div>
        `;
        return;
      }
      
      const stories = response.listStory;
      
      if (stories.length === 0) {
        storyListElement.innerHTML = `
          <div class="alert">
            <p>Belum ada cerita yang tersedia. Jadilah yang pertama berbagi cerita!</p>
            <a href="#/add" class="btn" style="margin-top: 15px;">Tambah Cerita</a>
          </div>
        `;
        return;
      }
      
      storyListElement.innerHTML = '';
      
      stories.forEach((story) => {
        // Ekstrak judul dan deskripsi dari konten
        const { title, description } = this._extractTitleAndDescription(story.description);
        
        // Gunakan judul yang diekstrak atau nama pengguna sebagai fallback
        const displayTitle = title || story.name;
        
        const storyItem = document.createElement('div');
        storyItem.classList.add('story-item');
        storyItem.innerHTML = `
          <img src="${story.photoUrl}" alt="Gambar cerita: ${displayTitle}" class="story-image">
          <div class="story-info">
            <h2><a href="#/detail/${story.id}">${displayTitle}</a></h2>
            <p class="story-date">
              <span>${showFormattedDate(story.createdAt)}</span>
              <span class="story-author">Oleh: ${story.name}</span>
            </p>
            <p>${this._truncateText(description, 100)}</p>
            <a href="#/detail/${story.id}" class="btn" style="margin-top: 10px;">Baca Selengkapnya</a>
          </div>
        `;
        
        storyListElement.appendChild(storyItem);
      });
    } catch (error) {
      storyListElement.innerHTML = `
        <div class="alert alert-error">
          Failed to load stories: ${error.message}
        </div>
      `;
    }
  }
  
  _extractTitleAndDescription(content) {
    if (!content) return { title: '', description: '' };
    
    // Cek apakah konten menggunakan format judul yang kita tetapkan
    if (content.startsWith('# ')) {
      const lines = content.split('\n');
      const title = lines[0].substring(2); // Hapus '# ' dari awal
      const description = lines.slice(2).join('\n'); // Ambil konten setelah baris kosong
      return { title, description };
    }
    
    // Jika tidak menggunakan format kita, kembalikan seluruh konten sebagai deskripsi
    return { title: '', description: content };
  }
  
  _truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
}