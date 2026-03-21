'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  criarCategoria,
  criarSubmenu,
  atualizarSubmenu,
  excluirCategoria,
  excluirSubmenu,
  atualizarCategoria,
} from '../actions';
import { useRouter } from 'next/navigation';
import { Categoria, Submenu } from '../../types';
import { normalizeString, sortCategorias } from '../../lib/utils';
import { MediaEditor } from '../../components/MediaEditor';
import { RelatedArticlesEditor } from '../../components/RelatedArticlesEditor';
import { Toast, ToastType } from '../../components/Toast';
import { Loader2, Plus, Save, Trash2, Edit3, X, AlertTriangle, Settings } from 'lucide-react';

// Single Modal Component for all dialogues
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: (inputValue?: string, secondInputValue?: string) => void;
  showInput?: boolean;
  inputPlaceholder?: string;
  initialInputValue?: string;
  showSecondInput?: boolean;
  secondInputPlaceholder?: string;
  initialSecondInputValue?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

function Modal({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  showInput,
  inputPlaceholder,
  initialInputValue = '',
  showSecondInput,
  secondInputPlaceholder,
  initialSecondInputValue = '',
  isDanger,
  isLoading
}: ModalProps) {
  const [val, setVal] = useState(initialInputValue);
  const [val2, setVal2] = useState(initialSecondInputValue);

  useEffect(() => {
    if (isOpen) {
      setVal(initialInputValue);
      setVal2(initialSecondInputValue);
    }
  }, [isOpen, initialInputValue, initialSecondInputValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-100">
        <div className={`p-4 ${isDanger ? 'bg-red-50' : 'bg-gray-50'} border-b border-gray-100 flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            {isDanger ? <AlertTriangle size={18} className="text-red-500" /> : <Edit3 size={18} className="text-gray-600" />}
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {message && <p className="text-sm text-gray-650 font-medium leading-normal">{message}</p>}

          {showInput && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">{inputPlaceholder || 'Nome'}</label>
              <input
                autoFocus
                type="text"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white transition-all text-sm font-bold"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onConfirm(val, val2)}
              />
            </div>
          )}

          {showSecondInput && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">{secondInputPlaceholder || 'Grupo'}</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white transition-all text-sm font-bold"
                value={val2}
                onChange={(e) => setVal2(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onConfirm(val, val2)}
              />
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-100 transition-all text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(val, val2)}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminClient({
  initialCategorias,
  initialSubmenus,
}: {
  initialCategorias: Categoria[];
  initialSubmenus: Submenu[];
}) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [novoSubmenuNome, setNovoSubmenuNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState('');
  const [isSubmittingEstrutura, setIsSubmittingEstrutura] = useState(false);

  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>('');
  const [selectedSubmenuId, setSelectedSubmenuId] = useState<string>('');
  const [edicaoConteudo, setEdicaoConteudo] = useState('');
  const [edicaoGrupo, setEdicaoGrupo] = useState('');
  const [edicaoImages, setEdicaoImages] = useState<{ url: string; file: File | null }[]>([]);
  const [edicaoVideoUrls, setEdicaoVideoUrls] = useState<string[]>(['', '']);
  const [edicaoRelatedIds, setEdicaoRelatedIds] = useState<string[]>([]);
  const [isSubmittingConteudo, setIsSubmittingConteudo] = useState(false);
  const [searchRelated, setSearchRelated] = useState('');

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [modalConfig, setModalConfig] = useState<Omit<ModalProps, 'isOpen' | 'onClose'> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => setToast({ message, type }), []);
  const openModal = useCallback((config: Omit<ModalProps, 'isOpen' | 'onClose'>) => setModalConfig(config), []);
  const closeModal = useCallback(() => setModalConfig(null), []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (selectedSubmenuId) {
      const sub = initialSubmenus.find(s => s.id === selectedSubmenuId);
      if (sub) {
        setEdicaoConteudo(sub.conteudo || '');
        setEdicaoGrupo(sub.grupo || '');
        const existingImages = sub.images ? sub.images.map(img => ({ url: img.url, file: null as File | null })) : [];
        const slots = Array(5).fill(null).map((_, i) => existingImages[i] || { url: '', file: null });
        setEdicaoImages(slots);
        setEdicaoVideoUrls(sub.videos && sub.videos.length > 0 ? [...sub.videos.map(v => v.url), '', ''].slice(0, 2) : ['', '']);
        setEdicaoRelatedIds(sub.relatedSubmenus ? sub.relatedSubmenus.map(r => r.id) : []);
      }
    } else {
      setEdicaoConteudo(''); setEdicaoGrupo(''); setEdicaoImages([]); setEdicaoVideoUrls(['', '']); setEdicaoRelatedIds([]);
    }
  }, [selectedSubmenuId, initialSubmenus]);

  const prepareFormData = useCallback((nome: string, grupo: string, conteudo: string, catId: string) => {
    const fd = new FormData();
    fd.append('nome', nome);
    fd.append('grupo', grupo.trim());
    fd.append('conteudo', conteudo);
    fd.append('categoriaId', catId);
    edicaoImages.forEach((img) => {
      if (img.file) fd.append('imageFiles', img.file);
      else if (img.url && img.url.trim()) fd.append('imageUrls', img.url.trim());
    });
    edicaoVideoUrls.forEach((url) => { if (url && url.trim()) fd.append('videoUrls', url.trim()); });
    edicaoRelatedIds.forEach((id) => { fd.append('relatedSubmenuIds', id); });
    return fd;
  }, [edicaoImages, edicaoVideoUrls, edicaoRelatedIds]);

  const insertTag = useCallback((tag: string, className?: string) => {
    const textarea = document.getElementById('conteudo') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart; const end = textarea.selectionEnd;
    const text = textarea.value; const selected = text.substring(start, end);
    const replacement = className ? `<${tag} class="${className}">${selected}</${tag}>` : `<${tag}>${selected}</${tag}>`;
    setEdicaoConteudo(text.substring(0, start) + replacement + text.substring(end));
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + tag.length + (className ? className.length + 9 : 2), start + tag.length + (className ? className.length + 9 : 2) + selected.length); }, 0);
  }, []);

  if (!mounted) return null;

  const filteredSubmenus = initialSubmenus.filter(s => s.categoriaId === selectedCategoriaId);

  // HANDLERS
  const handleAdicionarEstrutura = async () => {
    const nomeCat = novaCategoriaNome.trim();
    if (!nomeCat) return showToast('Informe a categoria.', 'error');
    setIsSubmittingEstrutura(true);
    try {
      const cat = initialCategorias.find(c => normalizeString(c.nome) === normalizeString(nomeCat));
      if (!cat) {
        const fd = new FormData(); fd.append('nome', nomeCat);
        await criarCategoria(fd); showToast('Categoria criada!'); router.refresh();
      } else {
        const nomeSub = novoSubmenuNome.trim();
        if (!nomeSub) return showToast(`A categoria "${cat.nome}" já existe. Preencha o submenu.`, 'info');
        const fd = new FormData();
        fd.append('nome', nomeSub); fd.append('conteudo', '...'); fd.append('categoriaId', cat.id);
        if (novoGrupo.trim()) fd.append('grupo', novoGrupo.trim());
        await criarSubmenu(fd); showToast('Submenu adicionado!'); router.refresh();
      }
      setNovaCategoriaNome(''); setNovoSubmenuNome(''); setNovoGrupo('');
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setIsSubmittingEstrutura(false); }
  };

  const handleSalvarConteudo = async () => {
    if (!selectedSubmenuId) return;
    setIsSubmittingConteudo(true);
    try {
      const sub = initialSubmenus.find(s => s.id === selectedSubmenuId);
      const fd = prepareFormData(sub?.nome || '', edicaoGrupo, edicaoConteudo, selectedCategoriaId);
      await atualizarSubmenu(selectedSubmenuId, fd);
      showToast('Salvo com sucesso!');
      router.refresh();
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setIsSubmittingConteudo(false); }
  };

  const triggerRenomearItem = () => {
    const sub = initialSubmenus.find(s => s.id === selectedSubmenuId);
    if (!sub) return;
    openModal({
      title: 'Renomear Item',
      showInput: true,
      inputPlaceholder: 'Novo Nome',
      initialInputValue: sub.nome,
      showSecondInput: true,
      secondInputPlaceholder: 'Novo Grupo',
      initialSecondInputValue: edicaoGrupo,
      confirmLabel: 'Renomear',
      onConfirm: async (novoNome, novoGrupoTxt) => {
        if (!novoNome?.trim()) return showToast('Nome inválido', 'error');
        try {
          const fd = prepareFormData(novoNome.trim(), novoGrupoTxt?.trim() || '', edicaoConteudo, selectedCategoriaId);
          await atualizarSubmenu(selectedSubmenuId, fd);
          showToast('Item renomeado!'); closeModal(); router.refresh();
        } catch (e: any) { showToast(e.message, 'error'); }
      }
    });
  };

  const triggerExcluirItem = () => {
    openModal({
      title: 'Excluir Item',
      message: 'Confirmar exclusão permanente?',
      isDanger: true,
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        try {
          await excluirSubmenu(selectedSubmenuId);
          showToast('Item excluído.'); setSelectedSubmenuId(''); closeModal(); router.refresh();
        } catch (e: any) { showToast(e.message, 'error'); }
      }
    });
  };

  const triggerRenomearCategoria = () => {
    const cat = initialCategorias.find(c => c.id === selectedCategoriaId);
    if (!cat) return;
    openModal({
      title: 'Renomear Categoria',
      showInput: true,
      inputPlaceholder: 'Novo Nome',
      initialInputValue: cat.nome,
      confirmLabel: 'Renomear',
      onConfirm: async (novoNome) => {
        if (!novoNome?.trim()) return showToast('Nome inválido', 'error');
        try {
          const fd = new FormData(); fd.append('nome', novoNome.trim());
          await atualizarCategoria(selectedCategoriaId, fd);
          showToast('Categoria renomeada!'); closeModal(); router.refresh();
        } catch (e: any) { showToast(e.message, 'error'); }
      }
    });
  };

  const triggerExcluirCategoriaCompleta = () => {
    const cat = initialCategorias.find(c => c.id === selectedCategoriaId);
    if (!cat) return;
    openModal({
      title: 'Excluir Categoria',
      message: `Isso excluirá "${cat.nome}" e TODOS os submenus!`,
      isDanger: true,
      confirmLabel: 'Excluir Tudo',
      onConfirm: async () => {
        try {
          await excluirCategoria(selectedCategoriaId);
          showToast('Categoria removida.'); setSelectedCategoriaId(''); setSelectedSubmenuId(''); closeModal(); router.refresh();
        } catch (e: any) { showToast(e.message, 'error'); }
      }
    });
  };

  const triggerNovoSubmenuAqui = () => {
    openModal({
      title: 'Novo Submenu',
      showInput: true,
      inputPlaceholder: 'Nome',
      showSecondInput: true,
      secondInputPlaceholder: 'Grupo',
      confirmLabel: 'Criar',
      onConfirm: async (nome, grupo) => {
        if (!nome?.trim()) return showToast('Nome obrigatório', 'error');
        try {
          const fd = new FormData();
          fd.append('nome', nome.trim()); fd.append('conteudo', '...'); fd.append('categoriaId', selectedCategoriaId);
          if (grupo?.trim()) fd.append('grupo', grupo.trim());
          await criarSubmenu(fd);
          showToast('Submenu criado!'); closeModal(); router.refresh();
        } catch (e: any) { showToast(e.message, 'error'); }
      }
    });
  };

  const triggerExcluirCategoriaPorNome = () => {
    const nome = novaCategoriaNome.trim();
    if (!nome) return showToast('Digite o nome da categoria.', 'error');
    const cat = initialCategorias.find(c => normalizeString(c.nome) === normalizeString(nome));
    if (!cat) return showToast('Não encontrado.', 'error');
    openModal({
      title: 'Confirmar Exclusão',
      message: `Excluir categoria "${cat.nome}"?`,
      isDanger: true,
      confirmLabel: 'Excluir',
      onConfirm: async () => {
        try {
          await excluirCategoria(cat.id);
          showToast('Excluído!'); setNovaCategoriaNome(''); closeModal(); router.refresh();
        } catch (e: any) { showToast(e.message, 'error'); }
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6 select-none font-sans text-gray-900">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Modal isOpen={!!modalConfig} onClose={closeModal} {...(modalConfig || { title: '', onConfirm: () => { } })} />

      {/* SEÇÃO 1: ESTRUTURA */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <Plus size={18} className="text-teal-600" />
          <h2 className="font-bold text-gray-700">1. Gerenciar Estrutura</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Categoria</label>
              <input
                type="text" list="cat-list" value={novaCategoriaNome} onChange={(e) => setNovaCategoriaNome(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-teal-400 focus:bg-white font-bold text-gray-800 placeholder:text-gray-400"
                placeholder="Ex: Associado"
              />
              <datalist id="cat-list">{initialCategorias.map(c => <option key={c.id} value={c.nome} />)}</datalist>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Submenu</label>
              <input
                type="text" value={novoSubmenuNome} onChange={(e) => setNovoSubmenuNome(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-teal-400 focus:bg-white font-bold text-gray-800 placeholder:text-gray-400"
                placeholder="Ex: Cadastro"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Grupo (Opcional)</label>
              <input
                type="text" value={novoGrupo} onChange={(e) => setNovoGrupo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-teal-400 focus:bg-white font-bold text-gray-800 placeholder:text-gray-400"
                placeholder="Ex: Documentos"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAdicionarEstrutura} disabled={isSubmittingEstrutura}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmittingEstrutura ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Adicionar Estrutura
            </button>
            <button
              onClick={triggerExcluirCategoriaPorNome}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg transition-all flex items-center gap-2"
            >
              <Trash2 size={16} />
              Excluir Categoria (pelo nome)
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: EDIÇÃO */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <Edit3 size={18} className="text-blue-600" />
          <h2 className="font-bold text-gray-700">2. Editar Conteúdo</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase font-bold">Selecionar Categoria</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 font-bold cursor-pointer transition-all text-gray-800"
                value={selectedCategoriaId}
                onChange={(e) => { setSelectedCategoriaId(e.target.value); setSelectedSubmenuId(''); }}
              >
                <option value="">Selecione...</option>
                {initialCategorias.sort(sortCategorias).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase font-bold">Selecionar Submenu</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 font-bold cursor-pointer transition-all disabled:opacity-50 text-gray-800"
                value={selectedSubmenuId}
                onChange={(e) => setSelectedSubmenuId(e.target.value)}
                disabled={!selectedCategoriaId}
              >
                <option value="">Selecione...</option>
                {filteredSubmenus.sort((a, b) => a.nome.localeCompare(b.nome)).map(s => <option key={s.id} value={s.id}>{s.grupo ? `[${s.grupo}] ${s.nome}` : s.nome}</option>)}
              </select>
            </div>
          </div>

          {selectedSubmenuId ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Grupo (Editar)</label>
                <input
                  type="text" value={edicaoGrupo} onChange={(e) => setEdicaoGrupo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 font-bold"
                />
              </div>

              <MediaEditor images={edicaoImages} setImages={setEdicaoImages} videoUrls={edicaoVideoUrls} setVideoUrls={setEdicaoVideoUrls} />

              <RelatedArticlesEditor
                initialSubmenus={initialSubmenus} initialCategorias={initialCategorias}
                selectedSubmenuId={selectedSubmenuId} relatedIds={edicaoRelatedIds}
                setRelatedIds={setEdicaoRelatedIds} searchRelated={searchRelated} setSearchRelated={setSearchRelated}
              />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Texto do Artigo</label>
                  <div className="flex gap-1">
                    {['b', 'u', 'mark'].map(t => (
                      <button key={t} type="button" onClick={() => insertTag(t, t === 'mark' ? 'bg-yellow-200 font-bold' : undefined)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 border border-gray-200 rounded text-[10px] font-black uppercase transition-all">{t[0]}</button>
                    ))}
                  </div>
                </div>
                <textarea
                  id="conteudo" value={edicaoConteudo} onChange={(e) => setEdicaoConteudo(e.target.value)}
                  className="w-full h-80 px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-400 font-medium leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleSalvarConteudo} disabled={isSubmittingConteudo}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingConteudo ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar Alterações
                </button>
                <button
                  onClick={triggerRenomearItem}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  Renomear Item
                </button>
                <button
                  onClick={triggerExcluirItem}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 font-bold rounded-lg flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Excluir Item
                </button>
              </div>

              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={triggerRenomearCategoria}
                  className="px-5 py-2 bg-gray-800 hover:bg-black text-white font-bold rounded-lg flex items-center gap-2 text-xs"
                >
                  <Edit3 size={14} />
                  Renomear Categoria Selecionada
                </button>
                <button
                  onClick={triggerExcluirCategoriaCompleta}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-2 text-xs"
                >
                  <Trash2 size={14} />
                  Excluir Categoria Selecionada
                </button>
              </div>
            </div>
          ) : selectedCategoriaId ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <h3 className="text-gray-500 font-bold mb-1">Nenhum submenu selecionado</h3>
                <p className="text-xs text-gray-400 mb-6 font-medium">Selecione um submenu acima ou crie um novo agora.</p>
                <button
                  onClick={triggerNovoSubmenuAqui}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg flex items-center gap-2 shadow-sm"
                >
                  <Plus size={18} />
                  <Settings size={18} />
                  Novo Submenu Aqui
                </button>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                <button onClick={triggerRenomearCategoria} className="px-5 py-2 bg-gray-800 hover:bg-black text-white font-bold rounded-lg flex items-center gap-2 text-xs"><Edit3 size={14} />Renomear Categoria Selecionada</button>
                <button onClick={triggerExcluirCategoriaCompleta} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg flex items-center gap-2 text-xs"><Trash2 size={14} />Excluir Categoria Selecionada</button>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 italic text-gray-400 font-medium">
              Selecione uma categoria acima para editar os conteúdos.
            </div>
          )}
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}