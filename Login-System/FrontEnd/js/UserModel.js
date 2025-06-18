class UserModel {
    constructor() {
        this.currentUser = null;
        this.listeners = [];
        this.API_URL = 'http://localhost:3000/api'; // URL do backend de autenticação
    }

    // Add event listener
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentUser));
    }

    // Register user
    async register(username, email, password, termsAccepted) {
        if (!termsAccepted) {
            throw new Error('Você precisa aceitar os termos de uso');
        }

        try {
            const response = await fetch(`${this.API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao registrar usuário');
            }

            // Auto-login after registration
            this.currentUser = {
                username: data.username,
                email: data.email,
                profileImage: data.profileImage,
                isLoggedIn: true,
                token: data.token
            };

            // Save token to localStorage for persistence
            localStorage.setItem('token', data.token);
            this.notifyListeners();
            return this.currentUser;
        } catch (error) {
            throw new Error(error.message || 'Erro ao registrar usuário');
        }
    }

    // Login user
    async login(username, email, password, remember) {
        if (!email || !password) {
            throw new Error('Email e senha são obrigatórios');
        }

        try {
            const response = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login');
            }

            this.currentUser = {
                username: data.username,
                email: data.email,
                profileImage: data.profileImage,
                isLoggedIn: true,
                token: data.token
            };

            // Save token to localStorage for persistence
            localStorage.setItem('token', data.token);
            this.notifyListeners();
            return this.currentUser;
        } catch (error) {
            throw new Error(error.message || 'Erro ao fazer login');
        }
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('token');
        this.notifyListeners();
    }

    // Check if user is logged in (could be from previous session)
    async checkLoginStatus() {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const response = await fetch(`${this.API_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                localStorage.removeItem('token');
                return false;
            }

            const data = await response.json();
            this.currentUser = {
                username: data.username,
                email: data.email,
                profileImage: data.profileImage,
                isLoggedIn: true,
                token
            };
            this.notifyListeners();
            return true;
        } catch (error) {
            console.error('Error checking login status:', error);
            localStorage.removeItem('token');
            return false;
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if email exists
    async emailExists(email) {
        try {
            const response = await fetch(`${this.API_URL}/check-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    }

    // Check if username exists
    async usernameExists(username) {
        try {
            const response = await fetch(`${this.API_URL}/check-username`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username })
            });

            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Error checking username:', error);
            return false;
        }
    }

    // Add game to user's collection
    async addToCollection(gameId) {
        if (!this.currentUser?.isLoggedIn) {
            throw new Error('User must be logged in to add games to collection');
        }

        try {
            const response = await fetch(`${this.API_URL}/collection/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({ gameId })
            });

            if (!response.ok) {
                throw new Error('Failed to add game to collection');
            }

            const data = await response.json();
            return data.collection;
        } catch (error) {
            throw new Error(error.message || 'Failed to add game to collection');
        }
    }

    // Remove game from user's collection
    async removeFromCollection(gameId) {
        if (!this.currentUser?.isLoggedIn) {
            throw new Error('User must be logged in to remove games from collection');
        }

        try {
            const response = await fetch(`${this.API_URL}/collection/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({ gameId })
            });

            if (!response.ok) {
                throw new Error('Failed to remove game from collection');
            }

            const data = await response.json();
            return data.collection;
        } catch (error) {
            throw new Error(error.message || 'Failed to remove game from collection');
        }
    }

    // Check if game is in user's collection
    async isGameInCollection(gameId) {
        if (!this.currentUser?.isLoggedIn) {
            return false;
        }

        try {
            const response = await fetch(`${this.API_URL}/collection/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({ gameId })
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return data.isInCollection;
        } catch (error) {
            console.error('Error checking collection:', error);
            return false;
        }
    }

    // Get user's collection
    async getUserCollection() {
        if (!this.currentUser?.isLoggedIn) {
            return [];
        }

        try {
            const response = await fetch(`${this.API_URL}/collection`, {
                headers: {
                    'Authorization': `Bearer ${this.currentUser.token}`
                }
            });

            if (!response.ok) {
                return [];
            }

            const data = await response.json();
            return data.collection || [];
        } catch (error) {
            console.error('Error getting collection:', error);
            return [];
        }
    }

    // Get collection size
    async getCollectionSize() {
        const collection = await this.getUserCollection();
        return collection.length;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Export as singleton
export default new UserModel(); 
