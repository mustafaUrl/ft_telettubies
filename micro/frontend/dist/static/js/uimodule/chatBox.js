import sendPostUserRequest from '../postwithjwt/userRequest.js';
import { getCookie } from '../cookies/cookies.js';
import { sendMessage } from '../utils/SocketHelper.js';

let activeTab = 'tab1';
function selectTab(selectedTabId) {
    // Sekmelerin stilini sıfırla
    const tabs = document.querySelectorAll('#tabs > div');
    tabs.forEach(function(tab) {
      tab.style.backgroundColor = '';
      tab.style.color = '';
    });
  
    // Seçili sekme stilini ayarla
    const selectedTab = document.getElementById(selectedTabId);
    selectedTab.style.backgroundColor = '#0d61d7';
    selectedTab.style.color = 'black';
  
    // Mesaj kutularının görünürlüğünü ayarla
    document.getElementById('chat_messages1').style.display = selectedTabId === 'tab1' ? 'block' : 'none';
    document.getElementById('chat_messages2').style.display = selectedTabId === 'tab2' ? 'block' : 'none';
    activeTab = selectedTabId;
  
  }

  
function showTab2WithUsername(username) {
  const tab2 = document.getElementById('tab2');
  tab2.textContent = username; // Sekme 2'nin metnini güncelle
  tab2.style.display = 'block'; // Sekme 2'yi göster
  selectTab('tab2'); // Sekme 2'yi seçili hale getir
}
// Bildirim butonunu güncelleme fonksiyonu
function updateNotificationButton(username) {
  const notificationButton = document.getElementById('notification_button');
  notificationButton.textContent = `Yeni mesajlar (${username})`;
  notificationButton.style.display = 'block'; // Bildirim butonunu göster
}

document.getElementById('chat_send').onclick = function() {
  const messageInput = document.getElementById('chat_input');
  const message = messageInput.value;
  const username = getCookie('username'); // Gönderen kullanıcının adını al

  if (chatSocketPrivate && activeTab === 'tab2') {
    sendMessage(message);
    showTab2WithUsername(window.otherUser);
  } else {
  // Mesajı WebSocket üzerinden gönder
  if (window.chatSocket) {
    window.chatSocket.send(JSON.stringify({
      'message': message,
      'username': username,
      'room': 'global'
    }));
  }}
  messageInput.value = '';
};



// İkona tıklama olayını dinleme ve arkadaş listesini göster
document.getElementById('chat_icon').addEventListener('click', function() {
  toggleFriendList(); // Bu fonksiyon daha önce tanımlanmış olmalı
  // fetchAndDisplayFriends();
});

document.getElementById('chat_bar').addEventListener('click', function() {
  var chatContainer = document.getElementById('chat_container');
  var isClosed = chatContainer.style.height === '0px' || chatContainer.style.height === '';

  // Sohbet penceresinin yüksekliğini ve gri çubuğun alt pozisyonunu güncelle
  chatContainer.style.height = isClosed ? '285px' : '0px';
  this.style.bottom = isClosed ? '310px' : '10px'; // 'this' ile chatBar'ı güncelle
});


document.getElementById('chat_input').onkeypress = function(e) {
  if (e.keyCode === 13) {  // Enter tuşu
    document.getElementById('chat_send').click();
   }
 };

 
 // Toggle chat box function

// Add event listener to chat bar

 function toggleFriendList() {
  var friendList = document.getElementById('friend-list');
  var chatContainer = document.getElementById('chat_container');
  var chatBbar = document.getElementById('chat_bar');
  var chatIcon = document.getElementById('chat_icon');


  var isFriendListVisible = friendList.style.display === 'block';

  // Arkadaş listesinin görünürlüğünü değiştir
  friendList.style.display = isFriendListVisible ? 'none' : 'block';

  // Eğer arkadaş listesi görünürse, chat_container'ı sola kaydır
  chatContainer.style.right = isFriendListVisible ? '10px' : '250px';
  chatBbar.style.right = isFriendListVisible ? '10px' : '250px';
  chatIcon.style.right = isFriendListVisible ? '330px' : '600px';
  if (!isFriendListVisible) {
    fetchAndDisplayFriends(); // Arkadaş listesini temizle
  }
}

// get_user_info fonksiyonundan gelen veriyi işleme
// Arkadaş listesini al ve ekranda göster
function fetchAndDisplayFriends() {
  sendPostUserRequest('list_friends')
    .then(data => {
      // Arkadaş listesini al
      const friends = data.friends;
      // Arkadaş listesini ekranda göster
      displayFriends(friends);
    })
    .catch(error => {
      console.error('Arkadaş listesi alınamadı:', error);
    });
}


