import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api/query';

export const useSearch = () => {
  const [results, setResults] = useState<string[]>([]); // Guarda los strings crudos del backend
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSparql = useCallback(async (sparqlQuery: string, modo: string = 'FUSEKI') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modo: modo,
          sparql: sparqlQuery
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json(); // Array de strings crudos enviado por Apache Jena
      setResults(data);
    } catch (err) {
      console.error('Error en ejecución SPARQL:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la consulta');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, executeSparql };
};