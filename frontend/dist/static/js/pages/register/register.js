import escapeHtml from '../escape/escape.js';
import changeContent from '../../uimodule/changeContent.js';

function containsSpecialChars(str) {
    const specialChars = /[&<>"'/]/;
    return specialChars.test(str);
}

function isStrongPassword(password) {
    if (password.length < 8) {
        return false;
    }
    if (!/[A-Z]/.test(password)) {
        return false;
    }
    if (!/[a-z]/.test(password)) {
        return false;
    }
    if (!/\d/.test(password)) {
        return false;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return false;
    }
    return true;
}

export default function register() {
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.querySelector('[name="username"]').value;
        const first_name = document.querySelector('[name="first_name"]').value;
        const last_name = document.querySelector('[name="last_name"]').value;
        const email = document.querySelector('[name="email"]').value;
        const password = document.querySelector('[name="password"]').value;
        const password_repeat = document.querySelector('[name="password_repeat"]').value;

        if (containsSpecialChars(username) || containsSpecialChars(first_name) || containsSpecialChars(last_name) || containsSpecialChars(email)) {
            alert('Special characters are not allowed.');
            return;
        }

        if (password !== password_repeat) {
            alert('Passwords do not match.');
            return;
        }

       if (!isStrongPassword(password)) {
             alert('Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.');
             return;
        }

        fetch('api/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: escapeHtml(username), first_name: escapeHtml(first_name), last_name: escapeHtml(last_name), email: escapeHtml(email), password: escapeHtml(password) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                changeContent('home');
            } else {
                alert('Registration failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    });
}