import { useState, useCallback } from 'react';
import { Serie } from '@/interfaces/series.interface';
import { parseSparqlToSerie } from '@/utils/sparqlParser';
import i18n from 'i18next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api/query';

// Prefijos base unificados
const online = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>`;

const offline = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>`;

const local = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX ont: <http://www.semanticweb.org/dell/ontologies/2026/2#>`;

// Helper de traducción por pasarela
const traducirCadenaBack = async (texto: string, targetLang: string): Promise<string> => {
  if (!texto) return texto;
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
      const currentLang = i18n.language.split('-')[0]; // Captura dinámica del lenguaje de la UI (es, en, fr, etc.)
      
      // 🌍 TRADUCCIÓN GLOBAL REACTIVA DE RESULTADOS DE BÚSQUEDA
      const promesasTraducidas = parsedResults.map(async (item) => {
        // Traducimos todo el contenido de texto plano que venga del motor federado
        return {
          ...item,
          nombre: await traducirCadenaBack(item.nombre, currentLang),
          descripcion: await traducirCadenaBack(item.descripcion, currentLang)
        };
      });
      
      return await Promise.all(promesasTraducidas);
    } catch (err) {
      console.error(`Error en modo ${modo}:`, err);
      return [];
    }
  };

  const obtenerDetalleEntidad = async (
    uriEntidad: string,
    origen: Serie['origen']
  ): Promise<Record<string, any> | null> => {
    try {
      if (!uriEntidad) return null;

      let modo: 'FUSEKI' | 'DBPEDIA_ONLINE' | 'DBPEDIA_OFFLINE';
      let prefijo: string = online;

      if (origen === 'LOCAL') {
        modo = 'FUSEKI';
        prefijo = local;
      } else if (origen === 'OFFLINE') {
        modo = 'DBPEDIA_OFFLINE';
        prefijo = offline;
      } else {
        modo = 'DBPEDIA_ONLINE';
        prefijo = online;
      }

      let recursoSparql = '';
      const uriLimpia = uriEntidad.trim();

      if (uriLimpia.startsWith('http://') || uriLimpia.startsWith('https://')) {
        recursoSparql = uriLimpia.startsWith('<') ? uriLinter : `<${uriLimpia}>`;
      } else {
        if (origen === 'LOCAL') {
          if (uriLimpia.includes(' ') || uriLimpia.includes(':')) {
            recursoSparql = `<http://www.semanticweb.org/dell/ontologies/2026/2#${uriLimpia.replace(/ /g, '_')}>`;
          } else {
            recursoSparql = `ont:${uriLimpia}`;
          }
        } else {
          const formateadoDbpedia = uriLimpia.replace(/ /g, '_');
          recursoSparql = `<http://dbpedia.org/resource/${formateadoDbpedia}>`;
        }
      }

      const sparqlQuery = `
        ${prefijo}
        SELECT DISTINCT ?propiedad ?valor
        WHERE {
          ${recursoSparql} ?propiedad ?valor .
        }
        ORDER BY ?propiedad
      `;

      console.log(`[${modo}] SPARQL Detalle:`, sparqlQuery);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modo, sparql: sparqlQuery })
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (!data || !Array.isArray(data)) return null;

      const currentLang = i18n.language.split('-')[0];
      const slotsAgrupados: Record<string, any> = {};

      for (const item of data) {
        if (item.error) continue;

        const propUri = item.propiedad?.value || item.propiedad || '';
        const valorRaw = item.valor?.value || item.valor || '';
        const tipoValor = item.valor?.type || 'literal';

        if (!propUri || valorRaw === undefined || valorRaw === null) continue;

        const nombreSlot = propUri.split('/').pop()?.split('#').pop() || propUri;

        if (
          !nombreSlot ||
          nombreSlot.includes('wikiPage') ||
          propUri.includes('wikiPageLink') ||
          nombreSlot === 'reason'
        ) {
          continue;
        }

        let valorFinal: any = valorRaw;

        if (tipoValor === 'uri' && typeof valorRaw === 'string') {
          valorFinal = valorRaw.split('/').pop()?.split('#').pop() || valorRaw;
          if (typeof valorFinal === 'string') {
            valorFinal = valorFinal.replace(/_/g, ' ');
          }
        }

        if (propUri === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
          slotsAgrupados.__tipoEntidad = valorFinal;
        }

        // 🌍 TRADUCCIÓN REACTIVA DE LITERALES EN EL PANEL DE DETALLES
        if (
          tipoValor === 'literal' &&
          typeof valorFinal === 'string' &&
          valorFinal.length > 1
        ) {
          try {
            valorFinal = await traducirCadenaBack(valorFinal, currentLang);
          } catch (e) {
            console.warn('Fallo al traducir el literal del grafo:', valorFinal);
          }
        }

        // Estructura de Grafos y agrupación de literales multivalor
        if (slotsAgrupados[nombreSlot] !== undefined) {
          if (Array.isArray(slotsAgrupados[nombreSlot])) {
            if (!slotsAgrupados[nombreSlot].includes(valorFinal)) {
              slotsAgrupados[nombreSlot].push(valorFinal);
            }
          } else {
            if (slotsAgrupados[nombreSlot] !== valorFinal) {
              slotsAgrupados[nombreSlot] = [slotsAgrupados[nombreSlot], valorFinal];
            }
          }
        } else {
          slotsAgrupados[nombreSlot] = valorFinal;
        }
      }

      return slotsAgrupados;
    } catch (err) {
      console.error('Error obteniendo detalles del recurso RDF:', err);
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