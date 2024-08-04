import  changeContent  from '../../uimodule/changeContent.js';
import { getCookie, deleteCookie } from '../../cookies/cookies.js';
import  {closeSocket} from '../../utils/SocketHelper.js';



export default function logout() {
    document.getElementById('logout-link').addEventListener('click', function(e) {
      e.preventDefault();
      fetch('api/auth/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getCookie('accessToken')
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        deleteCookie('username');
        closeSocket();
  
        changeContent('sign-in');
      })
      .catch(error => {
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        deleteCookie('username');
        closeSocket();
  
        changeContent('sign-in');
        console.error('There has been a problem with your fetch operation:', error);
      });
    });
  }