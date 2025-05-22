import BasePresenter from '../BasePresenter';
import RegisterModel from '../models/RegisterModel';

export default class RegisterPresenter extends BasePresenter {
  constructor(view) {
    super(view);
    this._model = new RegisterModel();
  }

  async init() {
    // Any initialization logic can go here
  }

  async handleRegister(name, email, password) {
    try {
      const response = await this._model.register(name, email, password);
      
      if (response.error) {
        throw new Error(response.message);
      }
      
      this._view.showAlert('success', 'Registrasi berhasil! Silakan login.');
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 1500);
    } catch (error) {
      this.handleError(error);
    }
  }
} 