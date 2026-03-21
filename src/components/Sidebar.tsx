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
    </>
  );
};
