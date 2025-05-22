import BasePresenter from '../BasePresenter';
import DetailModel from '../models/DetailModel';
import { parseActivePathname } from '../../routes/url-parser';

export default class DetailPresenter extends BasePresenter {
  constructor(view) {
    super(view);
    this._model = new DetailModel();
  }

  async init() {
    // Any initialization logic can go here
  }

  async loadStoryDetail() {
    try {
      const { id } = parseActivePathname();
      
      if (!id) {
        throw new Error('Story ID not found');
      }
      
      const response = await this._model.fetchStoryDetail(id);
      
      if (response.error) {
        throw new Error(response.message);
      }
      
      this._view.displayStoryDetail(response.story);
    } catch (error) {
      this._view.showError(`Failed to load story detail: ${error.message}`);
      this.handleError(error);
    }
  }
} 