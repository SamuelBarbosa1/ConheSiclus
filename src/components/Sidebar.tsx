import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Categoria, Submenu } from '../types';
import { iconMap } from '../lib/constants';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  filteredCategorias: Categoria[];
  categoriaAberta: string | null;
  toggleCategoria: (id: string) => void;
  gruposAbertos: Record<string, boolean>;
  toggleGrupo: (categoriaId: string, grupoNome: string) => void;
  isSearching: boolean;
  submenuAtivo: Submenu | null;
  setSubmenuAtivo: (sub: Submenu) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  filteredCategorias,
  categoriaAberta,
  toggleCategoria,
  gruposAbertos,
  toggleGrupo,
  isSearching,
  submenuAtivo,
  setSubmenuAtivo,
}) => {
  return (
    <>
      {/* BACKDROP MOBILE */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* SIDEBAR */}
      <nav
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${isSidebarOpen ? 'w-[300px] translate-x-0' : 'w-0 lg:w-0 -translate-x-full lg:translate-x-0 overflow-hidden'}
          h-full bg-[#f8fafc] overflow-y-auto custom-sidebar-scrollbar border-r border-gray-200 transition-all duration-300 ease-in-out
        `}
        role="navigation"
        aria-label="Menu de categorias"
      >
        <div className="p-4 bg-white/50 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-widest px-2">Navegação</h2>
        </div>

        <ul className="p-2 m-0 list-none space-y-1" role="list">
          {filteredCategorias.length === 0 && (
            <div className="p-8 text-base text-gray-500 text-center italic" role="status">
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
              <li key={cat.id} role="listitem">
                <button
                  onClick={() => toggleCategoria(cat.id)}
                  className={`w-full flex justify-between items-center p-3 cursor-pointer hover:bg-gray-200/50 font-bold text-[#0f2c4a] transition-colors rounded-lg mx-1 text-left ${estaAberta ? 'bg-gray-100/30' : ''}`}
                  aria-expanded={estaAberta}
                  aria-label={`Categoria ${cat.nome}, ${cat.submenus.length} tópicos`}
                >
                  <span className="flex items-center gap-3">
                    <Icone size={18} className={`${estaAberta ? 'text-blue-600' : 'text-[#0f2c4a]'}`} aria-hidden="true" />
                    <span className="text-base">{cat.nome}</span>
                  </span>
                  {estaAberta ? <ChevronUp size={18} className="text-blue-600" aria-hidden="true" /> : <ChevronDown size={18} className="text-gray-500" aria-hidden="true" />}
                </button>

                {estaAberta && cat.submenus && cat.submenus.length > 0 && (
                  <ul className="pb-2 mt-1 list-none bg-transparent" role="list" aria-label={`Tópicos de ${cat.nome}`}>
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
                              className={`py-2.5 pl-11 pr-2 text-base cursor-pointer transition-all rounded-r-lg mx-2 border-l-2 ${submenuAtivo?.id === sub.id
                                ? 'text-blue-700 font-bold bg-blue-50/70 border-blue-600'
                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100/50 border-transparent'
                                }`}
                              role="link"
                              tabIndex={0}
                              aria-label={sub.nome}
                              aria-current={submenuAtivo?.id === sub.id ? 'page' : undefined}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSubmenuAtivo(sub);
                                  setIsSidebarOpen(false);
                                }
                              }}
                            >
                              {sub.nome}
                            </li>
                          ))}

                          {Object.keys(grouped).filter(k => k !== 'soltos').map(grupoName => {
                            const isGroupOpen = gruposAbertos[`${cat.id}-${grupoName}`];
                            return (
                              <li key={grupoName}>
                                <button
                                  onClick={() => toggleGrupo(cat.id, grupoName)}
                                  className="w-full flex justify-between items-center py-2.5 pl-11 pr-3 cursor-pointer hover:bg-gray-100/80 font-bold text-gray-700 text-sm uppercase tracking-tight transition-colors text-left"
                                  aria-expanded={isGroupOpen || isSearching}
                                  aria-label={`Grupo ${grupoName}`}
                                >
                                  <span>{grupoName}</span>
                                  {(isGroupOpen || isSearching) ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
                                </button>

                                {(isGroupOpen || isSearching) && (
                                  <ul className="pl-6 pb-1 list-none" role="list" aria-label={`Tópicos do grupo ${grupoName}`}>
                                    {grouped[grupoName].map(sub => (
                                      <li
                                        key={sub.id}
                                        onClick={() => {
                                          setSubmenuAtivo(sub);
                                          setIsSidebarOpen(false);
                                        }}
                                        className={`py-2.5 pl-8 pr-2 text-base cursor-pointer transition-all rounded-r-lg mx-2 border-l-2 ${submenuAtivo?.id === sub.id
                                          ? 'text-blue-700 font-bold bg-blue-50/70 border-blue-600'
                                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100/50 border-transparent'
                                          }`}
                                        role="link"
                                        tabIndex={0}
                                        aria-label={sub.nome}
                                        aria-current={submenuAtivo?.id === sub.id ? 'page' : undefined}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSubmenuAtivo(sub);
                                            setIsSidebarOpen(false);
                                          }
                                        }}
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
      </nav>
    </>
  );
};
