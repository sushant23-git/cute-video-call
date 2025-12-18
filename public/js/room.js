// Room page JavaScript - WebRTC implementation

// Get user info from session storage
const username = sessionStorage.getItem('username');
const roomCode = sessionStorage.getItem('roomCode');
const avatar = sessionStorage.getItem('avatar');

// Redirect if no user info
if (!username || !roomCode || !avatar) {
    window.location.href = '/';
}

// Display room code
document.getElementById('roomCodeDisplay').textContent = roomCode;

// WebRTC configuration
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// State management
let localStream = null;
let socket = null;
let peers = new Map(); // Map of peer connections: peerId -> { pc, stream, username, avatar }
let isMicMuted = false;
let isCameraOff = false;

// Avatar emoji mapping
const avatarEmojis = {
    cat: '🐱',
    bunny: '🐰',
    bear: '🐻',
    panda: '🐼',
    fox: '🦊',
    star: '⭐'
};

// Avatar gradient classes
const avatarClasses = {
    cat: 'avatar-cat',
    bunny: 'avatar-bunny',
    bear: 'avatar-bear',
    panda: 'avatar-panda',
    fox: 'avatar-fox',
    star: 'avatar-star'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get local media stream
        await initLocalStream();

        // Connect to signaling server
        initSocket();

        // Setup control buttons
        setupControls();
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to access camera/microphone. Please check permissions! 📹🎤');
    }
});

// Initialize local media stream
async function initLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true
            }
        });

        // Add local video to UI
        addVideoElement(localStream, username, avatar, true);
    } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
    }
}

// Initialize Socket.IO connection
function initSocket() {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to signaling server');

        // Join the room
        socket.emit('join-room', {
            roomCode,
            username,
            avatar
        });
    });

    // Handle existing users in the room
    socket.on('existing-users', async (users) => {
        console.log('Existing users:', users);

        // Create peer connections for each existing user
        for (const user of users) {
            await createPeerConnection(user.id, user.username, user.avatar, true);
        }
    });

    // Handle new user joining
    socket.on('user-joined', async ({ id, username, avatar }) => {
        console.log('New user joined:', username);
        await createPeerConnection(id, username, avatar, false);
    });

    // Handle receiving offer
    socket.on('offer', async ({ offer, from, username, avatar }) => {
        console.log('Received offer from:', username);

        const peer = peers.get(from);
        if (peer) {
            await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peer.pc.createAnswer();
            await peer.pc.setLocalDescription(answer);

            socket.emit('answer', {
                answer,
                to: from
            });
        }
    });

    // Handle receiving answer
    socket.on('answer', async ({ answer, from }) => {
        console.log('Received answer from:', from);

        const peer = peers.get(from);
        if (peer) {
            await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    });

    // Handle ICE candidates
    socket.on('ice-candidate', async ({ candidate, from }) => {
        const peer = peers.get(from);
        if (peer && candidate) {
            await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    });

    // Handle user leaving
    socket.on('user-left', (userId) => {
        console.log('User left:', userId);
        removePeer(userId);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from signaling server');
    });
}

// Create peer connection
async function createPeerConnection(peerId, peerUsername, peerAvatar, shouldCreateOffer) {
    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks to peer connection
    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    });

    // Handle incoming stream
    pc.ontrack = (event) => {
        console.log('Received remote track from:', peerUsername);

        const peer = peers.get(peerId);
        if (peer) {
            peer.stream = event.streams[0];
            addVideoElement(event.streams[0], peerUsername, peerAvatar, false);
        }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                candidate: event.candidate,
                to: peerId
            });
        }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${peerUsername}:`, pc.connectionState);

        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
            removePeer(peerId);
        }
    };

    // Store peer connection
    peers.set(peerId, {
        pc,
        stream: null,
        username: peerUsername,
        avatar: peerAvatar
    });

    // Create and send offer if initiator
    if (shouldCreateOffer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('offer', {
            offer,
            to: peerId
        });
    }
}

// Add video element to UI
function addVideoElement(stream, displayUsername, displayAvatar, isLocal) {
    const videoContainer = document.getElementById('videoContainer');

    // Check if video already exists (for local video)
    const existingId = isLocal ? 'local-video' : `video-${stream.id}`;
    if (document.getElementById(existingId)) {
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'video-wrapper';
    wrapper.id = existingId;

    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    if (isLocal) {
        video.muted = true; // Mute local video to prevent echo
    }

    const info = document.createElement('div');
    info.className = 'video-info';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = `video-avatar ${avatarClasses[displayAvatar]}`;
    avatarDiv.textContent = avatarEmojis[displayAvatar];

    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'video-username';
    usernameSpan.textContent = displayUsername;

    info.appendChild(avatarDiv);
    info.appendChild(usernameSpan);

    if (isLocal) {
        const badge = document.createElement('span');
        badge.className = 'local-badge';
        badge.textContent = 'You';
        info.appendChild(badge);
    }

    wrapper.appendChild(video);
    wrapper.appendChild(info);
    videoContainer.appendChild(wrapper);
}

// Remove peer connection
function removePeer(peerId) {
    const peer = peers.get(peerId);
    if (peer) {
        // Close peer connection
        if (peer.pc) {
            peer.pc.close();
        }

        // Remove video element
        if (peer.stream) {
            const videoElement = document.getElementById(`video-${peer.stream.id}`);
            if (videoElement) {
                videoElement.remove();
            }
        }

        peers.delete(peerId);
    }
}

// Setup control buttons
function setupControls() {
    const toggleMicBtn = document.getElementById('toggleMic');
    const toggleCameraBtn = document.getElementById('toggleCamera');
    const leaveBtn = document.getElementById('leaveBtn');

    // Toggle microphone
    toggleMicBtn.addEventListener('click', () => {
        isMicMuted = !isMicMuted;

        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !isMicMuted;
        }

        if (isMicMuted) {
            toggleMicBtn.classList.add('muted');
            toggleMicBtn.querySelector('.control-icon').textContent = '🔇';
            toggleMicBtn.querySelector('.control-label').textContent = 'Mic Off';
        } else {
            toggleMicBtn.classList.remove('muted');
            toggleMicBtn.querySelector('.control-icon').textContent = '🎤';
            toggleMicBtn.querySelector('.control-label').textContent = 'Mic On';
        }
    });

    // Toggle camera
    toggleCameraBtn.addEventListener('click', () => {
        isCameraOff = !isCameraOff;

        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !isCameraOff;
        }

        if (isCameraOff) {
            toggleCameraBtn.classList.add('muted');
            toggleCameraBtn.querySelector('.control-icon').textContent = '📷';
            toggleCameraBtn.querySelector('.control-label').textContent = 'Camera Off';
        } else {
            toggleCameraBtn.classList.remove('muted');
            toggleCameraBtn.querySelector('.control-icon').textContent = '📹';
            toggleCameraBtn.querySelector('.control-label').textContent = 'Camera On';
        }
    });

    // Leave room
    leaveBtn.addEventListener('click', () => {
        leaveRoom();
    });
}

// Leave room and cleanup
function leaveRoom() {
    // Stop local stream
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    peers.forEach((peer, peerId) => {
        if (peer.pc) {
            peer.pc.close();
        }
    });
    peers.clear();

    // Notify server
    if (socket) {
        socket.emit('leave-room');
        socket.disconnect();
    }

    // Clear session storage
    sessionStorage.clear();

    // Redirect to home
    window.location.href = '/';
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    leaveRoom();
});
