import UserModel from '../models/UserModel.js';

class GameView {
    constructor() {
        this.gamesContent = document.getElementById('games-content');
        this.reviewDetail = document.getElementById('review-detail');
        this.setupFilters();
    }
    
    // Show the games catalog page
    show() {
        this.gamesContent.style.display = 'block';
        this.reviewDetail.style.display = 'none';
    }
    
    // Hide the games catalog page
    hide() {
        this.gamesContent.style.display = 'none';
    }
    
    // Setup filter event listeners
    setupFilters() {
        const platformFilter = document.getElementById('platform-filter');
        const genreFilter = document.getElementById('genre-filter');
        const sortOptions = document.getElementById('sort-options');
        const gamesSearch = document.getElementById('games-search');
        const searchButton = gamesSearch?.nextElementSibling;
        
        if (platformFilter && genreFilter && sortOptions && gamesSearch && searchButton) {
            // Create an object to store filter callbacks
            this.filterCallbacks = [];
            
            // Platform filter change event
            platformFilter.addEventListener('change', () => this.triggerFilterCallbacks());
            
            // Genre filter change event
            genreFilter.addEventListener('change', () => this.triggerFilterCallbacks());
            
            // Sort options change event
            sortOptions.addEventListener('change', () => this.triggerFilterCallbacks());
            
            // Search button click event
            searchButton.addEventListener('click', () => this.triggerFilterCallbacks());
            
            // Search input enter key event
            gamesSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.triggerFilterCallbacks();
                }
            });
        }
    }
    
    // Add a filter change callback
    addFilterChangeListener(callback) {
        if (typeof callback === 'function') {
            this.filterCallbacks.push(callback);
        }
    }
    
    // Trigger all filter callbacks with current filter values
    triggerFilterCallbacks() {
        const platformFilter = document.getElementById('platform-filter');
        const genreFilter = document.getElementById('genre-filter');
        const sortOptions = document.getElementById('sort-options');
        const gamesSearch = document.getElementById('games-search');
        
        const filters = {
            platform: platformFilter?.value || '',
            genre: genreFilter?.value || '',
            sort: sortOptions?.value || 'rating',
            search: gamesSearch?.value || ''
        };
        
        this.filterCallbacks.forEach(callback => callback(filters));
    }
    
    // Render games in the catalog
    renderGames(games, highlightGameId = null) {
        const gamesGrid = this.gamesContent.querySelector('.games-grid');
        if (!gamesGrid) return;
        
        gamesGrid.innerHTML = '';
        
        games.forEach(game => {
            // Check if this is a Steam game and render accordingly
            const gameHtml = game.isSteamGame ? 
                this.createSteamGameItemHtml(game, highlightGameId) : 
                this.createGameItemHtml(game, highlightGameId);
            gamesGrid.insertAdjacentHTML('beforeend', gameHtml);
        });
        
        // Add event listeners for game detail buttons
        this.setupGameDetailButtons();
        
        // Add event listeners for Steam game detail buttons if there are Steam games
        const hasSteamGames = games.some(game => game.isSteamGame);
        if (hasSteamGames) {
            this.setupSteamGameDetailButtons();
        }
        
        // Scroll to highlighted game if it exists
        if (highlightGameId) {
            setTimeout(() => {
                const highlightedGame = gamesGrid.querySelector(`[data-game-id="${highlightGameId}"]`);
                if (highlightedGame) {
                    highlightedGame.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, 100);
        }
    }
    
    // Render Steam games section
    renderSteamGamesSection(steamGames) {
        // First, check if a Steam games section already exists
        let steamSection = this.gamesContent.querySelector('.steam-games-section');
        
        // If it doesn't exist, create it
        if (!steamSection) {
            const sectionHtml = `
                <section class="steam-games-section">
                    <h2 class="section-title">Jogos da Steam</h2>
                    <div class="steam-games-grid"></div>
                </section>
            `;
            
            this.gamesContent.querySelector('.container').insertAdjacentHTML('beforeend', sectionHtml);
            steamSection = this.gamesContent.querySelector('.steam-games-section');
        }
        
        // Get the Steam games grid
        const steamGamesGrid = steamSection.querySelector('.steam-games-grid');
        if (!steamGamesGrid) return;
        
        // Clear existing Steam games
        steamGamesGrid.innerHTML = '';
        
        // Render each Steam game
        steamGames.forEach(game => {
            const gameHtml = this.createSteamGameItemHtml(game);
            steamGamesGrid.insertAdjacentHTML('beforeend', gameHtml);
        });
        
        // Add event listeners for Steam game detail buttons
        this.setupSteamGameDetailButtons();
    }
    
    // Create HTML for a Steam game item
    createSteamGameItemHtml(game, highlightGameId = null) {
        const isHighlighted = highlightGameId && game.id === highlightGameId;
        const highlightClass = isHighlighted ? ' highlighted' : '';
        
        // Check if game is in user's collection
        const isInCollection = UserModel.isGameInCollection(game.id);
        const collectionButtonText = isInCollection ? '💖 Na Coleção' : '💖 Adicionar à Coleção';
        const collectionButtonClass = isInCollection ? 'btn-outline' : 'btn-success';
        const collectionButtonDisabled = isInCollection ? 'disabled' : '';
        
        return `
            <div class="game-item steam-game-item${highlightClass}" data-game-id="${game.id}" data-steam-id="${game.steamId}">
                <img src="${game.imageUrl}" alt="${game.title}" class="game-cover" onerror="this.src='https://placehold.co/300x400?text=${encodeURIComponent(game.title)}'">
                <div class="game-item-info">
                    <h3>${game.title}</h3>
                    <p class="game-genre">${game.genre || 'Steam Game'}</p>
                    <p class="game-platform">${game.platform}</p>
                    <div class="game-rating">
                        <div class="stars">${this.getStarsHtml(game.rating)}</div>
                        <span>${game.rating}/10</span>
                    </div>
                    <p class="game-price">R$ ${game.price ? game.price.toFixed(2) : 'N/A'}</p>
                    <p class="game-description">${game.description || 'Jogo disponível na Steam'}</p>
                    <div class="game-actions">
                        <button class="btn btn-primary steam-game-detail-btn">Ver na Steam</button>
                        <button class="btn btn-secondary game-review-btn">⭐ Avaliar</button>
                        <button class="btn ${collectionButtonClass} add-to-collection-btn" data-game-id="${game.id}" ${collectionButtonDisabled}>${collectionButtonText}</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Setup Steam game detail buttons
    setupSteamGameDetailButtons() {
        // Steam buttons (these would open Steam store page)
        const steamButtons = this.gamesContent.querySelectorAll('.steam-game-detail-btn');
        steamButtons.forEach(button => {
            button.addEventListener('click', () => {
                const gameItem = button.closest('.steam-game-item');
                const steamId = gameItem.getAttribute('data-steam-id');
                
                // Open Steam store page in a new tab
                window.open(`https://store.steampowered.com/app/${steamId}`, '_blank');
            });
        });
        
        // Review buttons for Steam games
        const reviewButtons = this.gamesContent.querySelectorAll('.steam-game-item .game-review-btn');
        reviewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const gameItem = button.closest('.steam-game-item');
                const gameId = gameItem.getAttribute('data-game-id');
                
                // Dispatch custom event for reviewing a Steam game
                document.dispatchEvent(new CustomEvent('reviewGame', { detail: { gameId } }));
            });
        });
        
        // Add to collection buttons for Steam games
        const collectionButtons = this.gamesContent.querySelectorAll('.steam-game-item .add-to-collection-btn');
        collectionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const gameId = button.getAttribute('data-game-id');
                
                // Check if user is logged in
                const currentUser = UserModel.getCurrentUser();
                if (!currentUser.isLoggedIn) {
                    alert('Você precisa estar logado para adicionar jogos à sua coleção.');
                    return;
                }
                
                // Dispatch custom event for adding to collection
                document.dispatchEvent(new CustomEvent('addToCollection', { detail: { gameId } }));
            });
        });
    }
    
    // Create HTML for a game item
    createGameItemHtml(game, highlightGameId = null) {
        const isHighlighted = highlightGameId && game.id === highlightGameId;
        const highlightClass = isHighlighted ? ' highlighted' : '';
        
        return `
            <div class="game-item${highlightClass}" data-game-id="${game.id}">
                <img src="${game.imageUrl}" alt="${game.title}" class="game-cover" onerror="this.src='https://placehold.co/300x400?text=${encodeURIComponent(game.title)}'">
                <div class="game-item-info">
                    <h3>${game.title}</h3>
                    <p class="game-genre">${game.genre}</p>
                    <p class="game-platform">${game.platform}</p>
                    <div class="game-rating">
                        <div class="stars">${this.getStarsHtml(game.rating)}</div>
                        <span>${game.rating}/10</span>
                    </div>
                    <p class="game-description">${game.description}</p>
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
    
    // Setup game detail buttons
    setupGameDetailButtons() {
        // This method is no longer needed since we removed the detail buttons
        // Keeping it empty for compatibility
    }
}

export default GameView; 