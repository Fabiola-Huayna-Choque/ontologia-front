import { useState, useCallback } from 'react';
import { Serie } from '@/interfaces/series.interface';
import { parseSparqlToSerie } from '@/utils/sparqlParser';
import i18n from 'i18next'; // 🌐 Importación de la librería

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api/query';

// Función asistente para traducir el contenido asíncrono dinámico del Back-end
const traducirCadenaBack = async (texto: string, targetLang: string): Promise<string> => {
  if (!texto || targetLang === 'es') return texto;
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(texto)}`);
    const data = await res.json();
    return data?.[0]?.[0]?.[0] || texto;
  } catch {
    return texto; // Fallback seguro
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
      const currentLang = i18n.language;

      // Traducir las propiedades dinámicas provenientes del Back-end antes de enviarlas al Grid
      if (currentLang !== 'es') {
        const promesasTraducidas = parsedResults.map(async (item) => ({
          ...item,
          nombre: await traducirCadenaBack(item.nombre, currentLang),
          descripcion: await traducirCadenaBack(item.descripcion, currentLang)
        }));
        return await Promise.all(promesasTraducidas);
      }

      return parsedResults;
    } catch (err) {
      console.error(`Error en modo ${modo}:`, err);
      return [];
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

  return { results, loading, error, executeCombinedSearch };
};