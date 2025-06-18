import SteamGameModel from './SteamGameModel.js';

class GameModel {
    constructor() {
        this.games = [];
        this.listeners = [];
        
        // Load initial game data
        this.loadGames();
    }
    
    // Add a listener for game data changes
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    // Notify all observers of changes
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.games));
    }
    
    // Load game data - now only loads from Steam games
    loadGames() {
        // Initialize empty games array - we'll only use Steam games
        this.games = [];
        
        // Try to load from localStorage if available
        const savedGames = localStorage.getItem('games');
        if (savedGames) {
            try {
                const parsedGames = JSON.parse(savedGames);
                // Only keep Steam games from saved data
                this.games = parsedGames.filter(game => game.isSteamGame);
            } catch (e) {
                console.error('Error loading saved games:', e);
            }
        }
        
        this.notifyListeners();
    }
    
    // Get all games (including Steam games)
    getAllGames() {
        return this.games;
    }
    
    // Get all games including Steam games
    getAllGamesIncludingSteam() {
        const steamGames = SteamGameModel.getAllSteamGames();
        console.log('🎮 GameModel.getAllGamesIncludingSteam() called');
        console.log('🎮 Getting all games including Steam:', {
            localGames: this.games.length,
            steamGames: steamGames.length,
            totalGames: this.games.length + steamGames.length
        });
        console.log('🎮 Steam games details:', steamGames.slice(0, 3)); // Show first 3 games
        return [...this.games, ...steamGames];
    }
    
    // Get a specific game by ID
    getGameById(id) {
        // First check local games
        let game = this.games.find(g => g.id === id);
        
        // If not found, check Steam games
        if (!game) {
            const steamGames = SteamGameModel.getAllSteamGames();
            game = steamGames.find(g => g.id === id);
        }
        
        return game;
    }
    
    // Add a new game
    addGame(game) {
        this.games.push(game);
        this.saveToLocalStorage();
        this.notifyListeners();
    }
    
    // Update an existing game
    updateGame(gameId, updatedGame) {
        const index = this.games.findIndex(g => g.id === gameId);
        if (index !== -1) {
            this.games[index] = { ...this.games[index], ...updatedGame };
            this.saveToLocalStorage();
            this.notifyListeners();
        }
    }
    
    // Delete a game
    deleteGame(gameId) {
        this.games = this.games.filter(g => g.id !== gameId);
        this.saveToLocalStorage();
        this.notifyListeners();
    }
    
    // Save games to localStorage
    saveToLocalStorage() {
        localStorage.setItem('games', JSON.stringify(this.games));
    }
    
    // Filter games by criteria (including Steam games)
    filterGames(filters) {
        let filteredGames = this.getAllGamesIncludingSteam();
        
        if (filters.platform) {
            filteredGames = filteredGames.filter(game => 
                game.platform.toLowerCase().includes(filters.platform.toLowerCase()));
        }
        
        if (filters.genre) {
            filteredGames = filteredGames.filter(game => 
                game.genre.toLowerCase().includes(filters.genre.toLowerCase()));
        }
        
        if (filters.search) {
            filteredGames = filteredGames.filter(game => 
                game.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                game.description.toLowerCase().includes(filters.search.toLowerCase()));
        }
        
        // Sort games
        if (filters.sort) {
            switch(filters.sort) {
                case 'rating':
                    filteredGames.sort((a, b) => b.rating - a.rating);
                    break;
                case 'rating-asc':
                    filteredGames.sort((a, b) => a.rating - b.rating);
                    break;
                case 'name':
                    filteredGames.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'name-desc':
                    filteredGames.sort((a, b) => b.title.localeCompare(a.title));
                    break;
                default:
                    break;
            }
        }
        
        return filteredGames;
    }
    
    // Get popular games (top rated) - now from Steam games
    getPopularGames(limit = 4) {
        const allGames = this.getAllGamesIncludingSteam();
        return allGames
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }
    
    // Get recommended games - now from Steam games
    getRecommendedGames(limit = 5) {
        const allGames = this.getAllGamesIncludingSteam();
        return allGames
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }
}

// Create a singleton instance
const gameModel = new GameModel();

export default gameModel; 
