class ProfileController {
    constructor(userModel, reviewModel, gameModel, profileView) {
        this.userModel = userModel;
        this.reviewModel = reviewModel;
        this.gameModel = gameModel;
        this.profileView = profileView;
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    // Setup event listeners for the profile view
    setupEventListeners() {
        // Setup profile image upload
        this.profileView.setupProfileImageUpload((imageUrl) => {
            this.updateProfileImage(imageUrl);
        });
        
        // Setup review action listeners
        this.profileView.setupReviewActionListeners(
            (gameId, reviewId) => this.editReview(gameId, reviewId),
            (reviewId) => this.deleteReview(reviewId)
        );
        
        // Listen for review events
        document.addEventListener('reviewAdded', () => this.updateProfileData());
        document.addEventListener('reviewUpdated', () => this.updateProfileData());
        document.addEventListener('reviewDeleted', () => this.updateProfileData());
    }
    
    // Update profile data in the view
    updateProfileData() {
        // Check if user is logged in
        if (!this.userModel.isLoggedIn()) {
            return;
        }
        
        // Get current user
        const user = this.userModel.getCurrentUser();
        
        // Update profile info in view
        this.profileView.updateProfileInfo(user);
        
        // Get user reviews
        const userReviews = this.reviewModel.getCurrentUserReviews();
        
        // Get all games (including Steam games)
        const games = this.gameModel.getAllGamesIncludingSteam();
        
        // Render user reviews
        this.profileView.renderUserReviews(userReviews, games);
    }
    
    // Update profile image
    updateProfileImage(imageUrl) {
        this.userModel.updateProfileImage(imageUrl);
        
        // Update header avatar
        const headerAvatar = document.querySelector('.user-profile');
        if (headerAvatar) {
            headerAvatar.innerHTML = `<img src="${imageUrl}" alt="Profile" class="header-avatar-img">`;
        }
    }
    
    // Edit a review
    editReview(gameId, reviewId) {
        // Get the game data
        const game = this.gameModel.getGameById(gameId);
        if (!game) {
            alert('Jogo não encontrado!');
            return;
        }
        
        // Get the review data
        const reviews = this.reviewModel.getCurrentUserReviews();
        const review = reviews.find(r => r.id === reviewId);
        
        if (!review) {
            alert('Avaliação não encontrada!');
            return;
        }
        
        // Dispatch event to show review modal with existing data
        document.dispatchEvent(new CustomEvent('editReview', {
            detail: { gameId, reviewId }
        }));
    }
    
    // Delete a review
    deleteReview(reviewId) {
        try {
            const deleted = this.reviewModel.deleteReview(reviewId);
            
            if (deleted) {
                // Show success message
                alert('Avaliação excluída com sucesso!');
                
                // Update profile data
                this.updateProfileData();
            }
        } catch (error) {
            alert(`Erro ao excluir avaliação: ${error.message}`);
        }
    }
}

export default ProfileController; 