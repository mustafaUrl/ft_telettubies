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
    const contentProfile = document.getElementById('content-profile2');
    if (!contentProfile) {
      return;
    }
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

    contentProfile.innerHTML += `
      <div>
        <h3>Win-Lose Stats</h3>
        <canvas id="winLoseChart" width="800" height="600"></canvas>
      </div>
    `;

    drawWinLoseChart(wins, losses);
  }).catch(error => {
    console.error('An error occurred while fetching match history:', error);
  });
}

function drawWinLoseChart(wins, losses) {
  const canvas = document.getElementById('winLoseChart');
  const ctx = canvas.getContext('2d');

  const data = [wins, losses];
  const labels = ['Wins', 'Losses'];
  const colors = ['#B6FFFA', '#FFF67E'];

  const barWidth = 300;
  const barSpacing = 100;
  const chartHeight = canvas.height - 20;
  const maxDataValue = Math.max(...data);
  const scale = chartHeight / maxDataValue;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '20px Arial';

  data.forEach((value, index) => {
    const barHeight = value * scale;
    const x = index * (barWidth + barSpacing) + barSpacing;
    const y = canvas.height - barHeight;

    ctx.fillStyle = colors[index];
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 5);
    ctx.fillText(value, x + barWidth / 2, y - 5);
  });
}