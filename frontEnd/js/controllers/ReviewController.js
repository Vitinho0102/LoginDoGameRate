import SteamGameModel from '../models/SteamGameModel.js';

class ReviewController {
    constructor(reviewModel, gameModel, userModel, reviewModalView) {
        this.reviewModel = reviewModel;
        this.gameModel = gameModel;
        this.userModel = userModel;
        this.reviewModalView = reviewModalView;
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    // Setup event listeners for the review modal
    setupEventListeners() {
        // Set up the submit button in the review modal
        this.reviewModalView.setupSubmitButton((reviewData) => {
            this.submitReview(reviewData);
        });
    }
    
    // Show the review modal for a specific game
    showReviewModal(gameId) {
        // Check if user is logged in
        if (!this.userModel.isLoggedIn()) {
            alert('Você precisa estar logado para avaliar um jogo.');
            return;
        }
        
        console.log('🎮 Looking for game with ID:', gameId, 'Type:', typeof gameId);
        
        // Get the game data (check both regular games and Steam games)
        let game = this.gameModel.getGameById(gameId);
        
        // If not found in regular games, check Steam games with various ID formats
        if (!game) {
            // Try direct lookup in Steam games
            game = SteamGameModel.getSteamGameById(gameId);
            
            // If still not found and it's a string that starts with 'steam_', try without prefix
            if (!game && typeof gameId === 'string' && gameId.startsWith('steam_')) {
                const numericId = gameId.replace('steam_', '');
                game = SteamGameModel.getSteamGameById(numericId);
            }
            
            // If still not found and it's a number or numeric string, try with steam_ prefix
            if (!game && (typeof gameId === 'number' || !isNaN(gameId))) {
                game = SteamGameModel.getSteamGameById(`steam_${gameId}`);
            }
        }
        
        console.log('🔍 Game lookup result:', game ? `Found: ${game.title} (ID: ${game.id})` : 'Not found');
        
        if (!game) {
            alert('Jogo não encontrado!');
            console.error('Game not found with ID:', gameId);
            console.error('Available Steam games:', SteamGameModel.getAllSteamGames().map(g => ({ id: g.id, steamId: g.steamId, title: g.title })));
            return;
        }
        
        // Check if user has already reviewed this game
        const existingReview = this.reviewModel.getUserReviewForGame(game.id);
        
        // Show the review modal
        this.reviewModalView.show(game, existingReview);
    }
    
    // Show the edit review modal for a specific review
    showEditReviewModal(reviewId) {
        // Check if user is logged in
        if (!this.userModel.isLoggedIn()) {
            alert('Você precisa estar logado para editar uma avaliação.');
            return;
        }
        
        // Get the review data
        const review = this.reviewModel.getAllReviews().find(r => r.id === reviewId);
        
        if (!review) {
            alert('Avaliação não encontrada!');
            return;
        }
        
        // Check if the review belongs to the current user
        const currentUser = this.userModel.getCurrentUser();
        if (review.userId !== currentUser.email) {
            alert('Você só pode editar suas próprias avaliações.');
            return;
        }
        
        // Check if Steam games are loaded (if it's a Steam game)
        if (review.gameId.toString().startsWith('steam_') && !SteamGameModel.isGamesLoaded()) {
            alert('Os jogos da Steam ainda estão carregando. Tente novamente em alguns segundos.');
            console.log('⏳ Steam games not loaded yet, waiting...');
            return;
        }
        
        // Get the game data - improved lookup logic
        let game = null;
        
        // First, try to find in regular games
        game = this.gameModel.getGameById(review.gameId);
        
        // If not found and it's a Steam game ID, try Steam games
        if (!game && review.gameId.toString().startsWith('steam_')) {
            game = SteamGameModel.getSteamGameById(review.gameId);
        }
        
        // If still not found, try without steam_ prefix (fallback)
        if (!game && review.gameId.toString().startsWith('steam_')) {
            const numericId = review.gameId.replace('steam_', '');
            game = SteamGameModel.getSteamGameById(numericId);
        }
        
        // If still not found, try adding steam_ prefix (another fallback)
        if (!game && !review.gameId.toString().startsWith('steam_')) {
            game = SteamGameModel.getSteamGameById(`steam_${review.gameId}`);
        }
        
        console.log('🔍 Game lookup for edit:', {
            reviewId,
            gameId: review.gameId,
            gameFound: !!game,
            gameTitle: game?.title,
            steamGamesLoaded: SteamGameModel.isGamesLoaded(),
            totalSteamGames: SteamGameModel.getAllSteamGames().length
        });
        
        if (!game) {
            alert('Jogo não encontrado! ID do jogo: ' + review.gameId);
            console.error('Game not found for review:', review);
            console.error('Available Steam games:', SteamGameModel.getAllSteamGames().map(g => ({ id: g.id, title: g.title })));
            return;
        }
        
        // Show the edit review modal
        this.reviewModalView.showEditModal(game, review);
    }
    
    // Submit a review
    submitReview(reviewData) {
        try {
            // Check if this is a new review or an update
            if (reviewData.reviewId) {
                // Update existing review
                const updatedReview = this.reviewModel.updateReview(
                    reviewData.reviewId,
                    reviewData.rating,
                    reviewData.reviewText
                );
                
                // Show success message
                alert('Sua avaliação foi atualizada com sucesso!');
                
                // Dispatch event for updated review
                document.dispatchEvent(new CustomEvent('reviewUpdated', {
                    detail: { review: updatedReview }
                }));
            } else {
                // Add new review
                const newReview = this.reviewModel.addReview(
                    reviewData.gameId,
                    reviewData.rating,
                    reviewData.reviewText
                );
                
                // Show success message
                alert('Sua avaliação foi enviada com sucesso! Obrigado por contribuir.');
                
                // Dispatch event for new review
                document.dispatchEvent(new CustomEvent('reviewAdded', {
                    detail: { review: newReview }
                }));
            }
        } catch (error) {
            alert(`Erro ao enviar avaliação: ${error.message}`);
        }
    }
    
    // Delete a review
    deleteReview(reviewId) {
        try {
            const deleted = this.reviewModel.deleteReview(reviewId);
            
            if (deleted) {
                // Show success message
                alert('Avaliação excluída com sucesso!');
                
                // Dispatch event for deleted review
                document.dispatchEvent(new CustomEvent('reviewDeleted', {
                    detail: { reviewId }
                }));
            }
        } catch (error) {
            alert(`Erro ao excluir avaliação: ${error.message}`);
        }
    }
    
    // Get all reviews
    getAllReviews() {
        return this.reviewModel.getAllReviews();
    }
    
    // Get reviews for a specific game
    getReviewsByGameId(gameId) {
        return this.reviewModel.getReviewsByGameId(gameId);
    }
    
    // Get reviews by current user
    getCurrentUserReviews() {
        return this.reviewModel.getCurrentUserReviews();
    }
    
    // Get recent reviews
    getRecentReviews(limit = 3) {
        return this.reviewModel.getRecentReviews(limit);
    }
    
    // Like a review
    likeReview(reviewId) {
        try {
            const updatedReview = this.reviewModel.toggleLike(reviewId);
            
            // Dispatch event for liked review
            document.dispatchEvent(new CustomEvent('reviewLiked', {
                detail: { 
                    reviewId, 
                    review: updatedReview,
                    isLiked: this.reviewModel.hasUserLikedReview(reviewId),
                    likeCount: this.reviewModel.getLikeCount(reviewId)
                }
            }));
            
            return updatedReview;
        } catch (error) {
            console.error('Error liking review:', error.message);
            // Don't show alert for already liked reviews, just silently handle it
            if (!error.message.includes('already liked')) {
                alert(`Erro ao curtir avaliação: ${error.message}`);
            }
        }
    }
    
    // Check if user has liked a review
    hasUserLikedReview(reviewId) {
        return this.reviewModel.hasUserLikedReview(reviewId);
    }
    
    // Get like count for a review
    getLikeCount(reviewId) {
        return this.reviewModel.getLikeCount(reviewId);
    }
}

export default ReviewController; 