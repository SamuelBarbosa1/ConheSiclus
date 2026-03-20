'use client';

import React, { useState } from 'react';
import {
  Users,
  FileText,
  BarChart2,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Settings,
  Mail,
  Wrench,
  Shield,
  Briefcase,
  Play,
  Trophy,
  ArrowLeftRight,
  Target,
  Search,
  X,
  Menu
} from 'lucide-react';
import Link from 'next/link';

// Helper for mapping string names to lucide icons (extensible list based on image)
const iconMap: Record<string, React.ElementType> = {
  Associados: Users,
  'Ocorrências e Agenda': Calendar,
  Financeiro: DollarSign,
  Orçamento: BarChart2,
  Contábil: FileText,
  Materiais: Wrench,
  'Mala Direta': Mail,
  'Entrada/Saída': ArrowLeftRight,
  Esportes: Trophy,
  Eventos: Play,
  Jurídico: Shield,
  Administrativo: Briefcase,
  Parâmetros: Settings,
  Documentos: FileText,
  Relatórios: BarChart2,
  default: Target,
};

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

type Submenu = {
  id: string;
  nome: string;
  conteudo: string;
  grupo: string | null;
  images: { id: string; url: string }[];
  videos: { id: string; url: string }[];
  relatedSubmenus?: { id: string, nome: string }[];
};

type Categoria = {
  id: string;
  nome: string;
  icone: string | null;
  submenus: Submenu[];
};

