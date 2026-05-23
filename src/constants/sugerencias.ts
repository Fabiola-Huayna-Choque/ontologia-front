export interface SugerenciaPregunta {
  pregunta: string;
  query: string;
  modo: 'FUSEKI' | 'DBPEDIA_ONLINE' | 'DBPEDIA_OFFLINE'; // Cada pregunta define su origen
}

// Prefijo común para Fuseki local
const PREFIX_FUSEKI = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX ont: <http://www.semanticweb.org/dell/ontologies/2026/2#>
`;

export const LISTA_SUGERENCIAS: SugerenciaPregunta[] = [
  // --- CONSULTAS ESTRUCTURALES O LOCALES (FUSEKI) ---
  {
    pregunta: "[LOCAL] Listar todas las clases y subclases de mi ontología",
    modo: "FUSEKI",
    query: `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT ?clase ?subClase
WHERE {
  ?clase rdf:type owl:Class .
  OPTIONAL { ?subClase rdfs:subClassOf ?clase . }
} ORDER BY ?clase`
  },
  {
    pregunta: "¿Qué directores de cine de renombre han dirigido al menos un episodio de la serie?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI +`
SELECT ?nombreDirector ?tituloEpisodio
WHERE {
  # 1. Relacionamos el Episodio con el Director
  ?episodio ont:episodioDirigidoPor ?director .
  
  # 2. Obtenemos el nombre del episodio (Data Property que ya tenías)
  ?episodio ont:nombreEpisodio ?tituloEpisodio .
  
  # 3. Obtenemos los datos del Director
  ?director ont:nombreDirector ?nombreDirector .
  ?director ont:reconocido ?esRenombrado .
  
  # 4. Filtramos solo los directores de renombre
  FILTER (STR(?esRenombrado) = "si")
}`
  },
  {
    pregunta: "[LOCAL] Obtener directores y sus episodios de series de TV",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `SELECT ?nombreDirector ?tituloEpisodio WHERE {
  ?episodio ont:episodioDirigidoPor ?director .
  ?episodio ont:nombreEpisodio ?tituloEpisodio .
  ?director ont:nombreDirector ?nombreDirector .
}`
  },

  // --- CONSULTAS EXTERNAS (DBPEDIA ONLINE) ---
  {
    pregunta: "[ONLINE] Buscar series de televisión en español y sus directores en DBpedia",
    modo: "DBPEDIA_ONLINE",
    query: `PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?serie ?nombre ?director WHERE {
  ?serie a dbo:TelevisionShow .
  ?serie rdfs:label ?nombre .
  OPTIONAL { ?serie dbo:director ?director . }
  FILTER (lang(?nombre) = 'es')
} LIMIT 20`
  },
  {
    pregunta: "[ONLINE] Listar actores de Breaking Bad y sus premios ganados",
    modo: "DBPEDIA_ONLINE",
    query: `PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?nombreActor ?nombrePremio WHERE {
  ?serie a dbo:TelevisionShow .
  ?serie rdfs:label ?labelSerie .
  FILTER (regex(?labelSerie, "Breaking Bad", "i"))
  ?serie dbo:starring ?actor .
  ?actor rdfs:label ?nombreActor .
  ?actor dbo:award ?premio .
  ?premio rdfs:label ?nombrePremio .
  FILTER (lang(?nombreActor) = 'es')
  FILTER (lang(?nombrePremio) = 'es')
} LIMIT 20`
  }
];