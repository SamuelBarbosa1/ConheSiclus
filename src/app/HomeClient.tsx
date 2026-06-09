'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Menu, FileText, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { Categoria, Submenu } from '../types';
import { normalizeText, sortCategorias } from '../lib/utils';
import { SearchBar } from '../components/SearchBar';
import { Sidebar } from '../components/Sidebar';
import { YoutubePlayer } from '../components/YoutubePlayer';
import { iconMap } from '../lib/constants';

export default function HomeClient({
  initialCategorias,
}: {
  initialCategorias: Categoria[];
}) {
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null);
  const [submenuAtivo, setSubmenuAtivo] = useState<Submenu | null>(null);
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fechar lightbox com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const termNormalized = normalizeText(searchTerm);

  const filteredCategorias = initialCategorias
    .map((cat) => {
      const filteredSubmenus = cat.submenus.filter((sub) => {
        if (!termNormalized) return true;
        return (
          normalizeText(sub.nome).includes(termNormalized) ||
          (sub.conteudo && normalizeText(sub.conteudo).includes(termNormalized)) ||
          (sub.grupo && normalizeText(sub.grupo).includes(termNormalized))
        );
      });

      if (normalizeText(cat.nome).includes(termNormalized)) {
        return { ...cat, submenus: cat.submenus };
      }

      if (filteredSubmenus.length > 0) {
        return { ...cat, submenus: filteredSubmenus };
      }
      return null;
    })
    .filter((cat): cat is Categoria => cat !== null)
    .sort(sortCategorias);

  const allMatchingSubmenus = initialCategorias.flatMap(cat =>
    cat.submenus.filter(sub => {
      if (!termNormalized || termNormalized.length < 2) return false;
      return (
        normalizeText(sub.nome).includes(termNormalized) ||
        (sub.grupo && normalizeText(sub.grupo).includes(termNormalized))
      );
    }).map(sub => ({ ...sub, categoriaNome: cat.nome }))
  ).slice(0, 8);

  const isSearching = searchTerm.trim().length > 0;

  const toggleCategoria = (id: string) => {
    setCategoriaAberta(categoriaAberta === id ? null : id);
  };

  const toggleGrupo = (categoriaId: string, grupoNome: string) => {
    const key = `${categoriaId}-${grupoNome}`;
    setGruposAbertos(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResultClick = (sub: Submenu) => {
    setSubmenuAtivo(sub);
    setSearchTerm('');
    setIsDropdownOpen(false);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-full font-sans bg-white text-gray-900 overflow-hidden">
      <header className="h-20 flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100/80 flex items-center justify-between px-4 sm:px-8 z-30 shadow-sm sticky top-0">
        <div className="flex items-center gap-2 sm:gap-5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            title="Menu"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                setSubmenuAtivo(null);
                setCategoriaAberta(null);
                setSearchTerm('');
                setIsSidebarOpen(false);
              }}
              className="cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200"
              title="Voltar ao menu inicial"
            >
              <img src="/ensti-logo.jpg" alt="ENSTI Logo" className="h-12 w-auto object-contain" />
            </button>
            <div className="h-10 w-[2px] bg-gray-200 mx-1"></div>
            <span className="text-[#0f2c4a] font-black text-xl sm:text-2xl tracking-tighter">ConheSiclus</span>
          </div>
        </div>

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          allMatchingSubmenus={allMatchingSubmenus as any}
          onResultClick={handleResultClick}
        />
        {/* Configurações */}
        <div className="flex items-center gap-4">
          <Link
            href="/configuracoes"
            className="flex items-center gap-2 text-sm text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all border border-blue-100 shadow-sm"
          >
            <Settings size={16} />
            Configurações
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          filteredCategorias={filteredCategorias}
          categoriaAberta={categoriaAberta}
          toggleCategoria={toggleCategoria}
          gruposAbertos={gruposAbertos}
          toggleGrupo={toggleGrupo}
          isSearching={isSearching}
          submenuAtivo={submenuAtivo}
          setSubmenuAtivo={setSubmenuAtivo}
        />

        <div className="flex-1 bg-[#f4f7f6] p-4 sm:p-10 overflow-auto w-full">
          {submenuAtivo ? (
            <div key={submenuAtivo.id} className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* CONTEÚDO PRINCIPAL (Agora no lado ESQUERDO no desktop) */}
                <div className="flex-1 bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-gray-50 w-full">
                  {/* BREADCRUMBS & META TAGS */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => {
                          setSubmenuAtivo(null);
                          setSearchTerm('');
                        }}
                        className="hover:text-blue-600 transition-colors"
                      >
                        Início
                      </button>
                      <span>/</span>
                      <span className="text-gray-600">
                        {(() => {
                          const cat = initialCategorias.find((c) => c.id === submenuAtivo.categoriaId);
                          return cat ? cat.nome : '';
                        })()}
                      </span>
                      {submenuAtivo.grupo && (
                        <>
                          <span>/</span>
                          <span className="text-gray-600">{submenuAtivo.grupo}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                        {(() => {
                          const cat = initialCategorias.find((c) => c.id === submenuAtivo.categoriaId);
                          return cat ? cat.nome : '';
                        })()}
                      </span>
                      {submenuAtivo.grupo && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-650 rounded-full text-xs font-bold">
                          {submenuAtivo.grupo}
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2c4a] mb-6 text-center">
                    {submenuAtivo.nome}
                  </h2>

                  <div
                    className="prose prose-blue max-w-none text-gray-700 leading-relaxed mb-8 text-lg"
                    dangerouslySetInnerHTML={{ __html: submenuAtivo.conteudo.replace(/\n/g, '<br/>') }}
                  />

                  {submenuAtivo.images && submenuAtivo.images.length > 0 && (
                    <div className="mt-8 space-y-6">
                      {submenuAtivo.images.map((img, idx) => {
                        const finalUrl = (img.url.startsWith('http') || img.url.startsWith('/')) ? img.url : `https://${img.url}`;
                        return (
                          <div 
                            key={img.id} 
                            className="max-w-3xl mx-auto w-full rounded-xl overflow-hidden border border-gray-100 shadow-md bg-gray-50 group cursor-pointer relative"
                            onClick={(e) => {
                              e.preventDefault();
                              console.log('Opening image:', finalUrl);
                              setSelectedImage(finalUrl);
                            }}
                          >
                            <img
                              src={finalUrl}
                              alt={`${submenuAtivo.nome} image ${idx + 1}`}
                              className="w-full h-auto object-contain max-h-[500px] transition-all duration-500 group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                              <div className="bg-white/90 p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                <Maximize2 size={24} className="text-blue-600" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <YoutubePlayer videos={submenuAtivo.videos} submenuNome={submenuAtivo.nome} />

                  {/* Assuntos Relacionados (Mobile Only - Bottom) */}
                  {submenuAtivo.relatedSubmenus && submenuAtivo.relatedSubmenus.length > 0 && (
                    <div className="lg:hidden mt-12 pt-8 border-t border-gray-100">
                      <h3 className="text-xl font-bold text-[#0f2c4a] mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-blue-600" />
                        Assuntos Relacionados
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {submenuAtivo.relatedSubmenus.map((rel) => (
                          <div
                            key={rel.id}
                            onClick={() => {
                              for (const cat of initialCategorias) {
                                const found = cat.submenus.find(s => s.id === rel.id);
                                if (found) {
                                  setSubmenuAtivo(found);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                  break;
                                }
                              }
                            }}
                            className="p-4 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl cursor-pointer transition-all group"
                          >
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                              {rel.nome}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* LADO DIREITO: Assuntos Relacionados (Desktop) */}
                {submenuAtivo.relatedSubmenus && submenuAtivo.relatedSubmenus.length > 0 && (
                  <div className="hidden lg:block w-80 flex-shrink-0 sticky top-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-[#0f2c4a] mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-blue-600" />
                        Assuntos Relacionados
                      </h3>
                      <div className="space-y-3">
                        {submenuAtivo.relatedSubmenus.map((rel) => (
                          <div
                            key={rel.id}
                            onClick={() => {
                              for (const cat of initialCategorias) {
                                const found = cat.submenus.find(s => s.id === rel.id);
                                if (found) {
                                  setSubmenuAtivo(found);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                  break;
                                }
                              }
                            }}
                            className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-lg cursor-pointer transition-all group"
                          >
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 leading-tight block">
                              {rel.nome}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              {/* HERO SECTION */}
              <div className="bg-gradient-to-br from-[#0f2c4a] via-[#1a3d60] to-[#0a1e33] rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent)]"></div>
                <div className="relative z-10 max-w-2xl">
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Base de Conhecimento
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-4 mb-2 bg-gradient-to-r from-white via-blue-50 to-blue-200 bg-clip-text text-transparent">
                    Bem-vindo ao ConheSiclus
                  </h1>
                  <p className="text-blue-100/80 text-lg font-medium leading-relaxed">
                    Pesquise acima ou navegue pelas categorias abaixo para acessar tutoriais, manuais e documentações do sistema Siclus.
                  </p>
                </div>
              </div>

              {/* CATEGORIES GRID */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                  Navegar por Categorias
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {initialCategorias.sort(sortCategorias).map((cat) => {
                    const Icone = iconMap[cat.icone || ''] || iconMap[cat.nome] || iconMap.default;
                    return (
                      <div
                        key={cat.id}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                        onClick={() => {
                          toggleCategoria(cat.id);
                          setIsSidebarOpen(true);
                        }}
                      >
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-[#0f2c4a] group-hover:text-white transition-colors duration-300">
                              <Icone size={22} />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-[#0f2c4a] group-hover:text-blue-700 transition-colors">
                                {cat.nome}
                              </h4>
                              <p className="text-xs text-gray-400 font-medium">
                                {cat.submenus.length} {cat.submenus.length === 1 ? 'tópico' : 'tópicos'}
                              </p>
                            </div>
                          </div>

                          {cat.submenus && cat.submenus.length > 0 && (
                            <ul className="space-y-2.5 mt-2">
                              {cat.submenus.slice(0, 3).map((sub) => (
                                <li
                                  key={sub.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSubmenuAtivo(sub);
                                    setIsSidebarOpen(false);
                                  }}
                                  className="text-sm font-medium text-gray-650 hover:text-blue-600 flex items-center gap-2 transition-colors pl-1"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors"></span>
                                  <span className="truncate">{sub.nome}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {cat.submenus.length > 3 && (
                          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                            <span>Ver mais {cat.submenus.length - 3} tópicos</span>
                            <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-10 transition-all duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          
          <button 
            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all z-[10000]"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>

          <div 
            className="relative max-w-full max-h-full flex items-center justify-center z-[10000]"
            onClick={(e) => e.stopPropagation()} 
          >
            <img 
              src={selectedImage} 
              alt="Ampliada" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform duration-300 scale-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}
