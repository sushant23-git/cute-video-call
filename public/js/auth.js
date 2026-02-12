// Supabase Authentication Handler
// Initialize Supabase client with your project credentials

// NOTE: Replace these with your actual Supabase credentials
// Get them from: https://app.supabase.com -> Your Project -> Settings -> API
const SUPABASE_URL = 'https://cincnqzxicwpjxavyzrx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpbmNucXp4aWN3cGp4YXZ5enJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTM4MDAsImV4cCI6MjA4NjQ4OTgwMH0.h2iWMrbvQAZvTr10fZNtb43KjkwLDe8KQydVURRZKyA';


// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// UI Elements
let authSection, roomSection, signupTab, loginTab, signupForm, loginForm;
let userProfileSection, userNameDisplay, signOutBtn;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    initializeUIElements();
    setupEventListeners();

    // Check if user is already authenticated
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        showRoomSection(session.user);
    } else {
        showAuthSection();
    }

    // Listen for auth state changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && session) {
            showRoomSection(session.user);
        } else if (event === 'SIGNED_OUT') {
            showAuthSection();
        }
    });
});

// Initialize UI element references
function initializeUIElements() {
    authSection = document.getElementById('authSection');
    roomSection = document.getElementById('roomSection');
    signupTab = document.getElementById('signupTab');
    loginTab = document.getElementById('loginTab');
    signupForm = document.getElementById('signupForm');
    loginForm = document.getElementById('loginForm');
    userProfileSection = document.getElementById('userProfile');
    userNameDisplay = document.getElementById('userName');
    signOutBtn = document.getElementById('signOutBtn');
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    signupTab.addEventListener('click', () => switchTab('signup'));
    loginTab.addEventListener('click', () => switchTab('login'));

    // Form submissions
    signupForm.addEventListener('submit', handleSignup);
    loginForm.addEventListener('submit', handleLogin);

    // Sign out
    signOutBtn.addEventListener('click', handleSignOut);
}

// Switch between signup and login tabs
function switchTab(tab) {
    if (tab === 'signup') {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    } else {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    }
}

// Handle user signup
async function handleSignup(e) {
    e.preventDefault();

    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const username = document.getElementById('signupUsername').value.trim();
    const selectedAvatar = document.querySelector('.avatar-option.selected')?.dataset.avatar || 'star';

    // Validate inputs
    if (!email || !password || !username) {
        showError('Please fill in all fields! 💖');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters! 🔒');
        return;
    }

    if (username.length < 2) {
        showError('Username must be at least 2 characters! ✨');
        return;
    }

    try {
        // Show loading state
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account... ⏳';

        // Sign up with Supabase
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    avatar: selectedAvatar
                }
            }
        });

        if (error) throw error;

        // Check if email confirmation is required
        if (data.user && !data.session) {
            showSuccess('Account created! Please check your email to confirm. 📧');
            switchTab('login');
        } else {
            showSuccess('Account created successfully! 🎉');
        }

        signupForm.reset();
    } catch (error) {
        console.error('Signup error:', error);
        showError(error.message || 'Failed to create account. Please try again! 😢');
    } finally {
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign Up</span><span class="btn-emoji">🎉</span>';
    }
}

// Handle user login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showError('Please fill in all fields! 💖');
        return;
    }

    try {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in... ⏳';

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        showSuccess('Welcome back! 🎉');
        loginForm.reset();
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Failed to login. Please check your credentials! 😢');
    } finally {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Login</span><span class="btn-emoji">🚀</span>';
    }
}

// Handle sign out
async function handleSignOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        // Clear session storage
        sessionStorage.clear();

        showSuccess('Signed out successfully! 👋');
    } catch (error) {
        console.error('Sign out error:', error);
        showError('Failed to sign out. Please try again!');
    }
}

// Show authentication section
function showAuthSection() {
    authSection.style.display = 'block';
    roomSection.style.display = 'none';
    userProfileSection.style.display = 'none';
}

// Show room section (after authentication)
async function showRoomSection(user) {
    authSection.style.display = 'none';
    roomSection.style.display = 'block';
    userProfileSection.style.display = 'flex';

    // Fetch user profile from database
    try {
        const { data: profile, error } = await supabaseClient
            .from('user_profiles')
            .select('username, avatar')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        // Display user info
        const avatarEmojis = {
            cat: '🐱', bunny: '🐰', bear: '🐻',
            panda: '🐼', fox: '🦊', star: '⭐'
        };

        const username = profile?.username || user.user_metadata?.username || 'User';
        const avatar = profile?.avatar || user.user_metadata?.avatar || 'star';

        userNameDisplay.innerHTML = `${avatarEmojis[avatar]} ${username}`;

        // Store in session storage for room page
        sessionStorage.setItem('userId', user.id);
        sessionStorage.setItem('userEmail', user.email);
    } catch (error) {
        console.error('Error fetching profile:', error);
        userNameDisplay.textContent = user.email;
    }
}

// Show error message
function showError(message) {
    // Create or update error alert
    let alertDiv = document.querySelector('.alert-error');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-error';
        document.body.appendChild(alertDiv);
    }

    alertDiv.textContent = message;
    alertDiv.style.display = 'block';

    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 4000);
}

// Show success message
function showSuccess(message) {
    let alertDiv = document.querySelector('.alert-success');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success';
        document.body.appendChild(alertDiv);
    }

    alertDiv.textContent = message;
    alertDiv.style.display = 'block';

    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 4000);
}

// Get current user
async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

// Export for use in other scripts
window.supabaseClient = supabaseClient;
window.getCurrentUser = getCurrentUser;
