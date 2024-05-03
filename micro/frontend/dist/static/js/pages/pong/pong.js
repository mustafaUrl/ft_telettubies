import {openPongSocket, commandSocket} from './pongSocket.js'
// import {initGame} from './startGame.js'


  
 
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

  const createTournament = document.createElement('button');
  createTournament.textContent = 'Create Tournament';
  createTournament.classList.add('btn', 'btn-primary', 'mb-3'); // Bootstrap 5 primary buton sınıflarını ekle
  createTournament.onclick = function() {
    // Oda oluştur butonuna tıklandığında yapılacak işlem
    commandSocket('create_tournament');
    commandSocket('list_tournaments');
  };
  
  document.querySelector('.offcanvas-body').prepend(createTournament);

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




const listTournaments = document.createElement('button');
listTournaments.textContent = 'List Tournaments';
listTournaments.classList.add('btn', 'btn-secondary', 'mb-3'); // Bootstrap 5 secondary buton sınıflarını ekle
listTournaments.onclick = function() {
  // Odaları listeleyen butona tıklandığında yapılacak işlem
  commandSocket('list_tournaments');
};

// List Rooms butonunu offcanvas body'nin başına ekle
document.querySelector('.offcanvas-body').prepend(listTournaments);

// const tournaments = [
//   { name: 'Tournament 1', matches: [['Player A', 'Player B'], ['Player C', 'Player D']] },
//   // Diğer turnuvalar ve eşleşmeler...
// ];

// Turnuva listesini ve eşleşmeleri DOM'a ekleyen fonksiyon
// function populateTournamentList() {
//   const tournamentList = document.getElementById('tournamentList');
//   tournamentList.innerHTML = ''; // Listeyi temizle

//   tournaments.forEach(tournament => {
//     const tournamentItem = document.createElement('li');
//     tournamentItem.classList.add('list-group-item');
//     tournamentItem.textContent = tournament.name;

//     const matchList = document.createElement('ul');
//     tournament.matches.forEach(match => {
//       const matchItem = document.createElement('li');
//       matchItem.textContent = `${match[0]} vs ${match[1]}`;
//       matchList.appendChild(matchItem);
//     });

//     tournamentItem.appendChild(matchList);
//     tournamentList.appendChild(tournamentItem);
//   });
// }
// populateTournamentList();



  }
  

export default function pong(){


    openPongSocket();
   
    players();
    rooms();
    commandSocket('list_rooms');
    // initGame();
    
}