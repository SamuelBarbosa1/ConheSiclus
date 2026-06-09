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
        h-full bg-[#f8fafc] overflow-y-auto custom-sidebar-scrollbar border-r border-gray-100 transition-all duration-300 ease-in-out
      `}>
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-sidebar-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-sidebar-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-sidebar-scrollbar::-webkit-scrollbar-thumb {
            background-color: #e2e8f0;
            border-radius: 10px;
          }
          .custom-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #cbd5e1;
          }
        `}} />
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
              <li key={cat.id} className="">
                <div
                  onClick={() => toggleCategoria(cat.id)}
                  className={`flex justify-between items-center p-3 cursor-pointer hover:bg-gray-200/50 font-bold text-[#0f2c4a] transition-colors rounded-lg mx-1 ${estaAberta ? 'bg-gray-100/30' : ''}`}
                >
                  <span className="flex items-center gap-3">
                    <Icone size={18} className={`${estaAberta ? 'text-blue-600' : 'text-[#0f2c4a]'}`} />
                    {cat.nome}
                  </span>
                  {estaAberta ? <ChevronUp size={18} className="text-blue-600" /> : <ChevronDown size={18} className="text-gray-400" />}
                </div>

                {estaAberta && cat.submenus && cat.submenus.length > 0 && (
                  <ul className="pb-2 mt-1 list-none bg-transparent">
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
                              className={`py-2 pl-11 pr-2 text-sm cursor-pointer transition-all rounded-r-lg mx-2 border-l-2 ${submenuAtivo?.id === sub.id
                                ? 'text-blue-700 font-bold bg-blue-50/70 border-blue-600'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100/50 border-transparent'
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
                                  className="flex justify-between items-center py-2 pl-11 pr-3 cursor-pointer hover:bg-gray-100/80 font-bold text-gray-700 text-xs uppercase tracking-tight transition-colors"
                                >
                                  <span>{grupoName}</span>
                                  {(isGroupOpen || isSearching) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>

                                {(isGroupOpen || isSearching) && (
                                  <ul className="pl-6 pb-1 list-none">
                                    {grouped[grupoName].map(sub => (
                                      <li
                                        key={sub.id}
                                        onClick={() => {
                                          setSubmenuAtivo(sub);
                                          setIsSidebarOpen(false);
                                        }}
                                        className={`py-2 pl-8 pr-2 text-sm cursor-pointer transition-all rounded-r-lg mx-2 border-l-2 ${submenuAtivo?.id === sub.id
                                          ? 'text-blue-700 font-bold bg-blue-50/70 border-blue-600'
                                          : 'text-gray-655 hover:text-blue-600 hover:bg-gray-100/50 border-transparent'
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
