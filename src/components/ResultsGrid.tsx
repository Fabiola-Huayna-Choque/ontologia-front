'use client';

import React from 'react';

interface ResultsGridProps {
  results: string[]; // Recibe el array de texto crudo directo
  loading: boolean;
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ results, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #1e293b', borderTop: '4px solid #38bdf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
        <h3>No se devolvieron líneas para esta consulta</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ color: '#818cf8', fontSize: '18px' }}>Respuestas del Servidor ({results.length} filas):</h3>
      
      {results.map((lineaString, index) => (
        <div 
          key={index}
          style={{
            background: '#090d16',
            padding: '12px 18px',
            borderRadius: '6px',
            borderLeft: '4px solid #a78bfa',
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#cbd5e1',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {lineaString}
        </div>
      ))}
    </div>
  );
};