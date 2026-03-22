# Documentação do Projeto: ConheSiclus

Este projeto é uma plataforma de base de conhecimento (KB/FAQ) desenvolvida para organizar e exibir informações de forma rápida e intuitiva.

## 🚀 Tecnologias Utilizadas

- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Framework Web:** [Next.js 16.1.6 (App Router)](https://nextjs.org/)
- **Interface (UI):** [React 19.2.3](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (ícones)
- **Banco de Dados:** [MySQL 8+](https://www.mysql.com/) via `mysql2`
- **Comunicação Server-Client:** [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- **Armazenamento de Imagens:** Local (pasta `public/uploads`) e suporte a Links Externos.
- **Vídeos:** Suporte a links do YouTube.

---

## 🏗️ Lógica do Sistema

O sistema é dividido em duas partes principais: **Portal do Usuário** (Visualização) e **Painel Administrativo** (Gestão).

### 1. Estrutura de Conteúdo
A informação é organizada hierarquicamente para facilitar a busca e navegação:
- **Categorias:** O nível mais alto (ex: "Associados", "Financeiro"). Cada categoria possui um ícone da biblioteca Lucide.
- **Grupos (Opcional):** Agrupadores dentro de uma categoria (ex: "Documentos", "Manuais"). Permitem organizar submenus relacionados visualmente no menu lateral.
- **Submenus (Artigos):** Onde o conteúdo real reside. Cada artigo contém:
  - **Título e Conteúdo:** Suporta formatação HTML básica (negrito, sublinhado, destaque via tags `<b>`, `<u>`, `<mark>`).
  - **Mídias:** Até 5 fotos (upload local ou link) e 2 vídeos (link YouTube).
  - **Artigos Relacionados:** Vínculos manuais com outros submenus para sugerir leituras complementares.

### 2. Fluxo de Dados e Persistência
- **Consulta:** O `HomeClient.tsx` gerencia a exibição dinâmica. Ele busca o menu completo (categorias + submenus + mídias) via `getMenuCompleto`.
- **Busca em Tempo Real:** Filtra instantaneamente categorias e submenus por nome ou conteúdo textual.
- **Gerenciamento de Mídia:** 
  - **Local:** Ao fazer upload, a Server Action `salvarArquivoLocal` grava o arquivo em `public/uploads` com nome único (timestamp).
  - **URL:** O sistema armazena a string do link diretamente no banco.
- **Relacionamentos:** Ao editar um artigo, é possível pesquisar e selecionar outros artigos existentes para criar conexões de "Veja também".
- **Sincronização:** Todas as mudanças no Admin acionam `revalidatePath`, garantindo que o cache do Next.js seja atualizado imediatamente para todos os usuários.

---

## 🗄️ Estrutura do Banco de Dados (MySQL)

O banco `conhece_siclus` utiliza as seguintes tabelas:

1. **`categorias`**: Meta-dados dos menus principais.
   - `id`, `nome`, `icone` (string do nome do ícone Lucide).
2. **`submenus`**: Os artigos propriamente ditos.
   - `id`, `nome`, `conteudo` (TEXT), `grupo` (pode ser NULL), `categoriaId` (FK).
3. **`submenu_images`**: URLs das imagens vinculadas.
   - `id`, `submenuId` (FK), `url`.
4. **`submenu_videos`**: URLs dos vídeos (YouTube).
   - `id`, `submenuId` (FK), `url`.
5. **`submenu_related`**: Tabela de junção para artigos relacionados.
   - `submenuId` (FK), `relatedSubmenuId` (FK).

---
*Documentação atualizada em março de 2026 (Refletindo Next.js 16 e MySQL Local).*
