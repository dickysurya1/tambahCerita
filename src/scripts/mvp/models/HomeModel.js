import BaseModel from '../BaseModel';
import { getAllStories } from '../../network/api';

export default class HomeModel extends BaseModel {
  async fetchStories() {
    try {
      const response = await getAllStories();
      this.setData(response);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch stories');
    }
  }
} 