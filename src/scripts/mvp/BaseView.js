export default class BaseView {
  constructor() {
    this._presenter = null;
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }

  async render() {
    throw new Error('Method render() must be implemented');
  }

  async afterRender() {
    throw new Error('Method afterRender() must be implemented');
  }

  showAlert(type, message) {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type}`;
    alertElement.textContent = message;
    
    const form = document.querySelector('form');
    if (form) {
      form.insertAdjacentElement('beforebegin', alertElement);
      
      setTimeout(() => {
        alertElement.remove();
      }, 3000);
    }
  }
} 