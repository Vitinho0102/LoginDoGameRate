# Frontend Documentation - Game Rate v4

## 📋 Visão Geral

O frontend é uma Single Page Application (SPA) construída com **JavaScript vanilla** seguindo o padrão **MVC (Model-View-Controller)**. Interface moderna e responsiva para avaliação de jogos, com autenticação JWT e integração MongoDB.

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend**: JavaScript ES6+, HTML5, CSS3
- **Arquitetura**: MVC Pattern
- **Autenticação**: JWT (JSON Web Tokens)
- **Styling**: CSS3 com Flexbox e Grid
- **Icons**: Emoji + CSS personalizado
- **Build**: Vanilla JavaScript (sem frameworks)

### Padrão MVC

#### Models (js/models/)
Gerenciam dados e lógica de negócio:

```javascript
// UserModel.js - Gerencia usuários e autenticação
class UserModel {
    constructor() {
        this.token = localStorage.getItem('token') || null;
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }
    
    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return data;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            throw error;
        }
    }
    
    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('token', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return data;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            throw error;
        }
    }
    
    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        return Promise.resolve();
    }
    
    isAuthenticated() {
        return !!this.token;
    }
    
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}
```

- **UserModel.js** (357 linhas): Autenticação JWT e perfil
- **GameModel.js** (166 linhas): Jogos e filtros  
- **ReviewModel.js** (333 linhas): Avaliações CRUD
- **SteamGameModel.js** (217 linhas): Integração Steam

#### Views (js/views/)
Renderizam interface do usuário:

```javascript
// Exemplo de renderização dinâmica
renderGameCard(game) {
    return `
        <div class="game-card" data-game-id="${game._id}">
            <img src="${game.image}" alt="${game.name}" loading="lazy">
            <div class="game-info">
                <h3>${game.name}</h3>
                <p class="price">R$ ${(game.price / 100).toFixed(2)}</p>
                <div class="game-actions">
                    <button class="btn btn-primary add-to-collection">
                        ➕ Adicionar
                    </button>
                    <button class="btn btn-outline rate-game">
                        ⭐ Avaliar
                    </button>
                </div>
            </div>
        </div>
    `;
}
```

#### Controllers (js/controllers/)
Conectam Models e Views:

- **AppController.js** (775 linhas): Controlador principal
- **AuthController.js** (120 linhas): Autenticação JWT
- **GameController.js** (45 linhas): Operações de jogos
- **ReviewController.js** (255 linhas): Sistema de avaliações
- **ProfileController.js** (107 linhas): Perfil do usuário
- **CollectionController.js** (122 linhas): Coleção pessoal

## 🎯 Funcionalidades

### 🔐 Sistema de Autenticação
- **Login/Registro**: Modal responsivo com validação
- **JWT**: Tokens armazenados no localStorage
- **Bcrypt**: Senhas hasheadas no backend
- **Sessão**: Persistência via JWT
- **Feedback**: Mensagens visuais de erro/sucesso

### 🎮 Catálogo de Jogos
- **Grid Responsivo**: Cards de jogos adaptáveis
- **Busca em Tempo Real**: Filtro por nome
- **Lazy Loading**: Carregamento otimizado de imagens
- **Integração Steam**: Dados da API local
- **Autenticação**: Rotas protegidas por JWT

### ⭐ Sistema de Avaliações
- **Modal de Avaliação**: Sistema de 5 estrelas
- **Feed de Reviews**: Timeline da comunidade
- **CRUD Completo**: Criar, editar, excluir
- **Validação**: Nota obrigatória + comentário opcional
- **Autenticação**: Apenas usuários logados

### 📚 Coleção Pessoal
- **Minha Biblioteca**: Jogos salvos pelo usuário
- **Status**: Jogando, Concluído, Desejo Jogar
- **Estatísticas**: Contadores e métricas
- **Sincronização**: Dados persistidos no MongoDB

### 👤 Perfil do Usuário
- **Dashboard**: Atividade e estatísticas
- **Avatar**: Upload de imagem de perfil
- **Histórico**: Todas as avaliações do usuário
- **Segurança**: Dados protegidos por JWT

## 🎨 Interface e Design

### Design System
```css
:root {
    /* Cores Primárias */
    --primary-blue: #007bff;
    --success-green: #28a745;
    --danger-red: #dc3545;
    --warning-yellow: #ffc107;
    
    /* Tipografia */
    --font-main: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    --font-size-base: 16px;
    --line-height-base: 1.5;
    
    /* Espaçamento */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
}
```

### Componentes Principais

#### Header Navigation
```html
<header class="main-header">
    <div class="container">
        <div class="header-content">
            <div class="logo">
                <span class="logo-icon">🎮</span>
                <h1>Game Rate</h1>
            </div>
            <div class="search-bar">
                <input type="text" placeholder="Buscar jogos...">
                <button class="search-btn">🔍</button>
            </div>
            <nav class="main-nav">
                <ul>
                    <li><a href="#home">Início</a></li>
                    <li><a href="#games">Jogos</a></li>
                    <li><a href="#collection">Coleção</a></li>
                    <li><a href="#profile">Perfil</a></li>
                    <li class="auth-buttons">
                        <button class="btn btn-outline login-btn">Login</button>
                        <button class="btn btn-primary register-btn">Registrar</button>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
</header>
```

