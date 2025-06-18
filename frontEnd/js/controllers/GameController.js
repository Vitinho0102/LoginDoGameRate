class GameController {
    constructor(gameModel, gameView) {
        this.gameModel = gameModel;
        this.gameView = gameView;
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    // Setup event listeners for the game view
    setupEventListeners() {
        // Add filter change listener
        this.gameView.addFilterChangeListener((filters) => {
            this.filterGames(filters);
        });
    }
    
    // Get all games
    getAllGames() {
        return this.gameModel.getAllGames();
    }
    
    // Get a specific game by ID
    getGameById(id) {
        return this.gameModel.getGameById(id);
    }
    
    // Filter games based on criteria
    filterGames(filters) {
        const filteredGames = this.gameModel.filterGames(filters);
        this.gameView.renderGames(filteredGames);
    }
    
    // Get popular games
    getPopularGames(limit = 4) {
        return this.gameModel.getPopularGames(limit);
    }
    
    // Get recommended games
    getRecommendedGames(limit = 5) {
        return this.gameModel.getRecommendedGames(limit);
    }
}

export default GameController; 