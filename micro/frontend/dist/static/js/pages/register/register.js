import changeContent from '../../uimodule/changeContent.js';


function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function setCookies(token) {
  setCookie('token', token, 7);
  setCookie('loggedIn', 'true', 7);
}

export default function register() {
  document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = escapeHtml(document.querySelector('[name="email"]').value.trim());
    const password = document.querySelector('[name="password"]').value;
    const confirmPassword = document.querySelector('[name="confirmPassword"]').value;

    if (!email || !password || !confirmPassword) {
      alert('Email, password, and confirm password are required.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const submitButton = document.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';

    fetch('api/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
      submitButton.disabled = false;
      submitButton.textContent = 'Register';
      if (data.success) {
        setCookies(data.token);
        changeContent('home');
        if (document.getElementById('register-form')) {
          document.getElementById('register-form').reset();
        }
      } else {
        if (data.error === 'Content not found') {
          alert('The requested content could not be found.');
        } else {
          alert('An error occurred during the registration process: ' + data.error);
        }
      }
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
      submitButton.disabled = false;
      submitButton.textContent = 'Register';
    });
  });
}
