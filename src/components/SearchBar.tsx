import React, { useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsDropdownOpen]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;

    const normalize = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const normalizedText = normalize(text);
    const normalizedHighlight = normalize(highlight);

    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    while (true) {
      const matchIndex = normalizedText.indexOf(normalizedHighlight, currentIndex);
      if (matchIndex === -1) {
        parts.push(text.substring(currentIndex));
        break;
      }

      if (matchIndex > currentIndex) {
        parts.push(text.substring(currentIndex, matchIndex));
      }

      const matchText = text.substring(matchIndex, matchIndex + highlight.length);
      parts.push(
        <mark key={matchIndex} className="bg-yellow-100 text-blue-900 rounded-[2px] px-0.5 font-bold">
          {matchText}
        </mark>
      );

      currentIndex = matchIndex + highlight.length;
    }

    return <span>{parts}</span>;
  };

  return (
    <div ref={containerRef} className="flex-1 max-w-xl mx-2 sm:mx-12">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Como podemos ajudá-lo?"
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
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">{highlightText(sub.nome, searchTerm)}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {sub.categoriaNome} {sub.grupo ? <>• {highlightText(sub.grupo, searchTerm)}</> : ''}
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
