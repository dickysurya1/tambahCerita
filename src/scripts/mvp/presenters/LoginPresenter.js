import BasePresenter from '../BasePresenter';
import LoginModel from '../models/LoginModel';

export default class LoginPresenter extends BasePresenter {
  constructor(view) {
    super(view);
    this._model = new LoginModel();
  }

  async init() {
    // Any initialization logic can go here
  }

  async handleLogin(email, password) {
    try {
      const response = await this._model.login(email, password);
      
      if (response.error) {
        throw new Error(response.message);
      }

      // Redirect to home page after successful login
      window.location.hash = '#/';
    } catch (error) {
      this.handleError(error);
    }
  }
} 