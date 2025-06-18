import AppController from './controllers/AppController.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppController();
    app.loadSavedPageState();
    
    document.addEventListener('userLoggedIn', () => {
        app.showFeed();
    });
    
    document.addEventListener('userRegistered', () => {
        app.showFeed();
    });
    
    document.addEventListener('userLoggedOut', () => {
        app.showHome();
    });
    
    document.addEventListener('editReview', (e) => {
        const { gameId, reviewId } = e.detail;
        app.reviewController.showReviewModal(gameId, reviewId);
    });
    
    // Make app globally accessible for debugging
    window.gameRateApp = app;
});