'use client';

import React from 'react';
import { Serie } from '@/interfaces/series.interface';

interface DetailViewProps {
  item: Serie;
  onBack: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ item, onBack }) => {
  return (
    <div style={{
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: '#1e293b',
        padding: '30px',
        borderRadius: '15px'
      }}>
        <h2 style={{
          marginTop: 0,
          color: '#38bdf8',
          fontSize: '28px'
        }}>{item.nombre}</h2>
        
        <p style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#cbd5e1',
          marginTop: '15px'
        }}>{item.descripcion}</p>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#0f172a',
          borderRadius: '10px'
        }}>
          <b style={{ color: '#38bdf8' }}>Tipo:</b> {item.tipo}
        </div>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#0f172a',
          borderRadius: '10px'
        }}>
          <b style={{ color: '#38bdf8' }}>Información adicional:</b><br />
          {item.genero && <>Género: {item.genero}<br /></>}
          {item.temporadas && <>Temporadas: {item.temporadas}<br /></>}
          {item.episodios && <>Episodios: {item.episodios}<br /></>}
          {item.puntuacion && <>Puntuación: ⭐ {item.puntuacion}/10<br /></>}
          {item.serie && <>Serie: {item.serie}<br /></>}
        </div>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#0f172a',
          borderRadius: '10px'
        }}>
          <b style={{ color: '#38bdf8' }}>Relaciones Ontológicas:</b>
          <ul style={{ marginTop: '10px', color: '#cbd5e1', marginLeft: '20px' }}>
            <li>Serie → tiene → Temporada</li>
            <li>Serie → incluye → Personaje</li>
            <li>Serie → tiene → Review</li>
            <li>Personaje → aparece en → Serie</li>
            <li>Temporada → pertenece a → Serie</li>
            <li>Review → referencia a → Serie</li>
          </ul>
        </div>

        <button
          onClick={onBack}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            border: 'none',
            background: '#38bdf8',
            cursor: 'pointer',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#0284c7'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#38bdf8'}
        >
          ⬅ Volver a resultados
        </button>
      </div>
    </div>
  );
};