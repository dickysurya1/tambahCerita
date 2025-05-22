import BaseView from '../BaseView';

export default class RegisterView extends BaseView {
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
        
        await this._presenter.handleRegister(name, email, password);
      } catch (error) {
        this.showAlert('danger', error.message);
      } finally {
        const registerButton = document.getElementById('register-button');
        registerButton.disabled = false;
        registerButton.textContent = 'Register';
      }
    });
  }
} 