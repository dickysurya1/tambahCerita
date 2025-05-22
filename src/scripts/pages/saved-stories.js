import { getAllSavedStories, deleteStory } from '../../utils/indexedDB.js';

const SavedStoriesPage = {
  async render() {
    return `
      <div class="saved-stories-container">
        <h1>Cerita Tersimpan</h1>
        <div id="saved-stories-list" class="stories-list"></div>
      </div>
    `;
  },

  async afterRender() {
    const savedStoriesList = document.getElementById('saved-stories-list');
    
    try {
      const savedStories = await getAllSavedStories();
      
      if (savedStories.length === 0) {
        savedStoriesList.innerHTML = '<p class="no-stories">Belum ada cerita yang tersimpan</p>';
        return;
      }

      savedStoriesList.innerHTML = savedStories.map(story => `
        <div class="story-card" data-id="${story.id}">
          <h2>${story.name}</h2>
          <p>${story.description}</p>
          <div class="story-actions">
            <a href="#/detail/${story.id}" class="btn btn-primary">Lihat Detail</a>
            <button class="delete-story-btn" data-id="${story.id}">Hapus</button>
          </div>
        </div>
      `).join('');

      // Add event listeners for delete buttons
      const deleteButtons = document.querySelectorAll('.delete-story-btn');
      deleteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
          const storyId = e.target.dataset.id;
          try {
            await deleteStory(storyId);
            const storyCard = document.querySelector(`.story-card[data-id="${storyId}"]`);
            storyCard.remove();
            
            // If no stories left, show the empty message
            if (document.querySelectorAll('.story-card').length === 0) {
              savedStoriesList.innerHTML = '<p class="no-stories">Belum ada cerita yang tersimpan</p>';
            }
          } catch (error) {
            console.error('Error deleting story:', error);
            alert('Gagal menghapus cerita');
          }
        });
      });
    } catch (error) {
      console.error('Error loading saved stories:', error);
      savedStoriesList.innerHTML = '<p class="error">Gagal memuat cerita tersimpan</p>';
    }
  }
};

export default SavedStoriesPage; 