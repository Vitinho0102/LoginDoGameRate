import UserModel from '../models/UserModel.js';
import ReviewModel from '../models/ReviewModel.js';

class FeedView {
    constructor() {
        this.feedContent = document.getElementById('feed-content');
    }
    
    // Show the feed page
    show() {
        this.feedContent.style.display = 'block';
    }
    
    // Hide the feed page
    hide() {
        this.feedContent.style.display = 'none';
    }
    
    // Render reviews in the feed
    renderReviews(reviews, games) {
        console.log('📰 FeedView: Rendering reviews...', {
            reviewsCount: reviews.length,
            gamesCount: games.length,
            gameIds: games.map(g => g.id)
        });
        
        const feedSection = this.feedContent.querySelector('.feed');
        if (!feedSection) return;
        
        // Clear existing reviews
        const sectionTitle = feedSection.querySelector('.section-title');
        feedSection.innerHTML = '';
        
        // Re-add the section title
        if (sectionTitle) {
            feedSection.appendChild(sectionTitle);
        } else {
            const title = document.createElement('h2');
            title.className = 'section-title';
            title.textContent = 'Feed de Avaliações';
            feedSection.appendChild(title);
        }
        
        // Render each review
        reviews.forEach(review => {
            const game = games.find(g => g.id === review.gameId);
            console.log(`🎮 Looking for game ${review.gameId}:`, game ? 'Found' : 'Not found');
            if (!game) return;
            
            const reviewHtml = this.createReviewHtml(review, game);
            feedSection.insertAdjacentHTML('beforeend', reviewHtml);
        });
        
        console.log('✅ FeedView: Reviews rendered successfully');
        
        // Add event listeners to review buttons
        this.addReviewButtonListeners();
    }
    
