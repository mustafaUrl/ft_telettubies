import changeContent from '../../uimodule/changeContent.js';

export default function register() {
  document.addEventListener('DOMContentLoaded', (event) => {          // lujiangz mustiye tten
        e.preventDefault();
        const username = document.querySelector('[name="username"]').value.trim();
        const first_name = document.querySelector('[name="first_name"]').value.trim();
        const last_name = document.querySelector('[name="last_name"]').value.trim();
        const email = document.querySelector('[name="email"]').value.trim();
        const password = document.querySelector('[name="password"]').value;
        const password_repeat = document.querySelector('[name="password_repeat"]').value;

        if (!username || !email || !password) {
            alert('Username, email, and password are required.');
            return;
        }

        if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
            alert('Password must be at least 8 characters long and include lowercase, uppercase, and numeric characters.');
            return;
        }

        if (password !== password_repeat) {
            alert('Passwords do not match.');
            return;
        }


        fetch('api/auth/register/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, first_name, last_name, email, password })
      })
      .then(response => response.json())
      .then(data => {
          if(data.success) {
              changeContent('home');
              const registerForm = document.getElementById('register-form');
              if(registerForm) {
                  registerForm.reset();
              } else {
                  console.error('No element with id "register-form" found');
              }
          } else {
              alert('Registration failed: ' + data.error);
          }
      })
      .catch(error => {
          console.error('There has been a problem with your fetch operation:', error);
          // submitButton.disabled = false;
          // submitButton.textContent = 'Register';
      });
          });
}
