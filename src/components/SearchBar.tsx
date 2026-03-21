import React from 'react';
import { Search, X } from 'lucide-react';
import { Submenu } from '../types';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  allMatchingSubmenus: (Submenu & { categoriaNome: string })[];
  onResultClick: (sub: Submenu) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  isDropdownOpen,
  setIsDropdownOpen,
  allMatchingSubmenus,
  onResultClick,
}) => {
  return (
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

        {isDropdownOpen && allMatchingSubmenus.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 transition-all">
            <div className="p-2 border-b border-gray-50 bg-gray-50/50">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Resultados rápidos</span>
            </div>
            <ul className="max-h-[400px] overflow-y-auto">
              {allMatchingSubmenus.map((sub) => (
                <li
                  key={sub.id}
                  onClick={() => onResultClick(sub)}
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
              <p className="text-[10px] text-gray-400">Clique para selecionar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
