'use client';

import { useState, useEffect } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next'; // 👈 Importamos I18nextProvider
import i18nConfig from '@/utils/i18n'; // 👈 IMPORTA TU ARCHIVO DE CONFIGURACIÓN MODIFICADO AQUÍ
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ResultsGrid } from '@/components/ResultsGrid';
import { useSearch } from '@/hooks/useSearch';
import { LISTA_SUGERENCIAS, SugerenciaPregunta } from '@/constants/sugerencias';
import { construirQueriesDinamicas } from '@/utils/sparqlParser';
import { Serie } from '@/interfaces/series.interface';

type View = 'home' | 'results';

export default function HomePage() {
  return (
    // 🌐 ENVOLVEMOS TODA LA VISTA CON EL PROVEEDOR REACTIVO PASANDO TU INSTANCIA
    <I18nextProvider i18n={i18nConfig}>
      <HomePageContent />
    </I18nextProvider>
  );
}

// Subcomponente interno para que useTranslation() se ejecute dentro del contexto correcto del proveedor
function HomePageContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [mostrarTodas, setMostrarTodas] = useState(false);
  
  // 🔍 NUEVOS ESTADOS PARA GESTIONAR EL DETALLE DE LA ENTIDAD SELECCIONADA POR SPARQL
  const [entidadSeleccionada, setEntidadSeleccionada] = useState<any>(null);
  const [buscandoGrafo, setBuscandoGrafo] = useState(false);
  
  const { t, i18n } = useTranslation(); 
  const { results, loading, error, executeCombinedSearch, obtenerDetalleEntidad } = useSearch();

  // 💾 Cargar el idioma guardado previamente en LocalStorage de forma segura (Solo cliente)
  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  // 🌐 Cambiar de idioma y persistir la selección del usuario
  const cambiarIdioma = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('app_lang', lng);
  };

  const handleSearch = (textoBuscador: string) => {
    // 👉 PASAMOS i18n.language COMO SEGUNDO PARÁMETRO
    const queries = construirQueriesDinamicas(textoBuscador, i18n.language);
    executeCombinedSearch(queries);
    setCurrentView('results');
  };

  const seleccionarSugerencia = (item: SugerenciaPregunta) => {
    // Si las sugerencias son queries SPARQL fijas y crudas, 
    // reemplazamos dinámicamente cualquier filtro viejo de idioma que tengan inyectado
    const queryAdaptada = item.query
      .replace(/lang\(\?label\) = "[a-z]{2}"/g, `lang(?label) = "${i18n.language.split('-')[0]}"`)
      .replace(/lang\(\?nombre\) = "[a-z]{2}"/g, `lang(?nombre) = "${i18n.language.split('-')[0]}"`);

    executeCombinedSearch({
      fuseki: queryAdaptada,
      online: queryAdaptada,
      offline: queryAdaptada
    });
    setCurrentView('results');
  };

  // 🖱️ MANEJADOR PARA CUANDO EL USUARIO HAGA CLICK EN UN RESULTADO DE LA GRILLA
  const handleVerDetallesRDF = async (item: Serie) => {
    // Intentamos extraer el recurso/URI semántica de los campos posibles mapeados por tu parser
    const recursoUri = item.entidad || item.uri || item.id?.toString();
    if (!recursoUri) return;

    setBuscandoGrafo(true);
    
    // Disparamos la consulta SPARQL estructural secundaria a través de tu hook corregido
    const propiedadesExtra = await obtenerDetalleEntidad(recursoUri, item.origen);
    
    if (propiedadesExtra) {
      setEntidadSeleccionada({
        ...item,
        rdfProperties: propiedadesExtra // Almacenamos el objeto clave-valor limpio de triples RDF
      });
    } else {
      setEntidadSeleccionada(item);
    }
    setBuscandoGrafo(false);
  };

  const sugerenciasVisibles = mostrarTodas ? LISTA_SUGERENCIAS : LISTA_SUGERENCIAS.slice(0, 3);
  const safeResults = Array.isArray(results) ? results : [];

  // Mapeo dinámico para destacar el botón del idioma actual
  const idiomasDisponibles = ['es', 'en', 'de', 'pt'];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
      
      {/* 🌐 CONTENEDOR SELECTOR DE IDIOMAS DINÁMICO */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        padding: '10px 30px', 
        background: '#020617', 
        gap: '10px',
        borderBottom: '1px solid #1e293b'
      }}>
        {idiomasDisponibles.map((lang) => (
          <button 
            key={lang}
            onClick={() => cambiarIdioma(lang)} 
            style={{
              background: i18n.language === lang ? '#38bdf8' : 'transparent',
              color: i18n.language === lang ? '#000' : '#94a3b8',
              border: '1px solid #334155',
              padding: '4px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {lang}
          </button>
        ))}
      </div>

      <Navbar onNavigate={(page) => {
        if (page === 'home') setCurrentView('home');
        else if (page === 'series') handleSearch('Serie'); 
        else if (page === 'personajes') handleSearch('Personaje');
        else if (page === 'reviews') handleSearch('Review');
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
              {t('ui.tituloSugerencias')}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sugerenciasVisibles.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => seleccionarSugerencia(item)}
                  style={{ padding: '15px', background: '#1e293b', borderRadius: '8px', borderLeft: '4px solid #38bdf8', cursor: 'pointer' }}
                >
                  <span style={{ fontWeight: '600', fontSize: '15px' }}>
                    {t(item.keyTraducida)}
                  </span>
                </div>
              ))}
            </div>

            {LISTA_SUGERENCIAS.length > 3 && (
              <button
                onClick={() => setMostrarTodas(!mostrarTodas)}
                style={{ marginTop: '15px', background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', padding: '8px 16px', borderRadius: '6px', width: '100%', cursor: 'pointer' }}
              >
                {mostrarTodas 
                  ? t('ui.mostrarMenos') 
                  : t('ui.verMas', { count: LISTA_SUGERENCIAS.length - 3 })
                }
              </button>
            )}
          </div>
        </>
      )}
      
      {currentView === 'results' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '25px', paddingLeft: '20px', paddingRight: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => {
                setCurrentView('home');
                setEntidadSeleccionada(null); // Limpiamos detalles abiertos al regresar
              }}
              style={{ margin: '20px 0', padding: '8px 16px', background: '#334155', color: 'white', borderRadius: '5px', cursor: 'pointer', border: 'none' }}
            >
              {t('ui.volverInicio')}
            </button>

            {/* ⚡ FEEDBACK VISUAL MIENTRAS SE HACE LA SEGUNDA CONSULTA SPARQL */}
            {buscandoGrafo && (
              <span style={{ color: '#eab308', fontSize: '14px', fontWeight: 'bold' }}>
                ⚡ {t('ui.buscandoDetallesRDF', { defaultValue: 'Consultando triples del recurso...' })}
              </span>
            )}
          </div>
          
          {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
          
          {/* 👉 PASAMOS LA FUNCIÓN PROP CORRECTAMENTE ENLAZADA A RESULTSGRID */}
          <ResultsGrid 
            results={safeResults} 
            loading={loading} 
            onItemClick={handleVerDetallesRDF} 
          />

          {/* 📄 PANEL / MODAL DE ATRIBUTOS DINÁMICOS EXTRAÍDOS DEL GRAFO */}
          {entidadSeleccionada && (
            <div style={{ 
              background: '#0f172a', 
              border: '1px solid #334155', 
              padding: '24px', 
              borderRadius: '12px', 
              marginTop: '30px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                <div>
                  <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '22px' }}>
                    {entidadSeleccionada.nombre}
                  </h2>
                  <span style={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>
                    {entidadSeleccionada.tipo} • ({entidadSeleccionada.origen})
                  </span>
                </div>
                <button 
                  onClick={() => setEntidadSeleccionada(null)} 
                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                >
                  {t('ui.cerrar', { defaultValue: 'Cerrar Detalles' })}
                </button>
              </div>

              {entidadSeleccionada.rdfProperties && Object.keys(entidadSeleccionada.rdfProperties).length > 0 ? (
                <div>
                  <h4 style={{ color: '#818cf8', margin: '0 0 10px 0', fontSize: '14px' }}>
                    {t('ui.atributosGrafo', { defaultValue: 'Atributos Semánticos Encontrados (?p, ?o):' })}
                  </h4>
                  <pre style={{ 
                    background: '#1e293b', 
                    padding: '16px', 
                    color: '#cbd5e1', 
                    borderRadius: '8px', 
                    overflowX: 'auto',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    lineHeight: '1.6',
                    border: '1px solid #334155'
                  }}>
                    {JSON.stringify(entidadSeleccionada.rdfProperties, null, 2)}
                  </pre>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>
                  {t('ui.sinAtributosExtra', { defaultValue: 'No se encontraron propiedades adicionales en esta URI.' })}
                </p>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}