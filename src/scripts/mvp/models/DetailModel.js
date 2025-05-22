import BaseModel from '../BaseModel';
import { getStoryDetail } from '../../network/api';

export default class DetailModel extends BaseModel {
  async fetchStoryDetail(id) {
    try {
      const response = await getStoryDetail(id);
      this.setData(response);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch story detail');
    }
  }
} 