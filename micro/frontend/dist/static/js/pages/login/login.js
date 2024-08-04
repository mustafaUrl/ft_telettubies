import { setCookie } from '../../cookies/cookies.js';
import changeContent from '../../uimodule/changeContent.js';
import openSocket from '../../sockets/globalSocket.js';
import openSocketPrivate from '../../sockets/privateSocket.js';
import { selectTab } from '../../uimodule/chatBox.js';
import escapeHtml from '../escape/escape.js';

// Function to check for special characters
function containsSpecialChars(str) {
    const specialChars = /[&<>"'/]/;
    return specialChars.test(str);
}

export default function login() {
    document.getElementById('42intra').addEventListener('click', function(e) {
        e.preventDefault();

        fetch('api/auth/env/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            const apiUrl = data.api_url;
            window.location.href = apiUrl;
        })
        .catch(error => {
            console.error('An error occurred during the login process:', error);
        });
    });

    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username_or_email = escapeHtml(document.getElementById('InputUserOrEmail').value);
        const password = document.getElementById('InputPassword').value;

        // Check for special characters
        if (containsSpecialChars(username_or_email)) {
            alert('Special characters are not allowed.');
            return;
        }

        fetch('api/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username_or_email, password })
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
                        if (data.access) {
                            setCookie('accessToken', data.access, { secure: true });
                            setCookie('refreshToken', data.refresh, { secure: true });
                            setCookie('username', escapeHtml(data.username), { secure: true }); // Escape username before setting cookie
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
                setCookie('accessToken', data.access, { secure: true });
                setCookie('refreshToken', data.refresh, { secure: true });
                setCookie('username', escapeHtml(data.username), { secure: true }); // Escape username before setting cookie
                selectTab('tab1');
                openSocket();
                openSocketPrivate();
                setInterval(refreshAccessToken, 4 * 60 * 1000); 
                
                changeContent('home');
            } else {
                alert('Login failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('An error occurred during the login process:', error);
        });
    });
}