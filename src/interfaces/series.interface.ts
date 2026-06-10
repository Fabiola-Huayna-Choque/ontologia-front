// interfaces/series.interface.ts

export type OrigenDatos =
  | 'LOCAL'
  | 'ONLINE'
  | 'OFFLINE';

export interface Serie {

  // =====================================
  // GENERALES
  // =====================================

  id?: string | number;

  nombre: string;

  descripcion: string;

  tipo: string;

  origen: OrigenDatos;

  uri?: string;

  imagen?: string;

  // =====================================
  // SHIPAPU - SERIE
  // =====================================

  estadoSerie?: string;

  numeroTemporadas?: number;

  numeroEpisodios?: number;

  paisProduccion?: string;

  fechaEstreno?: string;

  categoriaObra?: string;

  productora?: string;

  plataforma?: string;

  genero?: string;

  puntuacionPromedioCritica?: number;

  puntuacionPromedioAudiencia?: number;

  detalleSerie?: string;

  // =====================================
  // SHIPAPU - PERSONAJES
  // =====================================

  rolNarrativo?: string;

  tipoPersonaje?: string;

  motivacionPrincipal?: string;

  tipoConflicto?: string;

  actorInterpretadoPor?: string;

  serie?: string;

  // =====================================
  // SHIPAPU - EPISODIOS
  // =====================================

  duracionMinutos?: number;

  numeroEpisodio?: number;

  nombreEpisodio?: string;

  fechaEmision?: string;

  calificacionEpisodio?: number;

  presupuestoEpisodio?: number;

  observacion?: string;

  // =====================================
  // SHIPAPU - TEMPORADAS
  // =====================================

  numeroTemporada?: number;

  totalEpisodios?: number;

  // =====================================
  // SHIPAPU - PRODUCTORAS
  // =====================================

  nombreProduc?: string;

  paisOrigen?: string;

  especialidadGenero?: string;

  historial?: string;

  // =====================================
  // SHIPAPU - PLATAFORMAS
  // =====================================

  nombrePlataforma?: string;

  coberturaGeografica?: string;

  tipoPlataforma?: string;

  // =====================================
  // SHIPAPU - PREMIOS
  // =====================================

  nombrePremio?: string;

  anio?: number;

  categoria?: string;

  // =====================================
  // SHIPAPU - DIRECTORES
  // =====================================

  nombreDirector?: string;

  reconocido?: string;

  estiloVisual?: string;

  obrasPrevias?: string;

  premiosDirectoriales?: string;

  // =====================================
  // SHIPAPU - ACTORES
  // =====================================

  nombreRol?: string;

  // =====================================
  // SHIPAPU - GENEROS
  // =====================================

  nombreGenero?: string;

  subGenero?: string;

  tematicaDominante?: string;

  // =====================================
  // SHIPAPU - CRITICAS
  // =====================================

  resenia?: string;

  autor?: string;

  calificacion?: number;

  fechaResenia?: string;

  // =====================================
  // SHIPAPU - RECEPCION
  // =====================================

  numeroNominaciones?: number;

  numeroPremiosGanados?: number;

  // =====================================
  // SHIPAPU - PRODUCCION
  // =====================================

  presupuesto?: number;

  lugaresRodaje?: string;

  tecnologiaUsada?: string;

  fechaInicioProduccion?: string;

  fechaFinProduccion?: string;

  premios?: string;

  // =====================================
  // DBPEDIA OFFLINE / ONLINE
  // =====================================

  label?: string;

  abstract?: string;

  dbpediaType?: string;

  thumbnail?: string;

  sameAs?: string[];

  wikipediaPage?: string;

  wikiPageID?: string;

  wikiPageRevisionID?: string;

  country?: string;

  language?: string;

  network?: string;

  company?: string;

  creator?: string[];

  producer?: string[];

  writer?: string[];

  starring?: string[];

  directors?: string[];

  genreDbpedia?: string[];

  releaseDate?: string;

  completionDate?: string;

  runtime?: number;

  numberOfEpisodes?: number;

  numberOfSeasons?: number;

  imdbId?: string;

  originalTitle?: string;

  basedOn?: string;

  distributor?: string;

  composer?: string;

  editor?: string;

  cinematography?: string;

  openingTheme?: string;

  endingTheme?: string;

  officialWebsite?: string;

  birthDate?: string;

  deathDate?: string;

  occupation?: string[];

  knownFor?: string[];

  nationality?: string;

  awards?: string[];

  aliases?: string[];

  // =====================================
  // CAMPOS RDF GENERICOS
  // =====================================

  rdfType?: string;

  rdfLabel?: string;

  rdfComment?: string;

  rdfProperties?: Record<string, any>;

  // =====================================
  // FLEXIBILIDAD TOTAL
  // =====================================

  [key: string]: any;
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

export interface FiltrosCount {

  series: number;

  personajes: number;

  productoras: number;

  plataformas: number;

  premios: number;

  episodios: number;

  temporadas: number;

  actores?: number;

  directores?: number;

  generos?: number;

  dbpedia?: number;
}