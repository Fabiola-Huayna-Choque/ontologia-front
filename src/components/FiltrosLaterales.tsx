'use client';

import React from 'react';
import { useTranslation } from 'react-i18next'; // 👈 Importamos el hook

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
  const { t } = useTranslation(); // 👈 Inicializamos t

  const filterItems = [
    { id: 'serie', label: t('ui.series'), count: filters.series, icon: '📺' },
    { id: 'personaje', label: t('ui.personajes'), count: filters.personajes, icon: '🎭' },
    { id: 'productora', label: t('ui.productoras'), count: filters.productoras, icon: '🏢' },
    { id: 'plataforma', label: t('ui.plataformas'), count: filters.plataformas, icon: '📱' },
    { id: 'premio', label: t('ui.premios'), count: filters.premios, icon: '🏆' },
    { id: 'episodio', label: t('ui.episodios'), count: filters.episodios, icon: '📺' },
    { id: 'temporada', label: t('ui.temporadas'), count: filters.temporadas, icon: '📅' }
  ];

  return (
    <div style={{ width: '250px', background: '#1e293b', padding: '20px', borderRadius: '12px', height: 'fit-content', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filterItems.map((item) => {
          const isSelected = selectedFilter === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onFilterChange(isSelected ? null : item.id)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: isSelected ? '#334155' : 'transparent',
                border: isSelected ? '1px solid #38bdf8' : '1px solid transparent',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = '#334155';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'transparent';
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
          );
        })}
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
            fontSize: '12px',
            transition: 'background 0.2s, color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          {t('ui.limpiarFiltro')} {/* 👈 Traducción del botón limpiar */}
        </button>
      )}
    </div>
  );
};