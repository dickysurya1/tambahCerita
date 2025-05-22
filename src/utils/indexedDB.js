const DB_NAME = 'storyDB';
const DB_VERSION = 1;
const STORE_NAME = 'savedStories';

// Initialize the database
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Save a story to IndexedDB
const saveStory = async (story) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(story);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving story:', error);
    throw error;
  }
};

// Get all saved stories
const getAllSavedStories = async () => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting saved stories:', error);
    throw error;
  }
};

// Delete a story from IndexedDB
const deleteStory = async (storyId) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(storyId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

// Check if a story is saved
const isStorySaved = async (storyId) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(storyId);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error checking saved story:', error);
    throw error;
  }
};

export { saveStory, getAllSavedStories, deleteStory, isStorySaved }; 