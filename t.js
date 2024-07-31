function nextMatch(tournamentName, roundId) {
    const tournaments = getTournaments(); // Assuming this function retrieves current tournament data
    const tournament = tournaments[tournamentName];
    if (!tournament) {
      console.error('Tournament not found.');
      return;
    }
  
    const currentRound = `Round_${roundId}`;
    const matches = tournament.rounds[currentRound] || [];
    let waitingPlayer = tournament.waiting_player;
  
    // Start matches for the current round
    if (matches.length > 0) {
      // Show match details for each match
      matches.forEach(([player1, player2]) => {
        console.log(`Starting match: ${player1} vs ${player2}`);
        showMatchModal(tournamentName, player1, player2, currentRound);
      });
    } else {
      console.log('No matches available for this round.');
    }
  
    // Prepare for the next round
    const winners = []; // This should be populated based on the outcomes of the matches
    const nextRoundId = parseInt(roundId, 10) + 1;
    const nextRound = `Round_${nextRoundId}`;
  
    // Add waiting player to the next round if there is one
    if (waitingPlayer) {
      winners.push(waitingPlayer);
    }
  
    // Shuffle winners and create new matches for the next round
    const shuffledWinners = shuffleArray(winners);
    const newMatches = [];
    while (shuffledWinners.length > 1) {
      newMatches.push([shuffledWinners.pop(), shuffledWinners.pop()]);
    }
  
    // Add waiting players if needed
    if (shuffledWinners.length === 1 && waitingPlayer) {
      newMatches.push([shuffledWinners.pop(), waitingPlayer]);
    }
  
    // Update tournament rounds with new matches
    tournament.rounds[nextRound] = newMatches;
  
    console.log('New matches for next round:', newMatches);
  
    // If there are new matches, show match details
    if (newMatches.length > 0) {
      const [nextPlayer1, nextPlayer2] = newMatches[0]; // Start with the first match
      showMatchModal(tournamentName, nextPlayer1, nextPlayer2, nextRound);
    }
  }
  
  // Utility function to shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Placeholder function for fetching tournaments
  function getTournaments() {
    // Replace with actual code to retrieve tournament data
    return {};
  }
  

  function updateLobbyTournaments(tournaments) {
    const tournamentList = document.getElementById('tournamentList');
    if (!tournamentList) {
      return;
    }
    tournamentList.innerHTML = '';
  
    const username = getCookie('username');
  
    for (const [tournament, details] of Object.entries(tournaments)) {
      const startTimeUtc = new Date(details.start_time);
      const localStartTime = startTimeUtc.toLocaleString();
      const currentTime = new Date();
      const joinTime = startTimeUtc > currentTime;
      const userJoined = details.players.includes(username);
      const checkTime = startTimeUtc - currentTime;
  
      if (checkTime > 0) {
        setTimeout(() => {
          checkTimeFunction();
        }, checkTime);
      }
  
      const li = document.createElement('li');
      li.className = 'list-group-item';
  
      let playerListHtml = '';
      let roundsHtml = '';
  
      if (details.status === 'started') {
        if (Object.keys(details.rounds).length > 0) {
          const currentRound = Object.keys(details.rounds)[0];
          const currentMatches = details.rounds[currentRound];
  
          roundsHtml = `
            <h5>Rounds:</h5>
            <div>
              <h6>${currentRound}</h6>
              <ul>
                ${currentMatches.map(match => {
                  if (Array.isArray(match) && match.length === 2) {
                    return `<li>${match.join(' vs ')}</li>`;
                  }
                  return '';
                }).join('')}
              </ul>
            </div>
            <h5>Waiting Players:</h5>
            <ul>
              ${details.waiting_player ? `<li>${details.waiting_player}</li>` : '<li>No waiting player</li>'}
            </ul>
          `;
  
          // Automatically start the first match
          if (currentMatches.length > 0) {
            const [player1, player2] = currentMatches[0]; // Assuming the first match to start
            showMatchModal(tournament, player1, player2, currentRound);
          }
        } else {
          roundsHtml = '<p>No rounds available.</p>';
        }
      } else {
        playerListHtml = `
          <ul id="participantList">
            ${(details.players || []).map(name => `
              <li>
                ${name} 
                ${username === details.host && name !== details.host ? `<button class="btn btn-danger btn-sm float-right kickPlayerButton" data-tournament="${tournament}" data-player="${name}">X</button>` : ''}
              </li>
            `).join('')}
          </ul>
        `;
      }
  
      li.innerHTML = `
        <h4>${tournament} (Host: ${details.host})</h4>
        <h7>Start Time: ${localStartTime}</h7>
        ${roundsHtml}
        ${playerListHtml}
      `;
  
      if (joinTime && !userJoined) {
        li.innerHTML += `<button class="btn btn-primary joinTournamentButton" data-tournament="${tournament}">Join Tournament</button>`;
      }
      if (userJoined) {
        li.innerHTML += `<button class="btn btn-danger leaveTournamentButton" data-tournament="${tournament}">Leave Tournament</button>`;
      } else if (!joinTime) {
        li.innerHTML += '<h7>Join Time is Over</h7>';
      }
  
      if (!joinTime && username === details.host && details.status !== 'started') {
        const startButton = document.createElement('button');
        startButton.className = 'btn btn-success startTournamentButton';
        startButton.dataset.tournament = tournament;
        startButton.textContent = 'Start Tournament';
        startButton.addEventListener('click', () => {
          if (window.chatSocket) {
            window.chatSocket.send(JSON.stringify({
              'username': getCookie('username'),
              'room': tournament,
              'command': 'start',
            }));
          }
        });
        li.appendChild(startButton);
      }
  
      tournamentList.appendChild(li);
    }
  }
  