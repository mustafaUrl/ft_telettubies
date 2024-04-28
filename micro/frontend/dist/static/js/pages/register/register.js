import changeContent from '../../uimodule/changeContent.js';

export default function register() {
    document.getElementById('register-form').addEventListener('submit', function(e) {
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

        const submitButton = document.querySelector('[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Registering...';

        fetch('api/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, first_name, last_name, email, password })
        })
        .then(response => response.json())
        .then(data => {
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
            if(data.success) {
                changeContent('home');
                document.getElementById('register-form').reset();
            } else {
                
                alert('Registration failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
        });
    });
}
