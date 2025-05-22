// src/scripts/pages/auth/login-page.js
import { login } from '../../network/api';

export default class LoginPage {
  async render() {
    return `
      <section class="container">
        <div class="form-container">
          <h1 class="form-title">Login to StoryApp</h1>
          
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" class="form-control" required autocomplete="email">
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" class="form-control" required autocomplete="current-password">
            </div>
            
            <button type="submit" id="login-button" class="btn btn-block">Login</button>
            
            <div class="form-footer">
              <p>Belum punya akun? <a href="#/register">Register</a></p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('login-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const loginButton = document.getElementById('login-button');
        loginButton.disabled = true;
        loginButton.textContent = 'Logging in...';
        
        const response = await login(email, password);
        
        if (response.error) {
          this._showAlert('error', response.message);
        } else {
          this._showAlert('success', 'Login berhasil!');
          // Update auth menu after successful login
          const app = document.querySelector('app-bar');
          if (app) {
            app._updateAuthMenu();
          }
          setTimeout(() => {
            window.location.hash = '#/';
          }, 1000);
        }
      } catch (error) {
        this._showAlert('error', `Login gagal: ${error.message}`);
      } finally {
        const loginButton = document.getElementById('login-button');
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
      }
    });
  }
  
  _showAlert(type, message) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    
    const form = document.getElementById('login-form');
    form.insertAdjacentElement('beforebegin', alertElement);
    
    setTimeout(() => {
      alertElement.remove();
    }, 3000);
  }
}