function updateNotificationCount(username, count) {
  const userLink = document.querySelector(`[data-username="${username}"]`);
  let notificationSpan = userLink.querySelector('.notification-count');
  
  if (!notificationSpan) {
    // Eğer bildirim sayacı span'ı yoksa, yeni bir tane oluştur
    notificationSpan = document.createElement('span');
    notificationSpan.classList.add('notification-count');
    userLink.appendChild(notificationSpan);
  }
  
  if (count > 0) {
    notificationSpan.textContent = count; // Bildirim sayısını güncelle
    notificationSpan.style.display = 'block'; // Bildirim sayacını göster
  } else {
    notificationSpan.style.display = 'none'; // Bildirim sayacını gizle
  }
}

// Cookie'den mesajları alıp gösteren fonksiyon
function displayMessagesFromCookie() {
  const chatMessages = document.getElementById('chat_messages2');
  chatMessages.innerHTML = ''; // Mevcut mesajları temizle

  // 'chat_messages' cookie'sini al
  const allCookies = document.cookie.split('; ');
  const chatCookie = allCookies.find(row => row.startsWith('chat_messages='));
  if (chatCookie) {
    // Cookie'den tüm mesajları al ve '|' ile ayır
    const messages = chatCookie.split('=')[1].split('|');
    console.log('Cookie mesajları:', messages);
    // Mesajları ve zaman damgalarını göster
    messages.forEach(message => {
      const [timeStamp, userMessage] = message.split('|');
      const time = new Date(timeStamp);
      const timeFormatted = time.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const messageDiv = document.createElement('div');
      messageDiv.textContent = `${userMessage} (${timeFormatted})`;
      chatMessages.appendChild(messageDiv);
    });
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessageToCookie(username, message) {
  // Mevcut cookie değerini al
  const existingCookie = document.cookie.split('; ').find(row => row.startsWith('chat_messages='));
  const messages = existingCookie ? existingCookie.split('=')[1].split('|') : [];

  // Yeni mesajı ve zaman damgasını mevcut mesajlara ekle
  const now = new Date();
  messages.push(`${now.toISOString()}|${username}: ${message}`);

  // Eğer mesaj sayısı 50'den fazlaysa, en eski mesajları sil
  if (messages.length > 50) {
    messages.splice(0, messages.length - 50);
  }

  // Cookie'yi güncelle
  const time = now.getTime();
  const expireTime = time + 1000 * 36000; // 10 saat sonra sona erecek
  now.setTime(expireTime);

  // Cookie'de saklanacak mesaj formatı
  const cookieValue = messages.join('|');
  document.cookie = `chat_messages=${cookieValue};expires=${now.toUTCString()};path=/;SameSite=None; Secure`;
}



// Arkadaş listesini güncelleyen ve olay dinleyicileri ekleyen fonksiyon
function displayFriends(friends) {
  const friendListContainer = document.getElementById('friend-list');
  friendListContainer.innerHTML = ''; // Mevcut listeyi temizle

  friends.forEach(friend => {
    const friendElement = document.createElement('div');
    friendElement.classList.add('friend-item');
    friendElement.innerHTML = `
      <p>
        <a href="#" class="link-underline-dark" data-username="${friend.username}">
          <img src="${friend.profile_picture}" alt="${friend.username}">
          <span>${friend.username}</span>
        </a>
      </p>`;
    friendListContainer.appendChild(friendElement);
  });

  // Kullanıcı adına tıklama olayını tanımla
  document.querySelectorAll('.friend-item .link-underline-dark').forEach(item => {
    item.addEventListener('click', function(event) {
      event.preventDefault();
      const username = this.getAttribute('data-username');
     // Bildirim sayısını sıfırla
      // Görünümü güncelle
      if (window.otherUser !== username) {
          window.otherUser = username; // Diğer kullanıcının adını güncelle
        }
      selectTab('tab2');
      displayMessagesFromCookie(username);
      updateNotificationCount(username, '');       
      var chatContainer = document.getElementById('chat_container');
      var chatBar = document.getElementById('chat_bar');
      chatContainer.style.height = '285px';
      chatBar.style.bottom = '310px';
    });
  });
}

export { addMessageToCookie, updateNotificationButton, showTab2WithUsername, selectTab };