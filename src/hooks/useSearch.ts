import { useState, useCallback } from 'react';
import { Serie } from '@/interfaces/series.interface';

// URL de tu backend - CAMBIAR SEGÚN TU API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const useSearch = () => {
  const [results, setResults] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Llamada a tu backend
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data.results || data);
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError(err instanceof Error ? err.message : 'Error al buscar');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterByCategory = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/category/${encodeURIComponent(category)}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data.results || data);
    } catch (err) {
      console.error('Error filtrando:', err);
      setError(err instanceof Error ? err.message : 'Error al filtrar');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search, filterByCategory };
};