# Guia de Administradores - ConheSiclus

Este documento explica como gerenciar pessoas com acesso ao painel administrativo e as configurações necessárias para o funcionamento do sistema.

## Gerenciamento de Usuários via Script

Atualmente, o gerenciamento de contas administrativas é feito através de scripts executados no servidor.

### 1. Como cadastrar um novo administrador
Para cadastrar um novo usuário:
```bash
node scripts/create-admin.mjs "Nome do Usuário" "email@dominio.com.br" "senha123"
```

### 2. Como excluir um administrador
Para remover o acesso de um usuário:
```bash
node scripts/delete-admin.mjs "email@dominio.com.br"
```

### 3. Como atualizar a senha de um administrador
Caso um usuário esqueça a senha ou precise trocá-la:
```bash
node scripts/update-password.mjs "email@dominio.com.br" "nova_senha456"
```

---

## Configuração de Email (SMTP)

Para que as funcionalidades de recuperação de senha e notificações funcionem, é necessário configurar as variáveis de SMTP no arquivo `.env`:

```env
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_USER=seu-usuario@exemplo.com
SMTP_PASS=sua-senha
SMTP_FROM="ConheSiclus <noreply@exemplo.com>"
```

---

## Observações Importantes

- **Segurança**: As senhas são armazenadas com hash SHA-256. Nunca compartilhe suas credenciais.
- **Banco de Dados**: Certifique-se de que as credenciais do MySQL no `.env` estão corretas antes de executar os scripts.
- **Interface**: O painel administrativo pode ser acessado em `/admin` após realizar o login.
- **Mídia**: O sistema suporta upload de imagens locais e links externos (YouTube/Vimeo) para os artigos.
