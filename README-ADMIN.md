# Guia de Administradores - ConheSiclus

Este documento explica como cadastrar e gerenciar pessoas com acesso ao painel administrativo.

## Como cadastrar um novo administrador

Para cadastrar um novo usuário com acesso ao painel, você deve executar o script de criação no terminal.

### Passo 1: Abrir o terminal
Abra o terminal (PowerShell ou Command Prompt) na pasta raiz do projeto (`C:\Users\sboliveira\Desktop\ConheSiclus`).

### Passo 2: Executar o comando
Execute o seguinte comando substituindo os dados conforme necessário:

```bash
node scripts/create-admin.mjs "Nome do Usuario" "email@dominio.com.br" "senha123"
```

**Exemplo:**
```bash
node scripts/create-admin.mjs "Joao Silva" "joao.silva@ensti.com.br" "admin456"
```

### Passo 3: Confirmar sucesso
Se o comando for bem sucedido, você verá a mensagem:
`✅ Admin user created successfully!`

Agora o novo usuário já pode acessar o site em `/admin` e fazer login com o e-mail e senha cadastrados.

---

## Observações Importantes

- **Segurança**: Guarde as senhas em local seguro. Por enquanto, as senhas só podem ser alteradas ou cadastradas via scripts por desenvolvedores.
- **E-mail Único**: Não é possível cadastrar dois usuários com o mesmo e-mail.
- **Script de Criação**: O script `scripts/create-admin.mjs` utiliza o banco de dados configurado no arquivo `.env`. Certifique-se de que o banco MySQL está rodando.
