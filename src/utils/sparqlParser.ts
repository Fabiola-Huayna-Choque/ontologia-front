import { Serie } from '@/interfaces/series.interface';

/**
 * Convierte los mapas JSON nativos enviados por el Backend genérico en Java
 * a objetos perfectamente adaptados para la interfaz visual de Next.js.
 */
export function parseSparqlToSerie(rawData: any[], origen: 'LOCAL' | 'ONLINE' | 'OFFLINE'): Serie[] {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  return rawData.map((item, index) => {
    if (item && typeof item === 'object') {
      
      // 1. Extraer de manera inteligente el nombre según lo que devuelva la consulta
      const nombreDefinitivo = 
        item.nombre || 
        item.tituloSerie || 
        item.nombrePersonage || 
        item.nombreEpisodio || 
        item.nombreProduc ||
        item.nombreDirector ||
        `Recurso Desconocido (${index + 1})`;

      // 2. Capturar el tipo dinámico enviado por la query SPARQL (por defecto 'Serie')
      const tipoDefinitivo: Serie['tipo'] = (item.tipo || 'Serie') as Serie['tipo'];

      // 3. Controlar la descripción/sinopsis o generar un fallback dinámico con los demás datos
      let descripcionDefinitiva = item.descripcion || item.detalleSerie || item.observacion || item.Historial || '';
      if (!descripcionDefinitiva) {
        const detallesExtra = Object.entries(item)
          .filter(([key]) => !['nombre', 'tipo', 'descripcion', 'entidad', 'id', 'miSerieLocal'].includes(key))
          .map(([key, val]) => `${key.replace(/([A-Z])/g, ' $1').trim()}: ${val}`)
          .join(' • ');
        descripcionDefinitiva = detallesExtra || `Entidad semántica encontrada en el entorno ${origen.toLowerCase()}.`;
      }

      // 4. Retornar el objeto mapeado mapeando las propiedades de la interfaz Serie
      return {
        id: `${origen}-${index}-${nombreDefinitivo.toString().replace(/\s+/g, '-')}`,
        nombre: String(nombreDefinitivo),
        tipo: tipoDefinitivo,
        descripcion: String(descripcionDefinitiva),
        origen: origen,
        
        // Propiedades específicas mapeadas automáticamente si vienen en el mapa de Java
        estadoSerie: item.estadoSerie,
        numeroTemporadas: item.numeroTemporadas ? parseInt(item.numeroTemporadas) : undefined,
        numeroEpisodios: item.numeroEpisodios ? parseInt(item.numeroEpisodios) : undefined,
        paisProduccion: item.paisProduccion,
        rolNarrativo: item.rolNarrativo,
        tipoPersonaje: item.tipoPersonaje,
        duracionMinutos: item.duracionMinutos ? parseInt(item.duracionMinutos) : undefined,
        nombreProduc: item.nombreProduc,
        paisOrigen: item.paisOrigen,
        ...item // Copia de seguridad para atributos dinámicos adicionales
      } as Serie;
    }

    return {
      id: `error-${index}`,
      nombre: 'Formato inválido',
      tipo: 'Serie',
      descripcion: String(item),
      origen: origen
    } as Serie;
  });
}

