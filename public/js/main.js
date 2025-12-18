// Landing page JavaScript - handles form submission and avatar selection

let selectedAvatar = 'star'; // Default avatar

// Avatar selection handler
document.addEventListener('DOMContentLoaded', () => {
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const form = document.getElementById('joinForm');

    // Handle avatar selection
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            avatarOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selected class to clicked option
            option.classList.add('selected');

            // Update selected avatar
            selectedAvatar = option.dataset.avatar;
        });
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const roomCode = document.getElementById('roomCode').value.trim().toLowerCase();

        // Validate inputs
        if (!username || !roomCode) {
            alert('Please fill in all fields! 💖');
            return;
        }

        if (username.length < 2) {
            alert('Username must be at least 2 characters! ✨');
            return;
        }

        if (roomCode.length < 3) {
            alert('Room code must be at least 3 characters! 🏠');
            return;
        }

        // Store user info in sessionStorage
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('roomCode', roomCode);
        sessionStorage.setItem('avatar', selectedAvatar);

        // Redirect to room page
        window.location.href = `/room.html?room=${encodeURIComponent(roomCode)}`;
    });

    // Add enter key support for inputs
    document.getElementById('username').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('roomCode').focus();
        }
    });
});
