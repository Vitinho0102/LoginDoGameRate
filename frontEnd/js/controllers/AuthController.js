class AuthController {
    constructor(userModel, authView) {
        this.userModel = userModel;
        this.authView = authView;
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    // Setup event listeners for auth actions
    setupEventListeners() {
        // Login form submission
        this.authView.setupLoginForm((username, email, password, remember) => {
            this.login(username, email, password, remember);
        });
        
        // Register form submission
        this.authView.setupRegisterForm((username, email, password, termsAccepted) => {
            this.register(username, email, password, termsAccepted);
        });
        
        // Logout button
        this.authView.setupLogoutButton(() => {
            this.logout();
        });
    }
    
    // Login user
    login(username, email, password, remember) {
        console.log('🔐 Login attempt:', { username, email, remember });
        
        this.userModel.login(username, email, password, remember)
            .then(user => {
                // Update UI
                this.authView.updateAuthUI(true, user);
                
                // Show success message
                alert(`✅ Login bem-sucedido! Bem-vindo de volta, ${user.username}!`);
                
                // Close modal
                this.authView.closeModals();
                
                // Redirect to feed
                document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user } }));
            })
            .catch(error => {
                console.error('❌ Login error:', error.message);
                alert(`❌ Erro ao fazer login: ${error.message}`);
            });
    }
    
    // Register user
    register(username, email, password, termsAccepted) {
        console.log('📝 Registration attempt:', { username, email, termsAccepted });
        
        this.userModel.register(username, email, password, termsAccepted)
            .then(user => {
                // Update UI
                this.authView.updateAuthUI(true, user);
                
                // Show success message
                alert(`🎉 Conta criada com sucesso! Bem-vindo ao Game Rate, ${user.username}!\n\n📝 Lembre-se dos seus dados de login:\n• Email: ${user.email}\n• Nome de usuário: ${user.username}\n• Senha: (a que você acabou de criar)`);
                
                // Close modal
                this.authView.closeModals();
                
                // Dispatch event for successful registration
                document.dispatchEvent(new CustomEvent('userRegistered', { detail: { user } }));
            })
            .catch(error => {
                console.error('❌ Registration error:', error.message);
                alert(`❌ Erro ao criar conta: ${error.message}`);
            });
    }
    
    // Logout user
    logout() {
        try {
            this.userModel.logout();
            // Update UI
            this.authView.updateAuthUI(false);
            // Show success message
            alert('Logout realizado com sucesso!');
            // Dispatch event for successful logout
            document.dispatchEvent(new CustomEvent('userLoggedOut'));
        } catch (error) {
            alert(`Erro ao fazer logout: ${error.message}`);
        }
    }
    
    // Check if user is logged in
    isLoggedIn() {
        return this.userModel.isLoggedIn();
    }
    
    // Check login status (could be from previous session)
    checkLoginStatus() {
        const isLoggedIn = this.userModel.checkLoginStatus();
        
        // Update UI based on login status
        if (isLoggedIn) {
            const user = this.userModel.getCurrentUser();
            this.authView.updateAuthUI(true, user);
        } else {
            this.authView.updateAuthUI(false);
        }
        
        return isLoggedIn;
    }
    
    // Get current user
    getCurrentUser() {
        return this.userModel.getCurrentUser();
    }
}

export default AuthController; 