import BaseModel from '../BaseModel';
import { login } from '../../network/api';

export default class LoginModel extends BaseModel {
  async login(email, password) {
    try {
      const response = await login(email, password);
      this.setData(response);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to login');
    }
  }
} 