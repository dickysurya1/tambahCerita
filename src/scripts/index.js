// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import SkipContent from './utils/skip-content';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  
  // Initialize skip to content
  SkipContent.init();
  
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
