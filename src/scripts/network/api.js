// Perbarui api.js
import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  GET_STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
};

// Fungsi untuk menyimpan token ke localStorage
const saveToken = (token) => {
  localStorage.setItem('token', token);
};

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

export async function register(name, email, password) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
  
  return await response.json();
}

export async function login(email, password) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  
  const responseJson = await response.json();
  
  if (!responseJson.error) {
    saveToken(responseJson.loginResult.token);
  }
  
  return responseJson;
}

export async function getAllStories() {
  const token = getToken();
  
  if (!token) {
    return { error: true, message: 'Tidak ada token autentikasi' };
  }
  
  const response = await fetch(ENDPOINTS.GET_ALL_STORIES, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return await response.json();
}

export async function getStoryDetail(id) {
  const token = getToken();
  
  if (!token) {
    return { error: true, message: 'Tidak ada token autentikasi' };
  }
  
  const response = await fetch(ENDPOINTS.GET_STORY_DETAIL(id), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return await response.json();
}

export async function addNewStory(formData) {
  const token = getToken();
  
  if (!token) {
    return { error: true, message: 'Tidak ada token autentikasi' };
  }
  
  const response = await fetch(ENDPOINTS.ADD_STORY, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  return await response.json();
}