'use client';

import React, { useState } from 'react';
import { Settings, Menu, FileText } from 'lucide-react';
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
            href="/admin"
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
            <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0f2c4a] mb-6 border-b pb-4 text-center">
                {submenuAtivo.nome}
              </h2>

              <div
                className="prose prose-blue max-w-none text-gray-700 leading-relaxed mb-8 text-lg"
                dangerouslySetInnerHTML={{ __html: submenuAtivo.conteudo.replace(/\n/g, '<br/>') }}
              />

              {submenuAtivo.images && submenuAtivo.images.length > 0 && (
                <div className="mt-8 space-y-6">
                  {submenuAtivo.images.map((img, idx) => (
                    <div key={img.id} className="rounded-xl overflow-hidden border border-gray-100 shadow-md">
                      <img
                        src={img.url}
                        alt={`${submenuAtivo.nome} image ${idx + 1}`}
                        className="w-full h-auto object-cover max-h-[600px] hover:scale-[1.01] transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}

              <YoutubePlayer videos={submenuAtivo.videos} submenuNome={submenuAtivo.nome} />

              {submenuAtivo.relatedSubmenus && submenuAtivo.relatedSubmenus.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
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
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText size={48} className="mb-4 opacity-50" />
              <h1 className="text-2xl font-medium text-gray-500">Bem-vindo ao ConheSiclus</h1>
              <p className="mt-2 text-gray-400">Selecione um item no menu lateral para visualizar!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
