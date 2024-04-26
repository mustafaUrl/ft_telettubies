import {getCookie} from '../cookies/cookies.js';
import refreshAccessToken from '../cookies/token.js';


export default async function sendPostWithJwt(url, bodyData, method = 'POST') {
    try {
      const accessToken = getCookie('accessToken');
      let headers = new Headers({
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      });
      var methodData;
      // Multipart/form-data için Content-Type başlığını kaldır
      if (url === 'api/user/update_profile_pic/') {
        headers.delete('Content-Type');
        methodData = bodyData;
      }
      else if (method === 'GET') {
        methodData = null;
      }
      else {
        methodData = JSON.stringify(bodyData);
      }
      // if (method === 'POST' && bodyData instanceof FormData) {
      //   headers.delete('Content-Type');
      // }
  
      let response = await fetch(url, {
        method: method,
        headers: headers,
        body: methodData,
      });
  
      // Eğer yanıt 401 ise, token yenileme fonksiyonunu çağır
      if (response.status === 401) {
        const newAccessToken = await refreshAccessToken();
        headers.set('Authorization', 'Bearer ' + newAccessToken);
        response = await fetch(url, {
          method: method,
          headers: headers,
          body: methodData,
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
  
  