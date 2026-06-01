'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next'; // 👈 Importamos el hook
import { Serie } from '@/interfaces/series.interface';
import { TarjetaResultado } from './TarjetaResultado';
import { FiltrosLaterales } from './FiltrosLaterales';

interface ResultsGridProps {
  results: Serie[];
  loading: boolean;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ results = [], loading }) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const { t } = useTranslation(); // 👈 Inicializamos t

  const safeResults = useMemo(() => (Array.isArray(results) ? results.filter(Boolean) : []), [results]);

  const filters = useMemo(() => {
    return {
      series: safeResults.filter(r => r.tipo === 'Serie').length,
      personajes: safeResults.filter(r => ['Personaje', 'Protagonista', 'Antagonista'].includes(r.tipo)).length,
      productoras: safeResults.filter(r => r.tipo === 'Productora').length,
      plataformas: safeResults.filter(r => r.tipo === 'PlataformaEmision').length,
      premios: safeResults.filter(r => r.tipo === 'PremioNominacion').length,
      episodios: safeResults.filter(r => r.tipo === 'Episodio').length,
      temporadas: safeResults.filter(r => r.tipo === 'Temporada').length,
    };
  }, [safeResults]);

  const filteredResults = useMemo(() => {
    if (!selectedFilter) return safeResults;
    return safeResults.filter(item => {
      if (selectedFilter === 'serie') return item.tipo === 'Serie';
      if (selectedFilter === 'personaje') return ['Personaje', 'Protagonista', 'Antagonista'].includes(item.tipo);
      if (selectedFilter === 'productora') return item.tipo === 'Productora';
      if (selectedFilter === 'plataforma') return item.tipo === 'PlataformaEmision';
      if (selectedFilter === 'premio') return item.tipo === 'PremioNominacion';
      if (selectedFilter === 'episodio') return item.tipo === 'Episodio';
      if (selectedFilter === 'temporada') return item.tipo === 'Temporada';
      return true;
    });
  }, [safeResults, selectedFilter]);

  if (loading) {
    return <div style={{ color: '#38bdf8', textAlign: 'center', padding: '40px', fontSize: '18px' }}>Cargando resultados...</div>; // Podrías crear "ui.cargando" en el json si quieres
  }

  return (
    <div style={{ marginTop: '20px' }}>
      {safeResults.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No se encontraron resultados para tu búsqueda.</div>
      ) : (
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <FiltrosLaterales 
            filters={filters}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />

          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }} border-bottom="">
              <h3 style={{ color: '#818cf8', fontSize: '18px', margin: 0 }}>
                {/* 👈 Interpolación inteligente de conteo */}
                {t('ui.resultadosEncontrados', { count: filteredResults.length })} 
              </h3>
              {selectedFilter && (
                <button
                  onClick={() => setSelectedFilter(null)}
                  style={{
                    padding: '6px 12px',
                    background: '#334155',
                    border: 'none',
                    color: '#94a3b8',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {t('ui.limpiarFiltro')}
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredResults.map((item, index) => (
                <TarjetaResultado key={item.id || index} item={item} onClick={() => {}} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};