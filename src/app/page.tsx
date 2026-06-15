'use client';

import { useState, useEffect } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next'; // 👈 Importamos I18nextProvider
import i18nConfig from '@/utils/i18n'; // 👈 IMPORTA TU ARCHIVO DE CONFIGURACIÓN MODIFICADO AQUÍ
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ResultsGrid } from '@/components/ResultsGrid';
import { PanelDetalleLateral } from '@/components/PanelDetalleLateral'; // 👈 Importamos tu componente de detalles
import { useSearch } from '@/hooks/useSearch';
import { LISTA_SUGERENCIAS, SugerenciaPregunta, LISTA_SUGERENCIAS_DBPEDIA_OFFLINE,LISTA_SUGERENCIAS_DBPEDIA_ONLINE } from '@/constants/sugerencias';
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
  const langISO = i18n.language.split('-')[0]; // Captura 'es', 'en', etc.

  // 1. 🕵️‍♂️ Buscamos la misma pregunta (por ID) en las tres listas independientes
  const sugerenciaFuseki = LISTA_SUGERENCIAS.find(p => p.id === item.id);
  const sugerenciaOnline = LISTA_SUGERENCIAS_DBPEDIA_ONLINE.find(p => p.id === item.id);
  const sugerenciaOffline = LISTA_SUGERENCIAS_DBPEDIA_OFFLINE.find(p => p.id === item.id);

  // 2. 📑 Función auxiliar para limpiar y adaptar TODOS los filtros de idioma dinámicos de DBpedia
  const adaptarIdiomaDBpedia = (queryRaw: string | undefined) => {
    if (!queryRaw) return '';
    return queryRaw
      .replace(/lang\(\?label\) = "[a-z]{2}"/g, `lang(?label) = "${langISO}"`)
      .replace(/lang\(\?nombreActor\) = "[a-z]{2}"/g, `lang(?nombreActor) = "${langISO}"`)
      .replace(/lang\(\?directorName\) = "[a-z]{2}"/g, `lang(?directorName) = "${langISO}"`)
      .replace(/lang\(\?premio\) = "[a-z]{2}"/g, `lang(?premio) = "${langISO}"`)
      .replace(/lang\(\?tituloSerie\) = "[a-z]{2}"/g, `lang(?tituloSerie) = "${langISO}"`)
      .replace(/lang\(\?nombreEpisodio\) = "[a-z]{2}"/g, `lang(?nombreEpisodio) = "${langISO}"`)
      .replace(/lang\(\?networkLabel\) = "[a-z]{2}"/g, `lang(?networkLabel) = "${langISO}"`);
  };

  // 3. 🚀 Construimos el mapa federado enviando a cada entorno su consulta correspondiente
  executeCombinedSearch({
    // Fuseki usa sus URIs locales, no necesita reemplazo de idioma RDFS tradicional
    fuseki: sugerenciaFuseki ? sugerenciaFuseki.query : '', 
    
    // Las DBpedia reciben su consulta adaptada al idioma actual de la UI
    online: adaptarIdiomaDBpedia(sugerenciaOnline?.query),
    offline: adaptarIdiomaDBpedia(sugerenciaOffline?.query)
  });

  setCurrentView('results');
};

  // 🖱️ MANEJADOR PARA CUANDO EL USUARIO HAGA CLICK EN UN RESULTADO DE LA GRILLA
  const handleVerDetallesRDF = async (item: Serie) => {
    // Intentamos extraer el recurso/URI semántica de los campos posibles mapeados por tu parser
    
    const recursoUri = item.entidad || item.uri || item.id?.toString();
    console.log(item);
console.log("URI enviada:", recursoUri);
    if (!recursoUri) return;

    setBuscandoGrafo(true);
    
    // Disparamos la consulta SPARQL estructural secundaria a través de tu hook corregido
    const propiedadesExtra = await obtenerDetalleEntidad(recursoUri, item.origen);
    

console.log("URI:", recursoUri);
console.log("PROPIEDADES RDF:", propiedadesExtra);

console.log("RESULTADO RDF", propiedadesExtra);

console.log("ITEM CLICK", item);
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
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <button 
        onClick={() => {
          setCurrentView('home');
          setEntidadSeleccionada(null);
        }}
        style={{ padding: '8px 16px', background: '#334155', color: 'white', borderRadius: '5px', cursor: 'pointer', border: 'none' }}
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
    
    {/* 💡 CONTROL DE FLUJO UNIFICADO */}
    {entidadSeleccionada ? (
      /* MUESTRA EL DETALLE COMPLETO SI EXISTE UNA ENTIDAD SELECCIONADA EN EL PADRE */
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setEntidadSeleccionada(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#38bdf8',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ← Volver a los resultados anteriores
          </button>
        </div>
        
        {/* Pasamos de forma aislada las rdfProperties del grafo procesado */}
        <PanelDetalleLateral 
          item={entidadSeleccionada.rdfProperties || {}} 
          headerInfo={{
            nombre: entidadSeleccionada.nombre,
            tipo: entidadSeleccionada.tipo,
            uri: entidadSeleccionada.entidad || entidadSeleccionada.uri
          }}
          onClose={() => setEntidadSeleccionada(null)} 
        />
      </div>
    ) : (
      /* SI NO HAY SELECCIÓN, SE MUESTRA LA GRILLA NORMAL */
      <ResultsGrid 
        results={safeResults} 
        loading={loading} 
        onItemClick={handleVerDetallesRDF} 
      />
    )}

  </div>
)}
    </div>
  );
}