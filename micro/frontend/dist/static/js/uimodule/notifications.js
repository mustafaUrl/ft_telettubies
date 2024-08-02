import sendPostWithJwt from '../postwithjwt/sendPostWithJwt.js';

async function get_notifications() {
    const dropdown = document.getElementById('notificationDropdown');
    dropdown.classList.toggle('show');

    if (dropdown.classList.contains('show')) {
        try {
            const response = await sendPostWithJwt('api/user/invite_notifications/', {}, 'POST');
            const notificationContent = document.getElementById('notificationContent');
            notificationContent.innerHTML = ''; // Clear existing notifications

            if (response.invites && response.invites.length > 0) {
                response.invites.forEach(invite => {
                    const inviteElement = document.createElement('div');
                    inviteElement.className = 'dropdown-item';
                    inviteElement.innerHTML = `
                        <span>
                            <strong>Invite Code:</strong> ${invite.invite_code} <br>
                            <strong>Inviting User:</strong> ${invite.inviting}
                        </span>
                        <span class="delete-invite">&times;</span>
                    `;

                    // Add hover event listener to decrement notification count
                    inviteElement.addEventListener('mouseover', function() {
                        if (!inviteElement.dataset.decremented) {
                            const notificationCount = document.getElementById('notificationCount');
                            const newCount = Math.max(parseInt(notificationCount.textContent) - 1, 0);
                            notificationCount.textContent = newCount;
                            inviteElement.dataset.decremented = true; // Mark as decremented
                        }
                    });

                    inviteElement.querySelector('.delete-invite').addEventListener('click', async function() {
                        try {
                            const deleteResponse = await sendPostWithJwt('api/user/delete_invite/', { invite_code: invite.invite_code }, 'DELETE');
                            if (deleteResponse.success || deleteResponse.message === 'Invite deleted successfully.') {
                                inviteElement.remove(); // Remove the invite from the dropdown
                                // Optionally update the notification count
                                const notificationCount = document.getElementById('notificationCount');
                                const newCount = Math.max(parseInt(notificationCount.textContent) - 1, 0);
                                notificationCount.textContent = newCount;
                            } else {
                                console.error('Failed to delete invite:', deleteResponse.message);
                            }
                        } catch (error) {
                            console.error('An error occurred while deleting the invite:', error);
                        }
                    });
                    notificationContent.appendChild(inviteElement);
                });
            } else {
                notificationContent.innerHTML = '<p class="dropdown-item">No invites found for the user.</p>';
            }
        } catch (error) {
            console.error('An error occurred while retrieving invitation notifications:', error);
        }
    }
}

// Fetch notifications count
async function get_notifications_count() {
    try {
        const response = await sendPostWithJwt('api/user/invite_notifications/', {}, 'POST');
        const notificationCount = document.getElementById('notificationCount');
        if (response.invites && response.invites.length > 0) {
            notificationCount.textContent = response.invites.length;
        } else {
            notificationCount.textContent = '0';
        }
    } catch (error) {
        console.error('An error occurred while retrieving notifications count:', error);
    }
}

export { get_notifications, get_notifications_count };