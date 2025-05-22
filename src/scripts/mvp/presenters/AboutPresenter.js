import BasePresenter from '../BasePresenter';
import AboutModel from '../models/AboutModel';

export default class AboutPresenter extends BasePresenter {
  constructor(view) {
    super(view);
    this._model = new AboutModel();
  }

  async init() {
    // Simple initialization, no specific actions needed for the About page
    try {
      await this._model.fetchData();
    } catch (error) {
      this.handleError(error);
    }
  }
} 