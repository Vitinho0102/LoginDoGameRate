const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Serve static files from the current directory
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Handle SPA routing - serve index.html for any route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`🌐 Game Rate v4 rodando em http://localhost:${port}`);
    console.log(`📡 API Server em http://localhost:3000`);
    console.log(`🎮 Abra http://localhost:${port} no seu navegador`);
}); 