export default function historylistener() {
    const accountButton = document.getElementById('accountButton');
    const friendsButton = document.getElementById('friendsButton');

    accountButton.addEventListener('click', () => {
        // Redirect to account page
        window.location.href = '/account';
    });

    friendsButton.addEventListener('click', () => {
        // Redirect to friends page
        window.location.href = '/friends';
    });
}