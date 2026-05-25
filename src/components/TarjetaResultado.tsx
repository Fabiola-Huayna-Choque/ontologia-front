'use client';

import React from 'react';
import { Serie } from '@/interfaces/series.interface';

interface ResultCardProps {
  item: Serie;
  onClick: (item: Serie) => void;
}

export const TarjetaResultado: React.FC<ResultCardProps> = ({ item, onClick }) => {
  const getIcon = () => {
    switch (item.tipo) {
      case 'Personaje': return '🎭';
      case 'Protagonista': return '⭐';
      case 'Antagonista': return '👿';
      case 'Serie': return '📺';
      case 'Temporada': return '📅';
      case 'Episodio': return '🎬';
      case 'Productora': return '🏢';
      case 'PlataformaEmision': return '📱';
      case 'PremioNominacion': return '🏆';
      case 'Actor/Actriz': return '🎪';
      case 'Director': return '🎥';
      case 'Genero': return '🏷️';
      default: return '📄';
    }
  };

  const getSubInfo = () => {
    if (item.tipo === 'Protagonista' || item.tipo === 'Antagonista') {
      return item.rolNarrativo || 'Personaje';
    }
    if (item.tipo === 'Serie') {
      return `${item.numeroTemporadas || '?'} temporadas • ${item.numeroEpisodios || '?'} episodios`;
    }
    if (item.tipo === 'Episodio') {
      return item.duracionMinutos ? `Duración: ${item.duracionMinutos} min` : 'Episodio';
    }
    if (item.tipo === 'Productora') {
      return item.paisOrigen || 'Productora';
    }
    return item.tipo;
  };

  return (
    <div
      onClick={() => onClick(item)}
      style={{
        background: '#1e293b',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: '1px solid #334155'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#38bdf8';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(56, 189, 248, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#334155';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '28px' }}>{getIcon()}</span>
        <div>
          <h3 style={{ color: '#38bdf8', margin: 0, fontSize: '18px' }}>
            {item.nombre}
          </h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>
            {getSubInfo()}
          </span>
        </div>
      </div>
      
      <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
        {item.descripcion?.substring(0, 120) || 'Sin descripción disponible'}...
      </p>
    </div>
  );
};