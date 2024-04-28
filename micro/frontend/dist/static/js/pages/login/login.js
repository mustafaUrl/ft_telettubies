export default function login() {

  document.getElementById('42intra').addEventListener('click', function(e) {
    e.preventDefault();
    console.log('42 login');
    window.location.href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-16b6c7462b738938b4c6b763f4d804a957769bb2e68fc5e727f86a1e219347e5&redirect_uri=https%3A%2F%2Flocalhost&response_type=code";
  });

  document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username_or_email = document.getElementById('InputUserOrEmail').value;
    const password = document.getElementById('InputPassword').value;
    try {
      const response = await fetch('api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username_or_email, password })
      });
      const data = await response.json();
      if (data.two_factor_required) {
        const twoFactorCode = prompt('Please write 2FA code:');
        if (twoFactorCode) {
          const verifyResponse = await fetch('api/auth/verify-2fa/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_username: data.user_username, token: twoFactorCode })
          });
          const verifyData = await verifyResponse.json();
          if (verifyData.access){
            setCookies(verifyData);
            selectTab('tab1');
            openSockets();
            changeContent('home');
          }
        }
      } else if (data.access) {
        setCookies(data);
        selectTab('tab1');
        openSockets();
        changeContent('home');
      } else {
        alert('Login failed: ' + data.error);
      }
    } catch (error) {
      console.error('An error occurred during the login process:', error);
    }
  });

  function setCookies(data) {
    setCookie('accessToken', data.access, { secure: true });
    setCookie('refreshToken', data.refresh, { secure: true });
    setCookie('username', data.username, { secure: true });
  }

  function openSockets() {
    openSocket();
    openSocketPrivate();
  }
}

// xss'e parmak attım aynı mustiye attığım gibi