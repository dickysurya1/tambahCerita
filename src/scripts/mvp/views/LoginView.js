import BaseView from '../BaseView';

export default class LoginView extends BaseView {
  async render() {
    return `
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card mt-5">
              <div class="card-body">
                <h2 class="text-center mb-4">Login</h2>
                <form id="login-form">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" required>
                  </div>
                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Login</button>
                </form>
                <p class="text-center mt-3">
                  Don't have an account? <a href="#/register">Register here</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        await this._presenter.handleLogin(email, password);
      } catch (error) {
        this.showAlert('danger', error.message);
      }
    });
  }
} 