    // Render recommended games in the sidebar
    renderRecommendedGames(games) {
        const recommendedList = this.feedContent.querySelector('.recommended-list');
        if (!recommendedList) return;
        
        recommendedList.innerHTML = '';
        
        games.forEach(game => {
            const gameHtml = `
                <li class="recommended-item" data-game-id="${game.id}">
                    <img src="${game.imageUrl}" alt="${game.title}" class="recommended-image">
                    <div class="recommended-info">
                        <p class="recommended-title">${game.title}</p>
                        <p class="recommended-platform">${game.platform}</p>
                        <p class="recommended-rating">${this.getStarsHtml(game.rating)} ${game.rating}/10</p>
                    </div>
                </li>
            `;
            
            recommendedList.insertAdjacentHTML('beforeend', gameHtml);
        });
        
        // Add click event to recommended games
        const recommendedItems = recommendedList.querySelectorAll('.recommended-item');
        recommendedItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const gameId = item.getAttribute('data-game-id'); // Don't parse as int - keep as string for Steam games
                const gameTitle = item.querySelector('.recommended-title').textContent;
                
                console.log('🎮 Sidebar game clicked:', { gameId, gameTitle });
                
                // Dispatch custom event to navigate to games page with specific game
                document.dispatchEvent(new CustomEvent('navigateToGamePage', { 
                    detail: { gameId, gameTitle } 
                }));
            });
        });
    }
    
    // Create HTML for a review card
    createReviewHtml(review, game) {
        const currentUser = UserModel.getCurrentUser();
        const isOwnReview = currentUser && currentUser.isLoggedIn && currentUser.email === review.userId;
        
        // Check if this is a recent review (posted in the last hour)
        const now = Date.now();
        const reviewTime = review.timestamp || 0;
        const isRecentReview = (now - reviewTime) < (60 * 60 * 1000); // 1 hour in milliseconds
        
        // Get like information
        const likeCount = ReviewModel.getLikeCount(review.id);
        const isLiked = ReviewModel.hasUserLikedReview(review.id);
        const likeButtonClass = isLiked ? 'btn-liked' : 'btn-outline';
        const likeIcon = isLiked ? '❤️' : '🤍';
        
        const editDeleteButtons = isOwnReview ? `
            <div class="review-actions">
                <button class="btn btn-small btn-danger delete-review-btn" data-review-id="${review.id}">🗑️ Excluir</button>
            </div>
        ` : '';
        
        // Like button (show for all users, but only functional when logged in)
        const likeButton = `
            <div class="review-interactions">
                <button class="btn btn-small ${likeButtonClass} like-review-btn" data-review-id="${review.id}" ${(currentUser && currentUser.isLoggedIn) ? '' : 'disabled'}>
                    ${likeIcon} ${likeCount}
                </button>
            </div>
        `;
        
        // Add special class and badge for recent reviews
        const recentClass = isRecentReview ? ' review-post' : '';
        const recentBadge = isRecentReview ? '<div class="new-review-badge">🆕 Nova Avaliação</div>' : '';
        
        return `
            <div class="game-card${recentClass}" data-game-id="${game.id}">
                ${recentBadge}
                <img src="${game.imageUrl}" alt="${game.title}" class="game-image">
                <div class="game-info">
                    <h3 class="game-title">${game.title}</h3>
                    <p class="game-platform">${game.platform}</p>
                    <p class="game-description">${game.description}</p>
                    <div class="rating">
                        <div class="stars">${this.getStarsHtml(game.rating)}</div>
                        <span class="rating-value">${game.rating}/10</span>
                    </div>
                    <button class="btn btn-primary game-review-btn">Avaliar</button>
                </div>
                <div class="user-review">
                    <div class="user-avatar">${review.userAvatar}</div>
                    <div class="review-content">
                        <p class="user-name">${review.username}</p>
                        <div class="review-rating">
                            <div class="stars">${this.getStarsHtml(review.rating)}</div>
                            <span class="rating-value">${review.rating}/5</span>
                        </div>
                        <p class="review-text">${review.reviewText}</p>
                        <p class="review-date">${review.date}</p>
                        ${likeButton}
                        ${editDeleteButtons}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Helper method to generate star HTML
    getStarsHtml(rating) {
        const fullStars = Math.floor(rating / 2);
        const halfStar = rating % 2 >= 1 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    }
    
    // Update like button state for a specific review
    updateLikeButton(reviewId, isLiked, likeCount) {
        const likeButton = this.feedContent.querySelector(`.like-review-btn[data-review-id="${reviewId}"]`);
        if (!likeButton) return;
        
        // Update button appearance
        if (isLiked) {
            likeButton.classList.remove('btn-outline');
            likeButton.classList.add('btn-liked');
            likeButton.innerHTML = `❤️ ${likeCount}`;
        } else {
            likeButton.classList.remove('btn-liked');
            likeButton.classList.add('btn-outline');
            likeButton.innerHTML = `🤍 ${likeCount}`;
        }
    }
    
    // Add event listeners to review buttons
    addReviewButtonListeners() {
        const reviewButtons = this.feedContent.querySelectorAll('.game-review-btn');
        reviewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const gameCard = button.closest('.game-card');
                const gameId = gameCard.getAttribute('data-game-id'); // Don't parse as int - keep as string for Steam games
                
                // Dispatch custom event for reviewing a game
                document.dispatchEvent(new CustomEvent('reviewGame', { detail: { gameId } }));
            });
        });
        
        // Add event listeners for like buttons
        const likeButtons = this.feedContent.querySelectorAll('.like-review-btn');
        likeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const reviewId = parseInt(button.getAttribute('data-review-id'));
                
                // Check if user is logged in
                const currentUser = UserModel.getCurrentUser();
                if (!currentUser.isLoggedIn) {
                    alert('Você precisa estar logado para curtir avaliações.');
                    return;
                }
                
                // Dispatch custom event for liking a review
                document.dispatchEvent(new CustomEvent('likeReview', { detail: { reviewId } }));
            });
        });
        
        // Add event listeners for delete buttons
        const deleteButtons = this.feedContent.querySelectorAll('.delete-review-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const reviewId = parseInt(button.getAttribute('data-review-id'));
                
                // Confirm deletion
                if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
                    // Dispatch custom event for deleting a review
                    document.dispatchEvent(new CustomEvent('deleteReview', { detail: { reviewId } }));
                }
            });
        });
    }
}

export default FeedView; 