// app.js
import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import ViewTransition from '../utils/view-transitions';
import PushNotification from '../utils/push-notification';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
  
    this._setupDrawer();
    this._updateAuthMenu();
    this._setupNotificationButton();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _isUserAuthenticated() {
    return Boolean(localStorage.getItem('token'));
  }

  async _setupNotificationButton() {
    const notificationButton = document.getElementById('notification-button');
    if (notificationButton) {
      // Check initial subscription state
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          notificationButton.classList.add('subscribed');
          notificationButton.textContent = 'Disable Notifications';
        }
      } catch (error) {
        console.error('Error checking subscription state:', error);
      }

      notificationButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          if (notificationButton.classList.contains('subscribed')) {
            await PushNotification.unsubscribe();
            notificationButton.classList.remove('subscribed');
            notificationButton.textContent = 'Enable Notifications';
            this._showAlert('success', 'Notifications disabled successfully');
          } else {
            // Show loading state
            notificationButton.disabled = true;
            notificationButton.textContent = 'Enabling...';

            try {
              await PushNotification.subscribe();
              notificationButton.classList.add('subscribed');
              notificationButton.textContent = 'Disable Notifications';
              this._showAlert('success', 'Notifications enabled successfully');
            } catch (error) {
              if (error.message.includes('permission denied')) {
                this._showAlert('error', 'Please allow notifications in your browser settings');
              } else {
                this._showAlert('error', error.message || 'Failed to enable notifications');
              }
              notificationButton.textContent = 'Enable Notifications';
            } finally {
              notificationButton.disabled = false;
            }
          }
        } catch (error) {
          this._showAlert('error', error.message || 'Failed to manage notifications');
          notificationButton.textContent = 'Enable Notifications';
          notificationButton.disabled = false;
        }
      });
    }
  }

  _showAlert(type, message) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    
    const mainContent = document.getElementById('main-content');
    mainContent.insertAdjacentElement('afterbegin', alertElement);
    
    setTimeout(() => {
      alertElement.remove();
    }, 3000);
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url] || routes['*'];
    
    // Redirect ke login jika belum terotentikasi dan mencoba mengakses halaman tertentu
    const publicPages = ['/login', '/register', '/about'];
    if (!this._isUserAuthenticated() && !publicPages.includes(url)) {
      window.location.hash = '#/login';
      return;
    }
    
    try {
      await ViewTransition.transition(async () => {
        const page = await route.render();
        this.#content.innerHTML = await page.render();
        if (typeof page.afterRender === 'function') {
          await page.afterRender();
        }
        this._updateAuthMenu();
        this._setupNotificationButton();
      });
    } catch (error) {
      console.error('Error rendering page:', error);
      this.#content.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  }

  _updateAuthMenu() {
    const authMenu = document.getElementById('auth-menu');
    
    if (this._isUserAuthenticated()) {
      authMenu.innerHTML = `
        <a href="#/" id="logout-button" style="color: red;">Logout</a>
        <button id="notification-button" class="notification-btn">Enable Notifications</button>
      `;
      
      // Tambahkan event listener untuk logout
      document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.hash = '#/login';
        this._updateAuthMenu();
      });
    } else {
      authMenu.innerHTML = `<a href="#/login">Login</a>`;
    }
  }
}

export default App;