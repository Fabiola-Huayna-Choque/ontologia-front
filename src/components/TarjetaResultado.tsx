'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Serie } from '@/interfaces/series.interface';

interface ResultCardProps {
  item: Serie;
  onClick: (item: Serie) => void;
}

export const TarjetaResultado: React.FC<ResultCardProps> = ({ item, onClick }) => {
  const { t } = useTranslation();
  
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
      return item.rolNarrativo || t('ui.personaje');
    }
    // ✂️ Se eliminó el bloque que calculaba y mostraba las temporadas y episodios de la Serie
    return item.tipo;
  };

  const renderBadgeOrigen = () => {
    if (!item.origen) return null;
    let color = '#64748b';
    if (item.origen === 'LOCAL') color = '#38bdf8';
    if (item.origen === 'ONLINE') color = '#22c55e';
    if (item.origen === 'OFFLINE') color = '#eab308';

    return (
      <span style={{
        background: `${color}20`,
        color: color,
        border: `1px solid ${color}`,
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold'
      }}>
        {item.origen}
      </span>
    );
  };

  // Filtrar propiedades internas para no duplicar campos semánticos en las mini-pestañas inferiores
  const propiedadesDinamicas = Object.entries(item).filter(([key, val]) => {
    return !['id', 'nombre', 'descripcion', 'tipo', 'origen', 'uri', 'entidad', 'numeroTemporadas', 'numeroEpisodios', 'rolNarrativo', 'rdfProperties'].includes(key) && 
           val !== null && val !== undefined && val !== '';
  });

  return (
    <div 
      onClick={() => onClick(item)}
      style={{ 
        background: '#1e293b', 
        border: '1px solid #334155', 
        borderRadius: '12px', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span style={{ fontSize: '28px' }}>{getIcon()}</span>
          <div>
            <h3 style={{ color: '#38bdf8', margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {item.nombre}
            </h3>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>
              {getSubInfo()}
            </span>
          </div>
        </div>
        <div>
          {renderBadgeOrigen()}
        </div>
      </div>
      
      {item.descripcion && (
        <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 12px 0', lineHeight: '1.5' }}>
          {item.descripcion}
        </p>
      )}

      {propiedadesDinamicas.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          {propiedadesDinamicas.map(([key, val]) => (
            <div 
              key={key} 
              style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                color: '#cbd5e1'
              }}
            >
              <strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {String(val)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};