export const construirQueriesDinamicas = (textoBuscador: string) => {
  const cleanText = textoBuscador.trim();

  // 1. FUSEKI LOCAL: Escanea exhaustivamente todas las clases reales de WebSemantica_SHIPAPU.rdf
  const queryFuseki = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX ont: <http://www.semanticweb.org/dell/ontologies/2026/2#>

    SELECT DISTINCT ?entidad ?nombre ?tipo ?descripcion
    WHERE {
      { 
        ?entidad rdf:type ont:Series_televisivas .
        ?entidad ont:tituloSerie ?nombre .
        OPTIONAL { ?entidad ont:detalleSerie ?descripcion . }
        BIND("Serie" AS ?tipo)
      } UNION { 
        ?entidad rdf:type ont:Personaje .
        ?entidad ont:nombrePersonage ?nombre .
        OPTIONAL { ?entidad ont:rolNarrativo ?descripcion . }
        BIND("Personaje" AS ?tipo)
      } UNION { 
        ?entidad rdf:type ont:Episodio .
        ?entidad ont:nombreEpisodio ?nombre .
        OPTIONAL { ?entidad ont:observacion ?descripcion . }
        BIND("Episodio" AS ?tipo)
      } UNION { 
        ?entidad rdf:type ont:Productora .
        ?entidad ont:nombreProduc ?nombre .
        OPTIONAL { ?entidad ont:Historial ?descripcion . }
        BIND("Productora" AS ?tipo)
      } UNION {
        ?entidad rdf:type ont:Director .
        ?entidad ont:nombreDirector ?nombre .
        OPTIONAL { ?entidad ont:estiloVisual ?descripcion . }
        BIND("Director" AS ?tipo)
      } UNION {
        ?entidad rdf:type ont:Temporada .
        ?entidad ont:numeroTemporada ?numTemp .
        BIND(STR(?numTemp) AS ?nombre)
        OPTIONAL { ?entidad ont:totalEpisodios ?descripcion . }
        BIND("Temporada" AS ?tipo)
      }
      
      FILTER (regex(str(?nombre), "${cleanText}", "i"))
    } LIMIT 30
  `;

  // 2. DBPEDIA OFFLINE: Mapeo polimórfico adaptado a lo que tiene dbpedia_subconjunto.rdf
  // Como el subconjunto descargado contiene principalmente Shows de TV, Directores y Creadores,
  // buscaremos Shows de TV por su label, o creadores/directores asociados a esos shows si coincide el texto.
  const queryOffline = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dbo: <http://dbpedia.org/ontology/>

    SELECT DISTINCT ?entidad ?nombre ?tipo ?descripcion
    WHERE {
      {
        ?entidad rdf:type dbo:TelevisionShow .
        ?entidad rdfs:label ?nombre .
        OPTIONAL { 
          ?entidad dbo:director ?dir .
          BIND(STRAFTER(STR(?dir), "/resource/") AS ?descripcion)
        }
        BIND("Serie" AS ?tipo)
        FILTER (regex(str(?nombre), "${cleanText}", "i"))
      } UNION {
        ?show rdf:type dbo:TelevisionShow .
        ?show dbo:director ?entidad .
        BIND(STRAFTER(STR(?entidad), "/resource/") AS ?nombre)
        ?show rdfs:label ?showLabel .
        BIND(CONCAT("Director de la serie: ", ?showLabel) AS ?descripcion)
        BIND("Director" AS ?tipo)
        FILTER (regex(str(?entidad), "${cleanText}", "i"))
      } UNION {
        ?show rdf:type dbo:TelevisionShow .
        ?show dbo:creator ?entidad .
        BIND(STRAFTER(STR(?entidad), "/resource/") AS ?nombre)
        ?show rdfs:label ?showLabel .
        BIND(CONCAT("Creador/Productor de: ", ?showLabel) AS ?descripcion)
        BIND("Productora" AS ?tipo)
        FILTER (regex(str(?entidad), "${cleanText}", "i"))
      }
    } LIMIT 20
  `;

  // 3. DBPEDIA ONLINE: Búsqueda global ilimitada en la nube real de Internet
  // Aquí sí podemos buscar de manera directa tipos nativos como dbo:Actor y dbo:TelevisionEpisode
  const queryOnline = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dbo: <http://dbpedia.org/ontology/>

    SELECT DISTINCT (?recurso AS ?entidad) (?label AS ?nombre) ?tipo (?extra AS ?descripcion)
    WHERE {
      {
        ?recurso rdf:type dbo:TelevisionShow .
        ?recurso rdfs:label ?label .
        OPTIONAL { ?recurso dbo:genre ?gen . BIND(STRAFTER(STR(?gen), "/resource/") AS ?extra) }
        BIND("Serie" AS ?tipo)
      } UNION {
        ?recurso rdf:type dbo:Actor .
        ?recurso rdfs:label ?label .
        OPTIONAL { ?recurso dbo:birthPlace ?bp . BIND(STRAFTER(STR(?bp), "/resource/") AS ?extra) }
        BIND("Actor/Actriz" AS ?tipo)
      } UNION {
        ?recurso rdf:type dbo:TelevisionEpisode .
        ?recurso rdfs:label ?label .
        OPTIONAL { ?recurso dbo:series ?ser . BIND(STRAFTER(STR(?ser), "/resource/") AS ?extra) }
        BIND("Episodio" AS ?tipo)
      }
      
      FILTER(lang(?label) = "es" || lang(?label) = "en")
      FILTER(regex(str(?label), "${cleanText}", "i"))
    } LIMIT 20
  `;

  return {
    fuseki: queryFuseki,
    online: queryOnline,
    offline: queryOffline
  };
};