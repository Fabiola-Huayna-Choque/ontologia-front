'use client';

import React, { useState } from 'react';

interface HeroProps {
  onSearch: (query: string) => void;
  onCategoryClick: (category: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onCategoryClick }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query); 
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const categories = [
    { emoji: '📺', name: 'Series', type: 'Serie' },
    { emoji: '🎭', name: 'Personajes', type: 'Personaje' },
    { emoji: '📚', name: 'Temporadas', type: 'Temporada' },
    { emoji: '⭐', name: 'Reviews', type: 'Review' }
  ];

  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 20px'
    }}>
      <h2 style={{
        fontSize: '40px',
        marginBottom: '10px',
        background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Explora Series con Semántica 🧠
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '18px' }}>
        Busca personajes, temporadas, episodios y más
      </p>

      <div style={{
        marginTop: '30px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ej: Drama, Personaje, Serie..."
          style={{
            width: '400px',
            padding: '12px',
            borderRadius: '10px 0 0 10px',
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            background: 'white'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 20px',
            background: '#38bdf8',
            border: 'none',
            color: 'black',
            fontWeight: 'bold',
            borderRadius: '0 10px 10px 0',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#0284c7'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#38bdf8'}
        >
          Buscar
        </button>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '30px',
        flexWrap: 'wrap'
      }}>
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