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
    pregunta: "¿Qué directores de cine de renombre han dirigido al menos un episodio de la serie?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
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
    pregunta: "¿Qué actores han recibido premios?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT ?nombreDelActor ?nombreDelPremio
WHERE {
  # 1. Relacionamos al Actor con el objeto del Premio (Object Property)
  ?actor ont:premioActor ?premio .
  
  # 2. Obtenemos el nombre real del Actor (Data Property)
  ?actor ont:actorInterpretadoPor ?nombreDelActor .
  
  # 3. Obtenemos el nombre específico del Premio (Data Property)
  # Asegúrate de que el individuo 'Waskar' o 'Emmy' tenga esta propiedad rellena
  ?premio ont:nombrePremio ?nombreDelPremio .
}`
  },
  {
    pregunta: "¿Qué personajes secundarios aparecen en la serie?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT DISTINCT ?nombreSerie ?nombreDelPersonaje
WHERE {
  ?temporada ont:perteneceASerie ?serie .
  ?serie ont:tituloSerie ?nombreSerie .

  ?temporada ont:tieneEpisodios ?episodio .

  ?episodio ont:salePersonaje ?personaje .

  ?personaje ont:rolNarrativo ?rol .
  FILTER (REGEX(STR(?rol), "secundario", "i"))

  ?personaje ont:nombrePersonage ?nombreDelPersonaje .
}
ORDER BY ?nombreSerie`
  },
  {
    pregunta: "¿En qué episodios aparece un actor interpretando a sí mismo?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT DISTINCT ?nombreSerie ?nombreActorYPersonaje ?nombreEpisodio
WHERE {
  # 1. Conectamos todo el camino: Serie -> Temporada -> Episodio -> Personaje
  ?temporada ont:perteneceASerie ?serie .
  ?serie ont:tituloSerie ?nombreSerie .
  ?temporada ont:tieneEpisodios ?episodio .
  ?episodio ont:nombreEpisodio ?nombreEpisodio .
  ?episodio ont:salePersonaje ?personaje .

  # 2. Obtenemos el actor que interpreta a ese personaje
  ?personaje ont:esInterpretadoPor ?actor .

  # 3. Extraemos los nombres (Data Properties)
  ?personaje ont:nombrePersonage ?nombrePers .
  ?actor ont:actorInterpretadoPor ?nombreAct .

  # 4. COMPARACIÓN: Filtramos si los nombres son iguales
  # Usamos STR() para asegurar que comparamos texto puro
  FILTER (STR(?nombrePers) = STR(?nombreAct))

  # 5. Creamos la variable de salida para el nombre coincidente
  BIND(STR(?nombreAct) AS ?nombreActorYPersonaje)
}
ORDER BY ?nombreSerie`
  },
  {
    pregunta: "¿En qué series murió el protagonista?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT DISTINCT ?nombreSerie ?nombreEpisodio 
WHERE {
  # 1. Conectamos la Serie con sus Temporadas y Episodios
  ?temporada ont:perteneceASerie ?serie .
  ?serie ont:tituloSerie ?nombreSerie .
  ?temporada ont:tieneEpisodios ?episodio .
  
  # 2. Obtenemos los datos del episodio
  ?episodio ont:nombreEpisodio ?nombreEpisodio .
  ?episodio ont:observacion ?detalleObservacion .
  
  # 3. Filtramos por el texto específico en la observación
  FILTER (REGEX(STR(?detalleObservacion), "muerte protagonista", "i"))
}
ORDER BY ?nombreSerie`
  },
  {
    pregunta: "¿Qué series son remakes?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT ?tituloDeLaSerie ?observacionRemake
WHERE {
  # 1. Filtramos por la clase Series_televisivas
  ?temporada ont:perteneceASerie ?serie .
  
  # 2. Obtenemos el título de la serie
  ?serie ont:tituloSerie ?tituloDeLaSerie .
  
  # 3. Buscamos el detalle que indique que es un remake
  ?serie ont:detalleSerie ?observacionRemake .
  
  # 4. Filtramos para que solo aparezcan las que contienen la palabra 'remake'
  FILTER (REGEX(STR(?observacionRemake), "remake", "i"))
}`
  },
  {
    pregunta: "¿Qué series tienen un episodio piloto que fue rehecho o modificado?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT ?serie ?nombreEpisodio ?estado
WHERE {
  # 1. Conectamos la Temporada con la Serie
  ?temporada ont:perteneceASerie ?serie .
  
  # 2. Conectamos la Temporada con sus Episodios
  ?temporada ont:tieneEpisodios ?episodio .
  
  # 3. Obtenemos el nombre y la observación del episodio
  ?episodio ont:nombreEpisodio ?nombreEpisodio .
  ?episodio ont:observacion ?estado .
  
  # 4. Filtramos los que tengan el texto 'modificado' o 'rehecho'
  FILTER (REGEX(STR(?nombreEpisodio), "Pilot", "i"))
  FILTER (REGEX(STR(?estado), "modificado|rehecho", "i"))
}`
  },
  {
    pregunta: "¿Qué series se estrenaron en el mismo día pero en años diferentes?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT ?serie1 ?fecha1 ?serie2 ?fecha2
WHERE {
  # 1. Filtramos para que solo sean Series (evita que salgan temporadas)
  ?serie1 rdf:type ont:Series_televisivas .
  ?serie2 rdf:type ont:Series_televisivas .
  
  # 2. Obtenemos las fechas de estreno
  ?serie1 ont:fechaEstreno ?fecha1 .
  ?serie2 ont:fechaEstreno ?fecha2 .
  
  # 3. Control de identidad y duplicados
  FILTER (?serie1 != ?serie2)
  FILTER (STR(?serie1) < STR(?serie2))

  FILTER (REGEX(STR(?fecha1), ".*-01-20T00:00:00.*") && REGEX(STR(?fecha2), ".*-01-20T00:00:00.*"))
  
  # Y que el año sea diferente (comparación manual)
  FILTER (STR(?fecha1) != STR(?fecha2))
}
ORDER BY ?fecha1`
  },
  {
    pregunta: "¿Qué actor interpreta al personaje principal?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT ?nombreDelPersonaje ?actorInterpretado
WHERE {
  # 1. Buscamos cualquier individuo que tenga un rol narrativo "Protagonista"
  ?personaje ont:rolNarrativo ?rol .
  FILTER (REGEX(STR(?rol), "Protagonista", "i"))
  
  # 2. Obtenemos su nombre y quién lo interpreta
  ?personaje ont:nombrePersonage ?nombreDelPersonaje .
  ?personaje ont:esInterpretadoPor ?actorInterpretado .
}`
  },
  {
    pregunta: "¿Qué personajes aparecen en la temporada?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT DISTINCT ?nombreTemporada ?nombreDelPersonaje
WHERE {
  # 1. Conectamos la Temporada con sus Episodios
  ?temporada ont:tieneEpisodios ?episodio .
  
  # 2. Conectamos el Episodio con los Personajes que salen en él
  ?episodio ont:salePersonaje ?personaje .
  
  # 3. Obtenemos el nombre legible del personaje (Data Property de Daenerys/Walter)
  ?personaje ont:nombrePersonage ?nombreDelPersonaje .
  
  # Opcional: Para identificar la temporada en la tabla
  BIND(STR(?temporada) AS ?nombreTemporada)
}
ORDER BY ?nombreTemporada`
  },
  {
    pregunta: "¿Qué actores han interpretado al menos un personaje por temporada durante toda la serie?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT DISTINCT ?nombreTemporada ?nombreDelPersonaje ?nombreActor
WHERE {
  # 1. Conectamos la Temporada con sus Episodios
  ?temporada ont:tieneEpisodios ?episodio .
  
  # 2. Conectamos el Episodio con los Personajes que salen en él
  ?episodio ont:salePersonaje ?personaje .
  
  # 3. Obtenemos el nombre legible del personaje (Data Property de Daenerys/Walter)
  ?personaje ont:nombrePersonage ?nombreDelPersonaje .
  ?personaje ont:esInterpretadoPor ?actor .
  ?actor ont:actorInterpretadoPor ?nombreActor .
  
  # Opcional: Para identificar la temporada en la tabla
  BIND(STR(?temporada) AS ?nombreTemporada)
}
ORDER BY ?nombreTemporada`
  },
  {
    pregunta: "¿Qué personajes han sido interpretados por más de un actor a lo largo de la serie?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT ?personaje (COUNT(?actor) AS ?numeroDeActores)
WHERE {
  ?personaje ont:esInterpretadoPor ?actor .
}
GROUP BY ?personaje
HAVING (COUNT(?actor) > 1)`
  },
  {
    pregunta: "¿Qué series son del género ciencia ficción estrenadas después de 2015?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT ?serie ?fecha ?genero
WHERE {
  # 1. Buscamos la relación entre la serie y su género
  ?serie ont:tieneGenero ont:Genero_Ciencia_Ficcion .
  ?serie ont:tieneGenero ?genero .
  
  # 2. Buscamos el dato de la fecha de estreno de esa misma serie
  ?serie ont:fechaEstreno ?fecha .
  FILTER (STR(?fecha) > "2015")
}
ORDER BY ?fecha`
  },
  {
    pregunta: "¿Qué género tiene el promedio de duración de episodios más largos?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT ?genero (AVG(?duracion) AS ?promedioDuracion)
WHERE {
  # 1. Conectamos la serie con su género
  ?serie ont:tieneGenero ?genero .
  
  ?temporada ont:perteneceASerie ?serie .

  # 2. Conectamos la Serie con sus Episodios
  ?temporada ont:tieneEpisodios ?episodio .
  
  # 3. Extraemos los minutos del Episodio
  ?episodio ont:duracionMinutos ?duracion .
}
GROUP BY ?genero
ORDER BY DESC(?promedioDuracion)
LIMIT 1`
  },
  {
    pregunta: "¿Qué series combinan tres o más géneros diferentes?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT ?serie (COUNT(?genero) AS ?totalGeneros) (GROUP_CONCAT(?genero; separator=", ") AS ?listaGeneros)
WHERE {
  # Relacionamos la serie con sus géneros
  ?serie ont:tieneGenero ?genero .
}
GROUP BY ?serie
HAVING (COUNT(?genero) >= 3)`
  },
  {
    pregunta: "¿Cuáles son los subgéneros más comunes en las series?",
    modo: "FUSEKI",
    query: PREFIX_FUSEKI + `
SELECT ?subgenero (COUNT(?serie) AS ?cantidadSeries)
WHERE {
  # 1. Buscamos series que tengan un género específico
  ?serie ont:tieneGenero ?instanciaGenero .
  
  # 2. Obtenemos la clase a la que pertenece ese género
  ?instanciaGenero ont:subGenero ?subgenero .
}
GROUP BY ?subgenero
ORDER BY DESC(?cantidadSeries)`
  }
];