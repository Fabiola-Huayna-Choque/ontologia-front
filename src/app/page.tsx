'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ResultsGrid } from '@/components/ResultsGrid';
import { useSearch } from '@/hooks/useSearch';
import { LISTA_SUGERENCIAS, SugerenciaPregunta } from '@/constants/sugerencias';

type View = 'home' | 'results';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [mostrarTodas, setMostrarTodas] = useState(false); // Controla el colapso de las sugerencias
  
  const { results, loading, error, executeSparql } = useSearch();

  // Búsqueda desde la barra superior de texto (Apuntar por defecto a FUSEKI local)
  const handleSearch = (textoBuscador: string) => {
    const query = `PREFIX ont: <http://www.semanticweb.org/dell/ontologies/2026/2#>
SELECT ?s ?p ?o WHERE { ?s ?p ?o . FILTER(regex(str(?s), "${textoBuscador}", "i")) } LIMIT 20`;
    
    executeSparql(query, 'FUSEKI');
    setCurrentView('results');
  };

  // La sugerencia decide de manera independiente su entorno en secreto
  const seleccionarSugerencia = (item: SugerenciaPregunta) => {
    executeSparql(item.query, item.modo);
    setCurrentView('results');
  };

  // Filtrar cuántas preguntas mostrar inicialmente en la Home
  const sugerenciasVisibles = mostrarTodas ? LISTA_SUGERENCIAS : LISTA_SUGERENCIAS.slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
      {/* Barra de Navegación superior */}
<Navbar onNavigate={(page) => {
  if (page === 'home') {
    setCurrentView('home');
  } else if (page === 'series') {
    // Busca automáticamente el concepto general de series en FUSEKI de forma oculta
    handleSearch('Serie'); 
  } else if (page === 'personajes') {
    // Busca automáticamente el concepto general de personajes en FUSEKI de forma oculta
    handleSearch('Personaje');
  } else if (page === 'reviews') {
    // Busca automáticamente el concepto general de reviews en FUSEKI de forma oculta
    handleSearch('Review');
  }
}} />

      {/* VISTA PRINCIPAL (HOME) */}
      {currentView === 'home' && (
        <>
          <Hero 
            onSearch={handleSearch} 
            onCategoryClick={(cat) => handleSearch(cat)} 
            onSelectSugerencia={seleccionarSugerencia} 
          />
          
          {/* SECCIÓN INFERIOR DE PREGUNTAS SUGERIDAS */}
          <div style={{ maxWidth: '800px', margin: '-30px auto 50px auto', padding: '0 20px' }}>
            <h3 style={{ color: '#38bdf8', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '8px' }}>
              💡 Preguntas sugeridas (Consultas asociadas)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sugerenciasVisibles.map((item, index) => (
                <div 
                  key={index}
                  onClick={() => seleccionarSugerencia(item)}
                  style={{ 
                    padding: '15px', 
                    background: '#1e293b', 
                    borderRadius: '8px', 
                    borderLeft: '4px solid #38bdf8', 
                    cursor: 'pointer', 
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background 0.2s' 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1e293b'}
                >
                  <span style={{ fontWeight: '600', fontSize: '15px' }}>{item.pregunta}</span>
                </div>
              ))}
            </div>

            {/* Botón para ver el resto de preguntas sugeridas */}
            {LISTA_SUGERENCIAS.length > 3 && (
              <button
                onClick={() => setMostrarTodas(!mostrarTodas)}
                style={{ marginTop: '15px', background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
              >
                {mostrarTodas ? "▲ Mostrar menos sugerencias" : `▼ Ver más sugerencias (${LISTA_SUGERENCIAS.length - 3} ocultas)`}
              </button>
            )}
          </div>
        </>
      )}
      
      {/* VISTA DE RESULTADOS */}
      {currentView === 'results' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '25px' }}>
          <button 
            onClick={() => setCurrentView('home')}
            style={{ margin: '20px 0 0 20px', padding: '8px 16px', background: '#334155', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ⬅ Volver al Inicio
          </button>
          
          {error && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>{error}</div>}
          
          <ResultsGrid results={results} loading={loading} />
        </div>
      )}
    </div>
  );
}