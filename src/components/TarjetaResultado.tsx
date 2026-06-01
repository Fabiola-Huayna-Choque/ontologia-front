'use client';

import React from 'react';
import { useTranslation } from 'react-i18next'; // 👈 Importamos el hook
import { Serie } from '@/interfaces/series.interface';

interface ResultCardProps {
  item: Serie;
  onClick: (item: Serie) => void;
}

export const TarjetaResultado: React.FC<ResultCardProps> = ({ item, onClick }) => {
  const { t } = useTranslation(); // 👈 Inicializamos t
  
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
    if (item.tipo === 'Serie') {
      // 👈 Traducimos pasando variables numéricas dinámicas al JSON
      const temps = t('ui.temporadasContador', { count: item.numeroTemporadas ?? 0 });
      const eps = t('ui.episodiosContador', { count: item.numeroEpisodios ?? 0 });
      return `${temps} • ${eps}`;
    }
    return item.tipo;
  };

  const renderBadgeOrigen = () => {
    if (!item.origen) return null;
    let color = '#64748b';
    if (item.origen === 'Fuseki') color = '#38bdf8';
    if (item.origen === 'DBPedia (Online)') color = '#22c55e';
    if (item.origen === 'Local (Offline)') color = '#eab308';

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

  const propiedadesDinamicas = Object.entries(item).filter(([key, val]) => {
    return !['id', 'nombre', 'descripcion', 'tipo', 'origen', 'numeroTemporadas', 'numeroEpisodios', 'rolNarrativo'].includes(key) && val !== null && val !== undefined && val !== '';
  });

  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              <strong>{key}:</strong> {String(val)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};