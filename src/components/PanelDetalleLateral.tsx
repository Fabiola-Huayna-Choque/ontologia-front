'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface PanelDetalleLateralProps {
  item: any; // Recibe 'entidadSeleccionada.rdfProperties'
  headerInfo?: {
    nombre?: string;
    tipo?: string;
    uri?: string;
  };
  onClose: () => void;
}

export const PanelDetalleLateral: React.FC<PanelDetalleLateralProps> = ({ item, headerInfo, onClose }) => {
  const { t } = useTranslation();

  if (!item) return null;

  // Convertimos el objeto RDF en pares [clave, valor] descartando nulos/vacíos
  const propiedadesRDF = Object.entries(item).filter(([_, val]) => {
    return val !== null && val !== undefined && val !== '';
  });

  /**
   * Función helper para renderizar CUALQUIER tipo de dato sin que devuelva [object Object]
   */
  const renderValor = (val: any): React.ReactNode => {
    if (val === null || val === undefined) return '';

    // 1. Si es un Array, iteramos y renderizamos cada elemento recursivamente
    if (Array.isArray(val)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {val.map((elem, idx) => (
            <div key={idx} style={{ borderLeft: '2px solid #38bdf8', paddingLeft: '8px' }}>
              {renderValor(elem)}
            </div>
          ))}
        </div>
      );
    }

    // 2. Si es un Objeto (pero no un array)
    if (typeof val === 'object') {
      // Caso común en RDF/SPARQL: El objeto tiene una propiedad '.value' o '.label'
      if ('value' in val) return String(val.value);
      if ('label' in val) return String(val.label);

      // Si es un objeto genérico, mostramos sus propiedades clave-valor de forma limpia
      return (
        <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {Object.entries(val).map(([subKey, subVal]) => (
            <div key={subKey}>
              <strong style={{ color: '#64748b' }}>{subKey}:</strong> {String(subVal)}
            </div>
          ))}
        </div>
      );
    }

    // 3. Si es un primitivo (string, number, boolean)
    return String(val);
  };

  return (
    <div style={{ /* Tus estilos de contenedor aquí */ }}>
      {/* ... Cabecera del panel si la tienes ... */}

      {/* Cuerpo: Muestra CUALQUIER propiedad que venga en el grafo del individual */}
      <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 4px 0', fontWeight: '600' }}>
          {t('ui.propiedadesGrafo', { defaultValue: 'Datos del Individual en el grafo:' })}
        </h4>

        {propiedadesRDF.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {propiedadesRDF.map(([key, val]) => (
              <div 
                key={key}
                style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '14px 20px',
                  fontSize: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {/* Nombre de la propiedad (Predicado) tal cual viene del RDF */}
                <span style={{ color: '#818cf8', fontSize: '13px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {key}
                </span>
                
                {/* Valor asociado procesado por el Helper */}
                <span style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {renderValor(val)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>
            {t('ui.sinPropiedadesRDF', { defaultValue: 'No hay propiedades registradas en este individual.' })}
          </p>
        )}

        {/* URI Ontológica al final */}
        {headerInfo?.uri && (
          <div style={{ marginTop: '10px', paddingTop: '20px', borderTop: '1px solid #334155' }}>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
              Resource URI
            </span>
            <div style={{ 
              fontSize: '12px', 
              color: '#475569', 
              wordBreak: 'break-all', 
              fontFamily: 'monospace',
              background: '#0f172a',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #1e293b'
            }}>
              {headerInfo.uri}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};