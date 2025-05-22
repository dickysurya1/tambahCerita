// src/scripts/pages/detail/detail-page.js
import { getStoryDetail } from '../../network/api';
import { parseActivePathname } from '../../routes/url-parser';
import { showFormattedDate } from '../../utils/index';

export default class DetailPage {
  async render() {
    return `
      <div class="container">
        <div id="story-detail">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();
    const storyDetailElement = document.getElementById('story-detail');
    
    try {
      const response = await getStoryDetail(id);
      
      if (response.error) {
        storyDetailElement.innerHTML = `
          <div class="alert alert-error">
            Error: ${response.message}
          </div>
        `;
        return;
      }
      
      const story = response.story;
      
      // Ekstrak judul dan deskripsi
      const { title, description } = this._extractTitleAndDescription(story.description);
      
      // Gunakan judul dari input sebagai judul utama
      const mainTitle = title || story.name;
      
      storyDetailElement.innerHTML = `
        <div class="story-detail">
          <img src="${story.photoUrl}" alt="Gambar cerita: ${mainTitle}" class="detail-image">
          <div class="detail-info">
            <h1 class="story-title">${mainTitle}</h1>
            <div class="story-meta">
              <div class="creator-info">
                <i class="fas fa-user"></i>
                <span>${story.name}</span>
              </div>
              <div class="date-info">
                <i class="fas fa-calendar"></i>
                <span>${showFormattedDate(story.createdAt)}</span>
              </div>
            </div>
            <div class="story-description">${description}</div>
            <a href="#/" class="btn">Kembali ke Beranda</a>
          </div>
        </div>
        
        <h2>Lokasi Cerita</h2>
        <div id="map" class="map"></div>
      `;
      
      // Initialize map
      if (story.lat && story.lon) {
        this._initMap(story, mainTitle);
      } else {
        document.getElementById('map').innerHTML = `
          <div class="alert" style="margin-top: 15px;">
            <p>Tidak ada data lokasi untuk cerita ini</p>
          </div>
        `;
      }
    } catch (error) {
      storyDetailElement.innerHTML = `
        <div class="alert alert-error">
          Failed to load story detail: ${error.message}
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
  
  _initMap(story, title) {
    // Load Leaflet.js from CDN if not already loaded
    if (!window.L) {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkElement);
      
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      scriptElement.onload = () => {
        this._renderMap(story, title);
      };
      document.head.appendChild(scriptElement);
    } else {
      this._renderMap(story, title);
    }
  }
  
  _renderMap(story, title) {
    // Inisialisasi peta
    const map = L.map('map').setView([story.lat, story.lon], 13);
    
    // Buat berbagai layer peta
    const layers = {
      // Layer default - OpenStreetMap
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }),
      
      // Layer Topografi dari OpenTopoMap
      "Terrain": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17
      }),
      
      // Menggabungkan Light Mode dan Dark Mode menjadi Black & White
      "Black & White": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
      }),
      
      // Layer Satelit dari ESRI
      "Satelit": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
      })
    };
    
    // Tambahkan layer default ke peta
    layers["OpenStreetMap"].addTo(map);
    
    // Tambahkan layer control untuk switching antara berbagai jenis peta
    L.control.layers(layers, null, {
      collapsed: false, // Agar control selalu terbuka
      position: 'topright' // Posisi di kanan atas
    }).addTo(map);
    
    // Tambahkan skala peta
    L.control.scale({
      imperial: false, // Gunakan metrik saja (meter/km)
      position: 'bottomright'
    }).addTo(map);
    
    // Tambahkan marker lokasi cerita
    const popupTitle = title || story.name;
    const marker = L.marker([story.lat, story.lon]).addTo(map);
    marker.bindPopup(`<b>${popupTitle}</b><br>${this._truncateText(story.description, 100)}`).openPopup();
  }
  
  _truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
}