#### Auth Modal
```html
<div class="modal auth-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Login</h2>
            <button class="close-modal">✕</button>
        </div>
        <div class="modal-body">
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Senha</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Entrar</button>
            </form>
            <p class="switch-form">
                Não tem conta? <a href="#" class="switch-to-register">Registre-se</a>
            </p>
        </div>
    </div>
</div>
```

#### Game Cards
```css
.game-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    overflow: hidden;
}

.game-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.game-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}
```

## 📱 Responsividade

### Breakpoints
```css
/* Mobile First Approach */
.container {
    max-width: 100%;
    padding: 0 16px;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        max-width: 750px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 1000px;
    }
}

/* Large Desktop */
@media (min-width: 1200px) {
    .container {
        max-width: 1170px;
    }
}
```

## 🔒 Segurança

### JWT Handling
```javascript
// Interceptor para adicionar token em todas as requisições
const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
    
    const response = await fetch(url, options);
    
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
    }
    
    return response;
};
```

### Input Validation
```javascript
// Validação de formulários
const validateForm = (data) => {
    const errors = {};
    
    if (!data.email || !data.email.includes('@')) {
        errors.email = 'Email inválido';
    }
    
    if (!data.password || data.password.length < 6) {
        errors.password = 'Senha deve ter no mínimo 6 caracteres';
    }
    
    return errors;
};
```

### XSS Prevention
```javascript
// Sanitização de inputs
const sanitizeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};
```

## 🔄 Estado da Aplicação

### Local Storage
```javascript
// Gerenciamento de estado local
class StateManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('currentUser'));
    }
    
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    }
    
    isAuthenticated() {
        return !!this.token;
    }
}
```

### Event Bus
```javascript
// Sistema de eventos para comunicação entre componentes
class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
}

const eventBus = new EventBus();
```

## 🎨 Temas e Customização

### Tema Claro/Escuro
```css
/* Variáveis de tema */
:root {
    /* Tema Claro (padrão) */
    --bg-primary: #ffffff;
    --text-primary: #333333;
    --border-color: #e0e0e0;
}

/* Tema Escuro */
[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
    --border-color: #404040;
}
```

### Toggle de Tema
```javascript
// Alternador de tema
const toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
};
```

## 🎯 Performance

### Otimizações Implementadas
- **Lazy Loading**: Imagens carregadas sob demanda
- **Event Delegation**: Gerenciamento eficiente de eventos
- **Debouncing**: Busca otimizada
- **Virtual Scrolling**: Para listas grandes (planejado)
- **Code Splitting**: Carregamento modular (planejado)

### Web Vitals Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

## 🧪 Testing & Quality

### Browser Support
- ✅ **Chrome 80+**: Suporte completo
- ✅ **Firefox 75+**: Suporte completo  
- ✅ **Safari 13+**: Suporte completo
- ✅ **Edge 80+**: Suporte completo
- ⚠️ **IE 11**: Não suportado

### Manual Testing Checklist
- ✅ **Navegação**: Todas as páginas funcionais
- ✅ **Autenticação**: Login/logout/registro
- ✅ **CRUD Reviews**: Criar/editar/excluir avaliações
- ✅ **Responsividade**: Mobile/tablet/desktop
- ✅ **Performance**: Carregamento < 3s
- ✅ **Acessibilidade**: Keyboard navigation

## 🚀 Roadmap

### Próximas Features
- [ ] **PWA**: Service Worker e offline support
- [ ] **Dark Mode**: Tema escuro configurável
- [ ] **Real-time**: WebSocket para updates live
- [ ] **Social**: Seguir usuários, comments em reviews
- [ ] **Advanced Search**: Filtros mais sofisticados
- [ ] **Gamification**: Sistema de pontos e badges
- [ ] **i18n**: Suporte a múltiplos idiomas
- [ ] **Voice Search**: Busca por voz
- [ ] **AR/VR**: Preview de jogos em realidade aumentada

### Performance Goals
- [ ] **Lighthouse Score**: 95+ em todas as métricas
- [ ] **Bundle Size**: < 100KB gzipped
- [ ] **Time to Interactive**: < 2s
- [ ] **Memory Usage**: < 50MB em mobile

## 🐛 Troubleshooting

### Problemas Comuns

1. **Página em Branco**
```javascript
// Debug no console
console.log('App initialized:', window.app);
console.log('Current user:', AppState.currentUser);
console.log('LocalStorage data:', localStorage);
```

2. **Login Não Funciona**
```javascript
// Verificar dados salvos
console.log('Users:', JSON.parse(localStorage.getItem('gameRateUsers')));
console.log('Current user:', JSON.parse(localStorage.getItem('currentUser')));
```

3. **Imagens Não Carregam**
```javascript
// Verificar CORS e URLs
fetch('http://localhost:3000/api/steam-games')
    .then(response => response.json())
    .then(data => console.log('API Response:', data))
    .catch(error => console.error('API Error:', error));
```

### Debug Mode
```javascript
// Ativar logs detalhados
window.DEBUG = true;
window.app.enableDebugMode();

// Logs automáticos
if (window.DEBUG) {
    console.log(`[${new Date().toISOString()}] Action:`, action, data);
}
``` 
