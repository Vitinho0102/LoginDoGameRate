import UserModel from './UserModel.js';
import GameModel from './GameModel.js';

class ReviewModel {
    constructor() {
        this.reviews = [];
        this.listeners = [];
        
        // Load initial review data
        this.loadReviews();
    }
    
    // Add an observer to be notified of changes
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    // Notify all observers of changes
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.reviews));
    }
    
    // Load review data (in a real app, this would be an API call)
    loadReviews() {
        // Try to load from localStorage if available
        const savedReviews = localStorage.getItem('reviews');
        if (savedReviews) {
            try {
                this.reviews = JSON.parse(savedReviews);
                
                // Ensure backward compatibility - add likes array to reviews that don't have it
                this.reviews.forEach(review => {
                    if (!review.likes) {
                        review.likes = [];
                    }
                });
                
                // Save the updated reviews back to localStorage
                this.saveReviews();
            } catch (e) {
                console.error('Error loading saved reviews:', e);
                this.initializeSampleReviews();
            }
        } else {
            this.initializeSampleReviews();
        }
        
        this.notifyListeners();
    }
    
    // Initialize with sample reviews
    initializeSampleReviews() {
        this.reviews = [
            {
                id: 1,
                gameId: 'steam_1145360', // Hades (changed from Elden Ring which isn't in our DB)
                userId: 'sample_user_1',
                username: 'Marcos Silva',
                userAvatar: 'M',
                rating: 5,
                reviewText: 'Simplesmente o melhor jogo que já joguei! O mundo é incrível e cheio de segredos. Os chefes são desafiadores e a trilha sonora é perfeita. Recomendo para quem curte jogos desafiadores.',
                date: '15/05/2023',
                likes: ['sample_user_2', 'sample_user_3'] // Array of user IDs who liked this review
            },
            {
                id: 2,
                gameId: 'steam_1086940', // Baldur's Gate 3
                userId: 'sample_user_2',
                username: 'Ana Costa',
                userAvatar: 'A',
                rating: 5,
                reviewText: 'Um dos melhores RPGs que já joguei. As opções de diálogo são incríveis e cada escolha realmente importa. A história é envolvente e os personagens são muito bem desenvolvidos.',
                date: '10/06/2023',
                likes: ['sample_user_1'] // Array of user IDs who liked this review
            },
            {
                id: 3,
                gameId: 'steam_292030', // The Witcher 3: Wild Hunt
                userId: 'sample_user_3',
                username: 'Pedro Oliveira',
                userAvatar: 'P',
                rating: 4,
                reviewText: 'Os gráficos são de tirar o fôlego e o combate é muito divertido. A história é boa, mas não tão cativante quanto a do primeiro jogo. Ainda assim, vale muito a pena jogar!',
                date: '20/04/2023',
                likes: [] // Array of user IDs who liked this review
            }
        ];
    }
    
    // Save reviews to localStorage
    saveReviews() {
        localStorage.setItem('reviews', JSON.stringify(this.reviews));
    }
    
    // Get all reviews
    getAllReviews() {
        return this.reviews;
    }
    
    // Get reviews for a specific game
    getReviewsByGameId(gameId) {
        return this.reviews.filter(review => review.gameId === gameId);
    }
    
    // Get reviews by a specific user
    getReviewsByUserId(userId) {
        return this.reviews.filter(review => review.userId === userId);
    }
    
    // Get reviews by current user
    getCurrentUserReviews() {
        const currentUser = UserModel.getCurrentUser();
        if (!currentUser.isLoggedIn) return [];
        
        return this.reviews.filter(review => review.userId === currentUser.email);
    }
    
    // Add a new review
    addReview(gameId, rating, reviewText) {
        const currentUser = UserModel.getCurrentUser();
        if (!currentUser.isLoggedIn) {
            throw new Error('User must be logged in to add a review');
        }
        
        const now = new Date();
        const newReview = {
            id: this.reviews.length + 1,
            gameId: gameId,
            userId: currentUser.email,
            username: currentUser.username,
            userAvatar: currentUser.profileImage || currentUser.username.charAt(0).toUpperCase(),
            rating: rating,
            reviewText: reviewText,
            date: now.toLocaleDateString('pt-BR'),
            timestamp: now.getTime(), // Add timestamp for better sorting
            likes: [] // Initialize with empty likes array
        };
        
        this.reviews.push(newReview);
        this.saveReviews();
        this.notifyListeners();
        
        return newReview;
    }
    
    // Update an existing review
    updateReview(reviewId, rating, reviewText) {
        const currentUser = UserModel.getCurrentUser();
        if (!currentUser.isLoggedIn) {
            throw new Error('User must be logged in to update a review');
        }
        
        const reviewIndex = this.reviews.findIndex(review => 
            review.id === reviewId && review.userId === currentUser.email);
        
        if (reviewIndex === -1) {
            throw new Error('Review not found or user does not have permission to edit');
        }
        
        const now = new Date();
        this.reviews[reviewIndex].rating = rating;
        this.reviews[reviewIndex].reviewText = reviewText;
        this.reviews[reviewIndex].date = now.toLocaleDateString('pt-BR');
        this.reviews[reviewIndex].timestamp = now.getTime(); // Update timestamp
        
        this.saveReviews();
        this.notifyListeners();
        
        return this.reviews[reviewIndex];
    }
    
    // Delete a review
    deleteReview(reviewId) {
        const currentUser = UserModel.getCurrentUser();
        if (!currentUser.isLoggedIn) {
            throw new Error('User must be logged in to delete a review');
        }
        
        const reviewIndex = this.reviews.findIndex(review => 
            review.id === reviewId && review.userId === currentUser.email);
        
        if (reviewIndex === -1) {
            throw new Error('Review not found or user does not have permission to delete');
        }
        
        this.reviews.splice(reviewIndex, 1);
        this.saveReviews();
        this.notifyListeners();
        
        return true;
    }
    
    // Get user review for a specific game
    getUserReviewForGame(gameId) {
        const currentUser = UserModel.getCurrentUser();
        if (!currentUser.isLoggedIn) return null;
        
        return this.reviews.find(review => 
            review.gameId === gameId && review.userId === currentUser.email);
    }
    
    // Check if user has reviewed a game
    hasUserReviewedGame(gameId) {
        return this.getUserReviewForGame(gameId) !== null;
    }
    
    // Get recent reviews
    getRecentReviews(limit = 10) {
        // Ensure all reviews have timestamps for backward compatibility
        this.reviews.forEach(review => {
            if (!review.timestamp) {
                // Create a timestamp from the date string if it doesn't exist
                const dateParts = review.date.split('/');
                if (dateParts.length === 3) {
                    const day = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                    const year = parseInt(dateParts[2]);
                    review.timestamp = new Date(year, month, day).getTime();
                } else {
                    // Fallback to current time if date parsing fails
                    review.timestamp = Date.now();
                }
            }
        });
        
        const recentReviews = [...this.reviews]
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)) // Sort by timestamp, newest first
            .slice(0, limit);
            
        console.log('📝 Getting recent reviews:', {
            totalReviews: this.reviews.length,
            recentReviews: recentReviews.length,
            reviewGameIds: recentReviews.map(r => r.gameId),
            reviewDates: recentReviews.map(r => r.date)
        });
        
        return recentReviews;
    }
    
    // Like a review
    likeReview(reviewId) {
        const currentUser = UserModel.getCurrentUser();
        if (!currentUser.isLoggedIn) {
            throw new Error('User must be logged in to like a review');
        }
        
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) {
            throw new Error('Review not found');
        }
        
        // Initialize likes array if it doesn't exist (for backward compatibility)
        if (!review.likes) {
            review.likes = [];
        }
        
        // Check if user already liked this review
        if (review.likes.includes(currentUser.email)) {
            throw new Error('User has already liked this review');
        }
        
        // Add user to likes array
        review.likes.push(currentUser.email);
        
        this.saveReviews();
        this.notifyListeners();
        
        return review;
    }
    
    // Unlike a review
    unlikeReview(reviewId) {
        const currentUser = UserModel.getCurrentUser();
        if (!currentUser.isLoggedIn) {
            throw new Error('User must be logged in to unlike a review');
        }
        
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review) {
            throw new Error('Review not found');
        }
        
        // Initialize likes array if it doesn't exist (for backward compatibility)
        if (!review.likes) {
            review.likes = [];
        }
        
        // Check if user has liked this review
        const likeIndex = review.likes.indexOf(currentUser.email);
        if (likeIndex === -1) {
            throw new Error('User has not liked this review');
        }
        
        // Remove user from likes array
        review.likes.splice(likeIndex, 1);
        
        this.saveReviews();
        this.notifyListeners();
        
        return review;
    }
    
    // Check if current user has liked a review
    hasUserLikedReview(reviewId) {
        const currentUser = UserModel.getCurrentUser();
        if (!currentUser || !currentUser.isLoggedIn) return false;
        
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review || !review.likes) return false;
        
        return review.likes.includes(currentUser.email);
    }
    
    // Get like count for a review
    getLikeCount(reviewId) {
        const review = this.reviews.find(r => r.id === reviewId);
        if (!review || !review.likes) return 0;
        
        return review.likes.length;
    }
    
    // Toggle like status for a review
    toggleLike(reviewId) {
        if (this.hasUserLikedReview(reviewId)) {
            return this.unlikeReview(reviewId);
        } else {
            return this.likeReview(reviewId);
        }
    }
}

// Export as singleton
export default new ReviewModel(); 