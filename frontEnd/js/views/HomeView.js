class HomeView {
    constructor() {
        this.homeContent = document.getElementById('home-content');
    }
    
    // Show the home page
    show() {
        this.homeContent.style.display = 'block';
    }
    
    // Hide the home page
    hide() {
        this.homeContent.style.display = 'none';
    }
    
    // Render popular games in the home page
    renderPopularGames(games) {
        const gamesGrid = this.homeContent.querySelector('.games-grid');
        if (!gamesGrid) return;
        
        gamesGrid.innerHTML = '';
        
        games.forEach(game => {
            const gameHtml = `
                <div class="game-thumbnail" data-game-id="${game.id}">
                    <img src="${game.imageUrl}" alt="${game.title}" onerror="this.src='https://placehold.co/300x200?text=${encodeURIComponent(game.title)}'">
                    <div class="game-info-overlay">
                        <h3>${game.title}</h3>
                        <div class="stars">${this.getStarsHtml(game.rating)}</div>
                        <p>${game.rating}/10</p>
                    </div>
                </div>
            `;
            
            gamesGrid.insertAdjacentHTML('beforeend', gameHtml);
        });
        
        // Add click event to game thumbnails
        const thumbnails = gamesGrid.querySelectorAll('.game-thumbnail');
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', (e) => {
                const gameId = thumbnail.getAttribute('data-game-id');
                const gameTitle = thumbnail.querySelector('h3').textContent;
                // Dispatch custom event to navigate to games page with this game
                document.dispatchEvent(new CustomEvent('navigateToGamePage', { detail: { gameId, gameTitle } }));
            });
        });
    }
    
    // Helper method to generate star HTML
    getStarsHtml(rating) {
        const fullStars = Math.floor(rating / 2);
        const halfStar = rating % 2 >= 1 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    }
    
    // Add event listeners for the hero buttons
    setupEventListeners(loginCallback, registerCallback) {
        const heroLoginBtn = document.getElementById('hero-login-btn');
        const heroRegisterBtn = document.getElementById('hero-register-btn');
        
        if (heroLoginBtn) {
            heroLoginBtn.addEventListener('click', loginCallback);
        }
        
        if (heroRegisterBtn) {
            heroRegisterBtn.addEventListener('click', registerCallback);
        }
    }
}

export default HomeView; 