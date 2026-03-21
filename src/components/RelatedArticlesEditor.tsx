import React from 'react';
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
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Artigos Relacionados (Sugestões de leitura)</h3>
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <input
          type="text"
          placeholder="Pesquisar artigo para relacionar..."
          className="w-full px-4 py-2 mb-3 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
          value={searchRelated}
          onChange={(e) => setSearchRelated(e.target.value)}
          disabled={disabled}
        />
        <div className="max-h-40 overflow-y-auto space-y-2">
          {initialSubmenus
            .filter(s => s.id !== selectedSubmenuId)
            .filter(s => s.nome.toLowerCase().includes(searchRelated.toLowerCase()))
            .map(s => (
              <label key={s.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={relatedIds.includes(s.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRelatedIds([...relatedIds, s.id]);
                    } else {
                      setRelatedIds(relatedIds.filter(id => id !== s.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={disabled}
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
  );
};
