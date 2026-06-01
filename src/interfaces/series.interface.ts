// interfaces/series.interface.ts

export interface Serie {
  id?: string | number;
  nombre: string;
  tipo: 'Serie' | 'Personaje' | 'Protagonista' | 'Antagonista' | 'Temporada' | 'Episodio' | 'Productora' | 'PlataformaEmision' | 'PremioNominacion' | 'Actor/Actriz' | 'Director' | 'Genero';
  descripcion: string;
  origen: 'LOCAL' | 'ONLINE' | 'OFFLINE';
  
  // ========== PROPIEDADES DE Series_televisivas ==========
  estadoSerie?: string;           // "Finalizado", "En emisión"
  numeroTemporadas?: number;      // ont:numeroTemporadas
  numeroEpisodios?: number;       // ont:numeroEpisodios
  paisProduccion?: string;        // ont:paisProduccion
  fechaEstreno?: string;          // ont:fechaEstreno
  categoriaObra?: string;         // ont:categoriaObra ("libro", "comics")
  productora?: string;            // nombre de la productora
  plataforma?: string;            // nombre de la plataforma
  genero?: string;                // nombre del género
  puntuacionPromedioCritica?: number;   // ont:puntuacionPromedioCritica
  puntuacionPromedioAudiencia?: number; // ont:puntuacionPromedioAudiencia
  detalleSerie?: string;          // ont:detalleSerie
  
  // ========== PROPIEDADES DE Personaje / Protagonista / Antagonista ==========
  rolNarrativo?: string;          // ont:rolNarrativo ("Protagonista", "Antagonista", "secundario")
  tipoPersonaje?: string;         // ont:tipoPersonaje ("Complejo", "Villano filosófico", "Manipuladora", etc.)
  motivacionPrincipal?: string;   // ont:motivacionPrincipal (solo para Protagonista)
  tipoConflicto?: string;         // ont:tipoConflicto (solo para Antagonista)
  actorInterpretadoPor?: string;  // ont:actorInterpretadoPor (nombre del actor/actriz)
  serie?: string;                 // Serie a la que pertenece el personaje
  
  // ========== PROPIEDADES DE Episodio ==========
  duracionMinutos?: number;       // ont:duracionMinutos
  numeroEpisodio?: number;        // ont:numeroEpisodio
  nombreEpisodio?: string;        // ont:nombreEpisodio
  fechaEmision?: string;          // ont:fechaEmision
  calificacionEpisodio?: number;  // ont:calificacionEpisodio
  presupuestoEpisodio?: number;   // ont:presupuestoEpisodio
  observacion?: string;           // ont:observacion
  
  // ========== PROPIEDADES DE Temporada ==========
  numeroTemporada?: number;       // ont:numeroTemporada
  totalEpisodios?: number;        // ont:totalEpisodios
  
  // ========== PROPIEDADES DE Productora ==========
  nombreProduc?: string;          // ont:nombreProduc
  paisOrigen?: string;            // ont:paisOrigen
  especialidadGenero?: string;    // ont:especialidadGenero
  historial?: string;             // ont:Historial
  
  // ========== PROPIEDADES DE PlataformaEmision ==========
  nombrePlataforma?: string;      // ont:nombrePlataforma
  coberturaGeografica?: string;   // ont:coberturaGeografica
  tipoPlataforma?: string;        // ont:tipo ("Streaming", "Streaming por suscripción")
  
  // ========== PROPIEDADES DE PremioNominacion ==========
  nombrePremio?: string;          // ont:nombrePremio
  anio?: number;                  // ont:anio
  categoria?: string;             // ont:categoria ("Mejor serie de comedia", etc.)
  
  // ========== PROPIEDADES DE Director ==========
  nombreDirector?: string;        // ont:nombreDirector
  reconocido?: string;            // ont:reconocido ("si"/"no")
  estiloVisual?: string;          // ont:estiloVisual
  obrasPrevias?: string;          // ont:obrasPrevias
  premiosDirectoriales?: string;  // ont:premiosDirectoriales
  
  // ========== PROPIEDADES DE Actor/Actriz ==========
  nombreRol?: string;             // ont:nombreRol ("Actor principal", "Actriz principal")
  
  // ========== PROPIEDADES DE Genero ==========
  nombreGenero?: string;          // ont:nombreGenero
  subGenero?: string;             // ont:subGenero
  tematicaDominante?: string;     // ont:tematicaDominante
  
  // ========== PROPIEDADES DE CriticaReview ==========
  resenia?: string;               // ont:resenia
  autor?: string;                 // ont:autor
  calificacion?: number;          // ont:calificacion
  fechaResenia?: string;          // ont:fechaResenia
  
  // ========== PROPIEDADES DE Recepcion ==========
  numeroNominaciones?: number;    // ont:numeroNominaciones
  numeroPremiosGanados?: number;  // ont:numeroPremiosGanados
  
  // ========== PROPIEDADES DE Produccion ==========
  presupuesto?: number;           // ont:presupuesto
  lugaresRodaje?: string;         // ont:lugaresRodage
  tecnologiaUsada?: string;       // ont:tecnologiaUsada
  fechaInicioProduccion?: string; // ont:fechaInicioProduccion
  fechaFinProduccion?: string;    // ont:fechaFinProduccion
  
  // ========== PROPIEDADES ADICIONALES ==========
  imagen?: string;                // Para futuras imágenes
  premios?: string;   
  
  [key: string]: any;// Texto concatenado de premios
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

// Tipo auxiliar para los filtros
export interface FiltrosCount {
  series: number;
  personajes: number;
  productoras: number;
  plataformas: number;
  premios: number;
  episodios: number;
  temporadas: number;
}