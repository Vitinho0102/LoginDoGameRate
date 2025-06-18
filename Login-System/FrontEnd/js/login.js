document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Get button elements
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const heroLoginBtn = document.getElementById('hero-login-btn');
    const heroRegisterBtn = document.getElementById('hero-register-btn');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    
    // Get form elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Get page elements for navigation
    const homeContent = document.getElementById('home-content');
    const feedContent = document.getElementById('feed-content');
    const profileContent = document.getElementById('profile-content');
    const userProfile = document.querySelector('.user-profile');
    const navItems = document.querySelector('nav ul');
    const searchBar = document.querySelector('.search-bar');
    
    // Store current user information
    let currentUser = {
        username: '',
        email: '',
        profileImage: null
    };
    
    // Open login modal
    function openLoginModal() {
        loginModal.style.display = 'flex';
        registerModal.style.display = 'none';
    }
    
    // Open register modal
    function openRegisterModal() {
        registerModal.style.display = 'flex';
        loginModal.style.display = 'none';
    }
    
    // Close all modals
    function closeModals() {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    }
    
    // Update profile page with user info
    function updateProfilePage() {
        // Update username display
        const profileUsername = document.querySelector('.profile-info h2');
        if (profileUsername) {
            profileUsername.textContent = currentUser.username;
        }
        
        // Update profile avatar initial
        const profileAvatar = document.querySelector('.profile-avatar');
        const headerAvatar = document.querySelector('.user-profile');
        if (profileAvatar) {
            if (currentUser.profileImage) {
                // If user has set a profile image
                profileAvatar.innerHTML = `<img src="${currentUser.profileImage}" alt="${currentUser.username}" class="profile-avatar-img">`;
                if (headerAvatar) {
                    headerAvatar.innerHTML = `<img src="${currentUser.profileImage}" alt="${currentUser.username}" class="header-avatar-img">`;
                }
            } else {
                // Display initial of username
                const initial = currentUser.username.charAt(0).toUpperCase();
                profileAvatar.textContent = initial;
                if (headerAvatar) {
                    headerAvatar.textContent = initial;
                }
            }
        }
    }
    
    // Logout function
    function logout() {
        localStorage.removeItem("monet-token");
        updateLoginStatus(null);
        showPage("home");
    }
    
    // Show home page (initial state)
    function showHomePage() {
        homeContent.style.display = 'block';
        feedContent.style.display = 'none';
        profileContent.style.display = 'none';
        userProfile.style.display = 'none';
        navItems.style.display = 'none';
        searchBar.style.display = 'none';
    }
    
    // Show feed page after login
    function showFeedPage() {
        homeContent.style.display = 'none';
        feedContent.style.display = 'block';
        profileContent.style.display = 'none';
        userProfile.style.display = 'flex';
        navItems.style.display = 'flex';
        searchBar.style.display = 'block';
        
        // Make sure the home link is shown for navigation back to home
        document.getElementById('home-link').style.display = 'block';
        
        // Hide login and register buttons after successful login
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        
        // Show logout button
        logoutBtn.style.display = 'block';
        
        // Update profile information
        updateProfilePage();
    }
    
    // Event listeners for opening modals
    loginBtn.addEventListener('click', openLoginModal);
    registerBtn.addEventListener('click', openRegisterModal);
    heroLoginBtn.addEventListener('click', openLoginModal);
    heroRegisterBtn.addEventListener('click', openRegisterModal);
    
    // Event listener for logout
    logoutBtn.addEventListener('click', logout);
    
    // Event listeners for switching between modals
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        openRegisterModal();
    });
    
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        openLoginModal();
    });
    
    // Event listeners for closing modals
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeModals);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal || e.target === registerModal) {
            closeModals();
        }
    });
    
    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.elements["login-email"].value;
        const password = this.elements["login-password"].value;
        try {
            const data = await apiRequest("http://localhost:3000/api/login", "POST", {
                email,
                password,
            });
            localStorage.setItem("monet-token", data.token);
            updateLoginStatus(data.user.name);
            alert(data.message);
            this.reset();
            showPage("welcome-page");
        } catch (error) {}
    });
    
    // Handle register form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = this.elements["register-name"].value;
        const email = this.elements["register-email"].value;
        const password = this.elements["register-password"].value;
        const confirmPassword = this.elements["register-confirm-password"].value;

        if (password !== confirmPassword) {
            alert("As senhas não coincidem.");
            return;
        }

        try {
            const data = await apiRequest("http://localhost:3000/api/register", "POST", {
                name,
                email,
                password,
            });
            alert(data.message);
            this.reset();
            switchTab("login");
            document.getElementById("login-email").value = email;
        } catch (error) {}
    });
    
    // Social login buttons (para demo)
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert('Autenticação social não implementada nesta versão de demonstração.');
        });
    });
    
    // Expor currentUser globalmente para outros scripts
    window.currentUser = currentUser;
});

function updateLoginStatus(username) {
    const statusEl = document.getElementById("login-status");
    if (username) {
        statusEl.innerHTML = `Olá, ${username}! | <a href=\"#\" onclick=\"logout()\" style=\"color: #E8D5B7;\">Sair</a>`;
    } else {
        statusEl.textContent = "Visitante";
    }
}

// Função utilitária para requisições à API
async function apiRequest(endpoint, method, body) {
    const response = await fetch(endpoint, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro na requisição");
    }
    return response.json();
}

// Funções auxiliares de navegação (adapte conforme seu projeto)
function showPage(pageId) {
    // Exemplo: mostrar/ocultar seções
    document.querySelectorAll(".page-section").forEach(sec => sec.style.display = "none");
    const page = document.getElementById(pageId);
    if (page) page.style.display = "block";
}

function switchTab(tab) {
    // Exemplo: trocar abas entre login e registro
    if (tab === "login") {
        document.getElementById("login-modal").style.display = "flex";
        document.getElementById("register-modal").style.display = "none";
    } else {
        document.getElementById("login-modal").style.display = "none";
        document.getElementById("register-modal").style.display = "flex";
    }
} 