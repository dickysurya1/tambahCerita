import BasePresenter from '../BasePresenter';
import AddModel from '../models/AddModel';

export default class AddPresenter extends BasePresenter {
  constructor(view) {
    super(view);
    this._model = new AddModel();
  }

  async init() {
    // Any initialization logic can go here
  }

  async handleAddStory(description, photo, lat, lon) {
    try {
      const response = await this._model.addStory(description, photo, lat, lon);
      
      if (response.error) {
        throw new Error(response.message || 'Failed to add story');
      }
      
      this._view.showAlert('success', 'Cerita berhasil ditambahkan!');
      
      // Redirect to home page after successful submission
      setTimeout(() => {
        window.location.hash = '#/';
      }, 1500);
      
      return true;
    } catch (error) {
      this.handleError(error);
      // Return false to indicate failure so the view can reset the button state
      return false;
    }
  }
} 