# 🚀 Guia de Uso - Conhece Siclus

Bem-vindo ao sistema **Conhece Siclus**! Este documento serve como um guia rápido para ajudar você a gerenciar o conteúdo de forma eficiente e segura.

---

## 🛠️ Acesso ao Painel Admin
Para gerenciar o sistema, acesse:
- **URL:** `http://localhost:3000/admin`
- No painel, você encontrará três seções principais:
    1. **Criar Categoria:** Adiciona novos ícones e menus principais.
    2. **Gerenciar Conteúdo e Submenus:** Onde a mágica acontece (edição de texto e mídia).
    3. **Criar Submenu:** Para adicionar novos itens a uma categoria existente.

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
- **Vídeos:** Aceita apenas links do **YouTube** (Ex: `https://www.youtube.com/watch?v=...`). O sistema transforma automaticamente em um player de vídeo no site.

---

## ✅ O que PODE fazer
- **Renomear Categorias:** Use o botão "Renomear Categoria" na Seção 2 para corrigir erros de digitação (como transformar "Orçacameno" em "Orçamento").
- **Organizar em Grupos:** Use o campo "Grupo" para agrupar submenus (Ex: colocar "RH" e "Financeiro" dentro de um grupo chamado "Administrativo").
- **Trocar Ícones:** Você pode mudar o ícone de uma categoria a qualquer momento na Seção 1.
- **Usar HTML Básico:** Se você souber um pouco de HTML, pode usar tags como `<br/>` para pular linhas ou `<i>` para itálico manualmente.

---

## ❌ O que NÃO PODE fazer (Para evitar erros)
- **Não apague as tags de formatação:** Se você ver algo como `<b>` ou `<u>` no editor, não remova as "setinhas" `< >`, pois isso quebrará a formatação no site.
- **Não use links de vídeo que não sejam do YouTube:** O sistema está otimizado especificamente para players do YouTube.
- **Não selecione uma Categoria e um Submenu diferentes ao mesmo tempo na Seção 2:** Sempre certifique-se de que o Submenu que você está editando pertence à Categoria selecionada para evitar confusão visual.
- **Não interrompa o processo de "Salvar":** Aguarde o alerta de "Conteúdo salvo com sucesso" antes de fechar a página ou atualizar.

---

## 🆘 Precisa de uma Categoria nova com ícone especial?
Se precisar de um ícone que não está na lista atual, verifique os nomes disponíveis na biblioteca **Lucide React**. Se o nome do ícone (ex: `User`, `Settings`, `Mail`) for digitado exatamente igual no campo "Nome do Ícone", o sistema tentará carregá-lo automaticamente.

---
*Documentação gerada em 14/03/2026.*
