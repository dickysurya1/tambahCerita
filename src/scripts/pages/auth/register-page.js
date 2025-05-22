// src/scripts/pages/auth/register-page.js
import { register } from '../../network/api';

export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <div class="form-container">
          <h1 class="form-title">Daftar Akun Baru</h1>
          
          <form id="register-form">
            <div class="form-group">
              <label for="name">Nama</label>
              <input type="text" id="name" name="name" class="form-control" required autocomplete="name">
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" class="form-control" required autocomplete="email">
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" class="form-control" required minlength="8" autocomplete="new-password">
              <small>Password minimal 8 karakter</small>
            </div>
            
            <button type="submit" id="register-button" class="btn btn-block">Register</button>
            
            <div class="form-footer">
              <p>Sudah punya akun? <a href="#/login">Login</a></p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('register-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const registerButton = document.getElementById('register-button');
        registerButton.disabled = true;
        registerButton.textContent = 'Registering...';
        
        const response = await register(name, email, password);
        
        if (response.error) {
          this._showAlert('error', response.message);
        } else {
          this._showAlert('success', 'Registrasi berhasil! Silakan login.');
          setTimeout(() => {
            window.location.hash = '#/login';
          }, 1500);
        }
      } catch (error) {
        this._showAlert('error', `Registrasi gagal: ${error.message}`);
      } finally {
        const registerButton = document.getElementById('register-button');
        registerButton.disabled = false;
        registerButton.textContent = 'Register';
      }
    });
  }
  
  _showAlert(type, message) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    
    const form = document.getElementById('register-form');
    form.insertAdjacentElement('beforebegin', alertElement);
    
    setTimeout(() => {
      alertElement.remove();
    }, 3000);
  }
}