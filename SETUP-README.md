# Setup & Requirements - Game Rate v4

## 📋 Visão Geral

Guia completo para instalação, configuração e execução do Game Rate v4. O projeto combina **Node.js/Express** (backend) com **MongoDB** para persistência de dados e **JavaScript vanilla** (frontend) em uma arquitetura full-stack moderna e segura.

## 📦 Dependências

### ✅ **Dependências Obrigatórias (Locais)**
```bash
# Node.js (projeto funciona 100% com estas)
npm install express mongodb bcrypt jsonwebtoken

# Python (para scripts de utilidade)
pip install requests
```

### ⚙️ **Dependências Opcionais (Globais)**
```bash
# Para desenvolvimento (auto-reload)
npm install -g nodemon

# Para produção (process manager)
npm install -g pm2

# Para deploy (escolher uma plataforma)
npm install -g vercel heroku railway
```

**⚠️ Importante**: O projeto funciona completamente **SEM dependências globais**. As globais são apenas para conveniência de desenvolvimento e produção.

## 🖥️ Requisitos do Sistema

### Requisitos Mínimos
- **Sistema Operacional**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: Versão 14.0+ (LTS recomendado)
- **Python**: Versão 3.7+ (para scripts de utilidade)
- **MongoDB**: Versão 5.0+
- **Navegador**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **RAM**: 4GB mínimo
- **Armazenamento**: 1GB livre

### Requisitos Recomendados
- **Node.js**: Versão 18.0+ (LTS atual)
- **Python**: Versão 3.10+
- **MongoDB**: Versão 6.0+
- **RAM**: 8GB ou mais
- **SSD**: Para melhor performance do MongoDB

## 🚀 Instalação Rápida

### Passo 1: Verificar Pré-requisitos
```bash
# Verificar Node.js
node --version
# Esperado: v14.0.0 ou superior

# Verificar npm
npm --version
# Esperado: 6.0.0 ou superior

# Verificar MongoDB
mongod --version
# Esperado: v5.0.0 ou superior
```

### Passo 2: Clonar o Repositório
```bash
# Via HTTPS
git clone https://github.com/SEU_USUARIO/gameRatev4.git

# Via SSH (se configurado)
git clone git@github.com:SEU_USUARIO/gameRatev4.git

# Entrar no diretório
cd gameRatev4
```

### Passo 3: Instalar Dependências
```bash
# Instalar dependências do Node.js
npm install

# Instalar dependências do Python (opcional)
pip install -r requirements.txt
```

### Passo 4: Configurar MongoDB
```bash
# Iniciar o serviço MongoDB
# Windows (como administrador)
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Passo 5: Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
MONGODB_URI=mongodb://localhost:27017/gamerate
JWT_SECRET=seu_jwt_secret_aqui
BCRYPT_SALT_ROUNDS=10
PORT=3000
```

### Passo 6: Iniciar o Servidor
```bash
# Iniciar servidor de desenvolvimento
npm start

# Ou diretamente com Node.js
node server.js
```

### Passo 7: Acessar a Aplicação
```
Abra o navegador e acesse:
http://localhost:3000
```

## 📦 Instalação Detalhada

### Windows

#### 1. Instalar Node.js
```powershell
# Baixar do site oficial
# https://nodejs.org/

# Ou via Chocolatey
choco install nodejs

# Ou via Winget
winget install OpenJS.NodeJS
```

#### 2. Instalar MongoDB
```powershell
# Via Chocolatey
choco install mongodb

# Ou baixar do site oficial
# https://www.mongodb.com/try/download/community
```

#### 3. Configurar Projeto
```powershell
# Clonar repositório
git clone https://github.com/SEU_USUARIO/gameRatev4.git
cd gameRatev4

# Instalar dependências
npm install

# Configurar .env
echo MONGODB_URI=mongodb://localhost:27017/gamerate > .env
echo JWT_SECRET=seu_jwt_secret_aqui >> .env
echo BCRYPT_SALT_ROUNDS=10 >> .env
echo PORT=3000 >> .env

# Iniciar servidor
npm start
```

