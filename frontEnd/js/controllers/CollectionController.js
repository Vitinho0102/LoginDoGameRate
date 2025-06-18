import SteamGameModel from '../models/SteamGameModel.js';

class CollectionController {
    constructor(userModel, gameModel, collectionView) {
        this.userModel = userModel;
        this.gameModel = gameModel;
        this.collectionView = collectionView;
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Listen for collection events
        document.addEventListener('addToCollection', (e) => {
            this.addToCollection(e.detail.gameId);
        });
        
        document.addEventListener('removeFromCollection', (e) => {
            this.removeFromCollection(e.detail.gameId);
        });
    }
    
    // Add game to collection
    addToCollection(gameId) {
        try {
            this.userModel.addToCollection(gameId);
            
            // Show success message
            const game = this.getGameById(gameId);
            const gameTitle = game ? game.title : 'Jogo';
            alert(`"${gameTitle}" foi adicionado à sua coleção! 💖`);
            
            // Dispatch event for collection updated
            document.dispatchEvent(new CustomEvent('collectionUpdated', {
                detail: { action: 'added', gameId }
            }));
            
        } catch (error) {
            if (error.message.includes('already in your collection')) {
                alert('Este jogo já está na sua coleção! 😊');
            } else {
                alert(`Erro ao adicionar à coleção: ${error.message}`);
            }
        }
    }
    
    // Remove game from collection
    removeFromCollection(gameId) {
        try {
            this.userModel.removeFromCollection(gameId);
            
            // Show success message
            const game = this.getGameById(gameId);
            const gameTitle = game ? game.title : 'Jogo';
            alert(`"${gameTitle}" foi removido da sua coleção! 💔`);
            
            // Dispatch event for collection updated
            document.dispatchEvent(new CustomEvent('collectionUpdated', {
                detail: { action: 'removed', gameId }
            }));
            
        } catch (error) {
            alert(`Erro ao remover da coleção: ${error.message}`);
        }
    }
    
    // Check if game is in collection
    isGameInCollection(gameId) {
        return this.userModel.isGameInCollection(gameId);
    }
    
    // Get user's collection games
    getCollectionGames() {
        const collectionGameIds = this.userModel.getUserCollection();
        const allGames = this.gameModel.getAllGamesIncludingSteam();
        
        // Filter games that are in the collection
        const collectionGames = allGames.filter(game => 
            collectionGameIds.includes(game.id)
        );
        
        console.log('📚 Collection games:', {
            collectionIds: collectionGameIds,
            foundGames: collectionGames.length,
            totalGames: allGames.length
        });
        
        return collectionGames;
    }
    
    // Get game by ID (helper method)
    getGameById(gameId) {
        // Try regular games first
        let game = this.gameModel.getGameById(gameId);
        
        // If not found, try Steam games
        if (!game) {
            game = SteamGameModel.getSteamGameById(gameId);
        }
        
        return game;
    }
    
    // Update collection display
    updateCollectionDisplay() {
        const collectionGames = this.getCollectionGames();
        this.collectionView.renderCollection(collectionGames);
        
        // Update stats
        const collectionSize = this.userModel.getCollectionSize();
        this.collectionView.updateCollectionStats(collectionSize);
    }
    
    // Get collection size
    getCollectionSize() {
        return this.userModel.getCollectionSize();
    }
}

export default CollectionController; 