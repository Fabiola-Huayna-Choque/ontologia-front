export interface Serie {
  id?: string | number;
  nombre: string;
  tipo: 'Serie' | 'Personaje' | 'Temporada' | 'Review';
  genero?: string;
  temporadas?: number;
  episodios?: number;
  puntuacion?: number;
  serie?: string;
  descripcion: string;
  imagen?: string;
}

export interface SearchResponse {
  results: Serie[];
  total: number;
  query?: string;
}

export interface ApiError {
  message: string;
  status: number;
}