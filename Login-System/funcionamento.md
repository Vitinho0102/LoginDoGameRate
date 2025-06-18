# Como Funciona o Sistema de Login do GameRate 🎮

## 📝 Visão Geral

O sistema de login do GameRate é construído usando:
- Frontend: HTML, CSS e JavaScript puro
- Backend: Node.js com Express
- Banco de Dados: MongoDB
- Autenticação: JWT (JSON Web Tokens)

## 🔄 Fluxo de Funcionamento

### 1. Registro de Novo Usuário

```javascript
// 1. Usuário preenche o formulário de registro
{
    username: "jogador123",
    email: "jogador@email.com",
    password: "senha123"
}

// 2. Frontend faz requisição POST para /api/register
const response = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
});

// 3. Backend valida e salva no MongoDB
// backend/routes/auth.js
router.post('/register', async (req, res) => {
    // Verifica se email/username já existem
    const existingUser = await User.findOne({ 
        $or: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
        ]
    });

    // Cria novo usuário com senha hashada
    const user = new User({
        username,
        email,
        password // será hashada automaticamente
    });

    // Salva e retorna token
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ token, user: user.toPublicJSON() });
});
```

### 2. Login de Usuário

```javascript
// 1. Usuário preenche formulário de login
{
    email: "jogador@email.com",
    password: "senha123"
}

// 2. Frontend faz requisição POST para /api/login
const response = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});

// 3. Backend verifica credenciais
// backend/routes/auth.js
router.post('/login', async (req, res) => {
    // Busca usuário pelo email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Verifica senha
    const isMatch = await user.comparePassword(password);
    
    // Gera e retorna token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ token, user: user.toPublicJSON() });
});
```

### 3. Mantendo o Login (Persistência)

```javascript
// 1. Token é salvo no localStorage após login/registro
localStorage.setItem('token', data.token);

// 2. Token é incluído em todas as requisições autenticadas
fetch('/api/alguma-rota-protegida', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});

// 3. Backend verifica token em rotas protegidas
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};
```

## 🔒 Segurança

### Senha
```javascript
// 1. Hash automático antes de salvar
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// 2. Comparação segura de senhas
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};
```

### Validações
```javascript
// 1. Email
email: {
    validate: {
        validator: (v) => /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v),
        message: 'Email inválido'
    }
}

// 2. Username
username: {
    minlength: [3, 'Username muito curto'],
    maxlength: [30, 'Username muito longo']
}

// 3. Senha
password: {
    minlength: [6, 'Senha muito curta']
}
```

## 📱 Interface do Usuário

### Estados de UI
```javascript
// 1. Não Logado
- Mostra: Botões Login/Registro
- Esconde: Perfil, Feed, Logout

// 2. Logado
- Mostra: Perfil, Feed, Logout
- Esconde: Login/Registro

// 3. Carregando
- Mostra: Spinner/Loading
- Desabilita: Botões de ação
```

### Feedback ao Usuário
```javascript
// 1. Sucesso
- Login: "✅ Bem-vindo de volta, {username}!"
- Registro: "🎉 Conta criada com sucesso!"

// 2. Erros
- Login: "❌ Email ou senha incorretos"
- Registro: "❌ Username já existe"

// 3. Validação
- Email: "⚠️ Digite um email válido"
- Senha: "⚠️ Senha muito curta"
```

## 🔍 Debugging Comum

### 1. Token Inválido
```javascript
// Problema: "Please authenticate"
// Solução: 
localStorage.removeItem('token'); // Limpa token inválido
// Redireciona para login
```

### 2. Erro de CORS
```javascript
// Backend: Adicionar middleware
app.use(cors({
    origin: 'http://localhost:5500',
    credentials: true
}));

// Frontend: Incluir credentials
fetch(url, {
    credentials: 'include'
});
```

### 3. MongoDB Desconectado
```javascript
// Verificar logs:
"MongoDB Connected: localhost:27017" // ✅ OK
"MongoDB connection error" // ❌ Erro

// Verificar .env:
MONGODB_URI=mongodb://localhost:27017/gamerate
```

## 🚀 Exemplos de Uso

### Login Completo
```javascript
// 1. Capturar dados do formulário
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;

// 2. Fazer login
try {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        // 3. Salvar token
        localStorage.setItem('token', data.token);
        
        // 4. Atualizar UI
        updateUIForLoggedInUser(data.user);
        
        // 5. Redirecionar
        window.location.href = '/feed';
    } else {
        showError(data.message);
    }
} catch (error) {
    showError('Erro ao fazer login');
}
```

## 📝 Dicas de Desenvolvimento

1. **Teste de Rotas**:
   ```bash
   # Login
   curl -X POST http://localhost:3000/api/login \
   -H "Content-Type: application/json" \
   -d '{"email":"teste@email.com","password":"senha123"}'
   ```

2. **Monitoramento MongoDB**:
   ```javascript
   mongoose.connection.on('error', console.error.bind(console, 'Erro:'));
   mongoose.connection.once('open', () => console.log('Conectado!'));
   ```

3. **Debug Frontend**:
   ```javascript
   // Verificar estado do login
   console.log('Token:', localStorage.getItem('token'));
   console.log('User:', JSON.parse(localStorage.getItem('user')));
   ``` 
