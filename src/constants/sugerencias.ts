export interface SugerenciaPregunta {
  id: string;
  keyTraducida: string; // Enlace limpio con el JSON
  modo: 'FUSEKI' | 'DBPEDIA_ONLINE' | 'DBPEDIA_OFFLINE';
  query: string;
}

const PREFIX_FUSEKI = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX ont: <http://www.semanticweb.org/dell/ontologies/2026/2#>
`;

const PREFIX_DBPEDIA = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>`

export const LISTA_SUGERENCIAS: SugerenciaPregunta[] = [
  { 
    id: "p1", 
    keyTraducida: "preguntas.p1", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?nombreDirector ?tituloEpisodio WHERE { ?episodio ont:episodioDirigidoPor ?director . ?episodio ont:nombreEpisodio ?tituloEpisodio . ?director ont:nombreDirector ?nombreDirector . ?director ont:reconocido ?esRenombrado . FILTER (STR(?esRenombrado) = "si") }` 
  },
  { 
    id: "p2", 
    keyTraducida: "preguntas.p2", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?nombreDelActor ?nombreDelPremio WHERE { ?actor ont:premioActor ?premio . ?actor ont:actorInterpretadoPor ?nombreDelActor . ?premio ont:nombrePremio ?nombreDelPremio . }` 
  },
  { 
    id: "p3", 
    keyTraducida: "preguntas.p3", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT DISTINCT ?nombreSerie ?nombreDelPersonaje WHERE { ?temporada ont:perteneceASerie ?serie . ?serie ont:tituloSerie ?nombreSerie . ?temporada ont:tieneEpisodios ?episodio . ?episodio ont:salePersonaje ?personaje . ?personaje ont:rolNarrativo ?rol . FILTER (REGEX(STR(?rol), "secundario", "i")) ?personaje ont:nombrePersonage ?nombreDelPersonaje . } ORDER BY ?nombreSerie` 
  },
  { 
    id: "p4", 
    keyTraducida: "preguntas.p4", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT DISTINCT ?nombreSerie ?nombreActorYPersonaje ?nombreEpisodio WHERE { ?temporada ont:perteneceASerie ?serie . ?serie ont:tituloSerie ?nombreSerie . ?temporada ont:tieneEpisodios ?episodio . ?episodio ont:nombreEpisodio ?nombreEpisodio . ?episodio ont:salePersonaje ?personaje . ?personaje ont:esInterpretadoPor ?actor . ?personaje ont:nombrePersonage ?nombrePers . ?actor ont:actorInterpretadoPor ?nombreAct . FILTER (STR(?nombrePers) = STR(?nombreAct)) BIND(STR(?nombreAct) AS ?nombreActorYPersonaje) } ORDER BY ?nombreSerie` 
  },
  { 
    id: "p5", 
    keyTraducida: "preguntas.p5", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT DISTINCT ?nombreSerie ?nombreEpisodio WHERE { ?temporada ont:perteneceASerie ?serie . ?serie ont:tituloSerie ?nombreSerie . ?temporada ont:tieneEpisodios ?episodio . ?episodio ont:nombreEpisodio ?nombreEpisodio . ?episodio ont:observacion ?detalleObservacion . FILTER (REGEX(STR(?detalleObservacion), "muerte protagonista", "i")) } ORDER BY ?nombreSerie` 
  },
  { 
    id: "p6", 
    keyTraducida: "preguntas.p6", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?tituloDeLaSerie ?observacionRemake WHERE { ?temporada ont:perteneceASerie ?serie . ?serie ont:tituloSerie ?tituloDeLaSerie . ?serie ont:detalleSerie ?observacionRemake . FILTER (REGEX(STR(?observacionRemake), "remake", "i")) }` 
  },
  { 
    id: "p7", 
    keyTraducida: "preguntas.p7", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?serie ?nombreEpisodio ?estado WHERE { ?temporada ont:perteneceASerie ?serie . ?temporada ont:tieneEpisodios ?episodio . ?episodio ont:nombreEpisodio ?nombreEpisodio . ?episodio ont:observacion ?estado . FILTER (REGEX(STR(?nombreEpisodio), "Pilot", "i")) FILTER (REGEX(STR(?estado), "modificado|rehecho", "i")) }` 
  },
  { 
    id: "p8", 
    keyTraducida: "preguntas.p8", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?serie1 ?fecha1 ?serie2 ?fecha2 WHERE { ?serie1 rdf:type ont:Series_televisivas . ?serie2 rdf:type ont:Series_televisivas . ?serie1 ont:fechaEstreno ?fecha1 . ?serie2 ont:fechaEstreno ?fecha2 . FILTER (?serie1 != ?serie2) FILTER (STR(?serie1) < STR(?serie2)) FILTER (REGEX(STR(?fecha1), ".*-01-20T00:00:00.*") && REGEX(STR(?fecha2), ".*-01-20T00:00:00.*")) FILTER (STR(?fecha1) != STR(?fecha2)) } ORDER BY ?fecha1` 
  },
  { 
    id: "p9", 
    keyTraducida: "preguntas.p9", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?nombreDelPersonaje ?actorInterpretado WHERE { ?personaje ont:rolNarrativo ?rol . FILTER (REGEX(STR(?rol), "Protagonista", "i")) ?personaje ont:nombrePersonage ?nombreDelPersonaje . ?personaje ont:esInterpretadoPor ?actorInterpretado . }` 
  },
  { 
    id: "p10", 
    keyTraducida: "preguntas.p10", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT DISTINCT ?nombreTemporada ?nombreDelPersonaje WHERE { ?temporada ont:tieneEpisodios ?episodio . ?episodio ont:salePersonaje ?personaje . ?personaje ont:nombrePersonage ?nombreDelPersonaje . BIND(STR(?temporada) AS ?nombreTemporada) } ORDER BY ?nombreTemporada` 
  },
  { 
    id: "p11", 
    keyTraducida: "preguntas.p11", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT DISTINCT ?nombreTemporada ?nombreDelPersonaje ?nombreActor WHERE { ?temporada ont:tieneEpisodios ?episodio . ?episodio ont:salePersonaje ?personaje . ?personaje ont:nombrePersonage ?nombreDelPersonaje . ?personaje ont:esInterpretadoPor ?actor . ?actor ont:actorInterpretadoPor ?nombreActor . BIND(STR(?temporada) AS ?nombreTemporada) } ORDER BY ?nombreTemporada` 
  },
  { 
    id: "p12", 
    keyTraducida: "preguntas.p12", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?personaje (COUNT(?actor) AS ?numeroDeActores) WHERE { ?personaje ont:esInterpretadoPor ?actor . } GROUP BY ?personaje HAVING (COUNT(?actor) > 1)` 
  },
  { 
    id: "p13", 
    keyTraducida: "preguntas.p13", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?serie ?fecha ?genero WHERE { ?serie ont:tieneGenero ont:Genero_Ciencia_Ficcion . ?serie ont:tieneGenero ?genero . ?serie ont:fechaEstreno ?fecha . FILTER (STR(?fecha) > "2015") } ORDER BY ?fecha` 
  },
  { 
    id: "p14", 
    keyTraducida: "preguntas.p14", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?genero (AVG(?duracion) AS ?promedioDuracion) WHERE { ?serie ont:tieneGenero ?genero . ?temporada ont:perteneceASerie ?serie . ?temporada ont:tieneEpisodios ?episodio . ?episodio ont:duracionMinutos ?duracion . } GROUP BY ?genero ORDER BY DESC(?promedioDuracion) LIMIT 1` 
  },
  { 
    id: "p15", 
    keyTraducida: "preguntas.p15", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?serie (COUNT(?genero) AS ?totalGeneros) (GROUP_CONCAT(?genero; separator=", ") AS ?listaGeneros) WHERE { ?serie ont:tieneGenero ?genero . } GROUP BY ?serie HAVING (COUNT(?genero) >= 3)` 
  },
  { 
    id: "p16", 
    keyTraducida: "preguntas.p16", 
    modo: "FUSEKI", 
    query: PREFIX_FUSEKI + `SELECT ?subgenero (COUNT(?serie) AS ?cantidadSeries) WHERE { ?serie ont:tieneGenero ?instanciaGenero . ?instanciaGenero ont:subGenero ?subgenero . } GROUP BY ?subgenero ORDER BY DESC(?cantidadSeries)` 
  },
  {
    id: "p17",
    keyTraducida: "preguntas.p17",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo ?fechaEstreno ?numTemporadas WHERE { ?serie rdf:type ont:Series_televisivas . ?serie ont:tituloSerie ?titulo . ?serie ont:fechaEstreno ?fechaEstreno . ?serie ont:numeroTemporadas ?numTemporadas . } ORDER BY ?fechaEstreno`
  },
  {
    id: "p18",
    keyTraducida: "preguntas.p18",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo ?numEpisodios ?descripcion WHERE { ?serie rdf:type ont:Series_televisivas . ?serie ont:tituloSerie ?titulo . ?serie ont:numeroEpisodios ?numEpisodios . ?serie ont:descripcion ?descripcion . FILTER (CONTAINS(LCASE(?descripcion), "especial") || CONTAINS(LCASE(?descripcion), "navidad") || CONTAINS(LCASE(?descripcion), "interactivo")) } ORDER BY DESC(?numEpisodios)`
  },
  {
    id: "p19",
    keyTraducida: "preguntas.p19",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo (COUNT(DISTINCT ?doblaje) AS ?totalDoblajes) (COUNT(DISTINCT ?subtitulo) AS ?totalSubtitulos) WHERE { ?serie rdf:type ont:Series_televisivas . ?serie ont:tituloSerie ?titulo . OPTIONAL { ?serie ont:dobladoA ?doblaje } OPTIONAL { ?serie ont:subtituladoA ?subtitulo } } GROUP BY ?serie ?titulo ORDER BY DESC(?totalDoblajes)`
  },
  {
    id: "p20",
    keyTraducida: "preguntas.p20",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo ?numEpisodios ?numTemporadas WHERE { ?serie rdf:type ont:Series_televisivas . ?serie ont:tituloSerie ?titulo . ?serie ont:numeroEpisodios ?numEpisodios . ?serie ont:numeroTemporadas ?numTemporadas . } ORDER BY DESC(?numEpisodios) DESC(?numTemporadas) LIMIT 1`
  },
  {
    id: "p21",
    keyTraducida: "preguntas.p21",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?productora (COUNT(DISTINCT ?plataforma) AS ?totalPlataformas) WHERE { ?serie ont:producidaPor ?productora . ?serie ont:seEmiteEn ?plataforma . ?productora ont:esIndependiente true . } GROUP BY ?productora HAVING (COUNT(DISTINCT ?plataforma) >= 3) ORDER BY DESC(?totalPlataformas)`
  },
  {
    id: "p22",
    keyTraducida: "preguntas.p22",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo ?plataforma WHERE { ?serie rdf:type ont:Series_televisivas ; ont:tituloSerie ?titulo ; ont:seEmiteEn ?plataformaInd . ?plataformaInd rdf:type ont:PlataformaEmision ; ont:nombrePlataforma ?plataforma . }`
  },
  {
    id: "p23",
    keyTraducida: "preguntas.p23",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT DISTINCT ?titulo WHERE { ?serie rdf:type ont:Series_televisivas ; ont:tituloSerie ?titulo ; ont:seEmiteEn ?plat . ?plat rdf:type ont:PlataformaEmision ; ont:tipo ?tipo . FILTER(?tipo = "Streaming") }`
  },
  {
    id: "p24",
    keyTraducida: "preguntas.p24",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?plataforma (COUNT(?serie) AS ?totalSeries) WHERE { ?serie rdf:type ont:Series_televisivas ; ont:seEmiteEn ?plataformaInd . ?plataformaInd rdf:type ont:PlataformaEmision ; ont:nombrePlataforma ?plataforma . } GROUP BY ?plataforma ORDER BY DESC(?totalSeries)`
  },
  {
    id: "p25",
    keyTraducida: "preguntas.p25",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo WHERE { ?serie rdf:type ont:Series_televisivas ; ont:tituloSerie ?titulo ; ont:paisProduccion ?pais . FILTER(?pais = "Estados Unidos") }`
  },
  {
    id: "p26",
    keyTraducida: "preguntas.p26",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?pais (COUNT(?serie) AS ?totalSeries) WHERE { ?serie rdf:type ont:Series_televisivas ; ont:paisProduccion ?pais . } GROUP BY ?pais ORDER BY DESC(?totalSeries)`
  },
  {
    id: "p27",
    keyTraducida: "preguntas.p27",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo ?categoria WHERE { ?serie rdf:type ont:Series_televisivas . ?serie ont:tituloSerie ?titulo . ?serie ont:categoriaObra ?categoria . FILTER(?categoria = "comics") }`
  },
  {
    id: "p28",
    keyTraducida: "preguntas.p28",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?episodio ?califMax WHERE { ?episodio rdf:type ont:Episodio . ?episodio ont:calificacionEpisodio ?califMax . } ORDER BY DESC(?califMax) LIMIT 1`
  },
  {
    id: "p29",
    keyTraducida: "preguntas.p29",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?productora (COUNT(DISTINCT ?plataforma) AS ?plataformas) WHERE { ?serie ont:producidaPor ?productora . ?serie ont:seEmiteEn ?plataforma . } GROUP BY ?productora HAVING (COUNT(DISTINCT ?plataforma) >= 1)`
  },
  {
    id: "p30",
    keyTraducida: "preguntas.p30",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo ?numTemporadas ?numEpisodios WHERE { ?serie rdf:type ont:Serie_tvShows . ?serie ont:tituloSerie ?titulo . ?serie ont:numeroTemporadas ?numTemporadas . ?serie ont:numeroEpisodios ?numEpisodios . } ORDER BY DESC(?numEpisodios) DESC(?numTemporadas) LIMIT 1`
  },
  {
    id: "p31",
    keyTraducida: "preguntas.p31",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo (COUNT(DISTINCT ?plataforma) AS ?totalPlataformas) WHERE { ?serie rdf:type ont:Series_Televisivas . ?serie ont:tituloSerie ?titulo . ?serie ont:SeEmiteEn ?plataforma . } GROUP BY ?serie ?titulo ORDER BY DESC(?totalPlataformas)`
  },
  {
    id: "p32",
    keyTraducida: "preguntas.p32",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo ?numEpisodios ?descripcion WHERE { ?serie rdf:type ont:Series_televisivas . ?serie ont:tituloSerie ?titulo . ?serie ont:numeroEpisodios ?numEpisodios . OPTIONAL { ?serie ont:descripcion ?descripcion } } ORDER BY DESC(?numEpisodios)`
  },
  {
    id: "p33",
    keyTraducida: "preguntas.p33",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?titulo ?fechaEstreno ?numTemporadas ?estado WHERE { ?serie rdf:type ont:Series_televisivas . ?serie ont:tieneTituloSerie ?titulo . ?serie ont:tieneFechaEstreno ?fechaEstreno . ?serie ont:tieneNumTemporadas ?numTemporadas . OPTIONAL { ?serie ont:estadoDeSerie ?estado } } ORDER BY ?fechaEstreno`
  }
];

