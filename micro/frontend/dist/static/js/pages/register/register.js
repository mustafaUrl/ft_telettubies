import  changeContent  from '../../uimodule/changeContent.js';


export default function register() {
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.querySelector('[name="username"]').value;
        const first_name = document.querySelector('[name="first_name"]').value;
        const last_name = document.querySelector('[name="last_name"]').value;
        const email = document.querySelector('[name="email"]').value;
        const password = document.querySelector('[name="password"]').value;
        const password_repeat = document.querySelector('[name="password_repeat"]').value;

        // Şifrelerin eşleşip eşleşmediğini kontrol et
        if(password !== password_repeat) {
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
                // Kayıt başarılı, ana sayfaya yönlendir
                changeContent('home');
            } else {
                // Hata mesajını göster
                alert('Registration failed: ' + data.error);
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    });
}