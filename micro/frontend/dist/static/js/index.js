import  checkAuthStatus  from './uimodule/checkAuthStatus.js';
import  hrefListener from './uimodule/hrefListener.js';
import  openSocket  from './sockets/globalSocket.js';
import  openSocketPrivate  from './sockets/privateSocket.js';
import  {selectTab}  from './uimodule/chatBox.js';
import  {getCookie}  from './cookies/cookies.js';

    checkAuthStatus();
    hrefListener();
    if (getCookie('accessToken')) {
      openSocketPrivate();
      openSocket();
    }
    selectTab('tab1');



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
