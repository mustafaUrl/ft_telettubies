
import  {setCookie}  from '../../cookies/cookies.js';
import  changeContent  from '../../uimodule/changeContent.js';
import   openSocket  from '../../sockets/globalSocket.js';
import  openSocketPrivate  from '../../sockets/privateSocket.js';
import { selectTab } from '../../uimodule/chatBox.js';

export default function ft_login(authCode) {

    fetch('api/auth/ft-auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: authCode })
      })
      .then(response => response.json())
      .then(data => {
        if (data.two_factor_required) {
          const twoFactorCode = prompt('Please write 2FA code:');
          if (twoFactorCode) {
            fetch('api/auth/verify-2fa/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ user_username: data.user_username, token: twoFactorCode })
            })
            .then(response => response.json())
            .then(data => {
              if (data.access){
              setCookie('accessToken', data.access, {secure: true});
              setCookie('refreshToken', data.refresh, {secure: true});
              setCookie('username', data.username, {secure: true});
              selectTab('tab1');
              openSocket();
              openSocketPrivate();
              setInterval(refreshAccessToken, 4 * 60 * 1000); 
              changeContent('home');
              }
            })
            .catch(error => {
              console.error('2FA authentication error:', error);
            });
          }
        } else if (data.access) {
              setCookie('accessToken', data.access, {secure: true});
              setCookie('refreshToken', data.refresh, {secure: true});
              setCookie('username', data.username, {secure: true});
              openSocket();
              openSocketPrivate();
              setInterval(refreshAccessToken, 4 * 60 * 1000); 
              changeContent('home');
        } else {
          alert('Login failed: ' + data.error);
        }
      })
      .catch(error => {
        console.error('error:',  error.message);
      });
   


}
