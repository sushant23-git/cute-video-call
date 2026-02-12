// Landing page JavaScript - handles room form submission and avatar selection

let selectedAvatar = 'star'; // Default avatar

// Wait for auth.js to be ready
document.addEventListener('DOMContentLoaded', () => {
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const joinForm = document.getElementById('joinForm');

    // Handle avatar selection (for signup form)
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options in the same container
            const container = option.closest('.avatar-selector');
            container.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));

            // Add selected class to clicked option
            option.classList.add('selected');

            // Update selected avatar
            selectedAvatar = option.dataset.avatar;
        });
    });

    // Handle room join form submission (shown after authentication)
    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const roomCode = document.getElementById('roomCode').value.trim().toLowerCase();

            // Validate room code
            if (!roomCode) {
                alert('Please enter a room code! 🏠');
                return;
            }

            if (roomCode.length < 3) {
                alert('Room code must be at least 3 characters! 🏠');
                return;
            }

            try {
                // Get authenticated user
                const user = await window.getCurrentUser();

                if (!user) {
                    alert('Please login first! 🔒');
                    return;
                }

                // Get user profile from database
                const { data: profile, error } = await window.supabaseClient
                    .from('user_profiles')
                    .select('username, avatar')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching profile:', error);
                }

                const username = profile?.username || user.user_metadata?.username || 'User';
                const avatar = profile?.avatar || user.user_metadata?.avatar || 'star';

                // Store user info and room code in sessionStorage
                sessionStorage.setItem('userId', user.id);
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('roomCode', roomCode);
                sessionStorage.setItem('avatar', avatar);

                // Create or get room in database
                const { data: room, error: roomError } = await window.supabaseClient
                    .from('rooms')
                    .select('id')
                    .eq('code', roomCode)
                    .maybeSingle();

                let roomId;

                if (!room) {
                    // Create new room
                    const { data: newRoom, error: createError } = await window.supabaseClient
                        .from('rooms')
                        .insert([
                            { code: roomCode, created_by: user.id, is_active: true }
                        ])
                        .select()
                        .single();

                    if (createError) {
                        console.error('Error creating room:', createError);
                        alert('Failed to create room. Please try again! 😢');
                        return;
                    }

                    roomId = newRoom.id;
                } else {
                    roomId = room.id;
                }

                // Store room ID
                sessionStorage.setItem('roomId', roomId);

                // Redirect to room page
                window.location.href = `/room.html?room=${encodeURIComponent(roomCode)}`;
            } catch (error) {
                console.error('Error joining room:', error);
                alert('Failed to join room. Please try again! 😢');
            }
        });
    }

    // Add enter key support for room code input
    const roomCodeInput = document.getElementById('roomCode');
    if (roomCodeInput) {
        roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinForm.dispatchEvent(new Event('submit'));
            }
        });
    }
});
