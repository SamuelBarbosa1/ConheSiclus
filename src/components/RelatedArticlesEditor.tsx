import React, { useState, useMemo } from 'react';
import { Categoria, Submenu } from '../types';

interface RelatedArticlesEditorProps {
  initialSubmenus: Submenu[];
  initialCategorias: Categoria[];
  selectedSubmenuId: string;
  relatedIds: string[];
  setRelatedIds: (ids: string[]) => void;
  searchRelated: string;
  setSearchRelated: (text: string) => void;
  disabled?: boolean;
}

export const RelatedArticlesEditor: React.FC<RelatedArticlesEditorProps> = ({
  initialSubmenus,
  initialCategorias,
  selectedSubmenuId,
  relatedIds,
  setRelatedIds,
  searchRelated,
  setSearchRelated,
  disabled,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('');

  const filteredAndSortedSubmenus = useMemo(() => {
    return initialSubmenus
      .filter(s => s.id !== selectedSubmenuId)
      .filter(s => {
        const matchesSearch = s.nome.toLowerCase().includes(searchRelated.toLowerCase());
        const matchesCategory = !filterCategory || s.categoriaId === filterCategory;
        // Se estiver selecionado, SEMPRE mostra
        return (relatedIds.includes(s.id)) || (matchesSearch && matchesCategory);
      })
      .sort((a, b) => {
        const aChecked = relatedIds.includes(a.id);
        const bChecked = relatedIds.includes(b.id);
        if (aChecked && !bChecked) return -1;
        if (!aChecked && bChecked) return 1;
        return a.nome.localeCompare(b.nome);
      });
  }, [initialSubmenus, selectedSubmenuId, searchRelated, filterCategory, relatedIds]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Artigos Relacionados (Sugestões de leitura)</h3>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
          {relatedIds.length} Selecionado(s)
        </span>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-400"
            value={searchRelated}
            onChange={(e) => setSearchRelated(e.target.value)}
            disabled={disabled}
          />
          <select
            className="sm:w-48 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-medium text-gray-600"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            disabled={disabled}
          >
            <option value="">Todas Categorias</option>
            {initialCategorias.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div className="max-h-52 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
          {filteredAndSortedSubmenus.map(s => {
            const isChecked = relatedIds.includes(s.id);
            return (
              <label 
                key={s.id} 
                className={`flex items-center gap-2 text-sm cursor-pointer p-2 rounded-lg transition-all group border ${
                  isChecked 
                    ? 'bg-blue-50 border-blue-100 text-blue-700 font-bold' 
                    : 'bg-white border-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRelatedIds([...relatedIds, s.id]);
                    } else {
                      setRelatedIds(relatedIds.filter(id => id !== s.id));
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                  disabled={disabled}
                />
                <div className="flex flex-col">
                  <span>{s.grupo ? `[${s.grupo}] ` : ''}{s.nome}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-tight ${isChecked ? 'text-blue-500' : 'text-gray-400'}`}>
                    {initialCategorias.find(c => c.id === s.categoriaId)?.nome || ''}
                  </span>
                </div>
              </label>
            );
          })}
          
          {filteredAndSortedSubmenus.length === 0 && (
            <div className="py-8 text-center bg-white rounded-lg border border-dashed border-gray-200">
               <p className="text-sm text-gray-400 italic">Nenhum artigo encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
