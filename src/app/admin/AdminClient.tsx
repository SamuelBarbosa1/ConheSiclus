'use client';

import React, { useState, useEffect } from 'react';
import {
  criarCategoria,
  criarSubmenu,
  atualizarSubmenu,
  excluirCategoria,
  excluirSubmenu,
  atualizarCategoria,
} from '../actions';
import { useRouter } from 'next/navigation';

type Categoria = { id: string; nome: string; icone: string | null };
type Submenu = {
  id: string;
  nome: string;
  conteudo: string;
  grupo: string | null;
  categoriaId: string;
  images: { id: string; url: string }[];
  videos: { id: string; url: string }[];
  relatedSubmenus?: { id: string, nome: string }[];
};

export default function AdminClient({
  initialCategorias,
  initialSubmenus,
}: {
  initialCategorias: Categoria[];
  initialSubmenus: Submenu[];
}) {
  const router = useRouter();

  // Bloco 1 State
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [novoSubmenuNome, setNovoSubmenuNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState('');
  const [isSubmittingEstrutura, setIsSubmittingEstrutura] = useState(false);

  // Bloco 2 State
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>('');
  const [selectedSubmenuId, setSelectedSubmenuId] = useState<string>('');
  const [edicaoConteudo, setEdicaoConteudo] = useState('');
  const [edicaoGrupo, setEdicaoGrupo] = useState('');
  const [edicaoImages, setEdicaoImages] = useState<{ url: string; file: File | null }[]>([]);
  const [edicaoVideoUrls, setEdicaoVideoUrls] = useState<string[]>(['', '']);
  const [edicaoRelatedIds, setEdicaoRelatedIds] = useState<string[]>([]);
  const [isSubmittingConteudo, setIsSubmittingConteudo] = useState(false);
  const [searchRelated, setSearchRelated] = useState('');

  // Update effect when submenu is selected
  useEffect(() => {
    if (selectedSubmenuId) {
      const sub = initialSubmenus.find(s => s.id === selectedSubmenuId);
      if (sub) {
        setEdicaoConteudo(sub.conteudo || '');
        setEdicaoGrupo(sub.grupo || '');
        // Garantir sempre 5 slots para as imagens
        const existingImages = sub.images ? sub.images.map(img => ({ url: img.url, file: null as File | null })) : [];
        const slots = Array(5).fill(null).map((_, i) => existingImages[i] || { url: '', file: null });
        setEdicaoImages(slots);
        setEdicaoVideoUrls(sub.videos && sub.videos.length > 0
          ? [...sub.videos.map(v => v.url), '', ''].slice(0, 2)
          : ['', '']);
        setEdicaoRelatedIds(sub.relatedSubmenus ? sub.relatedSubmenus.map(r => r.id) : []);
      }
    } else {
      setEdicaoConteudo('');
      setEdicaoGrupo('');
      setEdicaoImages([]);
      setEdicaoVideoUrls(['', '']);
      setEdicaoRelatedIds([]);
    }
  }, [selectedSubmenuId, initialSubmenus]);

  // Derivar submenus filtrados pela categoria selecionada
  const filteredSubmenus = initialSubmenus.filter(
    (s) => s.categoriaId === selectedCategoriaId
  );

  // Handle Bloco 1: Criar Estrutura
  const handleAdicionarEstrutura = async () => {
    const nomeCatLimp = novaCategoriaNome.trim();
    const nomeSubLimp = novoSubmenuNome.trim();
    const nomeGrupLimp = novoGrupo.trim();

    if (!nomeCatLimp) {
      alert('Por favor, informe pelo menos o nome da Categoria.');
      return;
    }
    setIsSubmittingEstrutura(true);
    try {
      // 1. Tenta achar categoria existente ou criar nova
      const normalize = (val: string) => val.toLowerCase().trim().replace(/s$/, '');
      const nomeNormalizado = normalize(nomeCatLimp);

      const cat = initialCategorias.find((c) => normalize(c.nome) === nomeNormalizado);
      const catId = cat?.id;

      if (!catId) {
        const fd = new FormData();
        fd.append('nome', nomeCatLimp);
        await criarCategoria(fd);
        alert('Categoria criada com sucesso!');
        router.refresh();
        return;
      } else {
        if (!nomeSubLimp) {
          alert(`Essa categoria já existe como "${cat.nome}"! Se quer adicionar um submenu a ela, por favor escreva o nome do submenu.`);
          return;
        }
        if (nomeSubLimp) {
          const subFd = new FormData();
          subFd.append('nome', nomeSubLimp);
          subFd.append('conteudo', 'Conteúdo provisório...'); // default
          subFd.append('categoriaId', catId.toString());
          if (nomeGrupLimp) subFd.append('grupo', nomeGrupLimp);

          await criarSubmenu(subFd);
          alert('Submenu adicionado à categoria existente!');
          router.refresh();
          return;
        }
      }
      setNovaCategoriaNome('');
      setNovoSubmenuNome('');
      setNovoGrupo('');
    } catch (e: unknown) {
      alert('Erro: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsSubmittingEstrutura(false);
    }
  };

  const handleExcluirCategoria = async () => {
    const nomeCatLimp = novaCategoriaNome.trim();
    if (!nomeCatLimp) {
      alert('Digite o nome da categoria para excluir.');
      return;
    }
    const normalize = (val: string) => val.toLowerCase().trim().replace(/s$/, '');
    const cat = initialCategorias.find(c => normalize(c.nome) === normalize(nomeCatLimp));

    if (cat && confirm(`Tem certeza que deseja excluir a categoria ${cat.nome}?`)) {
      await excluirCategoria(cat.id);
      router.refresh();
      setNovaCategoriaNome('');
    } else if (!cat) {
      alert('Categoria não encontrada.');
    }
  };

  const handleRenomearCategoria = async (catId: string, nomeAtual: string) => {
    const novoNome = prompt('Digite o novo nome para a categoria:', nomeAtual);
    if (!novoNome || novoNome.trim() === '' || novoNome.trim() === nomeAtual) return;

    try {
      const fd = new FormData();
      fd.append('nome', novoNome.trim());
      await atualizarCategoria(catId, fd);
      alert('Categoria renomeada com sucesso!');
      router.refresh();
    } catch (e: unknown) {
      alert('Erro: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleRenomearSubmenuEGrupo = async () => {
    if (!selectedSubmenuId) {
      alert('Selecione um submenu primeiro!');
      return;
    }
    const sub = initialSubmenus.find((s) => s.id === selectedSubmenuId);
    if (!sub) return;

    const novoNome = prompt('Digite o novo nome para o submenu:', sub.nome);
    if (novoNome === null) return; // Cancelado

    const nomeFinal = novoNome.trim() || sub.nome;

    try {
      setIsSubmittingConteudo(true);
      const fd = new FormData();
      fd.append('nome', nomeFinal);
      fd.append('grupo', edicaoGrupo.trim());
      fd.append('conteudo', edicaoConteudo);
      fd.append('categoriaId', selectedCategoriaId);

      // Re-enviar imagens e vídeos atuais para não perdê-los (já que o server action limpa e reinsere)
      edicaoImages.forEach((img) => {
        if (img.file) {
          fd.append('imageFiles', img.file);
        } else if (img.url && img.url.trim()) {
          fd.append('imageUrls', img.url.trim());
        }
      });

      edicaoVideoUrls.forEach((url) => {
        if (url && url.trim()) fd.append('videoUrls', url.trim());
      });

      edicaoRelatedIds.forEach((id) => {
        fd.append('relatedSubmenuIds', id);
      });

      await atualizarSubmenu(selectedSubmenuId, fd);
      alert('Submenu e Grupo renomeados com sucesso!');
      router.refresh();
    } catch (e: unknown) {
      alert('Erro: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsSubmittingConteudo(false);
    }
  };

  const handleExcluirCategoriaPorId = async (catId: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${nome}" e TODOS os seus submenus?`)) {
      try {
        await excluirCategoria(catId);
        setSelectedCategoriaId('');
        setSelectedSubmenuId('');
        alert('Categoria excluída com sucesso!');
        router.refresh();
      } catch (e: unknown) {
        alert('Erro: ' + (e instanceof Error ? e.message : String(e)));
      }
    }
  };

  // Handle Bloco 2: Mudar Seleção de Submenu
  const handleSubmenuChange = (submenuId: string) => {
    setSelectedSubmenuId(submenuId);
  };

  // Handle Bloco 2: Guardar Conteúdo
  const handleSalvarConteudo = async () => {
    if (!selectedSubmenuId) {
      alert('Selecione um submenu primeiro!');
      return;
    }
    setIsSubmittingConteudo(true);
    try {
      const fd = new FormData();
      fd.append('conteudo', edicaoConteudo);
      fd.append('categoriaId', selectedCategoriaId);
      const sub = initialSubmenus.find(s => s.id === selectedSubmenuId);
      fd.append('nome', sub?.nome || '');
      if (edicaoGrupo.trim()) fd.append('grupo', edicaoGrupo.trim());

      edicaoImages.forEach((img) => {
        if (!img) return;
        if (img.file) {
          fd.append('imageFiles', img.file);
        } else if (img.url && img.url.trim()) {
          fd.append('imageUrls', img.url.trim());
        }
      });

      edicaoVideoUrls.forEach(url => {
        if (url && url.trim()) fd.append('videoUrls', url.trim());
      });

      edicaoRelatedIds.forEach(id => {
        fd.append('relatedSubmenuIds', id);
      });

      await atualizarSubmenu(selectedSubmenuId, fd);
      alert('Conteúdo salvo com sucesso!');
      router.refresh();
    } catch (e: unknown) {
      alert('Erro: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsSubmittingConteudo(false);
    }
  };

  const insertTag = (tag: string, className?: string) => {
    const textarea = document.getElementById('conteudo') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    if (className) {
      replacement = `<${tag} class="${className}">${selected}</${tag}>`;
    } else {
      replacement = `<${tag}>${selected}</${tag}>`;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setEdicaoConteudo(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + (className ? className.length + 9 : 2), start + tag.length + (className ? className.length + 9 : 2) + selected.length);
    }, 0);
  };

  const handleExcluirSubmenu = async () => {
    if (!selectedSubmenuId) return;
    if (confirm('Deseja excluir este submenu?')) {
      await excluirSubmenu(selectedSubmenuId);
      setSelectedSubmenuId('');
      setEdicaoConteudo('');
      setEdicaoGrupo('');
      setEdicaoImages([]);
      setEdicaoVideoUrls(['', '']);
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Gerenciar Estrutura do Menu</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Categoria (Ex: Recursos Humanos)
            </label>
            <input
              type="text"
              list="categorias-existentes"
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Digite a categoria"
              value={novaCategoriaNome}
              onChange={(e) => setNovaCategoriaNome(e.target.value)}
            />
            <datalist id="categorias-existentes">
              {initialCategorias.map((cat) => (
                <option key={cat.id} value={cat.nome} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Submenu (Ex: Férias)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Opcional: Digite o submenu"
              value={novoSubmenuNome}
              onChange={(e) => setNovoSubmenuNome(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo do Submenu (Ex: Documentos)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Opcional: Agrupar sob um nome"
              value={novoGrupo}
              onChange={(e) => setNovoGrupo(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              *Para adicionar apenas uma Categoria, deixe o submenu e o grupo em branco. Para excluir uma Categoria, digite o nome e clique excluir.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleAdicionarEstrutura}
              disabled={isSubmittingEstrutura}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmittingEstrutura ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Adicionando...
                </>
              ) : (
                'Adicionar'
              )}
            </button>
            <button
              onClick={handleExcluirCategoria}
              className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-medium rounded-lg transition-colors"
            >
              Excluir Categoria
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Gerenciar Conteúdo e Submenus</h2>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedCategoriaId}
                onChange={(e) => {
                  setSelectedCategoriaId(e.target.value);
                  setSelectedSubmenuId('');
                }}
              >
                <option value="">Selecione uma categoria...</option>
                {initialCategorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Submenu</label>
              <select
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedSubmenuId}
                onChange={(e) => handleSubmenuChange(e.target.value)}
                disabled={!selectedCategoriaId}
              >
                <option value="">Selecione um submenu...</option>
                {filteredSubmenus.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.grupo ? `[${sub.grupo}] ${sub.nome}` : sub.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo (Opcional)</label>
            <input
              type="text"
              id="grupoOpcional"
              className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ex: Documentos"
              value={edicaoGrupo}
              onChange={(e) => setEdicaoGrupo(e.target.value)}
              disabled={!selectedSubmenuId}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Fotos (Máximo 5)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 border border-gray-100 rounded-lg bg-gray-50 relative">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-tight flex justify-between items-center">
                    Foto {i + 1}
                    {(edicaoImages[i]?.url || edicaoImages[i]?.file) && (
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...edicaoImages];
                          newImages[i] = { url: '', file: null };
                          setEdicaoImages(newImages);
                          const input = document.getElementById(`foto-input-${i}`) as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold bg-red-50 px-1 rounded"
                      >
                        REMOVER
                      </button>
                    )}
                  </label>
                  <input
                    id={`foto-input-${i}`}
                    type="file"
                    accept="image/*"
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      const newImages = [...edicaoImages];
                      newImages[i] = { url: newImages[i]?.url || '', file };
                      setEdicaoImages(newImages);
                    }}
                    disabled={!selectedSubmenuId}
                  />
                  <input
                    type="text"
                    className="w-full px-2 py-1 text-sm text-gray-900 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Ou cole a URL..."
                    value={edicaoImages[i]?.url || ''}
                    onChange={(e) => {
                      const newImages = [...edicaoImages];
                      newImages[i] = { url: e.target.value, file: newImages[i]?.file || null };
                      setEdicaoImages(newImages);
                    }}
                    disabled={!selectedSubmenuId || (edicaoImages[i]?.file !== undefined && edicaoImages[i]?.file !== null)}
                  />
                  {/* Preview Logic */}
                  {(() => {
                    const imgData = edicaoImages[i];
                    let previewUrl = '';
                    if (imgData?.file) {
                      try {
                        previewUrl = URL.createObjectURL(imgData.file);
                      } catch (e) {
                        console.error("Error creating object URL", e);
                      }
                    } else if (imgData?.url) {
                      previewUrl = imgData.url;
                    }

                    if (!previewUrl) return null;

                    return (
                      <div className="mt-2 h-24 w-full overflow-hidden rounded border border-gray-200 bg-white flex items-center justify-center">
                        <img
                          src={previewUrl}
                          className="max-w-full max-h-full object-contain"
                          alt={`Preview ${i + 1}`}
                          onLoad={() => {
                            // If it's a blob, we could revoke it after load if we don't need it anymore, 
                            // but since it's a preview in a list, we keep it until it changes.
                          }}
                        />
                      </div>
                    );
                  })()}
                  {edicaoImages[i]?.file && (
                    <div className="mt-1 text-[10px] text-blue-600 font-bold uppercase text-center">
                      Novo arquivo selecionado
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Vídeos YouTube (Máximo 2)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-tight">Link do Vídeo {i + 1}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: https://www.youtube.com/watch?v=..."
                    value={edicaoVideoUrls[i] || ''}
                    onChange={(e) => {
                      const newVideos = [...edicaoVideoUrls];
                      newVideos[i] = e.target.value;
                      setEdicaoVideoUrls(newVideos);
                    }}
                    disabled={!selectedSubmenuId}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Artigos Relacionados (Sugestões de leitura)</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <input
                type="text"
                placeholder="Pesquisar artigo para relacionar..."
                className="w-full px-4 py-2 mb-3 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                value={searchRelated}
                onChange={(e) => setSearchRelated(e.target.value)}
                disabled={!selectedSubmenuId}
              />
              <div className="max-h-40 overflow-y-auto space-y-2">
                {initialSubmenus
                  .filter(s => s.id !== selectedSubmenuId) // Não relacionar consigo mesmo
                  .filter(s => s.nome.toLowerCase().includes(searchRelated.toLowerCase()))
                  .map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={edicaoRelatedIds.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEdicaoRelatedIds([...edicaoRelatedIds, s.id]);
                          } else {
                            setEdicaoRelatedIds(edicaoRelatedIds.filter(id => id !== s.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={!selectedSubmenuId}
                      />
                      <span>[{initialCategorias.find(c => c.id === s.categoriaId)?.nome}] {s.grupo ? `(${s.grupo}) ` : ''}{s.nome}</span>
                    </label>
                  ))}
                {initialSubmenus.length <= 1 && (
                  <p className="text-xs text-gray-500 italic">Nenhum outro artigo disponível para relacionar.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => insertTag('b')}
                  className="px-2 py-0.5 text-xs font-bold border border-gray-300 rounded hover:bg-gray-100 bg-white"
                  title="Negrito"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('u')}
                  className="px-2 py-0.5 text-xs underline border border-gray-300 rounded hover:bg-gray-100 bg-white"
                  title="Sublinhado"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('mark', 'bg-yellow-200')}
                  className="px-2 py-0.5 text-xs border border-gray-300 rounded hover:bg-gray-100 bg-yellow-100"
                  title="Destaque"
                >
                  H
                </button>
              </div>
            </div>
            <textarea
              id="conteudo"
              className="w-full h-48 px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y transition-all"
              placeholder="Adicione o conteúdo aqui... Suporta HTML básico se necessário."
              value={edicaoConteudo}
              onChange={(e) => setEdicaoConteudo(e.target.value)}
              disabled={!selectedSubmenuId}
            ></textarea>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleSalvarConteudo}
              disabled={isSubmittingConteudo || !selectedSubmenuId}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmittingConteudo ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Salvando conteudo...
                </>
              ) : (
                'Salvar / Alterar Conteúdo'
              )}
            </button>
            {selectedSubmenuId && (
              <>
                <button
                  onClick={handleRenomearSubmenuEGrupo}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  Renomear Submenu e Grupo de Submenu
                </button>
                <button
                  onClick={handleExcluirSubmenu}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                >
                  Excluir Submenu
                </button>
              </>
            )}
            {selectedCategoriaId && !selectedSubmenuId && (
              <button
                onClick={async () => {
                  const name = prompt('Nome do novo submenu para esta categoria:');
                  if (name?.trim()) {
                    const grupoName = prompt('Nome do Grupo (ou deixe em branco para ficar solto):');
                    const fd = new FormData();
                    fd.append('nome', name.trim());
                    fd.append('conteudo', 'Novo conteúdo...');
                    fd.append('categoriaId', selectedCategoriaId);
                    if (grupoName?.trim()) fd.append('grupo', grupoName.trim());
                    await criarSubmenu(fd);
                    alert('Submenu criado com sucesso!');
                    router.refresh();
                  }
                }}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors"
              >
                + Novo Submenu Aqui
              </button>
            )}
            {selectedCategoriaId && (
              <>
                <button
                  onClick={() => {
                    const cat = initialCategorias.find(c => c.id === selectedCategoriaId);
                    if (cat) handleRenomearCategoria(cat.id, cat.nome);
                  }}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                >
                  Renomear Categoria
                </button>
                <button
                  onClick={() => {
                    const cat = initialCategorias.find(c => c.id === selectedCategoriaId);
                    if (cat) handleExcluirCategoriaPorId(cat.id, cat.nome);
                  }}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-medium rounded-lg transition-colors"
                >
                  Excluir Categoria Selecionada
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}