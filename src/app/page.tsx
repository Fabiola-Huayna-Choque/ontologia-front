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
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [searchTitle, setSearchTitle] = useState(''); // <-- Nuevo estado para guardar la pregunta/búsqueda
  
  const { results, loading, error, executeSparql } = useSearch();

  // Búsqueda desde la barra superior de texto
  const handleSearch = (textoBuscador: string) => {
    setSearchTitle(textoBuscador); // Guardamos lo que se escribió o la categoría
    const query = `PREFIX ont: <http://www.semanticweb.org/dell/ontologies/2026/2#>
SELECT ?s ?p ?o WHERE { ?s ?p ?o . FILTER(regex(str(?s), "${textoBuscador}", "i")) } LIMIT 20`;
    
    executeSparql(query, 'FUSEKI');
    setCurrentView('results');
  };

  // Búsqueda desde preguntas sugeridas
  const seleccionarSugerencia = (item: SugerenciaPregunta) => {
    setSearchTitle(item.pregunta); // Guardamos el texto exacto de la pregunta sugerida
    executeSparql(item.query, item.modo);
    setCurrentView('results');
  };

  const sugerenciasVisibles = mostrarTodas ? LISTA_SUGERENCIAS : LISTA_SUGERENCIAS.slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
      <Navbar onNavigate={(page) => {
        if (page === 'home') {
          setCurrentView('home');
        } else if (page === 'series') {
          handleSearch('Serie'); 
        } else if (page === 'personajes') {
          handleSearch('Personaje');
        } else if (page === 'reviews') {
          handleSearch('Review');
        }
      }} />

      {currentView === 'home' && (
        <>
          <Hero 
            onSearch={handleSearch} 
            onCategoryClick={(cat) => handleSearch(cat)} 
            onSelectSugerencia={seleccionarSugerencia} 
          />
          
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
      
      {currentView === 'results' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '25px' }}>
          <button 
            onClick={() => setCurrentView('home')}
            style={{ margin: '20px 0 0 20px', padding: '8px 16px', background: '#334155', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ⬅ Volver al Inicio
          </button>
          
          {error && <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>{error}</div>}
          
          {/* Añadimos la propiedad currentQuery pasándole nuestro estado searchTitle */}
          <ResultsGrid results={results} loading={loading} currentQuery={searchTitle} />
        </div>
      )}
    </div>
  );
}