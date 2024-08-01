import sendPostWithJwt from '../../postwithjwt/sendPostWithJwt.js';

export default function historylistener() {
    console.log('match history javascript');
    try {
        const url = 'api/user/get_match_history';
        const bodyData = {}; // Any required data for the POST request, if needed
        const method = 'GET'; // Use GET method as defined in the Django view

        sendPostWithJwt(url, bodyData, method).then(matchHistory => {
            console.log(matchHistory);
            const contentProfile = document.getElementById('content-profile');
            let tableHTML = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Game Mode</th>
                            <th>Tournament Name</th>
                            <th>Round</th>
                            <th>Player 1</th>
                            <th>Player 2</th>
                            <th>Player 1 Score</th>
                            <th>Player 2 Score</th>
                            <th>Winner</th>
                            <th>Start Time</th>
                            <th>Finish Time</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            matchHistory.forEach(match => {
                tableHTML += `
                    <tr>
                        <td>${match.game_mode}</td>
                        <td>${match.tournament_name || 'N/A'}</td>
                        <td>${match.round || 'N/A'}</td>
                        <td>${match.player1_username}</td>
                        <td>${match.player2_username}</td>
                        <td>${match.player1_score}</td>
                        <td>${match.player2_score}</td>
                        <td>${match.winner_username || 'N/A'}</td>
                        <td>${new Date(match.match_start_time).toLocaleString()}</td>
                        <td>${new Date(match.match_finish_time).toLocaleString()}</td>
                    </tr>
                `;
            });

            tableHTML += `
                    </tbody>
                </table>
            `;

            contentProfile.innerHTML = tableHTML;
        }).catch(error => {
            console.error('An error occurred while fetching match history:', error);
        });
    } catch (error) {
        console.error('An error occurred while fetching match history:', error);
    }
}
