import  sendPostWithJwt from '../postwithjwt/sendPostWithJwt.js';
import drawWinLoseChart from './drawChart.js';
import changeContent from '../uimodule/changeContent.js';
export default function viewProfile(username) {
    changeContent('view_profile');
    console.log(`Viewing profile of ${username}`);
    sendPostWithJwt('api/user/view_profile/', { username }, 'POST')
      .then(response => {
        console.log('Profile viewed:', response);
  
        const profileContainer = document.getElementById('view-container');
        if (!profileContainer) {
          console.error('Profile container not found in the DOM.');
          return;
        }
  
        // Access profile fields directly from response
        const profile = response;
  
        profileContainer.innerHTML = `
          <div class="container mt-4">
            <div class="row">
              <div class="col-md-4 text-center">
                <div class="profile-picture-container">
                  <img src="${profile.profile_picture}" alt="${profile.username}" class="img-fluid rounded-circle" style="width: 150px; height: 150px; object-fit: cover;">
                </div>
              </div>
              <div class="col-md-8">
                <div class="profile-details">
                  <h4>${profile.username}</h4>
                  <p><strong>First Name:</strong> ${profile.first_name}</p>
                  <p><strong>Last Name:</strong> ${profile.last_name}</p>
                  <p><strong>Email:</strong> ${profile.email}</p>
                </div>
              </div>
            </div>
          </div>`;
  
        profileContainer.style.display = 'block';
        
        
    const url = 'api/user/get_match_history/';
    const bodyData = { username:profile.username  }; // Include username in the body
    const method = 'POST'; // Use GET method as defined in the Django view
  
    sendPostWithJwt(url, bodyData, method).then(matchHistory => {
     
  
      let wins = 0;
      let losses = 0;
  
      matchHistory.forEach(match => {
        if (match.winner_username === profile.username) { // Replace 'current_user' with the actual username
          wins++;
        } else {
          losses++;
        }
      });
  
      profileContainer.innerHTML += `
        <div>
          <h3 style="color: aqua;">Win-Lose Stats</h3>
          <canvas id="winLoseChart" width="800" height="600"></canvas>
        </div>
      `;
  
      drawWinLoseChart(wins, losses);
    }).catch(error => {
      console.error('An error occurred while fetching match history:', error);
    });
      })
      .catch(error => {
        console.error('An error occurred while viewing profile:', error);
      });
  
    
  }