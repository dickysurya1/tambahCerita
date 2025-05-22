export default class BasePresenter {
  constructor(view) {
    this._view = view;
    this._view.setPresenter(this);
  }

  async init() {
    throw new Error('Method init() must be implemented');
  }

  async handleError(error) {
    console.error('Error:', error);
    this._view.showAlert('danger', error.message || 'An error occurred');
  }
} 