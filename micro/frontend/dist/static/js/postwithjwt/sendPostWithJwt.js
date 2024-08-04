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
     
  
      let response = await fetch(url, {
        method: method,
        headers: headers,
        body: methodData,
      });
  
      if (response.status === 401) {
        const newAccessToken = await refreshAccessToken();
        headers.set('Authorization', 'Bearer ' + newAccessToken);
        response = await fetch(url, {
          method: method,
          headers: headers,
          body: methodData,
        });
      }
  
      const data = await response.json();
      return data; 
    } catch (error) {
     
      console.error('An error occurred during the request:', error);
      throw error; 
    }
  }
  
  