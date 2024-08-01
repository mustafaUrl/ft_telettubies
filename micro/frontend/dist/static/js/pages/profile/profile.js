import changeContent from '../../uimodule/changeContent.js';
import profileTrigger from './profileTrigger.js';
import sendPostWithJwt from '../../postwithjwt/sendPostWithJwt.js';
import { getCookie } from '../../cookies/cookies.js';

export default function profile() {
  console.log('profile javascript');

  const dynamicLinks = document.querySelectorAll('.dynamic-profile');
  dynamicLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const contentId = this.id.replace('-link', '');
      changeContent(contentId);
      profileTrigger(contentId);
    });
  });

  // Fetch match history and calculate win-lose stats
  const url = 'api/user/get_match_history';
  const bodyData = {}; // Any required data for the POST request, if needed
  const method = 'GET'; // Use GET method as defined in the Django view

  sendPostWithJwt(url, bodyData, method).then(matchHistory => {
    console.log(matchHistory);

    let wins = 0;
    let losses = 0;

    matchHistory.forEach(match => {
      if (match.winner_username === getCookie('username')) { // Replace 'current_user' with the actual username
        wins++;
      } else {
        losses++;
      }
    });

    const winLoseStats = `
      <div>
        <h3>Win-Lose Stats</h3>
        <p>Wins: ${wins}</p>
        <p>Losses: ${losses}</p>
      </div>
    `;

    const contentProfile = document.getElementById('content-profile2');
    contentProfile.innerHTML += winLoseStats;
  }).catch(error => {
    console.error('An error occurred while fetching match history:', error);
  });
}