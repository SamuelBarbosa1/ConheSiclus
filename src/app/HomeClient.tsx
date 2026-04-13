'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Menu, FileText, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { Categoria, Submenu } from '../types';
import { normalizeText, sortCategorias } from '../lib/utils';
import { SearchBar } from '../components/SearchBar';
import { Sidebar } from '../components/Sidebar';
import { YoutubePlayer } from '../components/YoutubePlayer';

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
      <header className="h-20 flex-shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 z-30 shadow-sm relative">
        <div className="flex items-center gap-2 sm:gap-5">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            title="Menu"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/ensti-logo.jpg" alt="ENSTI Logo" className="h-12 w-auto object-contain" />
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
            <div className="max-w-[1600px] mx-auto w-full">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* CONTEÚDO PRINCIPAL (Agora no lado ESQUERDO no desktop) */}
                <div className="flex-1 bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-gray-50 w-full">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0f2c4a] mb-6 border-b pb-4 text-center">
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
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText size={48} className="mb-4 opacity-50" />
              <h1 className="text-2xl font-medium text-gray-500">Bem-vindo ao ConheSiclus</h1>
              <p className="mt-2 text-gray-400">Selecione um item no menu lateral para visualizar!</p>
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
