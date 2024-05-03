import  {getCookie , setCookie}  from '../../cookies/cookies.js';
import { startGame } from './startGame.js';

window.pongSocket = '';
function commandSocket(command, data=null) {
    if (window.pongSocket && window.pongSocket.readyState === WebSocket.OPEN) {

        if (data && command === 'invite_room') {
            window.pongSocket.send(JSON.stringify({
                'command': command,
                'username': data
              }));
            }
        else if (data && command === 'join_room') {
            window.pongSocket.send(JSON.stringify({
                'command': command,
                'room_name': data
              }));
            }
        else if (data && command === 'leave_room') {
            window.pongSocket.send(JSON.stringify({
                'command': command,
                'room_name': data
              }));
            }
        else if (data && command === 'continue_game') {
            window.pongSocket.send(JSON.stringify({
                'command': command,
                'game_id': data
              }));
            }
        else if (( command === 'join_tournament' || command === "creat_tournament"  || command === 'leave_tournament')) {
            window.pongSocket.send(JSON.stringify({
                'command': command,
                'tournament_id': data,
              
              }));
        }
        else{
            window.pongSocket.send(JSON.stringify({
                'command': command,
              }));
        }      
     


    }
  }




function listOnlinePlayers(onlinePlayers) {
  const playerListElement = document.getElementById('playerList');
  playerListElement.innerHTML = ''; // Online oyuncular listesini temizle

  onlinePlayers.forEach(player => {
      // Oyuncu için bir liste elemanı oluştur
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item'); // Bootstrap list-group-item sınıfını ekle

      // Oyuncu adını gösteren buton
      const playerButton = document.createElement('button');
      playerButton.textContent = player;
      playerButton.classList.add('btn', 'btn-primary', 'me-2');
      playerButton.setAttribute('data-player', player);

      // Davet et butonu
      const inviteButton = document.createElement('button');
      inviteButton.textContent = 'Invite';
      inviteButton.classList.add('btn', 'btn-outline-secondary');
      inviteButton.setAttribute('data-player', player);
      inviteButton.onclick = function() {
          const selectedPlayer = this.getAttribute('data-player');
          commandSocket('invite_room', selectedPlayer);
      };

      // Liste elemanına oyuncu adını ve davet et butonunu ekle
      listItem.appendChild(playerButton);
      listItem.appendChild(inviteButton);

      // Oluşturulan liste elemanını online oyuncular listesine ekle
      playerListElement.appendChild(listItem);
  });
}



function listRooms(rooms) {
  const roomListElement = document.getElementById('roomList');
  roomListElement.innerHTML = ''; // Oda listesini temizle
  const username = getCookie('username'); // Kullanıcı adını cookie'den al

  Object.values(rooms).forEach(roomInfo => {
    const roomItem = document.createElement('li');
    roomItem.classList.add('list-group-item');

    const roomDetailsSpan = document.createElement('span');
    roomDetailsSpan.textContent = `${roomInfo.room_name} - Players: ${roomInfo.players.join(', ')}`;
    roomItem.appendChild(roomDetailsSpan);

    // Eğer kullanıcı bu odada ise 'Leave' butonunu göster
    if (roomInfo.players.includes(username)) {
      const leaveButton = document.createElement('button');
      leaveButton.textContent = 'Leave';
      leaveButton.classList.add('btn', 'btn-danger', 'me-2');
      leaveButton.onclick = function() {
        commandSocket('leave_room', roomInfo.room_name);
      };
      roomItem.appendChild(leaveButton);

     
    } else if (roomInfo.players.length < 2) {
      // Eğer kullanıcı bu odada değilse ve odada yer varsa 'Join' butonunu göster
      const joinButton = document.createElement('button');
      joinButton.textContent = 'Join';
      joinButton.classList.add('btn', 'btn-success', 'me-2');
      joinButton.onclick = function() {
        commandSocket('join_room', roomInfo.room_name);
      };
      roomItem.appendChild(joinButton);
    }

    roomListElement.appendChild(roomItem);
  });
}



function openPongSocket() {
  if (window.pongSocket && window.pongSocket.readyState === WebSocket.OPEN) {
    console.log('Pong socket zaten açık');
    return;
  }
 
  window.pongSocket = new WebSocket(`wss://${window.location.host}/ws/pong/?token=` + getCookie('accessToken'));
 
  window.pongSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.type === 'online_players') {
     
        listOnlinePlayers(data.players);
        console.log('Online oyuncular:', data.players);
    }
    if (data.type === 'room_update'){
        console.log('room update:', data.room_name, data.player1, data.player2);
    }
    if (data.type === 'get_invite'){
        console.log('get invite:', data.invites);
    }
    if (data.type === 'list_rooms'){
        listRooms(data.rooms);
    }
    if (data.type === 'game_started'){
      
      setCookie('game_id', data.game_id );
      startGame();
      
      }
    if (data.type === 'already_in_game'){
      setCookie('game_id', data.game_id);
      console.log('already_in_game :', data.game_id);

      startGame();
    }
    if (data.type === 'tournaments_list'){
      
    
     if (Array.isArray(data.tournaments)){

       populateTournamentList(data.tournaments);
     }else {
        console.log('Tournament:', data.tournaments);
     }
    
    }
    console.log('Pong socket mesajı:', data);
    

   
  };

  window.pongSocket.onopen = function(e) {
    console.log('pong socket open', e );
    commandSocket('continue_game');
  };

  window.pongSocket.onclose = function(e) {
    console.error('pong socket closed ', e);
  };
  
}


function populateTournamentList(tournaments) {
  const tournamentList = document.getElementById('tournamentList');
  tournamentList.innerHTML = ''; // Listeyi temizle

  // Her turnuva için bir liste elemanı oluştur
  tournaments.forEach((tournament, index) => {
    const tournamentItem = document.createElement('li');
    tournamentItem.id = `tournamentItem-${tournament.tournament_id}`; // Benzersiz bir ID ver
    tournamentItem.classList.add('list-group-item');
    tournamentItem.textContent = `Tournament ID: ${tournament.tournament_id} - Player Count: ${tournament.player_count} - Status: ${tournament.status}`;

    // Eğer turnuva 'waiting' durumunda ise, katılma ve ayrılma butonlarını ekle
    if (tournament.status === 'waiting') {
      const joinButton = document.createElement('button');
      joinButton.textContent = 'Join';
      joinButton.classList.add('btn', 'btn-success', 'me-2');
      joinButton.id = `joinButton-${tournament.tournament_id}`; // Benzersiz bir ID ver
      joinButton.onclick = function() {
        commandSocket('join_tournament', tournament.tournament_id);
      };

      const leaveButton = document.createElement('button');
      leaveButton.textContent = 'Leave';
      leaveButton.classList.add('btn', 'btn-danger', 'me-2');
      leaveButton.id = `leaveButton-${tournament.tournament_id}`; // Benzersiz bir ID ver
      leaveButton.onclick = function() {
        commandSocket('leave_tournament', tournament.tournament_id);
      };

      tournamentItem.appendChild(joinButton);
      tournamentItem.appendChild(leaveButton);
    }

    tournamentList.appendChild(tournamentItem);
  });
}


// WebSocket üzerinden komut gönderme fonksiyonu
// function commandSocket(command, tournamentId, player1, player2) {
//   // WebSocket bağlantısı üzerinden komut gönderme işlemleri burada yapılacak
//   // Örneğin:
//   const data = {
//     type: command,
//     tournament_id: tournamentId,
//     player1: player1,
//     player2: player2
//   };
//   // socket.send(JSON.stringify(data));
// }





























export {openPongSocket, commandSocket};







