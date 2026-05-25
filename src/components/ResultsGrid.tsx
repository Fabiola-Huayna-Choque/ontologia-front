'use client';

import React, { useState, useMemo } from 'react';
import { Serie } from '@/interfaces/series.interface';
import { TarjetaResultado } from './TarjetaResultado';
import { FiltrosLaterales } from './FiltrosLaterales';

interface ResultsGridProps {
  results: Serie[];
  loading: boolean;
  currentQuery: string; // <-- Nueva Propiedad para capturar la pregunta/búsqueda
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ results, loading, currentQuery }) => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Calcular contadores para filtros según los tipos de tu ontología
  const filters = useMemo(() => {
    return {
      series: results.filter(r => r.tipo === 'Serie').length,
      personajes: results.filter(r => r.tipo === 'Personaje' || r.tipo === 'Protagonista' || r.tipo === 'Antagonista').length,
      productoras: results.filter(r => r.tipo === 'Productora').length,
      plataformas: results.filter(r => r.tipo === 'PlataformaEmision').length,
      premios: results.filter(r => r.tipo === 'PremioNominacion').length,
      episodios: results.filter(r => r.tipo === 'Episodio').length,
      temporadas: results.filter(r => r.tipo === 'Temporada').length,
    };
  }, [results]);

  // Filtrar resultados según selección
  const filteredResults = useMemo(() => {
    if (!selectedFilter) return results;
    
    const tipoMap: Record<string, string[]> = {
      'serie': ['Serie'],
      'personaje': ['Personaje', 'Protagonista', 'Antagonista'],
      'productora': ['Productora'],
      'plataforma': ['PlataformaEmision'],
      'premio': ['PremioNominacion'],
      'episodio': ['Episodio'],
      'temporada': ['Temporada'],
    };
    
    const tiposPermitidos = tipoMap[selectedFilter] || [];
    return results.filter(r => tiposPermitidos.includes(r.tipo));
  }, [results, selectedFilter]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #1e293b', 
          borderTop: '4px solid #38bdf8', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
      </div>
    );
  }

  // Vista de resultados con filtros
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {results.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#1e293b', borderRadius: '12px' }}>
          {currentQuery && (
            <p style={{ color: '#38bdf8', fontSize: '16px', marginBottom: '10px', fontWeight: '500' }}>
              Búsqueda: "{currentQuery}"
            </p>
          )}
          <p style={{ color: '#94a3b8' }}>No se encontraron resultados para esta consulta</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          {/* Sidebar de filtros */}
          <FiltrosLaterales 
            filters={filters}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />

          {/* Grid de resultados */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#818cf8', fontSize: '18px' }}>
                📋 Resultados encontrados ({filteredResults.length})
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
                  ✕ Limpiar filtro
                </button>
              )}
            </div>

            {/* SECCIÓN DE LA PREGUNTA SELECCIONADA */}
            {currentQuery && (
              <div style={{ 
                background: '#1e293b', 
                padding: '14px 20px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                borderLeft: '4px solid #818cf8'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '12px', uppercase: 'true', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Consulta Activa
                </span>
                <p style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                  {currentQuery}
                </p>
              </div>
            )}
            
            {/* Contenedor de Tarjetas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredResults.map((item, index) => (
                <TarjetaResultado key={item.id || index} item={item} onClick={() => {}} />
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};