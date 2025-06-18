import SteamGameModel from '../models/SteamGameModel.js';

class SteamGameController {
    constructor(steamGameModel, gameView) {
        this.steamGameModel = steamGameModel;
        this.gameView = gameView;
    }
    
    // Get all Steam games
    getAllSteamGames() {
        return this.steamGameModel.getAllSteamGames();
    }
    
    // Get a specific Steam game by ID
    getSteamGameById(id) {
        return this.steamGameModel.getSteamGameById(id);
    }
    
    // Add a new section to the games catalog for Steam games
    renderSteamGamesSection() {
        const steamGames = this.steamGameModel.getAllSteamGames();
        
        // This method would be implemented in the view
        if (this.gameView.renderSteamGamesSection) {
            this.gameView.renderSteamGamesSection(steamGames);
        } else {
            console.warn('GameView does not have renderSteamGamesSection method');
            // Fallback: use the regular renderGames method
            this.gameView.renderGames(steamGames);
        }
    }
}

export default SteamGameController; 