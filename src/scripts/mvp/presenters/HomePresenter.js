import BasePresenter from '../BasePresenter';
import HomeModel from '../models/HomeModel';

export default class HomePresenter extends BasePresenter {
  constructor(view) {
    super(view);
    this._model = new HomeModel();
  }

  async init() {
    // Any initialization logic can go here
  }

  async loadStories() {
    try {
      const response = await this._model.fetchStories();
      
      if (response.error) {
        throw new Error(response.message);
      }
      
      this._view.displayStories(response.listStory || []);
    } catch (error) {
      this._view.showError(`Failed to load stories: ${error.message}`);
      this.handleError(error);
    }
  }
} 