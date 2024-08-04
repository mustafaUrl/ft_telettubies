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
        const newAccessToken = await refreshAccessToken();
        headers = new Headers({
          'Authorization': 'Bearer ' + newAccessToken,
          'Content-Type': 'application/json'
        });
        response = await fetch('api/user/user_actions/', {
          method: 'POST',
          headers: headers,
          body: body
        });
      }
  
      const data = await response.json();
      return data; 
    } catch (error) {
      console.error('An error occurred during the request:', error);
      throw error; 
    }
  }