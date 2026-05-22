'use client';

import React from 'react';
import { Serie } from '@/interfaces/series.interface';

interface ResultsGridProps {
  results: Serie[];
  onCardClick: (item: Serie) => void;
  loading: boolean;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ results, onCardClick, loading }) => {
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #1e293b',
          borderTop: '4px solid #38bdf8',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px',
        color: '#94a3b8'
      }}>
        <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>No se encontraron resultados</h3>
        <p>Intenta con otra búsqueda o categoría</p>
      </div>
    );
  }

  const getTagColor = (tipo: string) => {
    switch(tipo) {
      case 'Serie': return '#3b82f6';
      case 'Personaje': return '#10b981';
      case 'Temporada': return '#f59e0b';
      case 'Review': return '#ef4444';
      default: return '#38bdf8';
    }
  };

  return (
    <div style={{
      padding: '30px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {results.map((item, index) => (
        <div
          key={index}
          onClick={() => onCardClick(item)}
          style={{
            background: '#1e293b',
            borderRadius: '15px',
            padding: '15px',
            transition: 'transform 0.3s, background 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.background = '#334155';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = '#1e293b';
          }}
        >
          <div style={{
            fontSize: '12px',
            color: getTagColor(item.tipo),
            marginBottom: '5px',
            fontWeight: 'bold'
          }}>
            {item.tipo}
          </div>
          <h3 style={{ margin: '5px 0', fontSize: '18px' }}>{item.nombre}</h3>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
            marginTop: '5px'
          }}>
            {item.genero || item.serie || ''}
          </p>
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '10px',
            fontSize: '12px'
          }}>
            {item.puntuacion && <span>⭐ {item.puntuacion}</span>}
            {item.temporadas && <span>📺 {item.temporadas} temp.</span>}
            {item.episodios && <span>🎬 {item.episodios} ep.</span>}
          </div>
        </div>
      ))}
    </div>
  );
};