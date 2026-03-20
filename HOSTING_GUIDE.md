# Guia de Hospedagem e Compartilhamento Local

Este guia explica como rodar este projeto no seu computador e permitir que outros dispositivos na mesma rede (Wi-Fi/Ethernet) acessem a aplicação.

---

## 1. Preparando a Aplicação

Para que outros computadores acessem o site, o servidor precisa "ouvir" todas as interfaces de rede, não apenas o `localhost`.

### Comandos de Inicialização (Adicionados ao package.json)

*   **Modo Desenvolvimento (Dev):**
    ```bash
    npm run dev:network
    ```
    *Isso executará o Next.js em `0.0.0.0:3000`, permitindo acesso externo.*

*   **Modo Produção (Recomendado):**
    1. Primeiro, gere o build:
       ```bash
       npm run build
       ```
    2. Depois, inicie o servidor:
       ```bash
       npm run start:network
       ```

---

## 2. Configurando o MySQL para Acesso Externo

Por padrão, o MySQL muitas vezes bloqueia conexões que não vêm do próprio computador (`localhost`).

### Passo A: Criar um Usuário para a Rede
Se você estiver usando o usuário `root`, ele pode estar restrito. É recomendável criar um usuário ou liberar o atual:

1. Abra o Terminal do MySQL ou MySQL Workbench.
2. Execute o comando para permitir acesso de qualquer IP (`%`):
   ```sql
   -- Substitua 'seu_usuario' e 'sua_senha' pelos dados do seu .env
   CREATE USER 'root'@'%' IDENTIFIED BY 'sua_senha';
   GRANT ALL PRIVILEGES ON conhece_siclus.* TO 'root'@'%';
   FLUSH PRIVILEGES;
   ```
   *Nota: Se o usuário root@% já existir, use `ALTER USER`.*

### Passo B: Bind Address (Opcional, mas comum)
Verifique seu arquivo `my.ini` (geralmente em `C:\ProgramData\MySQL\MySQL Server X.Y\my.ini`):
*   Procure por `bind-address`.
*   Certifique-se de que ele está como `0.0.0.0` ou comentado com `#`. Se estiver `127.0.0.1`, apenas o seu computador consegue conectar.

---

## 3. Configurando o Firewall do Windows

O Windows bloqueia conexões de entrada por segurança. Você precisa abrir as portas **3000** (Frontend) e **3306** (Banco de Dados).

1. No menu Iniciar, digite **"Firewall do Windows com Segurança Avançada"**.
2. Clique em **Regras de Entrada** (Inbound Rules) no lado esquerdo.
3. Clique em **Nova Regra...** no lado direito.
4. Escolha **Porta** e clique em Avançar.
5. Digite `3000, 3306` em "Portas locais específicas".
6. Escolha **Permitir a conexão**.
7. Marque todas as opções (Domínio, Particular, Público).
8. Dê um nome como `Conhece-Siclus-Access` e conclua.

---

## 4. Descobrindo seu IP Local

Para que outros acessem, eles precisam do seu endereço IP na rede.

1. Abra o Terminal (PowerShell ou CMD).
2. Digite: `ipconfig`
3. Procure por **Endereço IPv4** (ex: `192.168.1.15`). Este é o endereço que você usará.

---

## 5. Acessando de Outros Dispositivos

Agora, em qualquer outro celular ou computador conectado no mesmo Wi-Fi:

1. Abra o navegador.
2. Digite o IP seguido da porta: `http://192.168.1.15:3000` (substitua pelo seu IP).

---

## Dica: Mudando o .env para a Rede
Se o seu frontend precisar falar com o backend usando o IP (e não apenas `localhost`), lembre-se de atualizar as URLs de API no seu código ou variáveis de ambiente para usar o IP fixo, caso o Next.js não resolva automaticamente via SSR.
