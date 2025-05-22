import BaseModel from '../BaseModel';

export default class AboutModel extends BaseModel {
  async fetchData() {
    // About page doesn't need to fetch any data from API
    // but we implement the method for consistency
    try {
      // For About page, we can just set static data
      this.setData({
        appName: 'StoryApp',
        version: '1.0.0',
        description: 'Platform berbagi cerita'
      });
      return this.getData();
    } catch (error) {
      throw new Error('Failed to initialize about page data');
    }
  }
} 