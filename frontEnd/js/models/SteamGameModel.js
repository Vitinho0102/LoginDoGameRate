class SteamGameModel {
    constructor() {
        this.steamGames = [];
        this.listeners = [];
        this.isLoading = false;
        this.isLoaded = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.retryDelay = 2000; // 2 seconds
        
        // Load Steam games when the model is instantiated
        this.loadSteamGames();
    }
    
    // Add a listener for Steam game data changes
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    // Notify all observers of changes
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.steamGames));
    }
    
    // Load Steam games from the database
    async loadSteamGames() {
        if (this.isLoading) {
            console.log('🔄 Steam games already loading...');
            return;
        }
        
        this.isLoading = true;
        this.isLoaded = false;
        console.log('🎮 Starting to load Steam games...');
        
        const STEAM_GAMES_API_URL = 'http://localhost:3001/api/steam-games';
        
        try {
            // Fetch games from the database API endpoint
            console.log('📡 Fetching from', STEAM_GAMES_API_URL);
            
            const response = await fetch(STEAM_GAMES_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors' // Explicitly set CORS mode
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('📡 Response error text:', errorText);
                throw new Error(`Failed to fetch Steam games: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            const games = await response.json();
            console.log('📦 Raw games data received:', games);
            console.log('📦 Number of games received:', games.length);
            
            if (!Array.isArray(games)) {
                throw new Error('Invalid response format: expected array');
            }
            
            // Transform the data to match our game model format
            this.steamGames = games.map(game => ({
                id: `steam_${game.id}`, // Prefix with 'steam_' to avoid ID conflicts
                steamId: game.id, // Keep original Steam ID
                title: game.name,
                platform: 'PC (Steam)',
                genre: this.getGenreFromName(game.name), // Try to determine genre from name
                description: `${game.name} - Disponível na Steam`,
                rating: this.generateRatingFromName(game.name), // Generate rating based on game name
                imageUrl: game.image || 'https://placehold.co/300x200?text=Steam+Game',
                price: game.price / 100, // Convert from cents to currency
                reviews: [],
                isSteamGame: true // Flag to identify Steam games
            }));
            
            console.log('🎯 Transformed Steam games:', this.steamGames);
            console.log('🎯 Number of transformed games:', this.steamGames.length);
            
            this.isLoaded = true;
            this.retryCount = 0; // Reset retry count on success
            
            // Notify listeners about the new data
            this.notifyListeners();
            console.log('✅ Steam games loaded successfully:', this.steamGames.length);
            
        } catch (error) {
            console.error('❌ Error loading Steam games:', error);
            console.error('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Check if it's a network error
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error('❌ Network error - is the API server running on port 3000?');
                this.showUserFriendlyError('🌐 Não foi possível conectar com o servidor de jogos da Steam. Verificando conexão...');
                
                // Attempt retry for network errors
                if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    console.log(`🔄 Attempting retry ${this.retryCount}/${this.maxRetries} in ${this.retryDelay}ms...`);
                    setTimeout(() => {
                        this.loadSteamGames();
                    }, this.retryDelay);
                    return; // Don't initialize fallback data yet
                }
                
            } else if (error.message.includes('Failed to fetch Steam games')) {
                this.showUserFriendlyError('📡 A API da Steam está temporariamente indisponível. Usando dados locais...');
            } else {
                this.showUserFriendlyError('⚠️ Houve um problema ao carregar os jogos da Steam. O site funcionará com dados limitados.');
            }
            
            // Reset retry count after max attempts or non-network errors
            this.retryCount = 0;
            
            // Initialize fallback data if API fails
            this.steamGames = this.getFallbackSteamGames();
            this.isLoaded = false; // Mark as not fully loaded
            this.notifyListeners();
        } finally {
            this.isLoading = false;
        }
    }
    
    // Manual retry method for user-initiated retries
    retryLoadSteamGames() {
        this.retryCount = 0; // Reset retry count for manual retries
        this.steamGames = []; // Clear current data
        this.isLoaded = false;
        this.loadSteamGames();
    }
    
    // Show user-friendly error messages
    showUserFriendlyError(message) {
        // Create a subtle notification for the user
        const notification = document.createElement('div');
        notification.className = 'steam-api-notification';
        
        const showRetryButton = this.retryCount >= this.maxRetries || !this.isLoading;
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">ℹ️</span>
                <span class="notification-message">${message}</span>
                ${showRetryButton ? '<button class="notification-retry" onclick="steamGameModel.retryLoadSteamGames(); this.parentElement.parentElement.remove();">Tentar Novamente</button>' : ''}
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add notification styles if not already present
        if (!document.querySelector('#steam-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'steam-notification-styles';
            styles.textContent = `
                .steam-api-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
                    color: #f1f1f1;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    z-index: 1000;
                    max-width: 400px;
                    border-left: 4px solid #8c52ff;
                    animation: slideInFromRight 0.3s ease-out;
                }
                
                @keyframes slideInFromRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .notification-message {
                    flex: 1;
                    font-size: 14px;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: #ccc;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .notification-close:hover {
                    color: #8c52ff;
                }
                
                .notification-retry {
                    background: #8c52ff;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    font-size: 12px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin-right: 10px;
                    transition: background-color 0.3s;
                }
                
                .notification-retry:hover {
                    background: #7a47e6;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.steam-api-notification');
        existingNotifications.forEach(notif => notif.remove());
        
        // Add new notification
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Provide fallback Steam games data when API is unavailable
    getFallbackSteamGames() {
        return [
            {
                id: 'steam_fallback_1',
                steamId: 'offline_1',
                title: 'Dados da Steam Indisponíveis',
                platform: 'PC (Steam)',
                genre: 'Informação',
                description: 'A conexão com a Steam está temporariamente indisponível. Tente novamente mais tarde.',
                rating: 0,
                imageUrl: 'https://placehold.co/300x200?text=Steam+Offline',
                price: 0,
                reviews: [],
                isSteamGame: true,
                isOfflinePlaceholder: true
            }
        ];
    }
    
    // Try to determine genre from game name (basic heuristic)
    getGenreFromName(name) {
        const lowerName = name.toLowerCase();
        
        if (lowerName.includes('ring') || lowerName.includes('souls') || lowerName.includes('rpg')) {
            return 'RPG, Ação, Mundo Aberto';
        } else if (lowerName.includes('cyberpunk') || lowerName.includes('sci-fi')) {
            return 'RPG, Ação, Mundo Aberto, Sci-Fi';
        } else if (lowerName.includes('knight') || lowerName.includes('hollow')) {
            return 'Metroidvania, Ação, Aventura, Indie';
        } else if (lowerName.includes('war') || lowerName.includes('god')) {
            return 'Ação, Aventura';
        } else if (lowerName.includes('gate') || lowerName.includes('baldur')) {
            return 'RPG, Estratégia, Fantasia';
        } else if (lowerName.includes('witcher')) {
            return 'RPG, Ação, Mundo Aberto';
        } else if (lowerName.includes('hades')) {
            return 'Roguelike, Ação, Indie';
        }
        
        return 'Ação, Aventura'; // Default genre
    }
    
    // Generate a rating based on game name (basic heuristic for popular games)
    generateRatingFromName(name) {
        const lowerName = name.toLowerCase();
        
        // High-rated games
        if (lowerName.includes('elden ring') || lowerName.includes('baldur')) {
            return 9.6;
        } else if (lowerName.includes('witcher') || lowerName.includes('hades')) {
            return 9.5;
        } else if (lowerName.includes('god of war') || lowerName.includes('hollow knight')) {
            return 9.4;
        } else if (lowerName.includes('cyberpunk')) {
            return 8.5;
        }
        
        // Default rating for other games
        return 8.0;
    }
    
    // Get all Steam games
    getAllSteamGames() {
        console.log('🎮 SteamGameModel.getAllSteamGames() called');
        console.log('🎮 Current steamGames array:', this.steamGames);
        console.log('🎮 steamGames length:', this.steamGames.length);
        console.log('🎮 isLoaded:', this.isLoaded);
        console.log('🎮 isLoading:', this.isLoading);
        return this.steamGames;
    }
    
    // Get a specific Steam game by ID
    getSteamGameById(id) {
        console.log('🔍 Looking for Steam game with ID:', id);
        console.log('🔍 Available Steam games:', this.steamGames.map(g => ({ id: g.id, steamId: g.steamId, title: g.title })));
        
        // Try exact match first
        let game = this.steamGames.find(game => game.id === id || game.steamId === id);
        
        // If not found and id is a string, try different formats
        if (!game && typeof id === 'string') {
            // Try with steam_ prefix if not present
            if (!id.startsWith('steam_')) {
                game = this.steamGames.find(game => game.id === `steam_${id}` || game.steamId === id);
            }
            // Try without steam_ prefix if present
            else {
                const numericId = id.replace('steam_', '');
                game = this.steamGames.find(game => game.steamId === numericId || game.steamId === parseInt(numericId));
            }
        }
        
        // If not found and id is a number, try string conversion
        if (!game && typeof id === 'number') {
            const stringId = id.toString();
            game = this.steamGames.find(game => 
                game.id === `steam_${stringId}` || 
                game.steamId === stringId || 
                game.steamId === id
            );
        }
        
        console.log('🔍 Steam game lookup result:', game ? `Found: ${game.title}` : 'Not found');
        return game;
    }
    
    // Get top-rated Steam games
    getTopSteamGames(limit = 5) {
        return [...this.steamGames]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }
    
    // Check if Steam games are loaded
    isGamesLoaded() {
        return this.isLoaded;
    }
    
    // Check if Steam games are currently loading
    isGamesLoading() {
        return this.isLoading;
    }
}

// Create a singleton instance
const steamGameModel = new SteamGameModel();

export default steamGameModel; 