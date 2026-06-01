'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LISTA_SUGERENCIAS, SugerenciaPregunta } from '@/constants/sugerencias';
import { useTranslation } from 'react-i18next';

interface HeroProps {
  onSearch: (query: string) => void;
  onCategoryClick: (category: string) => void;
  onSelectSugerencia: (sugerencia: SugerenciaPregunta) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onCategoryClick, onSelectSugerencia }) => {
  const [query, setQuery] = useState('');
  const [sugerenciasFiltradas, setSugerenciasFiltradas] = useState<SugerenciaPregunta[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 🌐 Extraemos 'i18n' para escuchar de forma reactiva cuándo muta el idioma global
  const { t, i18n } = useTranslation(); 

  // Filtrar sugerencias en tiempo real (reacciona al texto introducido o al cambio de idioma)
  useEffect(() => {
    if (query.trim() === '') {
      setSugerenciasFiltradas([]);
      setActiveIndex(-1);
      return;
    }

    const filtradas = LISTA_SUGERENCIAS.filter(item =>
      t(item.keyTraducida).toLowerCase().includes(query.toLowerCase())
    );

    setSugerenciasFiltradas(filtradas.slice(0, 5));
    setActiveIndex(-1);
  // 🔥 Escuchamos i18n.language de manera explícita para forzar el re-filtrado si el usuario cambia el idioma con el menú abierto
  }, [query, i18n.language]); 

  // Cerrar el dropdown al hacer clic fuera del contenedor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setMostrarDropdown(false);
    }
  };

  const handleClickSugerencia = (item: SugerenciaPregunta) => {
    setQuery(t(item.keyTraducida)); 
    setMostrarDropdown(false);
    onSelectSugerencia(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < sugerenciasFiltradas.length) {
        handleClickSugerencia(sugerenciasFiltradas[activeIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMostrarDropdown(true);
      setActiveIndex(prev => (prev < sugerenciasFiltradas.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setMostrarDropdown(false);
    }
  };

  const categories = [
    { emoji: '📺', nameKey: 'ui.series', type: 'Serie' },
    { emoji: '🎭', nameKey: 'ui.personajes', type: 'Personaje' },
    { emoji: '📚', nameKey: 'ui.temporadas', type: 'Temporada' },
    { emoji: '⭐', nameKey: 'ui.reviews', type: 'Review' }
  ];

  const tieneSugerencias = mostrarDropdown && sugerenciasFiltradas.length > 0;

  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h2 style={{
        fontSize: '40px',
        marginBottom: '10px',
        background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold'
      }}>
        {t('ui.tituloHero')}
      </h2>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
        {t('ui.subtituloHero')}
      </p>

      <div ref={containerRef} style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setMostrarDropdown(true);
            }}
            onFocus={() => setMostrarDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={t('ui.buscarPlaceholder')}
            style={{
              width: '100%',
              padding: '16px 20px 16px 50px',
              background: '#1e293b',
              border: '2px solid #334155',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
          />
          <button
            onClick={() => handleSearch()}
            style={{
              padding: '0 25px',
              background: '#38bdf8',
              border: 'none',
              color: 'black',
              fontWeight: 'bold',
              borderRadius: tieneSugerencias ? '0 10px 0 0' : '0 10px 10px 0',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {t('ui.botonBuscar')}
          </button>
        </div>

        {tieneSugerencias && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#1e293b',
            border: '1px solid #334155',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            textAlign: 'left',
            overflow: 'hidden'
          }}>
            {sugerenciasFiltradas.map((item, index) => (
              <div
                key={index}
                onClick={() => handleClickSugerencia(item)}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  borderBottom: index !== sugerenciasFiltradas.length - 1 ? '1px solid #334155' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'background 0.2s',
                  background: activeIndex === index ? '#334155' : 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                onMouseLeave={(e) => {
                  if (activeIndex !== index) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ color: '#64748b' }}>🔍</span>
                <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>
                  {t(item.keyTraducida)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <div
            key={cat.nameKey}
            onClick={() => onCategoryClick(cat.type)}
            style={{
              background: '#1e293b',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              transition: 'transform 0.3s, background 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#334155';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = '#1e293b';
            }}
          >
            {cat.emoji} {t(cat.nameKey)}
          </div>
        ))}
      </div>
    </div>
  );
};