### macOS

#### 1. Instalar via Homebrew
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js e MongoDB
brew install node mongodb-community

# Verificar instalação
node --version
mongod --version
```

#### 2. Configurar Projeto
```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/gameRatev4.git
cd gameRatev4

# Instalar dependências
npm install

# Configurar .env
cat > .env << EOL
MONGODB_URI=mongodb://localhost:27017/gamerate
JWT_SECRET=seu_jwt_secret_aqui
BCRYPT_SALT_ROUNDS=10
PORT=3000
EOL

# Iniciar MongoDB
brew services start mongodb-community

# Iniciar servidor
npm start
```

### Ubuntu/Debian

#### 1. Instalar Node.js e MongoDB
```bash
# Atualizar pacotes
sudo apt update

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 2. Configurar Projeto
```bash
# Clonar e configurar
git clone https://github.com/SEU_USUARIO/gameRatev4.git
cd gameRatev4
npm install

# Configurar .env
cat > .env << EOL
MONGODB_URI=mongodb://localhost:27017/gamerate
JWT_SECRET=seu_jwt_secret_aqui
BCRYPT_SALT_ROUNDS=10
PORT=3000
EOL

# Iniciar servidor
npm start
```

## 🔒 Segurança

### Configuração do bcrypt
O projeto usa bcrypt para hash seguro de senhas:
- Salt rounds configurável via `BCRYPT_SALT_ROUNDS`
- Hash único para cada senha
- Proteção contra ataques de rainbow table

### JWT (JSON Web Tokens)
Autenticação stateless usando JWT:
- Token gerado no login
- Expiração configurável
- Payload contém ID do usuário
- Secret key configurável via `JWT_SECRET`

## 🗄️ Banco de Dados

### MongoDB
O projeto usa MongoDB para persistência:
- Collections: users, games, reviews
- Índices otimizados para busca
- Relações via ObjectId
- Validação de schema

### Backup
Recomendado fazer backup regular:
```bash
# Backup
mongodump --db gamerate --out ./backup

# Restore
mongorestore --db gamerate ./backup/gamerate
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente
Crie um arquivo `.env` (opcional):
```bash
# .env
PORT=3000
NODE_ENV=development
DB_PATH=./games.db
STEAM_API_LANGUAGE=portuguese
STEAM_API_COUNTRY=BR
```

### Configuração do Banco de Dados

#### Personalizar Lista de Jogos
Edite `create-games-db.py`:
```python
# Adicionar seus jogos favoritos
jogos = [
    "Elden Ring", "Hades", "Cyberpunk 2077",
    "Hollow Knight", "FIFA 23", "GTA V",
    "God of War", "Zelda", "Baldur's Gate 3",
    "The Witcher 3", "SEU_JOGO_AQUI"
]
```

#### Recriar Banco de Dados
```bash
# Remover banco existente
rm games.db

# Recriar com novos dados
python create-games-db.py

# Verificar dados
sqlite3 games.db "SELECT COUNT(*) FROM games;"
```

### Configuração do Servidor

#### Mudar Porta do Servidor
Edite `js/api-server.js`:
```javascript
const port = process.env.PORT || 8080; // Muda de 3000 para 8080
```

#### Configuração CORS
Para permitir acesso de outros domínios:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://seudominio.com');
  // ... resto da configuração
});
```

## 🧪 Verificação da Instalação

### Testes Básicos
```bash
# 1. Testar API diretamente
curl http://localhost:3000/api/steam-games

# 2. Verificar banco de dados
sqlite3 games.db "SELECT name FROM games LIMIT 5;"

# 3. Testar página principal
curl http://localhost:3000
```

### Checklist de Funcionamento
- [ ] **Servidor inicia sem erros**
- [ ] **API retorna lista de jogos**
- [ ] **Página principal carrega**
- [ ] **Login/registro funcionam**
- [ ] **Banco de dados tem jogos**

### Troubleshooting Common Issues

