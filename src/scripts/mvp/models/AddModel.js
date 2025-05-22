import BaseModel from '../BaseModel';
import { addNewStory } from '../../network/api';

export default class AddModel extends BaseModel {
  async addStory(description, photo, lat, lon) {
    try {
      // Create FormData object to send multipart/form-data
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo);
      
      // Only add location if valid coordinates are provided
      if (!isNaN(lat) && !isNaN(lon)) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }
      
      // Call the API with the FormData object
      const response = await addNewStory(formData);
      this.setData(response);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to add story');
    }
  }
} 