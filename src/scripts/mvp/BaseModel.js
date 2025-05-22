export default class BaseModel {
  constructor() {
    this._data = null;
  }

  async fetchData() {
    throw new Error('Method fetchData() must be implemented');
  }

  getData() {
    return this._data;
  }

  setData(data) {
    this._data = data;
  }
} 