export default function HomeClient({
  initialCategorias,
}: {
  initialCategorias: Categoria[];
}) {
  const [categoriaAberta, setCategoriaAberta] = useState<string | null>(null);
  const [submenuAtivo, setSubmenuAtivo] = useState<Submenu | null>(null);
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile: starts closed
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Lógica de Filtragem
  const termNormalized = normalizeText(searchTerm);

  const filteredCategorias = initialCategorias
    .map((cat) => {
      const catNomeNormalized = normalizeText(cat.nome);
      const catMatches = catNomeNormalized.includes(termNormalized);

      const filteredSubmenus = cat.submenus.filter((sub) => {
        if (!termNormalized) return true;
        return (
          normalizeText(sub.nome).includes(termNormalized) ||
          (sub.conteudo && normalizeText(sub.conteudo).includes(termNormalized)) ||
          (sub.grupo && normalizeText(sub.grupo).includes(termNormalized))
        );
      });

      if (catMatches) {
        // Se a categoria coincide, mostramos TODOS os seus submenus (melhor UX)
        return { ...cat, submenus: cat.submenus };
      }

      if (filteredSubmenus.length > 0) {
        return { ...cat, submenus: filteredSubmenus };
      }
      return null;
    })
    .filter((cat): cat is Categoria => cat !== null);

  // Lista plana de submenus para o dropdown de busca rápida
  const allMatchingSubmenus = initialCategorias.flatMap(cat => 
    cat.submenus.filter(sub => {
      if (!termNormalized || termNormalized.length < 2) return false;
      return (
        normalizeText(sub.nome).includes(termNormalized) ||
        (sub.grupo && normalizeText(sub.grupo).includes(termNormalized))
      );
    }).map(sub => ({ ...sub, categoriaNome: cat.nome }))
  ).slice(0, 8); // Limitar a 8 resultados no dropdown

  const isSearching = searchTerm.trim().length > 0;

  const toggleCategoria = (id: string) => {
    setCategoriaAberta(categoriaAberta === id ? null : id);
  };

  const toggleGrupo = (categoriaId: string, grupoNome: string) => {
    const key = `${categoriaId}-${grupoNome}`;
    setGruposAbertos(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="flex flex-col h-screen w-full font-sans bg-white text-gray-900 overflow-hidden">
      {/* HEADER SUPERIOR */}
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
            <img
              src="/ensti-logo.jpg"
              alt="ENSTI Logo"
              className="h-12 w-auto object-contain"
            />
            <div className="h-10 w-[2px] bg-gray-200 mx-1"></div>
            <div className="flex flex-col justify-center">
              {/* <span className="text-blue-700 font-extrabold text-[10px] tracking-widest uppercase mb-[-2px]">Knowledge Portal</span> */}
              <span className="text-[#0f2c4a] font-black text-xl sm:text-2xl tracking-tighter">ConheSiclus</span>
            </div>
          </div>
        </div>

        {/* BARRA DE PESQUISA CENTRALIZADA */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-12">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="w-full pl-11 pr-10 py-2.5 bg-gray-100 border-transparent border focus:border-blue-200 focus:bg-white rounded-2xl focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setIsDropdownOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-500 p-1 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            )}

            {/* DROPDOWN DE RESULTADOS */}
            {isDropdownOpen && allMatchingSubmenus.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 transition-all">
                <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Resultados rápidos</span>
                </div>
                <ul className="max-h-[400px] overflow-y-auto">
                  {allMatchingSubmenus.map((sub) => (
                    <li 
                      key={sub.id}
                      onClick={() => {
                        setSubmenuAtivo(sub);
                        setSearchTerm('');
                        setIsDropdownOpen(false);
                        setIsSidebarOpen(false);
                      }}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">{sub.nome}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {sub.categoriaNome} {sub.grupo ? `• ${sub.grupo}` : ''}
                          </p>
                        </div>
                        <Search size={14} className="text-gray-300 group-hover:text-blue-400 mt-1" />
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="p-2 bg-gray-50 text-center">
                  <p className="text-[10px] text-gray-400">Pressione Esc para fechar</p>
                </div>
              </div>
            )}
          </div>
        </div>

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
        {/* BACKDROP MOBILE */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* SIDEBAR */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${isSidebarOpen ? 'w-[300px] translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:translate-x-0 overflow-hidden'}
          h-full bg-[#f8fafc] overflow-y-auto border-r border-gray-100 transition-all duration-300 ease-in-out
        `}>
          <div className="p-4 bg-white/50 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Navegação</h3>
          </div>

          <ul className="p-2 m-0 list-none space-y-1">
            {filteredCategorias.length === 0 && (
              <div className="p-8 text-sm text-gray-400 text-center italic">
                {isSearching ? 'Nenhum resultado para sua busca.' : 'Estrutura vazia.'}
              </div>
            )}
            {filteredCategorias.map((cat) => {
              const Icone =
                iconMap[cat.icone || ''] ||
                iconMap[cat.nome] ||
                iconMap.default;
              const estaAberta = categoriaAberta === cat.id || isSearching;

              return (
                <li key={cat.id} className="border-b border-gray-200">
                  <div
                    onClick={() => toggleCategoria(cat.id)}
                    className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-200 font-semibold text-[#0f2c4a] transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Icone size={18} className="text-[#0f2c4a]" />
                      {cat.nome}
                    </span>
                    {estaAberta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {estaAberta && cat.submenus && cat.submenus.length > 0 && (
                    <ul className="pb-2 list-none bg-white">
                      {(() => {
                        const grouped: Record<string, Submenu[]> = { soltos: [] };
                        cat.submenus.forEach((sub) => {
                          if (sub.grupo) {
                            if (!grouped[sub.grupo]) grouped[sub.grupo] = [];
                            grouped[sub.grupo].push(sub);
                          } else {
                            grouped.soltos.push(sub);
                          }
                        });

                        return (
                          <>
                            {grouped.soltos.map((sub) => (
                              <li
                                key={sub.id}
                                onClick={() => {
                                  setSubmenuAtivo(sub);
                                  setIsSidebarOpen(false);
                                }}
                                className={`py-2 pl-11 pr-2 text-sm cursor-pointer transition-colors ${submenuAtivo?.id === sub.id
                                  ? 'text-blue-600 font-bold'
                                  : 'text-gray-700 hover:text-blue-600'
                                  }`}
                              >
                                {sub.nome}
                              </li>
                            ))}

                            {Object.keys(grouped).filter(k => k !== 'soltos').map(grupoName => {
                              const isGroupOpen = gruposAbertos[`${cat.id}-${grupoName}`];
                              return (
                                <li key={grupoName}>
                                  <div
                                    onClick={() => toggleGrupo(cat.id, grupoName)}
                                    className="flex justify-between items-center py-2 pl-11 pr-3 cursor-pointer hover:bg-gray-100 font-semibold text-[#0f2c4a] text-sm transition-colors"
                                  >
                                    <span>{grupoName}</span>
                                    {(isGroupOpen || isSearching) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </div>

                                  {(isGroupOpen || isSearching) && (
                                    <ul className="pl-14 pb-1 list-none bg-white">
                                      {grouped[grupoName].map(sub => (
                                        <li
                                          key={sub.id}
                                          onClick={() => {
                                            setSubmenuAtivo(sub);
                                            setIsSidebarOpen(false);
                                          }}
                                          className={`py-2 pr-2 text-sm cursor-pointer transition-colors ${submenuAtivo?.id === sub.id
                                            ? 'text-blue-600 font-bold'
                                            : 'text-gray-700 hover:text-blue-600'
                                            }`}
                                        >
                                          {sub.nome}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                          </>
                        );
                      })()}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

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

              {submenuAtivo.videos && submenuAtivo.videos.length > 0 && (
                <div className="mt-8 space-y-6">
                  {submenuAtivo.videos.map((vid) => {
                    let embedUrl = vid.url;
                    if (embedUrl.includes('watch?v=')) {
                      const videoId = embedUrl.split('watch?v=')[1].split('&')[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    } else if (embedUrl.includes('youtu.be/')) {
                      const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
                      embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                    return (
                      <div key={vid.id} className="aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-md relative group">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={embedUrl}
                          title={`Vídeo para ${submenuAtivo.nome}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        ></iframe>
                      </div>
                    );
                  })}
                </div>
              )}

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
                          // Find the full submenu object from initialCategorias
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
              <h1 className="text-2xl font-medium text-gray-500">
                Bem-vindo ao ConheceSiclus
              </h1>
              <p className="mt-2 text-gray-400">
                Selecione um item no menu lateral para visualizar o conteúdo da sua base de dados Prisma.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
