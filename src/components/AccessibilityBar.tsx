'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, RotateCcw, Eye, Accessibility } from 'lucide-react';

const FONT_SIZES = [
  { label: 'Normal', value: 100 },
  { label: 'Grande', value: 118 },
  { label: 'Muito Grande', value: 136 },
];

export const AccessibilityBar: React.FC = () => {
  const [fontSizeIndex, setFontSizeIndex] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Apply font size to root element
  useEffect(() => {
    const size = FONT_SIZES[fontSizeIndex].value;
    document.documentElement.style.fontSize = `${size}%`;

    // Save preference
    try {
      localStorage.setItem('a11y-font-size', String(fontSizeIndex));
    } catch {}

    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSizeIndex]);

  // Apply high contrast mode
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    try {
      localStorage.setItem('a11y-high-contrast', String(highContrast));
    } catch {}

    return () => {
      document.documentElement.classList.remove('high-contrast');
    };
  }, [highContrast]);

  // Restore saved preferences on mount
  useEffect(() => {
    try {
      const savedSize = localStorage.getItem('a11y-font-size');
      if (savedSize !== null) {
        const idx = parseInt(savedSize, 10);
        if (idx >= 0 && idx < FONT_SIZES.length) {
          setFontSizeIndex(idx);
        }
      }
      const savedContrast = localStorage.getItem('a11y-high-contrast');
      if (savedContrast === 'true') {
        setHighContrast(true);
      }
    } catch {}
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSizeIndex(prev => Math.min(prev + 1, FONT_SIZES.length - 1));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSizeIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const resetFontSize = useCallback(() => {
    setFontSizeIndex(0);
    setHighContrast(false);
  }, []);

  // Keyboard shortcut: Ctrl+U to toggle accessibility bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        setIsExpanded(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-3"
      role="toolbar"
      aria-label="Ferramentas de acessibilidade"
    >
      {/* Expanded toolbar */}
      {isExpanded && (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 min-w-[200px]">
          <div className="px-2 pb-1 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Acessibilidade
            </span>
          </div>

          {/* Font size controls */}
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-sm font-semibold text-gray-700">Fonte</span>
            <div className="flex items-center gap-1">
              <button
                onClick={decreaseFontSize}
                disabled={fontSizeIndex === 0}
                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-700"
                aria-label="Diminuir fonte"
                title="Diminuir fonte"
              >
                <Minus size={18} />
              </button>

              <span className="text-sm font-bold text-[#0f2c4a] min-w-[32px] text-center tabular-nums">
                {FONT_SIZES[fontSizeIndex].label}
              </span>

              <button
                onClick={increaseFontSize}
                disabled={fontSizeIndex === FONT_SIZES.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-gray-700"
                aria-label="Aumentar fonte"
                title="Aumentar fonte"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* High contrast toggle */}
          <button
            onClick={() => setHighContrast(prev => !prev)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold ${
              highContrast
                ? 'bg-gray-900 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            aria-label={highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
            title={highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
          >
            <Eye size={18} />
            <span>Alto Contraste</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
              highContrast ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {highContrast ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Reset */}
          <button
            onClick={resetFontSize}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            aria-label="Restaurar padrão"
            title="Restaurar configurações padrão"
          >
            <RotateCcw size={16} />
            <span>Restaurar padrão</span>
          </button>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        className={`p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
          isExpanded
            ? 'bg-[#0f2c4a] text-white shadow-[#0f2c4a]/30'
            : 'bg-white text-[#0f2c4a] border-2 border-gray-200 hover:border-blue-300 shadow-lg'
        }`}
        aria-label="Abrir ferramentas de acessibilidade (Ctrl+U)"
        title="Acessibilidade (Ctrl+U)"
        aria-expanded={isExpanded}
      >
        <Accessibility size={24} />
      </button>
    </div>
  );
};
