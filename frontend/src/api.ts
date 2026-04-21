import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000'
});

api.interceptors.request.use((config) => {
  // language handling
  const currentLanguage = localStorage.getItem('language') || 'en';
  if (config.method === 'get') {
    config.params = { ...config.params, language: currentLanguage };
  } else if (config.data instanceof FormData) {
    config.data.append('language', currentLanguage);
  } else if (config.data) {
    config.data.language = currentLanguage;
  } else {
    // This handles methods like POST that might not have an initial body.
    config.data = { language: currentLanguage };
  }

  // authentication token handling
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    config.headers.Authorization = `Token ${authToken}`;
  }

  return config;
});

export const isAxiosError = axios.isAxiosError;

export const getApiErrorMessage = (error: unknown): string | null => {
  if (isAxiosError(error) && error.response?.data?.error) {
    return error.response.data.error;
  }
  return null;
};

export default api;