< !DOCTYPE html >
    <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Painel Administrador</title>
                    <link rel="stylesheet" href="/style.css">
                    </head>

                    <body>

                        <div style="background: #e9ecef; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
                            <h3>1. Gerenciar Estrutura do Menu</h3>
                            <form id="formEstrutura">
                                <div class="form-group">
                                    <label for="novaCategoria">Nome da Categoria (Ex: Recursos Humanos)</label>
                                    <input type="text" id="novaCategoria" placeholder="Digite a categoria">
                                </div>

                                <div class="form-group">
                                    <label for="novoSubmenu">Nome do Submenu (Ex: Férias)</label>
                                    <input type="text" id="novoSubmenu" placeholder="Opcional: Digite o submenu">
                                        <small style="color: #666; display: block; margin-top: 5px;">*Para excluir/alterar uma Categoria inteira, deixe o submenu em branco.</small>
                                </div>

                                <div style="display: flex; gap: 10px; margin-top: 15px;">
                                    <button type="button" id="btnAdicionarEstrutura" style="background: #28a745;">Adicionar</button>
                                    <button type="button" id="btnAlterarEstrutura" style="background: #ffc107; color: #000;">Alterar Nome</button>
                                    <button type="button" id="btnExcluirEstrutura" style="background: #dc3545;">Excluir</button>
                                </div>
                            </form>
                        </div>

                        <div style="padding: 20px;">
                            <h3>2. Gerenciar Conteúdo e Submenus</h3>
                            <form id="myForm">
                                <div class="form-group">
                                    <label for="categoria">Categoria</label>
                                    <select id="categoria" required>
                                        <option value="">Carregando categorias...</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label for="submenu">Submenu</label>
                                    <select id="submenu" required>
                                        <option value="">Selecione uma categoria primeiro</option>
                                    </select>
                                </div>

                                <div class="form-group">
                                    <label for="mensagem">Conteúdo</label>
                                    <textarea id="mensagem" name="mensagem" rows="5" placeholder="Adicione o conteúdo aqui..." required></textarea>
                                </div>

                                <div style="display: flex; gap: 10px; margin-top: 15px;">
                                    <button type="submit" id="btnSalvar" style="background: #0b5ed7;">Salvar / Alterar</button>
                                    <button type="button" id="btnExcluir" style="background: #dc3545; display: none;">Excluir Submenu</button>
                                </div>
                            </form>
                        </div>

                        <script src="/script.js"></script>
                    </body>
                </html>