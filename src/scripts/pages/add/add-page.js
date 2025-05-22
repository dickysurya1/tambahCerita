// src/scripts/pages/add/add-page.js
import { addNewStory } from '../../network/api';

export default class AddPage {
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
    
    // Store stream on the class instance for later cleanup
    this._mediaStream = null;
    
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
        this._showAlert('error', 'Kamera tidak tersedia');
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
        this._showAlert('success', 'Foto berhasil diambil!');
        
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
    
    // Clean up resources on page unload
    this._cleanupHandler = () => {
      if (this._mediaStream) {
        this._mediaStream.getTracks().forEach(track => {
          track.stop();
        });
        this._mediaStream = null;
        if (cameraPreview) cameraPreview.srcObject = null;
      }
    };
    
    // Add event listeners for cleanup
    window.addEventListener('beforeunload', this._cleanupHandler);
    
    // Add cleanup handler for SPA navigation
    window.addEventListener('hashchange', this._cleanupHandler);
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
    
    // Tambahkan event listener untuk klik pada peta
    map.on('click', (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Update hidden inputs
      latInput.value = lat;
      lonInput.value = lng;
      
      // Update text
      selectedLocationText.innerHTML = `
        <strong>Lokasi dipilih:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}
      `;
      selectedLocationText.className = 'selected-location alert-success';
      
      // Update marker
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(map);
      }
    });
    
    // Coba dapatkan lokasi pengguna saat ini
    if (navigator.geolocation) {
      try {
        const positionOptions = {
          enableHighAccuracy: true,  // Tingkatkan akurasi jika memungkinkan
          timeout: 30000,            // Naikkan timeout ke 30 detik
          maximumAge: 0              // Selalu minta posisi terbaru
        };
        
        navigator.geolocation.getCurrentPosition(
          // Success callback
          (position) => {
            try {
              const userLocation = [position.coords.latitude, position.coords.longitude];
              map.setView(userLocation, 15);
              
              // Set nilai default
              latInput.value = position.coords.latitude;
              lonInput.value = position.coords.longitude;
              
              // Update text
              selectedLocationText.innerHTML = `
                <strong>Lokasi Anda:</strong> ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}
              `;
              selectedLocationText.className = 'selected-location alert-success';
              
              // Tambahkan marker
              marker = L.marker(userLocation).addTo(map);
            } catch (innerError) {
              console.error('Error processing geolocation result:', innerError);
              this._useDefaultLocation(map, marker, latInput, lonInput, selectedLocationText, defaultLocation);
            }
          },
          
          // Error callback
          (error) => {
            // Menangani berbagai error dari Geolocation API
            let errorMessage = '';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Izin lokasi ditolak oleh pengguna.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Informasi lokasi tidak tersedia.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Waktu permintaan lokasi habis.';
                break;
              default:
                errorMessage = 'Terjadi kesalahan saat mendapatkan lokasi.';
            }
            
            console.warn(`Geolocation error (${error.code}): ${errorMessage}`, error);
            this._useDefaultLocation(map, marker, latInput, lonInput, selectedLocationText, defaultLocation);
          },
          positionOptions
        );
      } catch (error) {
        console.error('Error in geolocation setup:', error);
        this._useDefaultLocation(map, marker, latInput, lonInput, selectedLocationText, defaultLocation);
      }
    } else {
      console.log('Geolocation not supported by this browser');
      this._useDefaultLocation(map, marker, latInput, lonInput, selectedLocationText, defaultLocation);
    }
  }
  
  // Helper method untuk menggunakan lokasi default
  _useDefaultLocation(map, marker, latInput, lonInput, selectedLocationText, defaultLocation) {
    // Set nilai default
    latInput.value = defaultLocation[0];
    lonInput.value = defaultLocation[1];
    
    // Update text
    selectedLocationText.innerHTML = `
      <strong>Menggunakan lokasi default:</strong> ${defaultLocation[0].toFixed(6)}, ${defaultLocation[1].toFixed(6)}
    `;
    selectedLocationText.className = 'selected-location';
    
    // Tambahkan marker
    if (!marker) {
      marker = L.marker(defaultLocation).addTo(map);
    } else {
      marker.setLatLng(defaultLocation);
    }
    
    // Pindahkan view ke lokasi default
    map.setView(defaultLocation, 13);
  }
  
  _initFormSubmission() {
    const form = document.getElementById('add-story-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const photoInput = document.getElementById('photo');
      const lat = document.getElementById('lat').value;
      const lon = document.getElementById('lon').value;
      
      if (!photoInput.files || photoInput.files.length === 0) {
        this._showAlert('error', 'Silakan ambil foto terlebih dahulu');
        return;
      }
      
      if (!lat || !lon) {
        this._showAlert('error', 'Silakan pilih lokasi pada peta');
        return;
      }
      
      // Gabungkan judul dan deskripsi
      const fullDescription = `# ${title}\n\n${description}`;
      
      // Buat FormData
      const formData = new FormData();
      formData.append('description', fullDescription);
      formData.append('photo', photoInput.files[0]);
      formData.append('lat', lat);
      formData.append('lon', lon);
      
      try {
        // Dapatkan referensi ke tombol submit
        const submitButton = document.getElementById('submit-button');
        submitButton.disabled = true;
        submitButton.textContent = 'Mengirim...';
        
        const response = await addNewStory(formData);
        
        if (response.error) {
          this._showAlert('error', `Error: ${response.message}`);
        } else {
          this._showAlert('success', 'Cerita berhasil ditambahkan!');
          
          // Redirect setelah berhasil
          setTimeout(() => {
            window.location.hash = '#/';
          }, 1500);
        }
      } catch (error) {
        this._showAlert('error', `Failed to add story: ${error.message}`);
      } finally {
        const submitButton = document.getElementById('submit-button');
        submitButton.disabled = false;
        submitButton.textContent = 'Tambah Cerita';
      }
    });
  }
  
  _showAlert(type, message) {
    // Hapus alert sebelumnya jika ada
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Buat alert baru
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    
    // Tambahkan ke form
    const form = document.getElementById('add-story-form');
    form.insertAdjacentElement('beforebegin', alertElement);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      alertElement.remove();
    }, 3000);
  }
  
  _setupCleanup() {
    // Store original function to call later
    const originalRender = this.render;
    
    // Create a cleanup function to ensure camera is stopped when component is destroyed
    this._cleanup = () => {
      if (this._mediaStream) {
        this._mediaStream.getTracks().forEach(track => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
        this._mediaStream = null;
        
        const cameraPreview = document.getElementById('camera-preview');
        if (cameraPreview) cameraPreview.srcObject = null;
      }
      
      // Remove event listeners
      window.removeEventListener('beforeunload', this._cleanupHandler);
      window.removeEventListener('hashchange', this._cleanupHandler);
    };
    
    // Run cleanup on destroy or navigate away
    document.addEventListener('page:destroy', this._cleanup);
    window.addEventListener('hashchange', this._cleanup);
  }
  
  // Add a method to clean up if this component is unmounted
  destroy() {
    if (this._cleanup) {
      this._cleanup();
    }
  }
}