'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LISTA_SUGERENCIAS, SugerenciaPregunta } from '@/constants/sugerencias';

interface HeroProps {
  onSearch: (query: string) => void;
  onCategoryClick: (category: string) => void;
  onSelectSugerencia: (sugerencia: SugerenciaPregunta) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onCategoryClick, onSelectSugerencia }) => {
  const [query, setQuery] = useState('');
  const [sugerenciasFiltradas, setSugerenciasFiltradas] = useState<SugerenciaPregunta[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detectar lo que el usuario escribe y filtrar las sugerencias en tiempo real
  useEffect(() => {
    if (query.trim() === '') {
      setSugerenciasFiltradas([]);
      return;
    }

    // Filtrar las preguntas que coincidan con la búsqueda
    const filtradas = LISTA_SUGERENCIAS.filter(item =>
      item.pregunta.toLowerCase().includes(query.toLowerCase())
    );

    // LIMITADOR: Cortar el array para mostrar un máximo de 5 elementos como en Google
    const limitadas = filtradas.slice(0, 5);
    
    setSugerenciasFiltradas(limitadas);
  }, [query]);

  // Cerrar el dropdown si el usuario hace clic en cualquier otra parte de la pantalla
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setMostrarDropdown(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClickSugerencia = (item: SugerenciaPregunta) => {
    setQuery(item.pregunta);
    setMostrarDropdown(false);
    onSelectSugerencia(item); // Ejecuta la query internamente con su modo correspondiente
  };

  const categories = [
    { emoji: '📺', name: 'Series', type: 'Serie' },
    { emoji: '🎭', name: 'Personajes', type: 'Personaje' },
    { emoji: '📚', name: 'Temporadas', type: 'Temporada' },
    { emoji: '⭐', name: 'Reviews', type: 'Review' }
  ];

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
        Buscador Semántico de Series
      </h2>
      <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
        Descubre relaciones en grafos de conocimiento locales y globales
      </p>

      {/* CONTENEDOR DE LA BARRA (Relativo para controlar el Dropdown flotante) */}
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
            onKeyPress={handleKeyPress}
            placeholder="Escribe para buscar o ver preguntas sugeridas..."
            style={{
              flex: 1,
              padding: '15px 20px',
              fontSize: '16px',
              border: '1px solid #334155',
              borderRadius: mostrarDropdown && sugerenciasFiltradas.length > 0 ? '10px 0 0 0' : '10px 0 0 10px',
              background: '#1e293b',
              color: 'white',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '0 25px',
              background: '#38bdf8',
              border: 'none',
              color: 'black',
              fontWeight: 'bold',
              borderRadius: mostrarDropdown && sugerenciasFiltradas.length > 0 ? '0 10px 0 0' : '0 10px 10px 0',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Buscar
          </button>
        </div>

        {/* DROPDOWN ESTILO GOOGLE (Modo oculto al usuario) */}
        {mostrarDropdown && sugerenciasFiltradas.length > 0 && (
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
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: '#64748b' }}>🔍</span>
                <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: '500' }}>{item.pregunta}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categorías inferiores */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <div
            key={cat.name}
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
            {cat.emoji} {cat.name}
          </div>
        ))}
      </div>
    </div>
  );
};