#### Problema: "Cannot find module 'express'"
```bash
# Solução: Reinstalar dependências
rm -rf node_modules
npm install
```

#### Problema: "python: command not found"
```bash
# Linux/Mac: Usar python3
python3 create-games-db.py

# Windows: Verificar PATH do Python
where python
```

#### Problema: "EADDRINUSE: address already in use"
```bash
# Linux/Mac: Matar processo na porta
lsof -ti:3000 | xargs kill -9

# Windows: Matar processo
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Problema: "Database is locked"
```bash
# Fechar todas as conexões SQLite
pkill -f "sqlite3"

# Remover lock file se existir
rm games.db-wal games.db-shm

# Reiniciar servidor
npm start
```

## 🔄 Scripts Disponíveis

### NPM Scripts
```json
{
  "scripts": {
    "start": "node js/api-server.js",
    "create-db": "python create-games-db.py",
    "dev": "nodemon js/api-server.js",
    "test": "echo 'No tests specified'",
    "clean": "rm -rf node_modules games.db"
  }
}
```

### Scripts Úteis
```bash
# Desenvolvimento com auto-reload
npm install -g nodemon
npm run dev

# Limpar e reinstalar
npm run clean
npm install
npm run create-db

# Backup do banco
cp games.db games-backup.db

# Ver logs do servidor
npm start > server.log 2>&1 &
tail -f server.log
```

## 🐳 Docker (Opcional)

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar Python para criar DB
RUN apk add --no-cache python3 py3-pip

# Copiar arquivos de dependência
COPY package*.json ./
COPY requirements.txt ./

# Instalar dependências
RUN npm ci --only=production
RUN pip3 install -r requirements.txt

# Copiar código fonte
COPY . .

# Criar banco de dados
RUN python3 create-games-db.py

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  game-rate:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./games.db:/app/games.db
    environment:
      - NODE_ENV=production
```

### Comandos Docker
```bash
# Build da imagem
docker build -t game-rate .

# Executar container
docker run -p 3000:3000 game-rate

# Com Docker Compose
docker-compose up -d
```

## 🌐 Deploy em Produção

### Heroku
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
heroku create seu-game-rate

# Configurar buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/python

# Deploy
git push heroku main
```

### Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configurar no vercel.json
{
  "version": 2,
  "builds": [
    { "src": "js/api-server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/js/api-server.js" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

### Railway
```bash
# Conectar ao Railway
railway login

# Deploy
railway deploy

# Configurar variáveis
railway variables set NODE_ENV=production
```

## 📊 Monitoramento

### Logs de Desenvolvimento
```bash
# Ver logs em tempo real
npm start | tee server.log

# Logs com timestamp
npm start 2>&1 | while read line; do echo "$(date): $line"; done
```

### Health Check
Adicione ao `api-server.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### Métricas Básicas
```bash
# CPU e Memória
top -p $(pgrep -f "node js/api-server.js")

# Uso de porta
netstat -tulpn | grep :3000

# Conexões ativas
ss -tn state established | grep :3000
```

## 🔒 Segurança

### Configurações Recomendadas
```javascript
// Adicionar ao api-server.js
const helmet = require('helmet');
app.use(helmet());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Variáveis Sensíveis
```bash
# Nunca commitar no Git
echo "SECRET_KEY=sua_chave_secreta" >> .env
echo ".env" >> .gitignore
```

## 📈 Performance

### Otimizações Recomendadas
```bash
# Instalar PM2 para produção
npm install -g pm2

# Executar com PM2
pm2 start js/api-server.js --name "game-rate"

# Auto-restart e cluster
pm2 start js/api-server.js -i max

# Monitorar
pm2 monit
```

### Benchmark
```bash
# Instalar Apache Bench
sudo apt install apache2-utils  # Ubuntu
brew install httpie            # macOS

# Teste de carga
ab -n 1000 -c 10 http://localhost:3000/api/steam-games

# Teste com HTTPie
http GET localhost:3000/api/steam-games
```

Pronto! Agora você tem 5 documentações completas e organizadas para o seu projeto Game Rate v4! 🚀 