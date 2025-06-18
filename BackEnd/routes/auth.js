const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// Registrar usuário
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Verificar se email já existe
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).send({ message: 'Email já cadastrado' });
        }

        // Verificar se username já existe
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return res.status(400).send({ message: 'Nome de usuário já cadastrado' });
        }

        // Criar novo usuário
        const user = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            collection: []
        });

        await user.save();

        // Gerar token
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

        res.status(201).send({
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
            token
        });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Encontrar usuário
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).send({ message: 'Usuário não encontrado' });
        }

        // Verificar senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: 'Senha incorreta' });
        }

        // Gerar token
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

        res.send({
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
            token
        });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Verificar token e retornar dados do usuário
router.get('/me', auth, async (req, res) => {
    res.send({
        username: req.user.username,
        email: req.user.email,
        profileImage: req.user.profileImage
    });
});

// Verificar se email existe
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        res.send({ exists: !!user });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Verificar se username existe
router.post('/check-username', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username: username.toLowerCase() });
        res.send({ exists: !!user });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Adicionar jogo à coleção
router.post('/collection/add', auth, async (req, res) => {
    try {
        const { gameId } = req.body;
        
        if (req.user.collection.includes(gameId)) {
            return res.status(400).send({ message: 'Jogo já está na sua coleção' });
        }

        req.user.collection.push(gameId);
        await req.user.save();

        res.send({ collection: req.user.collection });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Remover jogo da coleção
router.post('/collection/remove', auth, async (req, res) => {
    try {
        const { gameId } = req.body;
        
        const index = req.user.collection.indexOf(gameId);
        if (index === -1) {
            return res.status(400).send({ message: 'Jogo não encontrado na coleção' });
        }

        req.user.collection.splice(index, 1);
        await req.user.save();

        res.send({ collection: req.user.collection });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Verificar se jogo está na coleção
router.post('/collection/check', auth, async (req, res) => {
    try {
        const { gameId } = req.body;
        res.send({ isInCollection: req.user.collection.includes(gameId) });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Obter coleção do usuário
router.get('/collection', auth, async (req, res) => {
    try {
        res.send({ collection: req.user.collection });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router; 
