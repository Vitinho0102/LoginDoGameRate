# Backend Documentation - Game Rate v4

## 📋 Visão Geral

O backend é uma **API REST** construída com **Node.js + Express.js** que fornece dados de jogos através de um banco **MongoDB**. Implementa autenticação segura com JWT e bcrypt, além de servir os arquivos estáticos do frontend.

## 🏗️ Arquitetura

### Stack Tecnológica
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB 6.0+
- **Authentication**: JWT + bcrypt
- **CORS**: Habilitado para cross-origin requests
- **Static Files**: Servindo frontend integrado

### Componentes Principais
- **API Server** (`server.js`): Servidor Express principal
- **Database** (`MongoDB`): Banco NoSQL com collections de usuários, jogos e reviews
- **Auth Middleware**: Validação de JWT tokens
- **CORS Middleware**: Headers para permitir requests do frontend
- **Static Middleware**: Servindo arquivos HTML/CSS/JS

## 📁 Estrutura do Backend

```
js/
├── server.js                # Servidor principal
├── config/
│   └── database.js         # Configuração MongoDB
├── middleware/
│   ├── auth.js             # Middleware JWT
│   └── validation.js       # Validação de inputs
├── models/
│   ├── UserModel.js        # Schema de usuários
│   ├── GameModel.js        # Schema de jogos
│   ├── ReviewModel.js      # Schema de reviews
│   └── CollectionModel.js  # Schema de coleções
├── controllers/
│   ├── AuthController.js   # Lógica de autenticação
│   ├── GameController.js   # Operações de jogos
│   ├── ReviewController.js # Gerenciamento de reviews
│   └── ProfileController.js # Perfil de usuário
└── utils/
    ├── jwt.js              # Utilitários JWT
    └── bcrypt.js           # Funções de hash
```

## 🚀 Inicialização do Servidor

### Configuração Principal
```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Middleware JWT
const authMiddleware = require('./middleware/auth');

// Servir arquivos estáticos
app.use(express.static('./'));

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
```

### Inicialização
```javascript
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
```

## 🗄️ Banco de Dados

### Schemas MongoDB

#### User Schema
```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });
```

#### Game Schema
```javascript
const gameSchema = new mongoose.Schema({
  steamId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  image: String,
  price: Number
}, { timestamps: true });
```

#### Review Schema
```javascript
const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String
}, { timestamps: true });
```

#### Collection Schema
```javascript
const collectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  status: {
    type: String,
    enum: ['playing', 'completed', 'wishlist'],
    required: true
  }
}, { timestamps: true });
```

## 🔒 Autenticação

### JWT Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const [, token] = authHeader.split(' ');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

### Bcrypt Utils
```javascript
// utils/bcrypt.js
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS));
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
```

## 📡 Controllers

### Auth Controller
```javascript
// controllers/AuthController.js
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const User = require('../models/UserModel');

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      const hashedPassword = await hashPassword(password);
      
      const user = await User.create({
        username,
        email,
        password: hashedPassword
      });
      
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });
      
      return res.status(201).json({ user, token });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
  
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const validPassword = await comparePassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });
      
      return res.json({ user, token });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AuthController();
```

### Game Controller
```javascript
// controllers/GameController.js
const Game = require('../models/GameModel');

class GameController {
  async index(req, res) {
    try {
      const games = await Game.find();
      return res.json(games);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  
  async show(req, res) {
    try {
      const game = await Game.findById(req.params.id);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      return res.json(game);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new GameController();
```

## 🔐 Segurança

### Headers de Segurança
```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite por IP
});

app.use('/api/', limiter);
```

### Input Validation
```javascript
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('username').trim().isLength({ min: 3 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { registerValidation };
```

## 📝 Exemplos de Uso

### Registro de Usuário
```javascript
const registerUser = async (userData) => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

### Login
```javascript
const login = async (credentials) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```

### Requisição Autenticada
```javascript
const getGames = async (token) => {
  const response = await fetch('http://localhost:3000/api/steam-games', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## 🔍 Índices MongoDB

### Índices Otimizados
```javascript
// Índices para User
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });

// Índices para Game
db.games.createIndex({ "steamId": 1 }, { unique: true });
db.games.createIndex({ "name": "text" });

// Índices para Review
db.reviews.createIndex({ "userId": 1, "gameId": 1 });
db.reviews.createIndex({ "gameId": 1 });

// Índices para Collection
db.collections.createIndex({ "userId": 1, "gameId": 1 }, { unique: true });
```

## 🔄 Backup e Restore

### Backup do MongoDB
```bash
# Backup completo
mongodump --uri="mongodb://localhost:27017/gamerate" --out=./backup

# Backup de uma collection específica
mongodump --uri="mongodb://localhost:27017/gamerate" --collection=users --out=./backup
```

### Restore
```bash
# Restore completo
mongorestore --uri="mongodb://localhost:27017/gamerate" ./backup/gamerate

# Restore de uma collection específica
mongorestore --uri="mongodb://localhost:27017/gamerate" --collection=users ./backup/gamerate/users.bson
```
