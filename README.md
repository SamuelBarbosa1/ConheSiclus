# 🚀 Guia de Uso - ConheSiclus

Bem-vindo ao sistema **ConheSiclus**! Este documento serve como um guia rápido para ajudar você a gerenciar o conteúdo de forma eficiente e segura.

---

## 🛠️ Acesso ao Painel Admin
Para gerenciar o sistema, acesse:
- **URL:** `http://localhost:3000/admin`
- No painel, você encontrará três seções principais:
    1. **Gerenciar Estrutura:** Criar ou excluir categorias e submenus básicos.
    2. **Editar Conteúdo:** Onde a mágica acontece (edição de texto, mídias e relações).

---

## 📝 Tutorial: Editando Conteúdo

### 1. Formatação de Texto (Rich Text)
Acima do campo de **Conteúdo**, você encontrará três botões:
- **B (Bold):** Deixa o texto selecionado em **negrito**.
- **U (Underline):** Adiciona um **sublinhado** ao texto.
- **H (Highlight):** Destaca o texto com um **fundo amarelo**.

> [!TIP]
> **Como usar:** Selecione o texto que deseja formatar com o mouse e clique no botão correspondente. O sistema inserirá tags como `<b>texto</b>`. Não apague essas tags!

### 2. Adicionando Mídias
Agora você pode adicionar até **5 fotos** e **2 vídeos** por item:
- **Fotos:** Você pode fazer o upload de um arquivo do seu computador ou colar um link direto de uma imagem da internet.
- **Vídeos:** Aceita links do **YouTube**. O sistema gera automaticamente o player.

### 3. Artigos Relacionados (Novidade)
Na parte inferior da edição, você pode buscar por outros artigos existentes e vinculá-los. Isso criará uma seção "Veja também" no final do artigo, facilitando a navegação do usuário.

---

## ✅ Funcionalidades Principais
- **Grupos:** Organize submenus em blocos (ex: "RH" e "Financeiro" dentro de um grupo "Administrativo").
- **Renomear Itens:** Corrija nomes de categorias ou artigos a qualquer momento.
- **Ícones Dinâmicos:** Use nomes de ícones da biblioteca **Lucide React** (ex: `User`, `Settings`, `Mail`).
- **Página Inicial Dinâmica:** Menu lateral auto-gerado e busca inteligente por todo o conteúdo.

---

## ❌ O que EVITAR (Para evitar erros)
- **Não apague as tags de formatação:** Tags como `<b>` ou `<u>` são essenciais para o estilo.
- **Não interrompa o processo de "Salvar":** Aguarde o alerta de sucesso antes de sair.
- **Links de Vídeo:** Use apenas links válidos do YouTube.

---

## 🏠 Hospedagem e Rede
Para saber como disponibilizar o sistema para outros computadores na mesma rede, consulte o [Guia de Hospedagem](HOSTING_GUIDE.md).

---
*Documentação atualizada em 22/03/2026.*
