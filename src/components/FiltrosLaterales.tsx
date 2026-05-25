'use client';

import React from 'react';

interface FilterSidebarProps {
  filters: {
    series: number;
    personajes: number;
    productoras: number;
    plataformas: number;
    premios: number;
    episodios: number;
    temporadas: number;
  };
  selectedFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export const FiltrosLaterales: React.FC<FilterSidebarProps> = ({ 
  filters, 
  selectedFilter, 
  onFilterChange 
}) => {
  const filterItems = [
    { id: 'serie', label: 'Series', count: filters.series, icon: '📺' },
    { id: 'personaje', label: 'Personajes', count: filters.personajes, icon: '🎭' },
    { id: 'productora', label: 'Productoras', count: filters.productoras, icon: '🏢' },
    { id: 'plataforma', label: 'Plataformas', count: filters.plataformas, icon: '📱' },
    { id: 'premio', label: 'Premios', count: filters.premios, icon: '🏆' },
    { id: 'episodio', label: 'Episodios', count: filters.episodios, icon: '📺' },
    { id: 'temporada', label: 'Temporadas', count: filters.temporadas, icon: '📅' },
  ];

  return (
    <aside style={{
      width: '260px',
      background: '#1e293b',
      borderRadius: '12px',
      padding: '20px',
      height: 'fit-content',
      position: 'sticky',
      top: '80px'
    }}>
      <h3 style={{
        color: '#38bdf8',
        fontSize: '16px',
        marginBottom: '20px',
        borderBottom: '1px solid #334155',
        paddingBottom: '10px'
      }}>
        🔍 FILTRAR RESULTADOS
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filterItems.map(item => (
          <div
            key={item.id}
            onClick={() => onFilterChange(selectedFilter === item.id ? null : item.id)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              background: selectedFilter === item.id ? '#334155' : 'transparent',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              borderLeft: selectedFilter === item.id ? '3px solid #38bdf8' : '3px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (selectedFilter !== item.id) {
                e.currentTarget.style.background = '#2d3a5e';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedFilter !== item.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <span style={{ color: '#cbd5e1', fontSize: '14px' }}>
              {item.icon} {item.label}
            </span>
            <span style={{
              background: '#0f172a',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#38bdf8',
              fontWeight: 'bold'
            }}>
              {item.count}
            </span>
          </div>
        ))}
      </div>

      {selectedFilter && (
        <button
          onClick={() => onFilterChange(null)}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '8px',
            background: 'transparent',
            border: '1px solid #ef4444',
            color: '#ef4444',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          ✕ Limpiar filtro
        </button>
      )}
    </aside>
  );
};