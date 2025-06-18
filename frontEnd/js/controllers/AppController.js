import UserModel from '../models/UserModel.js';
import GameModel from '../models/GameModel.js';
import ReviewModel from '../models/ReviewModel.js';
import SteamGameModel from '../models/SteamGameModel.js';

import HomeView from '../views/HomeView.js';
import FeedView from '../views/FeedView.js';
import ProfileView from '../views/ProfileView.js';
import GameView from '../views/GameView.js';
import AuthView from '../views/AuthView.js';
import ReviewModalView from '../views/ReviewModalView.js';
import CollectionView from '../views/CollectionView.js';

import AuthController from './AuthController.js';
import GameController from './GameController.js';
import ReviewController from './ReviewController.js';
import ProfileController from './ProfileController.js';
import SteamGameController from './SteamGameController.js';
import CollectionController from './CollectionController.js';

class AppController {
    constructor() {
        // Initialize views
        this.homeView = new HomeView();
        this.feedView = new FeedView();
        this.profileView = new ProfileView();
        this.gameView = new GameView();
        this.authView = new AuthView();
        this.reviewModalView = new ReviewModalView();
        this.collectionView = new CollectionView();
        
        // Initialize controllers
        this.authController = new AuthController(UserModel, this.authView);
        this.gameController = new GameController(GameModel, this.gameView);
        this.reviewController = new ReviewController(ReviewModel, GameModel, UserModel, this.reviewModalView);
        this.profileController = new ProfileController(UserModel, ReviewModel, GameModel, this.profileView);
        this.steamGameController = new SteamGameController(SteamGameModel, this.gameView);
        this.collectionController = new CollectionController(UserModel, GameModel, this.collectionView);
        
        // Elements
        this.navItems = document.querySelector('nav ul');
        this.searchBar = document.querySelector('.search-bar');
        this.homeLink = document.getElementById('home-link');
        this.gamesLink = document.getElementById('games-link');
        this.profileLink = document.getElementById('profile-link');
        this.ratingsLink = document.getElementById('ratings-link');
        this.collectionLink = document.getElementById('collection-link');
        
        // Initialize the app
        this.init();
    }
    
    // Initialize the application
    async init() {
        // Check if user is already logged in (await async)
        const isLoggedIn = await this.authController.checkLoginStatus();
        // Setup navigation event listeners
        this.setupNavigation();
        // Setup search functionality
        this.setupSearch();
        // Setup review event listeners
        this.setupReviewEvents();
        // Listen for Steam games to be loaded
        SteamGameModel.addListener(() => {
            console.log('🔄 Steam games loaded, refreshing current page...');
            // Refresh the current page if it's the feed or games page
            const currentPage = localStorage.getItem('currentPage');
            if (currentPage === 'feed') {
                this.refreshFeed();
            } else if (currentPage === 'games') {
                this.refreshGames();
            }
        });
        // Setup hero buttons in home page
        this.homeView.setupEventListeners(
            () => this.authView.openLoginModal(),
            () => this.authView.openRegisterModal()
        );
        // Wait a bit for Steam games to load, then show initial page
        setTimeout(() => {
            console.log('🎮 Checking Steam games after timeout...');
            const steamGames = SteamGameModel.getAllSteamGames();
            console.log('🎮 Steam games available:', steamGames.length);
            // Load initial page based on login status
            if (isLoggedIn) {
                this.showFeed();
            } else {
                this.showHome();
            }
        }, 3000); // Wait 3 seconds for Steam games to load
    }
    
