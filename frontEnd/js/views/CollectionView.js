import UserModel from '../models/UserModel.js';

class CollectionView {
    constructor() {
        this.collectionContent = document.getElementById('collection-content');
    }
    
    // Show the collection page
    show() {
        this.collectionContent.style.display = 'block';
    }
    
    // Hide the collection page
    hide() {
        this.collectionContent.style.display = 'none';
    }
    
    // Render games in the collection
    renderCollection(games) {
        console.log('📚 CollectionView: Rendering collection...', {
            gamesCount: games.length,
            gameIds: games.map(g => g.id)
        });
        
        const collectionGrid = this.collectionContent.querySelector('.collection-grid');
        if (!collectionGrid) return;
        
        // Clear existing games
        collectionGrid.innerHTML = '';
        
        if (games.length === 0) {
            collectionGrid.innerHTML = `
                <div class="empty-collection">
                    <div class="empty-icon">📚</div>
                    <h3>Sua coleção está vazia</h3>
                    <p>Adicione jogos que você gosta à sua coleção pessoal!</p>
                    <p>Vá para a página de <strong>Jogos</strong> e clique em "💖 Adicionar à Coleção" nos jogos que você curte.</p>
                </div>
            `;
            return;
        }
        
        // Render each game
        games.forEach(game => {
            const gameHtml = this.createCollectionGameHtml(game);
            collectionGrid.insertAdjacentHTML('beforeend', gameHtml);
        });
        
        console.log('✅ CollectionView: Collection rendered successfully');
        
        // Add event listeners to collection buttons
        this.addCollectionButtonListeners();
    }
    
    // Create HTML for a game in the collection
    createCollectionGameHtml(game) {
        return `
            <div class="collection-game-item" data-game-id="${game.id}">
                <img src="${game.imageUrl}" alt="${game.title}" class="collection-game-image">
                <div class="collection-game-info">
                    <h3 class="collection-game-title">${game.title}</h3>
                    <p class="collection-game-platform">${game.platform}</p>
                    <p class="collection-game-genre">${game.genre}</p>
                    <div class="collection-game-rating">
                        <div class="stars">${this.getStarsHtml(game.rating)}</div>
                        <span class="rating-value">${game.rating}/10</span>
                    </div>
                    <div class="collection-game-actions">
                        <button class="btn btn-primary review-game-btn" data-game-id="${game.id}">⭐ Avaliar</button>
                        <button class="btn btn-danger remove-from-collection-btn" data-game-id="${game.id}">💔 Remover</button>
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
    
    // Add event listeners to collection buttons
    addCollectionButtonListeners() {
        // Review game buttons
        const reviewButtons = this.collectionContent.querySelectorAll('.review-game-btn');
        reviewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const gameId = button.getAttribute('data-game-id');
                
                // Dispatch custom event for reviewing a game
                document.dispatchEvent(new CustomEvent('reviewGame', { detail: { gameId } }));
            });
        });
        
        // Remove from collection buttons
        const removeButtons = this.collectionContent.querySelectorAll('.remove-from-collection-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const gameId = button.getAttribute('data-game-id');
                const gameTitle = button.closest('.collection-game-item').querySelector('.collection-game-title').textContent;
                
                // Confirm removal
                if (confirm(`Tem certeza que deseja remover "${gameTitle}" da sua coleção?`)) {
                    // Dispatch custom event for removing from collection
                    document.dispatchEvent(new CustomEvent('removeFromCollection', { detail: { gameId } }));
                }
            });
        });
    }
    
    // Update collection stats
    updateCollectionStats(collectionSize) {
        const statsElement = this.collectionContent.querySelector('.collection-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat">
                    <span class="stat-value">${collectionSize}</span>
                    <p>Jogos na Coleção</p>
                </div>
            `;
        }
    }
}

export default CollectionView; 