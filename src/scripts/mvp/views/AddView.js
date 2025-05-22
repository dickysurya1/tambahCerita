import BaseView from '../BaseView';

export default class AddView extends BaseView {
  constructor() {
    super();
    this._mediaStream = null;
    this._cleanupHandler = null;
  }

  async render() {
    return `
      <div class="container">
        <div class="form-container">
          <h1 class="form-title">Tambah Cerita Baru</h1>
          
          <form id="add-story-form">
            <div class="form-group">
              <label for="title">Judul Cerita</label>
              <input type="text" id="title" name="title" class="form-control" required placeholder="Masukkan judul cerita...">
            </div>
            
            <div class="form-group">
              <label for="description">Cerita Anda</label>
              <textarea id="description" name="description" class="form-control" rows="5" required placeholder="Tulis cerita Anda di sini..."></textarea>
            </div>
            
            <div class="form-group">
              <label for="photo">Foto</label>
              <div class="camera-container">
                <video id="camera-preview" class="camera-preview" autoplay playsinline></video>
                <div class="camera-controls">
                  <button type="button" id="camera-button" class="btn">Ambil Foto</button>
                </div>
                <canvas id="camera-canvas" style="display: none;"></canvas>
              </div>
              <input type="file" id="photo" name="photo" class="form-control" accept="image/*" required>
              <small>Gunakan kamera atau pilih file gambar</small>
            </div>
            
            <div class="form-group">
              <label for="location-map">Lokasi</label>
              <div id="location-map" class="location-map"></div>
              <p id="selected-location" class="selected-location">Belum ada lokasi yang dipilih. Klik pada peta untuk memilih lokasi.</p>
              <input type="hidden" id="lat" name="lat">
              <input type="hidden" id="lon" name="lon">
            </div>
            
            <button type="submit" id="submit-button" class="btn btn-block">Tambah Cerita</button>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this._initCamera();
    this._initMap();
    this._initFormSubmission();
    
    // Ensure cleanup happens when navigating away
    this._setupCleanup();
  }
  
  _initCamera() {
    const cameraPreview = document.getElementById('camera-preview');
    const cameraButton = document.getElementById('camera-button');
    const cameraCanvas = document.getElementById('camera-canvas');
    const photoInput = document.getElementById('photo');
    const cameraContainer = document.querySelector('.camera-container');
    
    let stream = null;
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment', 
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      } 
    })
      .then((mediaStream) => {
        stream = mediaStream;
        this._mediaStream = mediaStream; // Store reference for cleanup
        cameraPreview.srcObject = stream;
        cameraPreview.style.display = 'block';
        
        // Add play event listener to ensure video dimensions are available
        cameraPreview.addEventListener('play', () => {
          // Ensure the video fills the container
          cameraPreview.style.width = '100%';
          cameraPreview.style.height = '400px';
          cameraPreview.style.objectFit = 'cover';
        });
      })
      .catch((error) => {
        console.error('Camera error:', error);
        cameraContainer.innerHTML = `
          <div class="alert alert-error">
            <p>Kamera tidak tersedia atau izin ditolak. Silakan gunakan upload file.</p>
          </div>
        `;
      });
    
    // Capture photo
    cameraButton.addEventListener('click', () => {
      if (!stream) {
        this.showAlert('danger', 'Kamera tidak tersedia');
        return;
      }
      
      const context = cameraCanvas.getContext('2d');
      
      // Set canvas dimensions to match video
      cameraCanvas.width = cameraPreview.videoWidth;
      cameraCanvas.height = cameraPreview.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(cameraPreview, 0, 0, cameraCanvas.width, cameraCanvas.height);
      
      // Ambil foto dari kamera
      cameraCanvas.toBlob((blob) => {
        // Buat objek File
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        
        // Buat DataTransfer untuk mengatur file input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        // Set file ke input file
        photoInput.files = dataTransfer.files;
        
        // Tampilkan pesan sukses
        this.showAlert('success', 'Foto berhasil diambil!');
        
        // Tampilkan preview gambar yang diambil
        const imgPreview = document.createElement('img');
        imgPreview.src = URL.createObjectURL(blob);
        imgPreview.className = 'camera-preview';
        imgPreview.style.objectFit = 'cover';
        imgPreview.style.height = '400px';
        
        // Hentikan stream kamera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          this._mediaStream = null; // Clear reference
          cameraPreview.srcObject = null;
          
          // Ganti tampilan kamera dengan gambar yang diambil
          cameraPreview.style.display = 'none';
          cameraContainer.insertBefore(imgPreview, cameraPreview.nextSibling);
          
          // Ubah tombol
          cameraButton.textContent = 'Ambil Foto Lagi';
          cameraButton.addEventListener('click', () => {
            window.location.reload();
          });
        }
      }, 'image/jpeg', 0.9);
    });
  }
  
  _initMap() {
    // Load Leaflet.js from CDN jika belum dimuat
    if (!window.L) {
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(linkElement);
      
      const scriptElement = document.createElement('script');
      scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      scriptElement.onload = () => {
        this._renderMap();
      };
      document.head.appendChild(scriptElement);
    } else {
      this._renderMap();
    }
  }
  
  _renderMap() {
    const mapElement = document.getElementById('location-map');
    const latInput = document.getElementById('lat');
    const lonInput = document.getElementById('lon');
    const selectedLocationText = document.getElementById('selected-location');
    
    // Lokasi default (Malang)
    const defaultLocation = [-7.983908, 112.621391];
    
    // Inisialisasi peta
    const map = L.map('location-map').setView(defaultLocation, 13);
    
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
    
    let marker = null;
    
    // Coba dapatkan lokasi pengguna
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [position.coords.latitude, position.coords.longitude];
          
          // Pindahkan peta ke lokasi pengguna
          map.setView(userLocation, 13);
          
          // Tambahkan marker
          marker = L.marker(userLocation).addTo(map);
          
          // Isi nilai input
          latInput.value = userLocation[0];
          lonInput.value = userLocation[1];
          
          // Update text
          selectedLocationText.textContent = `Lokasi terpilih: ${userLocation[0]}, ${userLocation[1]}`;
        },
        (error) => {
          console.log('Error getting location:', error);
          this._useDefaultLocation(map, marker, latInput, lonInput, selectedLocationText, defaultLocation);
        }
      );
    } else {
      this._useDefaultLocation(map, marker, latInput, lonInput, selectedLocationText, defaultLocation);
    }
    
    // Event onclick pada peta untuk memilih lokasi
    map.on('click', (e) => {
      const selectedLocation = [e.latlng.lat, e.latlng.lng];
      
      // Hapus marker sebelumnya jika ada
      if (marker) {
        map.removeLayer(marker);
      }
      
      // Tambahkan marker baru
      marker = L.marker(selectedLocation).addTo(map);
      
      // Isi nilai input
      latInput.value = selectedLocation[0];
      lonInput.value = selectedLocation[1];
      
      // Update text
      selectedLocationText.textContent = `Lokasi terpilih: ${selectedLocation[0]}, ${selectedLocation[1]}`;
    });
  }
  
  _useDefaultLocation(map, marker, latInput, lonInput, selectedLocationText, defaultLocation) {
    // Tambahkan marker di lokasi default
    if (marker) {
      map.removeLayer(marker);
    }
    
    marker = L.marker(defaultLocation).addTo(map);
    
    // Isi nilai input
    latInput.value = defaultLocation[0];
    lonInput.value = defaultLocation[1];
    
    // Update text
    selectedLocationText.textContent = `Lokasi default: ${defaultLocation[0]}, ${defaultLocation[1]}`;
  }
  
  _initFormSubmission() {
    const form = document.getElementById('add-story-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const titleInput = document.getElementById('title');
      const descriptionInput = document.getElementById('description');
      const photoInput = document.getElementById('photo');
      const latInput = document.getElementById('lat');
      const lonInput = document.getElementById('lon');
      const submitButton = document.getElementById('submit-button');
      
      // Validate form
      if (!titleInput.value) {
        this.showAlert('danger', 'Judul cerita tidak boleh kosong');
        return;
      }
      
      if (!descriptionInput.value) {
        this.showAlert('danger', 'Deskripsi cerita tidak boleh kosong');
        return;
      }
      
      if (!photoInput.files || photoInput.files.length === 0) {
        this.showAlert('danger', 'Pilih foto terlebih dahulu');
        return;
      }
      
      // Format data
      const title = titleInput.value;
      const rawDescription = descriptionInput.value;
      const description = `# ${title}\n\n${rawDescription}`;
      const photo = photoInput.files[0];
      const lat = parseFloat(latInput.value);
      const lon = parseFloat(lonInput.value);
      
      // Disable button to prevent multiple submissions
      submitButton.disabled = true;
      submitButton.textContent = 'Mengirim...';
      
      try {
        const success = await this._presenter.handleAddStory(description, photo, lat, lon);
        
        // If not successful, reset the button
        if (!success) {
          submitButton.disabled = false;
          submitButton.textContent = 'Tambah Cerita';
        }
      } catch (error) {
        this.showAlert('danger', error.message);
        
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = 'Tambah Cerita';
      }
    });
  }
  
  _setupCleanup() {
    // Clean up resources on page unload
    this._cleanupHandler = () => {
      if (this._mediaStream) {
        this._mediaStream.getTracks().forEach(track => {
          track.stop();
        });
        this._mediaStream = null;
        const cameraPreview = document.getElementById('camera-preview');
        if (cameraPreview) cameraPreview.srcObject = null;
      }
    };
    
    // Add event listeners for cleanup
    window.addEventListener('beforeunload', this._cleanupHandler);
    
    // Add cleanup handler for SPA navigation
    window.addEventListener('hashchange', this._cleanupHandler);
  }
  
  destroy() {
    // Clean up resources
    if (this._cleanupHandler) {
      window.removeEventListener('beforeunload', this._cleanupHandler);
      window.removeEventListener('hashchange', this._cleanupHandler);
      this._cleanupHandler();
    }
  }
} 