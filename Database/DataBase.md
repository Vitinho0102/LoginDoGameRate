# Configuração do Banco de Dados - GameRate

Este documento descreve como o servidor se conecta com o banco de dados MongoDB no projeto GameRate.

## 📋 Pré-requisitos

- MongoDB instalado localmente ou uma conta no MongoDB Atlas
- Node.js e npm instalados
- Variáveis de ambiente configuradas

## 🔧 Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório `backend` com as seguintes variáveis:

```env
MONGODB_URI=sua_uri_de_conexao_aqui
PORT=3000
```

Exemplo de URI de conexão:
- Local: `mongodb://localhost:27017/gamerate`
- Atlas: `mongodb+srv://seu_usuario:sua_senha@seu_cluster.mongodb.net/gamerate`

## 🔌 Como a Conexão Funciona

### 1. Configuração Inicial

O arquivo `config/database.js` contém a lógica principal de conexão com o MongoDB. Ele:

- Estabelece a conexão usando Mongoose
- Configura listeners para eventos de conexão
- Implementa graceful shutdown
- Gerencia erros de conexão

```javascript
// Exemplo simplificado da configuração
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
```

### 2. Inicialização no Servidor

O arquivo `server.js` inicializa a conexão quando o servidor é iniciado:

```javascript
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamerate')
    .then(() => console.log('📦 Conectado ao MongoDB'))
    .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));
```

## 🛡️ Recursos de Segurança

1. **Graceful Shutdown**: A conexão é fechada adequadamente quando o servidor é encerrado
2. **Fallback para Local**: Se MONGODB_URI não estiver definida, conecta ao MongoDB local
3. **Tratamento de Erros**: Logs detalhados para problemas de conexão
4. **Eventos Monitorados**:
   - Erros de conexão
   - Desconexões
   - Reconexões

## 🚀 Como Testar a Conexão

1. **Teste Básico**
```bash
# Inicie o servidor
npm start

# Verifique os logs de conexão
# Deve aparecer: "📦 Conectado ao MongoDB"
```

2. **Rota de Teste**
```bash
# Faça uma requisição GET para
curl http://localhost:3000/api/test

# Deve retornar: "API funcionando!"
```

## ⚠️ Troubleshooting

### Problemas Comuns

1. **Erro de Conexão**
   - Verifique se o MongoDB está rodando
   - Confirme se a URI está correta
   - Verifique as credenciais

2. **Timeout**
   - Verifique sua conexão com a internet
   - Confirme se o IP está na whitelist (MongoDB Atlas)

3. **Autenticação Falhou**
   - Verifique usuário e senha
   - Confirme as permissões do usuário

## 📚 Recursos Adicionais

- [Documentação MongoDB](https://docs.mongodb.com/)
- [Documentação Mongoose](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 🤝 Suporte

Para problemas ou dúvidas sobre a conexão com o banco de dados:
1. Verifique os logs de erro
2. Consulte a documentação acima
3. Abra uma issue no repositório 