    // Setup navigation event listeners
    setupNavigation() {
        // Home link
        if (this.homeLink) {
            this.homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.authController.isLoggedIn()) {
                    this.showFeed();
                } else {
                    this.showHome();
                }
            });
        }
        
        // Games link
        if (this.gamesLink) {
            this.gamesLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.authController.isLoggedIn()) {
                    // Clear header search when navigating to games page
                    const headerSearchInput = document.getElementById('header-search');
                    if (headerSearchInput) {
                        headerSearchInput.value = '';
                    }
                    this.showGames();
                } else {
                    this.showHome();
                }
            });
        }
        
        // Collection link
        if (this.collectionLink) {
            this.collectionLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.authController.isLoggedIn()) {
                    this.showCollection();
                } else {
                    this.showHome();
                }
            });
        }
        
        // Profile link
        if (this.profileLink) {
            this.profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.authController.isLoggedIn()) {
                    this.showProfile();
                } else {
                    this.showHome();
                }
            });
        }
        
        // Ratings link
        if (this.ratingsLink) {
            this.ratingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.authController.isLoggedIn()) {
                    this.showFeed();
                } else {
                    this.showHome();
                }
            });
        }
    }
    
    // Setup search functionality
    setupSearch() {
        const headerSearchInput = document.getElementById('header-search');
        const headerSearchBtn = document.getElementById('header-search-btn');
        
        if (headerSearchInput && headerSearchBtn) {
            // Handle search button click
            headerSearchBtn.addEventListener('click', () => {
                this.performSearch();
            });
            
            // Handle Enter key in search input
            headerSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch();
                }
            });
        }
    }
    
    // Perform search and navigate to games page
    performSearch() {
        const headerSearchInput = document.getElementById('header-search');
        const searchTerm = headerSearchInput?.value.trim();
        
        if (!searchTerm) {
            alert('Por favor, digite um termo de busca.');
            return;
        }
        
        // Check if user is logged in
        if (!this.authController.isLoggedIn()) {
            alert('Você precisa estar logado para buscar jogos.');
            return;
        }
        
        console.log('🔍 Performing search for:', searchTerm);
        
        // Navigate to games page with search term
        this.showGamesWithSearch(searchTerm);
    }
    
    // Show games page with search filter applied
    showGamesWithSearch(searchTerm) {
        // Navigate to games page
        this.hideAllPages();
        this.gameView.show();
        
        // Show navigation items
        if (this.navItems) this.navItems.style.display = 'flex';
        if (this.searchBar) this.searchBar.style.display = 'block';
        
        // Set the search term in the games page search input
        const gamesSearchInput = document.getElementById('games-search');
        if (gamesSearchInput) {
            gamesSearchInput.value = searchTerm;
        }
        
        // Load Steam games and setup filtering
        const steamGames = this.steamGameController.getAllSteamGames();
        this.setupGamesPageFiltering(steamGames);
        
        // Apply initial search filter
        const filteredGames = this.filterGamesBySearch(steamGames, searchTerm);
        this.sortGames(filteredGames, 'rating'); // Default sort by rating
        
        console.log(`🎮 Found ${filteredGames.length} games matching "${searchTerm}"`);
        this.gameView.renderGames(filteredGames);
        
        // Update page title to show search results
        const gamesTitle = document.querySelector('#games-content .section-title');
        if (gamesTitle) {
            gamesTitle.textContent = `Resultados da busca: "${searchTerm}" (${filteredGames.length} jogos)`;
        }
        
        // Save current page to localStorage
        localStorage.setItem('currentPage', 'games');
        localStorage.setItem('currentSearch', searchTerm);
    }
    
    // Filter games by search term
    filterGamesBySearch(games, searchTerm) {
        const term = searchTerm.toLowerCase();
        return games.filter(game => 
            game.title.toLowerCase().includes(term) ||
            game.description.toLowerCase().includes(term) ||
            game.genre.toLowerCase().includes(term) ||
            game.platform.toLowerCase().includes(term)
        );
    }
    
    // Setup review events
    setupReviewEvents() {
        // Listen for review game event
        document.addEventListener('reviewGame', (e) => {
            const gameId = e.detail.gameId;
            this.reviewController.showReviewModal(gameId);
        });
        
        // Listen for navigate to game page event (from sidebar)
        document.addEventListener('navigateToGamePage', (e) => {
            const { gameId, gameTitle } = e.detail;
            this.showGamesPageWithGame(gameId, gameTitle);
        });
        
        // Listen for edit review event
        document.addEventListener('editReview', (e) => {
            const reviewId = e.detail.reviewId;
            this.reviewController.showEditReviewModal(reviewId);
        });
        
        // Listen for delete review event
        document.addEventListener('deleteReview', (e) => {
            const reviewId = e.detail.reviewId;
            this.reviewController.deleteReview(reviewId);
            // Refresh the current page to show updated reviews
            this.refreshCurrentPage();
        });
        
        // Listen for like review event
        document.addEventListener('likeReview', (e) => {
            const reviewId = e.detail.reviewId;
            this.reviewController.likeReview(reviewId);
        });
        
        // Listen for review liked event (to update UI)
        document.addEventListener('reviewLiked', (e) => {
            const { reviewId, isLiked, likeCount } = e.detail;
            
            // Update the like button in the feed view if we're on the feed page
            const currentPage = localStorage.getItem('currentPage');
            if (currentPage === 'feed') {
                this.feedView.updateLikeButton(reviewId, isLiked, likeCount);
            }
        });
        
        // Listen for new review added event
        document.addEventListener('reviewAdded', (e) => {
            console.log('🎉 Nova avaliação adicionada!', e.detail.review);
            
            // Refresh the current page to show the new review
            const currentPage = localStorage.getItem('currentPage');
            if (currentPage === 'feed') {
                this.refreshFeed();
                console.log('📰 Feed atualizado com nova avaliação');
            } else if (currentPage === 'profile') {
                this.profileController.updateProfileData();
                console.log('👤 Perfil atualizado com nova avaliação');
            }
        });
        
        // Listen for review updated event
        document.addEventListener('reviewUpdated', (e) => {
            console.log('✏️ Avaliação atualizada!', e.detail.review);
            
            // Refresh the current page to show the updated review
            const currentPage = localStorage.getItem('currentPage');
            if (currentPage === 'feed') {
                this.refreshFeed();
                console.log('📰 Feed atualizado com avaliação editada');
            } else if (currentPage === 'profile') {
                this.profileController.updateProfileData();
                console.log('👤 Perfil atualizado com avaliação editada');
            }
        });
        
        // Listen for collection events
        document.addEventListener('addToCollection', (e) => {
            const gameId = e.detail.gameId;
            this.collectionController.addToCollection(gameId);
        });
        
        document.addEventListener('removeFromCollection', (e) => {
            const gameId = e.detail.gameId;
            this.collectionController.removeFromCollection(gameId);
        });
        
        // Listen for collection updated event
        document.addEventListener('collectionUpdated', (e) => {
            console.log('📚 Coleção atualizada!', e.detail);
            
            // Refresh current page if needed
            const currentPage = localStorage.getItem('currentPage');
            if (currentPage === 'collection') {
                this.refreshCollection();
            } else if (currentPage === 'games') {
                // Refresh games page to update collection buttons
                this.refreshGames();
            } else if (currentPage === 'profile') {
                // Update profile stats
                this.profileController.updateProfileData();
            }
        });
    }
    
    // Show home page
    showHome() {
        this.hideAllPages();
        this.homeView.show();
        
        // Hide navigation items on home page
        if (this.navItems) this.navItems.style.display = 'none';
        if (this.searchBar) this.searchBar.style.display = 'none';
        
        // Save current page to localStorage
        localStorage.setItem('currentPage', 'home');
    }
    
    // Show feed page
    showFeed() {
        // Temporarily disable login check for testing
        // if (!this.authController.isLoggedIn()) {
        //     console.log('🔒 User not logged in, redirecting to home');
        //     this.showHome();
        //     return;
        // }
        
        console.log('📰 Showing feed page...');
        this.hideAllPages();
        this.feedView.show();
        
        // Show navigation items on feed page
        if (this.navItems) this.navItems.style.display = 'flex';
        if (this.searchBar) this.searchBar.style.display = 'block';
        
        // Load recent reviews
        const reviews = ReviewModel.getRecentReviews();
        // Use Steam games instead of mocked games
        const allGames = GameModel.getAllGamesIncludingSteam();
        console.log('📊 Feed data:', {
            reviews: reviews.length,
            games: allGames.length
        });
        this.feedView.renderReviews(reviews, allGames);
        
        // Load recommended Steam games
        const recommendedGames = GameModel.getRecommendedGames();
        console.log('🎯 Recommended games:', recommendedGames.length);
        this.feedView.renderRecommendedGames(recommendedGames);
        
        // Save current page to localStorage
        localStorage.setItem('currentPage', 'feed');
    }
    
    // Show profile page
    showProfile() {
        // Check if user is logged in
        if (!this.authController.isLoggedIn()) {
            this.showHome();
            return;
        }
        
        this.hideAllPages();
        this.profileView.show();
        
        // Show navigation items on profile page
        if (this.navItems) this.navItems.style.display = 'flex';
        if (this.searchBar) this.searchBar.style.display = 'block';
        
        // Update profile data
        this.profileController.updateProfileData();
        
        // Save current page to localStorage
        localStorage.setItem('currentPage', 'profile');
    }
    
    // Show games catalog page
    showGames() {
        // Temporarily disable login check for testing
        // if (!this.authController.isLoggedIn()) {
        //     this.showHome();
        //     return;
        // }
        
        this.hideAllPages();
        this.gameView.show();
        
        // Show navigation items on games page
        if (this.navItems) this.navItems.style.display = 'flex';
        if (this.searchBar) this.searchBar.style.display = 'block';
        
        // Clear any previous search
        const gamesSearchInput = document.getElementById('games-search');
        if (gamesSearchInput) {
            gamesSearchInput.value = '';
        }
        
        // Reset page title
        const gamesTitle = document.querySelector('#games-content .section-title');
        if (gamesTitle) {
            gamesTitle.textContent = 'Jogos da Steam';
        }
        
        // Load only Steam games (replacing the regular catalog)
        const steamGames = this.steamGameController.getAllSteamGames();
        this.gameView.renderGames(steamGames);
        
        // Setup filter listener for the games page
        this.setupGamesPageFiltering(steamGames);
        
        // Save current page to localStorage
        localStorage.setItem('currentPage', 'games');
        localStorage.removeItem('currentSearch'); // Clear any saved search
        localStorage.removeItem('currentGameFocus'); // Clear any saved game focus
    }
    
    // Setup filtering for the games page
    setupGamesPageFiltering(allGames) {
        // Remove any existing filter listeners to avoid duplicates
        this.gameView.filterCallbacks = [];
        
        // Add filter change listener
        this.gameView.addFilterChangeListener((filters) => {
            console.log('🔍 Applying filters:', filters);
            
            let filteredGames = [...allGames];
            
            // Apply search filter
            if (filters.search) {
                filteredGames = this.filterGamesBySearch(filteredGames, filters.search);
            }
            
            // Apply platform filter
            if (filters.platform) {
                filteredGames = filteredGames.filter(game => 
                    game.platform.toLowerCase().includes(filters.platform.toLowerCase())
                );
            }
            
            // Apply genre filter
            if (filters.genre) {
                filteredGames = filteredGames.filter(game => 
                    game.genre.toLowerCase().includes(filters.genre.toLowerCase())
                );
            }
            
            // Apply sorting
            this.sortGames(filteredGames, filters.sort);
            
            // Update the display
            this.gameView.renderGames(filteredGames);
            
            // Update title with results count
            const gamesTitle = document.querySelector('#games-content .section-title');
            if (gamesTitle) {
                if (filters.search || filters.platform || filters.genre) {
                    const filterText = filters.search ? `"${filters.search}"` : 'filtros aplicados';
                    gamesTitle.textContent = `Resultados: ${filterText} (${filteredGames.length} jogos)`;
                } else {
                    gamesTitle.textContent = 'Jogos da Steam';
                }
            }
        });
    }
    
    // Sort games based on sort option
    sortGames(games, sortOption) {
        switch (sortOption) {
            case 'rating':
                games.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating-asc':
                games.sort((a, b) => a.rating - b.rating);
                break;
            case 'name':
                games.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'name-desc':
                games.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'release':
            case 'release-asc':
                // For now, sort by rating as we don't have release dates
                games.sort((a, b) => b.rating - a.rating);
                break;
            default:
                games.sort((a, b) => b.rating - a.rating);
        }
    }
    
    // Refresh feed page content
    refreshFeed() {
        if (!this.authController.isLoggedIn()) return;
        
        console.log('🔄 Refreshing feed content...');
        
        // Load recent reviews
        const reviews = ReviewModel.getRecentReviews();
        // Use Steam games instead of mocked games
        const allGames = GameModel.getAllGamesIncludingSteam();
        console.log('📊 Refreshed feed data:', {
            reviews: reviews.length,
            games: allGames.length
        });
        this.feedView.renderReviews(reviews, allGames);
        
        // Load recommended Steam games
        const recommendedGames = GameModel.getRecommendedGames();
        console.log('🎯 Refreshed recommended games:', recommendedGames.length);
        this.feedView.renderRecommendedGames(recommendedGames);
    }
    
    // Refresh games page content
    refreshGames() {
        if (!this.authController.isLoggedIn()) return;
        
        console.log('🔄 Refreshing games catalog...');
        
        // Load only Steam games (replacing the regular catalog)
        const steamGames = this.steamGameController.getAllSteamGames();
        console.log('🎮 Refreshed Steam games:', steamGames.length);
        
        // Check if there's a current game focus to maintain
        const savedGameFocus = localStorage.getItem('currentGameFocus');
        const savedSearch = localStorage.getItem('currentSearch');
        
        if (savedGameFocus) {
            // Maintain specific game focus
            const { gameId, gameTitle } = JSON.parse(savedGameFocus);
            this.setupGamesPageFiltering(steamGames);
            const filteredGames = this.filterGamesForSpecificGame(steamGames, gameId, gameTitle);
            this.sortGames(filteredGames, 'rating');
            this.gameView.renderGames(filteredGames, gameId);
            
            // Update title
            const gamesTitle = document.querySelector('#games-content .section-title');
            if (gamesTitle) {
                gamesTitle.textContent = `Jogo: ${gameTitle}`;
            }
        } else if (savedSearch) {
            // Maintain search results
            this.setupGamesPageFiltering(steamGames);
            const filteredGames = this.filterGamesBySearch(steamGames, savedSearch);
            this.sortGames(filteredGames, 'rating');
            this.gameView.renderGames(filteredGames);
            
            // Update title
            const gamesTitle = document.querySelector('#games-content .section-title');
            if (gamesTitle) {
                gamesTitle.textContent = `Resultados da busca: "${savedSearch}" (${filteredGames.length} jogos)`;
            }
        } else {
            // Show all games with filtering system
            this.setupGamesPageFiltering(steamGames);
            this.gameView.renderGames(steamGames);
        }
    }
    
    // Refresh collection page content
    refreshCollection() {
        if (!this.authController.isLoggedIn()) return;
        
        console.log('🔄 Refreshing collection content...');
        this.collectionController.updateCollectionDisplay();
    }
    
    // Refresh current page content
    refreshCurrentPage() {
        const currentPage = localStorage.getItem('currentPage');
        switch (currentPage) {
            case 'feed':
                this.refreshFeed();
                break;
            case 'games':
                this.refreshGames();
                break;
            case 'collection':
                this.refreshCollection();
                break;
            case 'profile':
                this.profileController.updateProfileData();
                break;
            default:
                console.log('No specific refresh needed for current page');
        }
    }
    
    // Hide all pages
    hideAllPages() {
        this.homeView.hide();
        this.feedView.hide();
        this.profileView.hide();
        this.gameView.hide();
        this.collectionView.hide();
    }
    
    // Load saved page state on refresh
    loadSavedPageState() {
        const savedPage = localStorage.getItem('currentPage');
        const savedSearch = localStorage.getItem('currentSearch');
        const savedGameFocus = localStorage.getItem('currentGameFocus');
        
        if (savedPage) {
            switch (savedPage) {
                case 'feed':
                    this.showFeed();
                    break;
                case 'collection':
                    this.showCollection();
                    break;
                case 'profile':
                    this.showProfile();
                    break;
                case 'games':
                    if (savedGameFocus) {
                        // Restore specific game focus
                        const { gameId, gameTitle } = JSON.parse(savedGameFocus);
                        this.showGamesPageWithGame(gameId, gameTitle);
                    } else if (savedSearch) {
                        // Restore search results
                        this.showGamesWithSearch(savedSearch);
                        // Also restore the search term in the header
                        const headerSearchInput = document.getElementById('header-search');
                        if (headerSearchInput) {
                            headerSearchInput.value = savedSearch;
                        }
                    } else {
                        this.showGames();
                    }
                    break;
                case 'home':
                default:
                    this.showHome();
                    break;
            }
        } else {
            this.showHome();
        }
    }
    
    // Show games page with a specific game highlighted
    showGamesPageWithGame(gameId, gameTitle) {
        console.log('🎮 Navigating to games page for game:', { gameId, gameTitle });
        
        // Check if user is logged in
        if (!this.authController.isLoggedIn()) {
            alert('Você precisa estar logado para ver os jogos.');
            return;
        }
        
        // Navigate to games page
        this.hideAllPages();
        this.gameView.show();
        
        // Show navigation items
        if (this.navItems) this.navItems.style.display = 'flex';
        if (this.searchBar) this.searchBar.style.display = 'block';
        
        // Clear header search
        const headerSearchInput = document.getElementById('header-search');
        if (headerSearchInput) {
            headerSearchInput.value = '';
        }
        
        // Set the game title as search term in the games page search input
        const gamesSearchInput = document.getElementById('games-search');
        if (gamesSearchInput) {
            gamesSearchInput.value = gameTitle;
        }
        
        // Load Steam games and setup filtering
        const steamGames = this.steamGameController.getAllSteamGames();
        this.setupGamesPageFiltering(steamGames);
        
        // Filter games to show the specific game and similar ones
        const filteredGames = this.filterGamesForSpecificGame(steamGames, gameId, gameTitle);
        this.sortGames(filteredGames, 'rating'); // Default sort by rating
        
        console.log(`🎯 Showing specific game: "${gameTitle}"`);
        this.gameView.renderGames(filteredGames, gameId);
        
        // Update page title to show the specific game
        const gamesTitle = document.querySelector('#games-content .section-title');
        if (gamesTitle) {
            gamesTitle.textContent = `Jogo: ${gameTitle}`;
        }
        
        // Save current page to localStorage
        localStorage.setItem('currentPage', 'games');
        localStorage.setItem('currentGameFocus', JSON.stringify({ gameId, gameTitle }));
        localStorage.removeItem('currentSearch'); // Clear any saved search
        
        // Scroll to top of games page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Filter games to show a specific game only
    filterGamesForSpecificGame(games, targetGameId, targetGameTitle) {
        // First, try to find the exact game
        const exactGame = games.find(game => game.id === targetGameId);
        
        if (exactGame) {
            // Return only the exact game that was clicked
            return [exactGame];
        } else {
            // If exact game not found, search by title and return only the first match
            const searchResults = this.filterGamesBySearch(games, targetGameTitle);
            return searchResults.length > 0 ? [searchResults[0]] : [];
        }
    }
    
    // Show collection page
    showCollection() {
        // Check if user is logged in
        if (!this.authController.isLoggedIn()) {
            this.showHome();
            return;
        }
        
        this.hideAllPages();
        this.collectionView.show();
        
        // Show navigation items on collection page
        if (this.navItems) this.navItems.style.display = 'flex';
        if (this.searchBar) this.searchBar.style.display = 'block';
        
        // Update collection display
        this.collectionController.updateCollectionDisplay();
        
        // Save current page to localStorage
        localStorage.setItem('currentPage', 'collection');
    }
}

export default AppController; 
