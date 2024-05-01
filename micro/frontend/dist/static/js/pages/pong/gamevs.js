// Assume you have a WebSocket connection established and it's called 'socket'

import  {getCookie}  from '../../cookies/cookies.js';
  
import * as THREE from "three";

// Define global variables for the WebSocket connection and get the opponent from backend

let pongSocket = null;
let opponent = null;
let username = getCookie('username');
let opponentUsername = getCookie('opponentUsername');
//get the gameID from the backend
let gameID = getCookie('gameID');
let game_state = null;
let ball_position = null;
let paddle_position = null;
let opponent_paddle_position = null;
let score = null;
let opponent_score = null;


// Function to open a WebSocket connection

function openSocket() {
  pongSocket = new WebSocket('ws://localhost:8000/ws/pong/' + gameID + '/');
  pongSocket.onopen = function () {
    console.log('WebSocket connection established');
    joinGame(opponentUsername);
  };
  pongSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    if (data.action === 'start') {
      console.log('Game started');
      startGame(opponentUsername);
    }
  };
}

function send_message(message) {
  pongSocket.send(JSON.stringify(message));
}

//function to receive updates from the server
function receive_message() {
  pongSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
  };
}

export default function pongVS(){

  document.getElementById('startButton').addEventListener('click', function(event){
  
    openSocket();
    console.log('start button clicked');
       
  });
  }