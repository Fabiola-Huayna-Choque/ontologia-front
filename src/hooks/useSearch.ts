import { useState, useCallback } from 'react';
import { Serie } from '@/interfaces/series.interface';
import { parseSparqlToSerie } from '@/utils/sparqlParser';
import i18n from 'i18next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api/query';

const traducirCadenaBack = async (texto: string, targetLang: string): Promise<string> => {
  if (!texto || targetLang === 'es') return texto;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(texto)}`);
    const data = await res.json();
    return data?.[0]?.[0]?.[0] || texto;
  } catch {
    return texto;
  }
};

export const useSearch = () => {
  const [results, setResults] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchEntorno = async (sparqlQuery: string, modo: 'FUSEKI' | 'DBPEDIA_ONLINE' | 'DBPEDIA_OFFLINE', origen: Serie['origen']): Promise<Serie[]> => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo, sparql: sparqlQuery })
      });
      
      if (!response.ok) return [];
      const data = await response.json();
      if (!data || !Array.isArray(data)) return [];
      
      const parsedResults = parseSparqlToSerie(data, origen);
      const currentLang = i18n.language.split('-')[0];
      
      // 🌐 TRADUCCIÓN MULTI-IDIOMA EN TIEMPO REAL
      if (currentLang !== 'es') {
        const promesasTraducidas = parsedResults.map(async (item) => {
          const debeTraducir = origen !== 'ONLINE'; 

          return {
            ...item,
            nombre: debeTraducir ? await traducirCadenaBack(item.nombre, currentLang) : item.nombre,
            descripcion: debeTraducir ? await traducirCadenaBack(item.descripcion, currentLang) : item.descripcion
          };
        });
        return await Promise.all(promesasTraducidas);
      }

      return parsedResults;
    } catch (err) {
      console.error(`Error en modo ${modo}:`, err);
      return [];
    }
  };

  // 🔍 NUEVA CONSULTA SPARQL EN SEGUNDO PLANO PARA ATRIBUTOS DETALLADOS
  // 🔍 CONSULTA SPARQL PROTEGIDA CONTRA CARACTERES ESPECIALES
  const obtenerDetalleEntidad = async (
    uriEntidad: string, 
    origen: Serie['origen']
  ): Promise<Record<string, any> | null> => {
    try {
      if (!uriEntidad) return null;

      // 1. Mapear el origen al endpoint correspondiente del Servidor
      let modo: 'FUSEKI' | 'DBPEDIA_ONLINE' | 'DBPEDIA_OFFLINE' = 'DBPEDIA_ONLINE';
      if (origen === 'LOCAL') modo = 'FUSEKI';
      if (origen === 'OFFLINE') modo = 'DBPEDIA_OFFLINE';

      // 2. Sanitización y Envoltura estricta del recurso RDF
      // Si la URI ya viene envuelta en < >, la dejamos intacta; si no, la envolvemos de forma segura.
      const recursoFormateado = uriEntidad.startsWith('<') && uriEntidad.endsWith('>')
        ? uriEntidad
        : `<${uriEntidad.trim()}>`;

      // Estructuramos la query limpia pidiendo propiedades y objetos del grafo
      const sparqlQuery = `
        SELECT DISTINCT ?propiedad ?valor
        WHERE {
          ${recursoFormateado} ?propiedad ?valor .
        }
        LIMIT 100
      `;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo, sparql: sparqlQuery })
      });

      // Si el servidor backend responde con un error 500, lanzamos una alerta controlada en consola
      if (!response.ok) {
        console.error(`El servidor de triples RDF respondió con un código de estado: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      if (!data || !Array.isArray(data)) return null;

      const currentLang = i18n.language.split('-')[0];
      const propiedadesMapeadas: Record<string, any> = {};

      // 3. Normalizar propiedades eliminando los Namespaces (URIs) del Grafo RDF
      for (const item of data) {
        const propUri = item.propiedad?.value || item.propiedad || '';
        const valorRaw = item.valor?.value || item.valor || '';

        if (!propUri) continue;

        // Limpieza de claves (ej: http://dbpedia.org/ontology/numberOfSeasons -> numberOfSeasons)
        const nombrePropiedad = propUri.split('/').pop().split('#').pop();

        // Ignoramos enlaces internos cíclicos irrelevantes de Wikipedia que saturan el JSON
        if (!nombrePropiedad || nombrePropiedad.includes('wikiPage') || propUri.includes('wikiPageLink')) {
          continue;
        }

        let valorFinal = valorRaw;
        // Traducir dinámicamente Literales de texto largos si el idioma seleccionado no es Español
        if (currentLang !== 'es' && typeof valorRaw === 'string' && valorRaw.length > 3 && !valorRaw.startsWith('http')) {
          valorFinal = await traducirCadenaBack(valorRaw, currentLang);
        }

        propiedadesMapeadas[nombrePropiedad] = valorFinal;
      }

      return propiedadesMapeadas;
    } catch (err) {
      console.error("Error obteniendo detalles del recurso RDF:", err);
      return null;
    }
  };

  const executeCombinedSearch = useCallback(async (queries: { fuseki: string; online: string; offline: string }) => {
    setLoading(true);
    setError(null);
    try {
      const [resLocal, resOnline, resOffline] = await Promise.all([
        fetchEntorno(queries.fuseki, 'FUSEKI', 'LOCAL'),
        fetchEntorno(queries.online, 'DBPEDIA_ONLINE', 'ONLINE'),
        fetchEntorno(queries.offline, 'DBPEDIA_OFFLINE', 'OFFLINE')
      ]);
      setResults([...resLocal, ...resOnline, ...resOffline]);
    } catch (err) {
      setError('Error al procesar la búsqueda en la federación.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, executeCombinedSearch, obtenerDetalleEntidad };
};