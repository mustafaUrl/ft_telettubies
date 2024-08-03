import  checkAuthStatus  from './uimodule/checkAuthStatus.js';
import  hrefListener from './uimodule/hrefListener.js';
import  openSocket  from './sockets/globalSocket.js';
import  openSocketPrivate  from './sockets/privateSocket.js';
import  {selectTab}  from './uimodule/chatBox.js';
import  {getCookie, deleteCookie}  from './cookies/cookies.js';
import triggerContentLoad from './gatePage/gatePage.js';
import profileTrigger from './pages/profile/profileTrigger.js';
import ft_login from './pages/login/42login.js';
// import changeContent from './uimodule/changeContent.js';
import { get_notifications, get_notifications_count } from './uimodule/notifications.js';

deleteCookie('contentData');


// Event listener for notification icon click
document.getElementById('notificationIcon').addEventListener('click', async function() {
  get_notifications();
});


window.onclick = function(event) {
  // Check if the click is outside the notification dropdown
  if (!event.target.closest('#notificationIcon')) {
    const notificationDropdown = document.getElementById('notificationDropdown');
    if (notificationDropdown.classList.contains('show')) {
      notificationDropdown.classList.remove('show');
    }
  }
};



    checkAuthStatus();
    hrefListener();
    if (getCookie('accessToken')) {
      openSocketPrivate();
      openSocket();
      get_notifications_count();
    }
    selectTab('tab1');

    window.addEventListener('load', function() {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');
      // console.log(authCode);
      if (authCode) {

        ft_login(authCode);
      }
      this.history.replaceState({id: 'home'}, '', '/');
    });
    
  document.getElementById('tab1').addEventListener('click', function(event) {
    event.stopPropagation();
    selectTab('tab1');
  });
  document.getElementById('tab2').addEventListener('click', function(event) {
    event.stopPropagation();
    selectTab('tab2');
  });
  

  window.onpopstate = function(event) {
    if (event.state) {
      var mainContent = document.getElementById('main-content');
      mainContent.innerHTML = event.state.htmlContent;
      triggerContentLoad(event.state.id);
      profileTrigger(event.state.id);

    }
  }

  window.addEventListener('storage', (event) => {
    if (event.key === 'accessToken') {
      checkAuthStatus();
    }
  });


//   // Gözlemlemek istediğiniz elementi tanımlayın
// var elementToObserve = document.getElementById('myElement');

// // Yeni bir 'MutationObserver' örneği oluşturun ve bir callback fonksiyonu geçirin
// var observer = new MutationObserver(function(mutationsList, observer) {
//   // Burada her bir mutasyon için yapılacak işlemleri tanımlayabilirsiniz
//   mutationsList.forEach(function(mutation) {
//     console.log(mutation);
//   });
// });

// // Gözlemciye gözlemlemek istediğiniz elementi ve seçenekleri nesnesini geçirin
// observer.observe(elementToObserve, {
//   childList: true, // Elementin çocuklarında yapılan değişiklikleri dinler
//   attributes: true, // Elementin attribute'larında yapılan değişiklikleri dinler
//   characterData: true, // Elementin veri karakterlerinde yapılan değişiklikleri dinler
//   subtree: true // Elementin alt ağacındaki tüm değişiklikleri dinler
// });
