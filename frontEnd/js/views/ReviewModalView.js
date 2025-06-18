class ReviewModalView {
    constructor() {
        this.ratingModal = document.getElementById('rating-modal');
        this.editModal = document.getElementById('edit-review-modal');
        this.stars = document.querySelectorAll('.stars-input .star');
        this.editStars = document.querySelectorAll('#edit-stars-input .star');
        this.ratingValueDisplay = document.getElementById('rating-value-display');
        this.editRatingValueDisplay = document.getElementById('edit-rating-value-display');
        this.submitRatingBtn = document.getElementById('submit-rating');
        this.updateReviewBtn = document.getElementById('update-review');
        this.cancelEditBtn = document.getElementById('cancel-edit');
        this.userReviewInput = document.getElementById('user-review');
        this.editUserReviewInput = document.getElementById('edit-user-review');
        this.closeModal = this.ratingModal?.querySelector('.close-modal');
        this.closeEditModal = this.editModal?.querySelector('.close-modal');
        
        // Debug: Check if all elements are found
        console.log('🔧 ReviewModalView elements check:', {
            ratingModal: !!this.ratingModal,
            editModal: !!this.editModal,
            stars: this.stars.length,
            editStars: this.editStars.length,
            submitRatingBtn: !!this.submitRatingBtn,
            updateReviewBtn: !!this.updateReviewBtn,
            cancelEditBtn: !!this.cancelEditBtn,
            userReviewInput: !!this.userReviewInput,
            editUserReviewInput: !!this.editUserReviewInput
        });
        
        this.currentRating = 0;
        this.currentEditRating = 0;
        this.currentGameId = null;
        this.currentReviewId = null;
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    // Setup event listeners for the rating modal
    setupEventListeners() {
        // Close modal when clicking X
        if (this.closeModal) {
            this.closeModal.addEventListener('click', () => this.hide());
        }
        
        // Close edit modal when clicking X
        if (this.closeEditModal) {
            this.closeEditModal.addEventListener('click', () => this.hideEditModal());
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.ratingModal) {
                this.hide();
            }
            if (e.target === this.editModal) {
                this.hideEditModal();
            }
        });
        
        // Cancel edit button
        if (this.cancelEditBtn) {
            this.cancelEditBtn.addEventListener('click', () => this.hideEditModal());
        }
        
        // Star rating system for main modal
        this.stars.forEach(star => {
            // Show preview on hover
            star.addEventListener('mouseover', () => {
                const value = parseInt(star.getAttribute('data-value'));
                this.highlightStars(value);
            });
            
            // Reset to current rating on mouseout
            star.addEventListener('mouseout', () => {
                this.highlightStars(this.currentRating);
            });
            
            // Set rating on click
            star.addEventListener('click', () => {
                this.currentRating = parseInt(star.getAttribute('data-value'));
                this.highlightStars(this.currentRating);
                this.ratingValueDisplay.textContent = this.currentRating + '/5';
            });
        });
        
        // Star rating system for edit modal
        this.editStars.forEach(star => {
            // Show preview on hover
            star.addEventListener('mouseover', () => {
                const value = parseInt(star.getAttribute('data-value'));
                this.highlightEditStars(value);
            });
            
            // Reset to current rating on mouseout
            star.addEventListener('mouseout', () => {
                this.highlightEditStars(this.currentEditRating);
            });
            
            // Set rating on click
            star.addEventListener('click', () => {
                this.currentEditRating = parseInt(star.getAttribute('data-value'));
                this.highlightEditStars(this.currentEditRating);
                this.editRatingValueDisplay.textContent = this.currentEditRating + '/5';
            });
        });
    }
    
    // Show the rating modal for a specific game
    show(gameData, existingReview = null) {
        // Reset form
        this.resetForm();
        
        // Set current game
        this.currentGameId = gameData.id;
        
        // Set game info in the modal
        document.getElementById('game-rating-title').textContent = gameData.title;
        document.getElementById('game-rating-platform').textContent = gameData.platform;
        document.getElementById('game-rating-image').src = gameData.imageUrl;
        
        // If editing an existing review
        if (existingReview) {
            this.currentReviewId = existingReview.id;
            this.currentRating = existingReview.rating;
            this.highlightStars(existingReview.rating);
            this.ratingValueDisplay.textContent = existingReview.rating + '/5';
            this.userReviewInput.value = existingReview.reviewText;
        }
        
        // Show the modal
        this.ratingModal.style.display = 'flex';
    }
    
    // Hide the rating modal
    hide() {
        this.ratingModal.style.display = 'none';
    }
    
    // Reset the form
    resetForm() {
        this.currentRating = 0;
        this.currentGameId = null;
        this.currentReviewId = null;
        this.highlightStars(0);
        this.ratingValueDisplay.textContent = '0/5';
        this.userReviewInput.value = '';
    }
    
    // Highlight stars up to a specific count
    highlightStars(count) {
        this.stars.forEach((star, index) => {
            if (index < count) {
                star.textContent = '★'; // Filled star
                star.classList.add('active');
            } else {
                star.textContent = '☆'; // Empty star
                star.classList.remove('active');
            }
        });
    }
    
    // Setup the submit button
    setupSubmitButton(callback) {
        if (!this.submitRatingBtn) return;
        
        // Store the callback for later use
        this.submitCallback = callback;
        
        // Remove any existing event listeners to avoid duplicates
        const newSubmitBtn = this.submitRatingBtn.cloneNode(true);
        this.submitRatingBtn.parentNode.replaceChild(newSubmitBtn, this.submitRatingBtn);
        this.submitRatingBtn = newSubmitBtn;
        
        // Main modal submit button
        this.submitRatingBtn.addEventListener('click', () => {
            // Validate form
            if (this.currentRating === 0) {
                alert('Por favor, selecione uma avaliação de 1 a 5 estrelas.');
                return;
            }
            
            if (!this.userReviewInput.value.trim()) {
                alert('Por favor, escreva uma avaliação para o jogo.');
                return;
            }
            
            // Call the callback with review data
            if (this.submitCallback && typeof this.submitCallback === 'function') {
                const reviewData = {
                    gameId: this.currentGameId,
                    reviewId: this.currentReviewId,
                    rating: this.currentRating,
                    reviewText: this.userReviewInput.value.trim()
                };
                
                this.submitCallback(reviewData);
            }
            
            // Hide the modal
            this.hide();
        });
        
        // Setup edit modal update button
        this.setupEditSubmitButton();
    }
    
    // Setup the edit modal submit button
    setupEditSubmitButton() {
        console.log('🔧 Setting up edit submit button...', {
            updateReviewBtn: !!this.updateReviewBtn,
            buttonElement: this.updateReviewBtn
        });
        
        if (!this.updateReviewBtn) {
            console.error('❌ Update review button not found!');
            return;
        }
        
        // Remove any existing event listeners to avoid duplicates
        const newUpdateBtn = this.updateReviewBtn.cloneNode(true);
        this.updateReviewBtn.parentNode.replaceChild(newUpdateBtn, this.updateReviewBtn);
        this.updateReviewBtn = newUpdateBtn;
        
        // Edit modal update button
        this.updateReviewBtn.addEventListener('click', () => {
            console.log('🔧 Edit modal update button clicked!', {
                currentEditRating: this.currentEditRating,
                editUserReviewInput: this.editUserReviewInput?.value,
                currentGameId: this.currentGameId,
                currentReviewId: this.currentReviewId
            });
            
            // Validate form
            if (this.currentEditRating === 0) {
                alert('Por favor, selecione uma avaliação de 1 a 5 estrelas.');
                return;
            }
            
            if (!this.editUserReviewInput.value.trim()) {
                alert('Por favor, escreva uma avaliação para o jogo.');
                return;
            }
            
            // Call the callback with updated review data
            if (this.submitCallback && typeof this.submitCallback === 'function') {
                const reviewData = {
                    gameId: this.currentGameId,
                    reviewId: this.currentReviewId,
                    rating: this.currentEditRating,
                    reviewText: this.editUserReviewInput.value.trim()
                };
                
                console.log('🔧 Calling submit callback with review data:', reviewData);
                this.submitCallback(reviewData);
            } else {
                console.error('❌ Submit callback not found or not a function!', this.submitCallback);
            }
            
            // Hide the edit modal
            this.hideEditModal();
        });
        
        console.log('✅ Edit submit button setup complete!');
    }
    
    // Show the edit review modal
    showEditModal(gameData, reviewData) {
        console.log('🔧 Showing edit modal with data:', {
            gameData: gameData,
            reviewData: reviewData,
            editModal: !!this.editModal
        });
        
        // Reset edit form
        this.resetEditForm();
        
        // Set current game and review
        this.currentGameId = gameData.id;
        this.currentReviewId = reviewData.id;
        this.currentEditRating = reviewData.rating;
        
        // Set game info in the edit modal
        document.getElementById('edit-game-rating-title').textContent = gameData.title;
        document.getElementById('edit-game-rating-platform').textContent = gameData.platform;
        document.getElementById('edit-game-rating-image').src = gameData.imageUrl;
        
        // Set existing review data
        this.highlightEditStars(reviewData.rating);
        this.editRatingValueDisplay.textContent = reviewData.rating + '/5';
        this.editUserReviewInput.value = reviewData.reviewText;
        
        console.log('🔧 Edit modal data set:', {
            currentGameId: this.currentGameId,
            currentReviewId: this.currentReviewId,
            currentEditRating: this.currentEditRating,
            editUserReviewInputValue: this.editUserReviewInput.value
        });
        
        // Show the edit modal
        this.editModal.style.display = 'flex';
        
        console.log('✅ Edit modal should now be visible!');
    }
    
    // Hide the edit review modal
    hideEditModal() {
        this.editModal.style.display = 'none';
    }
    
    // Reset the edit form
    resetEditForm() {
        this.currentEditRating = 0;
        this.currentGameId = null;
        this.currentReviewId = null;
        this.highlightEditStars(0);
        this.editRatingValueDisplay.textContent = '0/5';
        this.editUserReviewInput.value = '';
    }
    
    // Highlight edit stars up to a specific count
    highlightEditStars(count) {
        this.editStars.forEach((star, index) => {
            if (index < count) {
                star.textContent = '★'; // Filled star
                star.classList.add('active');
            } else {
                star.textContent = '☆'; // Empty star
                star.classList.remove('active');
            }
        });
    }
}

export default ReviewModalView; 