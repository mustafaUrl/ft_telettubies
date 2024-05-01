import {openPongSocket, commandSocket} from '../../sockets/pongSocket.js'



  
 
  function players(){
      // Butonu seç
      var friendsListButton = document.querySelector('button[data-bs-target="#offcanvas-list"]');
  
      // Butona 'click' olay dinleyicisi ekle
      friendsListButton.addEventListener('click', function() {
        commandSocket('online_players'); // Fonksiyonu çağır
      });
  
  }


  
 function rooms(){
    // // Butonu seç
    // var roomsListButton = document.querySelector('button[data-bs-target="#offcanvas-rooms"]');
  
    // // Butona 'click' olay dinleyicisi ekle
    // roomsListButton.addEventListener('click', function() {
    //   commandSocket('list_rooms'); // Fonksiyonu çağır
    // });

     // Oda oluştur butonu
  const createRoomButton = document.createElement('button');
  createRoomButton.textContent = 'Create Room';
  createRoomButton.classList.add('btn', 'btn-primary', 'mb-3'); // Bootstrap 5 primary buton sınıflarını ekle
  createRoomButton.onclick = function() {
    // Oda oluştur butonuna tıklandığında yapılacak işlem
    commandSocket('create_room');
    commandSocket('list_rooms');
  };
  
  // Oda oluştur butonunu offcanvas body'nin başına ekle
  document.querySelector('.offcanvas-body').prepend(createRoomButton);
  
  // Odalar listesi için bir ul elementi oluştur ve offcanvas body'ye ekle
  const roomListUl = document.createElement('ul');
  roomListUl.id = 'roomList';
  roomListUl.classList.add('list-group');
  document.querySelector('.offcanvas-body').appendChild(roomListUl);


  // Odaları listeleyen bir buton oluştur
const listRoomsButton = document.createElement('button');
listRoomsButton.textContent = 'List Rooms';
listRoomsButton.classList.add('btn', 'btn-secondary', 'mb-3'); // Bootstrap 5 secondary buton sınıflarını ekle
listRoomsButton.onclick = function() {
  // Odaları listeleyen butona tıklandığında yapılacak işlem
  commandSocket('list_rooms');
};

// List Rooms butonunu offcanvas body'nin başına ekle
document.querySelector('.offcanvas-body').prepend(listRoomsButton);

// Odalar listesi için bir ul elementi zaten oluşturulmuş, tekrar eklemeye gerek yok

  }
  

export default function pong(){


    openPongSocket();
   
    players();
    rooms();
    commandSocket('list_rooms');
    
}