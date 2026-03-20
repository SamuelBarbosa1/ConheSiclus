# Documentação do Projeto: ConheceSiclus

Este projeto é uma plataforma de base de conhecimento (KB/FAQ) desenvolvida para organizar e exibir informações de forma rápida e intuitiva.

## 🚀 Tecnologias Utilizadas

- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Framework Web:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Interface (UI):** [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (ícones)
- **Banco de Dados:** [MySQL](https://www.mysql.com/)
- **Comunicação Server-Client:** [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- **Armazenamento de Imagens:** Local (pasta `public/uploads`)

---

## 🏗️ Lógica do Sistema

O sistema é dividido em duas partes principais: **Portal do Usuário** (Visualização) e **Painel Administrativo** (Gestão).

### 1. Estrutura de Conteúdo
A informação é organizada hierarquicamente para facilitar a busca e navegação:
- **Categorias:** O nível mais alto (ex: "Associados", "Financeiro"). Cada categoria pode ter um ícone personalizado da biblioteca Lucide.
- **Grupos (Opcional):** Agrupadores dentro de uma categoria (ex: "Documentos", "Manuais"). Permitem organizar submenus relacionados visualmente.
- **Submenus (Artigos):** Onde o conteúdo real reside. Cada artigo contém:
  - Título e Conteúdo (suporta formatação HTML básica: negrito, sublinhado, destaque).
  - Fotos (até 5, via upload local ou link externo).
  - Vídeos (até 2, via link YouTube).
  - Artigos Relacionados (sugestões de leitura vinculadas a outros submenus).

### 2. Fluxo de Dados e Persistência
- **Consulta:** O `HomeClient.tsx` é o componente principal que exibe o menu lateral e o conteúdo central. Ele recebe os dados do servidor e mantém o estado de qual categoria/submenu está aberto.
- **Busca em Tempo Real:** Uma barra de pesquisa permite filtrar categorias e submenus instantaneamente por nome ou conteúdo.
- **Gerenciamento de Mídia:** 
  - Ao subir uma foto no admin, o sistema usa uma **Server Action** (`salvarArquivoLocal`) para gravar o arquivo em `public/uploads`.
  - O nome do arquivo é sanitizado e recebe um prefixo com a data atual (`Date.now()`) para garantir que seja único.
  - O caminho relativo (ex: `/uploads/123-foto.png`) é salvo no banco MySQL.
- **Consistência:** Ao atualizar um submenu, o sistema limpa as associações antigas de imagens/vídeos e re-insere as novas em uma transação de banco de dados, garantindo que o estado salvo no banco sempre reflita o que foi configurado no painel.

---

## 🗄️ Estrutura do Banco de Dados (MySQL)

O banco `conhece_siclus` utiliza as seguintes tabelas principais:
- `categorias`: Armazena os menus principais e seus ícones.
- `submenus`: Contém os artigos, vinculados a uma categoria e opcionalmente a um grupo.
- `submenu_images`: Lista de URLs de imagens associadas a cada submenu.
- `submenu_videos`: Lista de links de vídeos associados a cada submenu.
- `submenu_related`: Tabela de ligação que define quais artigos são "relacionados" entre si.

