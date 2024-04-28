import { getCookie, setCookie } from './cookies.js';

export default async function refreshAccessToken() {
    // Refresh token'ı cookie'den alın
    const refreshToken = getCookie('refreshToken');
    const response = await fetch('api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    });
  
    if (!response.ok) {
      throw new Error('Token yenileme isteği başarısız oldu.');
    }
  
    const data = await response.json();
    if (data.access) {
      // Yeni access token'ı cookie'ye kaydedin
      setCookie('accessToken', data.access, {secure: true});
      return data.access;
    } else {
      throw new Error('Access token refresh failed: ' + data.error);
    }
  }
  