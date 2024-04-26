import { getCookie } from '../cookies/cookies.js';

import  refreshAccessToken from '../cookies/token.js';

export default async function sendPostUserRequest(action, friend_username = null) {
    try {
      const accessToken = getCookie('accessToken');
      let headers = new Headers({
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      });
  
      const bodyData = { 'action': action };
      if (friend_username) {
        bodyData['friend_username'] = friend_username;
      }
      const body = JSON.stringify(bodyData);
  
      let response = await fetch('api/user/user_actions/', {
        method: 'POST',
        headers: headers,
        body: body
      });
  
      if (response.status === 401) {
        // Eğer yanıt 401 ise, token yenileme fonksiyonunu çağır
        const newAccessToken = await refreshAccessToken();
        // Yeni access token ile headerları güncelle
        headers = new Headers({
          'Authorization': 'Bearer ' + newAccessToken,
          'Content-Type': 'application/json'
        });
        // İsteği yeni token ile tekrar gönder
        response = await fetch('api/user/user_actions/', {
          method: 'POST',
          headers: headers,
          body: body
        });
      }
  
      // İkinci isteğin sonucunu al
      const data = await response.json();
      return data; // İşlem başarılıysa veriyi dön
    } catch (error) {
      // Hata oluşursa burada ele al
      console.error('İstek sırasında bir hata oluştu:', error);
      throw error; // Hata bilgisini dışarı fırlat
    }
  }