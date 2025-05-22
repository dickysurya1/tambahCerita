import BaseModel from '../BaseModel';
import { register } from '../../network/api';

export default class RegisterModel extends BaseModel {
  async register(name, email, password) {
    try {
      const response = await register(name, email, password);
      this.setData(response);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to register');
    }
  }
} 