import UserModel from '../models/UserModel.js';

class ProfileView {
    constructor() {
        this.profileContent = document.getElementById('profile-content');
        this.setupTabNavigation();
    }
    
    // Show the profile page
    show() {
        this.profileContent.style.display = 'block';
    }
    
    // Hide the profile page
    hide() {
        this.profileContent.style.display = 'none';
    }
    
    // Setup tab navigation in the profile page
    setupTabNavigation() {
        const tabs = this.profileContent.querySelectorAll('.tab');
        if (!tabs.length) return;
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Handle tab content switching (in a real app)
                // For now, we're just showing the reviews tab
            });
        });
    }
    
    // Update profile information
    updateProfileInfo(user) {
        // Update username
        const usernameElement = this.profileContent.querySelector('.profile-info h2');
        if (usernameElement) {
            usernameElement.textContent = user.username;
        }
        
        // Update avatar
        this.updateProfileAvatar(user);
        
        // Update profile stats
        this.updateProfileStats(user);
    }
    
    // Update profile avatar
    updateProfileAvatar(user) {
        const profileAvatar = this.profileContent.querySelector('.profile-avatar');
        if (!profileAvatar) return;
        
        if (user.profileImage) {
            profileAvatar.innerHTML = `<img src="${user.profileImage}" alt="${user.username}" class="profile-avatar-img">`;
        } else {
            profileAvatar.textContent = user.username.charAt(0).toUpperCase();
        }
    }
    
    // Update profile stats
    updateProfileStats(user) {
        const statsContainer = this.profileContent.querySelector('.profile-stats');
        if (!statsContainer) return;
        
        // Get collection size
        const collectionSize = UserModel.getCollectionSize();
        
        // Get review count (this would be calculated from ReviewModel)
        // For now, we'll use a placeholder
        const reviewCount = 0; // This should be calculated from actual reviews
        
        statsContainer.innerHTML = `
            <div class="stat">
                <span class="stat-value">${reviewCount}</span>
                <p>Avaliações</p>
            </div>
            <div class="stat">
                <span class="stat-value">${collectionSize}</span>
                <p>Jogos na coleção</p>
            </div>
            <div class="stat">
                <span class="stat-value">0</span>
                <p>Seguidores</p>
            </div>
        `;
    }
    
    // Setup profile image upload functionality
    setupProfileImageUpload(callback) {
        const profileAvatar = this.profileContent.querySelector('.profile-avatar');
        const profileImageInput = document.getElementById('profile-image-input');
        
        if (!profileAvatar || !profileImageInput) return;
        
        // Open file dialog when profile avatar is clicked
        profileAvatar.addEventListener('click', () => {
            profileImageInput.click();
        });
        
        // Handle file selection
        profileImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    const imageUrl = event.target.result;
                    
                    // Update UI
                    profileAvatar.innerHTML = `<img src="${imageUrl}" alt="Profile" class="profile-avatar-img">`;
                    
                    // Call the callback with the new image
                    if (callback && typeof callback === 'function') {
                        callback(imageUrl);
                    }
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Render user reviews
    renderUserReviews(reviews, games) {
        const userReviewsContainer = this.profileContent.querySelector('.user-reviews');
        if (!userReviewsContainer) return;
        
        userReviewsContainer.innerHTML = '';
        
        reviews.forEach(review => {
            // Find the game in either regular games or Steam games
            let game = games.find(g => g.id === review.gameId);
            
            // If not found in regular games and the gameId looks like a Steam game, 
            // try to find it in Steam games
            if (!game && typeof review.gameId === 'string' && review.gameId.startsWith('steam_')) {
                // Import SteamGameModel dynamically to avoid circular dependencies
                import('../models/SteamGameModel.js').then(module => {
                    const SteamGameModel = module.default;
                    game = SteamGameModel.getSteamGameById(review.gameId);
                    
                    if (game) {
                        const reviewHtml = this.createReviewCardHtml(review, game);
                        userReviewsContainer.insertAdjacentHTML('beforeend', reviewHtml);
                    }
                });
                return; // Skip this iteration since we're handling it asynchronously
            }
            
            if (!game) return;
            
            const reviewHtml = this.createReviewCardHtml(review, game);
            userReviewsContainer.insertAdjacentHTML('beforeend', reviewHtml);
        });
    }
    
    // Create HTML for a review card in the profile
    createReviewCardHtml(review, game) {
        return `
            <div class="game-card" data-game-id="${game.id}" data-review-id="${review.id}">
                <img src="${game.imageUrl}" alt="${game.title}" class="game-image">
                <div class="game-info">
                    <h3 class="game-title">${game.title}</h3>
                    <p class="game-platform">${game.platform}</p>
                    <div class="rating">
                        <div class="stars">${this.getStarsHtml(review.rating)}</div>
                        <span class="rating-value">${review.rating}/5</span>
                    </div>
                    <p class="game-description">Sua avaliação: "${review.reviewText}"</p>
                    <div class="review-actions">
                        <button class="btn btn-outline btn-sm edit-review-btn">Editar</button>
                        <button class="btn btn-outline btn-sm delete-review-btn">Excluir</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Helper method to generate star HTML
    getStarsHtml(rating) {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }
    
    // Setup event listeners for review actions
    setupReviewActionListeners(editCallback, deleteCallback) {
        // Edit review button listener
        this.profileContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-review-btn')) {
                const gameCard = e.target.closest('.game-card');
                const gameId = parseInt(gameCard.getAttribute('data-game-id'));
                const reviewId = parseInt(gameCard.getAttribute('data-review-id'));
                
                if (editCallback && typeof editCallback === 'function') {
                    editCallback(gameId, reviewId);
                }
            }
        });
        
        // Delete review button listener
        this.profileContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-review-btn')) {
                const gameCard = e.target.closest('.game-card');
                const reviewId = parseInt(gameCard.getAttribute('data-review-id'));
                
                if (deleteCallback && typeof deleteCallback === 'function') {
                    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
                        deleteCallback(reviewId);
                    }
                }
            }
        });
    }
}

export default ProfileView; 