// Query genérica estándar sobre Series de TV para mapear como fallback en DBpedia
const QUERY_BASE_DBPEDIA = `SELECT DISTINCT (?serie AS ?entidad) (?label AS ?nombre) ("Serie de TV" AS ?tipo) WHERE { ?serie rdf:type dbo:TelevisionShow . ?serie rdfs:label ?label . FILTER(lang(?label) = "es") } LIMIT 15`;

// ==========================================
// 2. LISTA PARA DBPEDIA ONLINE (Mismos IDs y Claves)
// ==========================================
export const LISTA_SUGERENCIAS_DBPEDIA_ONLINE: SugerenciaPregunta[] = LISTA_SUGERENCIAS.map(p => {
  let queryDbpedia = PREFIX_DBPEDIA + QUERY_BASE_DBPEDIA;

  // Mapeos específicos para preguntas semánticamente compatibles con la Ontología de DBpedia
  if (p.id === "p1") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?director AS ?entidad) (?nombreDirector AS ?nombre) ("Director" AS ?tipo) (?tituloSerie AS ?descripcion) WHERE { ?serie rdf:type dbo:TelevisionShow . ?serie rdfs:label ?tituloSerie . ?serie dbo:director ?director . ?director rdfs:label ?nombreDirector . FILTER(lang(?tituloSerie) = "es" && lang(?nombreDirector) = "es") } LIMIT 15`;
  } else if (p.id === "p2") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?actor AS ?entidad) (?nombreActor AS ?nombre) ("Actor/Actriz" AS ?tipo) (?premio AS ?descripcion) WHERE { ?actor rdf:type dbo:Actor . ?actor rdfs:label ?nombreActor . ?actor dbo:award ?premioUri . ?premioUri rdfs:label ?premio . FILTER(lang(?nombreActor) = "es" && lang(?premio) = "es") } LIMIT 15`;
  } else if (p.id === "p3") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?personaje AS ?entidad) (?nombrePersonaje AS ?nombre) ("Personaje" AS ?tipo) (?tituloSerie AS ?descripcion) WHERE { ?serie rdf:type dbo:TelevisionShow . ?serie rdfs:label ?tituloSerie . ?serie dbo:character ?personaje . ?personaje rdfs:label ?nombrePersonaje . FILTER(lang(?tituloSerie) = "es" && lang(?nombrePersonaje) = "es") } LIMIT 15`;
  } else if (p.id === "p4" || p.id === "p9" || p.id === "p11") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?actor AS ?entidad) (?nombreActor AS ?nombre) ("Actor/Actriz" AS ?tipo) (?tituloSerie AS ?descripcion) WHERE { ?serie rdf:type dbo:TelevisionShow . ?serie rdfs:label ?tituloSerie . ?serie dbo:starring ?actor . ?actor rdfs:label ?nombreActor . FILTER(lang(?tituloSerie) = "es" && lang(?nombreActor) = "es") } LIMIT 15`;
  } else if (p.id === "p7") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?ep AS ?entidad) (?nombreEpisodio AS ?nombre) ("Episodio" AS ?tipo) WHERE { ?ep rdf:type dbo:TelevisionEpisode . ?ep rdfs:label ?nombreEpisodio . FILTER(lang(?nombreEpisodio) = "es" && REGEX(?nombreEpisodio, "Piloto", "i")) } LIMIT 15`;
  } else if (p.id === "p13") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?serie AS ?entidad) (?label AS ?nombre) ("Serie de TV" AS ?tipo) ("Ciencia Ficción" AS ?descripcion) WHERE { ?serie rdf:type dbo:TelevisionShow . ?serie rdfs:label ?label . ?serie dbo:genre dbr:Science_fiction . FILTER(lang(?label) = "es") } LIMIT 15`;
  } else if (p.id === "p17" || p.id === "p33") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?serie AS ?entidad) (?label AS ?nombre) ("Serie" AS ?tipo) (?releaseDate AS ?descripcion) WHERE { ?serie rdf:type dbo:TelevisionShow . ?serie rdfs:label ?label . ?serie dbo:releaseDate ?releaseDate . FILTER(lang(?label) = "es") } ORDER BY ?releaseDate LIMIT 15`;
  } else if (p.id === "p20" || p.id === "p30" || p.id === "p32") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?serie AS ?entidad) (?label AS ?nombre) ("Serie" AS ?tipo) (?numberOfEpisodes AS ?descripcion) WHERE { ?serie rdf:type dbo:TelevisionShow . ?serie rdfs:label ?label . ?serie dbo:numberOfEpisodes ?numberOfEpisodes . FILTER(lang(?label) = "es") } ORDER BY DESC(?numberOfEpisodes) LIMIT 15`;
  } else if (p.id === "p21" || p.id === "p29") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?company AS ?entidad) (?label AS ?nombre) ("Productora" AS ?tipo) WHERE { ?company rdf:type dbo:ProductionCompany . ?company rdfs:label ?label . FILTER(lang(?label) = "es") } LIMIT 15`;
  } else if (p.id === "p22" || p.id === "p24" || p.id === "p31") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?serie AS ?entidad) (?label AS ?nombre) ("Serie" AS ?tipo) (?networkLabel AS ?descripcion) WHERE { ?serie rdf:type dbo:TelevisionShow . ?serie rdfs:label ?label . ?serie dbo:network ?network . ?network rdfs:label ?networkLabel . FILTER(lang(?label) = "es" && lang(?networkLabel) = "es") } LIMIT 15`;
  } else if (p.id === "p23") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?serie AS ?entidad) (?label AS ?nombre) ("Serie en Streaming" AS ?tipo) WHERE { ?serie rdf:type dbo:TelevisionShow . ?serie rdfs:label ?label . ?serie dbo:network ?network . FILTER(lang(?label) = "es" && (CONTAINS(STR(?network), "Netflix") || CONTAINS(STR(?network), "Amazon"))) } LIMIT 15`;
  } else if (p.id === "p25") {
    queryDbpedia = PREFIX_DBPEDIA + `SELECT DISTINCT (?serie AS ?entidad) (?label AS ?nombre) ("Serie" AS ?tipo) ("Estados Unidos" AS ?descripcion) WHERE { ?serie rdf:type dbo:TelevisionShow . ?serie rdfs:label ?label . ?serie dbo:country dbr:United_States . FILTER(lang(?label) = "es") } LIMIT 15`;
  }

  return {
    id: p.id,
    keyTraducida: p.keyTraducida,
    modo: 'DBPEDIA_ONLINE',
    query: queryDbpedia
  };
});

// ==========================================
// 3. LISTA PARA DBPEDIA OFFLINE (Es igual a Online cambiando el modo)
// ==========================================
export const LISTA_SUGERENCIAS_DBPEDIA_OFFLINE: SugerenciaPregunta[] = LISTA_SUGERENCIAS_DBPEDIA_ONLINE.map(p => ({
  ...p,
  modo: 'DBPEDIA_OFFLINE'
}));