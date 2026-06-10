import { Serie } from '@/interfaces/series.interface';

export function parseSparqlToSerie(
  rawData: any[],
  origen: 'LOCAL' | 'ONLINE' | 'OFFLINE'
): Serie[] {

  if (!rawData || !Array.isArray(rawData)) return [];

  return rawData.map((item, index) => {

    if (!item || typeof item !== 'object') {
      return {
        id: `error-${index}`,
        nombre: 'Formato inválido',
        tipo: 'RecursoDBpedia',
        descripcion: String(item),
        origen
      } as Serie;
    }

    const nombreDefinitivo =
      item.nombre ||
      item.label ||
      item.rdfLabel ||
      item.tituloSerie ||
      item.nombrePersonage ||
      item.nombreEpisodio ||
      item.nombreProduc ||
      item.nombreDirector ||
      item.foafName ||
      item.rdfsLabel ||
      `Recurso Desconocido (${index + 1})`;

    const tipoDefinitivo =
      item.tipo ||
      item.dbpediaType ||
      item.rdfType ||
      'RecursoDBpedia';

    let descripcionDefinitiva =
      item.descripcion ||
      item.abstract ||
      item.detalleSerie ||
      item.observacion ||
      item.historial ||
      item.comment ||
      '';

    if (!descripcionDefinitiva) {
      const detallesExtra = Object.entries(item)
        .filter(([key]) =>
          ![
            'nombre',
            'tipo',
            'descripcion',
            'entidad',
            'id',
            'miSerieLocal'
          ].includes(key)
        )
        .map(([key, val]) =>
          `${key.replace(/([A-Z])/g, ' $1').trim()}: ${val}`
        )
        .join(' • ');

      descripcionDefinitiva =
        detallesExtra;
    }

    return {
      id:
        item.uri ||
        item.entidad ||
        `${origen}-${index}-${String(nombreDefinitivo).replace(/\s+/g, '-')}`,

      nombre: String(nombreDefinitivo),

      tipo: String(tipoDefinitivo),

      descripcion: String(descripcionDefinitiva),

      origen,

      uri: item.uri || item.entidad,

      imagen:
        item.thumbnail ||
        item.imagen,

      // SHIPAPU
      estadoSerie: item.estadoSerie,

      numeroTemporadas:
        item.numeroTemporadas
          ? Number(item.numeroTemporadas)
          : item.numberOfSeasons
            ? Number(item.numberOfSeasons)
            : undefined,

      numeroEpisodios:
        item.numeroEpisodios
          ? Number(item.numeroEpisodios)
          : item.numberOfEpisodes
            ? Number(item.numberOfEpisodes)
            : undefined,

      paisProduccion:
        item.paisProduccion ||
        item.country,

      rolNarrativo: item.rolNarrativo,
      tipoPersonaje: item.tipoPersonaje,

      duracionMinutos:
        item.duracionMinutos
          ? Number(item.duracionMinutos)
          : item.runtime
            ? Number(item.runtime)
            : undefined,

      nombreProduc: item.nombreProduc,
      paisOrigen: item.paisOrigen,

      // DBPEDIA
      label: item.label,
      abstract: item.abstract,
      dbpediaType: item.dbpediaType,

      country: item.country,
      language: item.language,

      network: item.network,
      company: item.company,

      releaseDate:
        item.releaseDate ||
        item.fechaEstreno,

      completionDate:
        item.completionDate,

      runtime:
        item.runtime
          ? Number(item.runtime)
          : undefined,

      starring:
        Array.isArray(item.starring)
          ? item.starring
          : item.starring
            ? [item.starring]
            : undefined,

      directors:
        Array.isArray(item.directors)
          ? item.directors
          : item.director
            ? [item.director]
            : undefined,

      creator:
        Array.isArray(item.creator)
          ? item.creator
          : item.creator
            ? [item.creator]
            : undefined,

      producer:
        Array.isArray(item.producer)
          ? item.producer
          : item.producer
            ? [item.producer]
            : undefined,

      writer:
        Array.isArray(item.writer)
          ? item.writer
          : item.writer
            ? [item.writer]
            : undefined,

      rdfProperties: item,

      ...item
    } as Serie;
  });
}
export const construirQueriesDinamicas = (
  textoBuscador: string,
  lang: string = 'es'
) => {

  const cleanText = textoBuscador.trim();

  const queryLang = lang.split('-')[0].toLowerCase();

  // =====================================================
  // FUSEKI LOCAL (SHIPAPU)
  // =====================================================

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
      }

      UNION

      {
        ?entidad rdf:type ont:Personaje .
        ?entidad ont:nombrePersonage ?nombre .
        OPTIONAL { ?entidad ont:rolNarrativo ?descripcion . }
        BIND("Personaje" AS ?tipo)
      }

      UNION

      {
        ?entidad rdf:type ont:Episodio .
        ?entidad ont:nombreEpisodio ?nombre .
        OPTIONAL { ?entidad ont:observacion ?descripcion . }
        BIND("Episodio" AS ?tipo)
      }

      UNION

      {
        ?entidad rdf:type ont:Productora .
        ?entidad ont:nombreProduc ?nombre .
        OPTIONAL { ?entidad ont:Historial ?descripcion . }
        BIND("Productora" AS ?tipo)
      }

      UNION

      {
        ?entidad rdf:type ont:Director .
        ?entidad ont:nombreDirector ?nombre .
        OPTIONAL { ?entidad ont:estiloVisual ?descripcion . }
        BIND("Director" AS ?tipo)
      }

      FILTER(regex(str(?nombre), "${cleanText}", "i"))
    }

    LIMIT 30
  `;

  // =====================================================
  // DBPEDIA OFFLINE
  // =====================================================

  const queryOffline = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dbo: <http://dbpedia.org/ontology/>

    SELECT DISTINCT ?entidad ?nombre ?tipo ?descripcion
    WHERE {

      {
        ?entidad rdf:type dbo:TelevisionShow .
        ?entidad rdfs:label ?nombre .

        OPTIONAL { ?entidad dbo:director ?dir . }

        BIND("Serie" AS ?tipo)
        BIND(
          IF(
            BOUND(?dir),
            STR(?dir),
            "Serie de Televisión"
          ) AS ?descripcion
        )

        FILTER(
          regex(str(?entidad), "${cleanText}", "i")
          ||
          regex(str(?nombre), "${cleanText}", "i")
        )

        FILTER(
          lang(?nombre) = ""
          ||
          lang(?nombre) = "${queryLang}"
        )
      }

      UNION

      {
        ?show rdf:type dbo:TelevisionShow .
        ?show dbo:director ?entidad .

        OPTIONAL {
          ?entidad rdfs:label ?labelDir .
        }

        BIND("Director" AS ?tipo)

        BIND(
          IF(
            BOUND(?labelDir),
            ?labelDir,
            "Director de Cine/TV"
          ) AS ?nombre
        )

        BIND(?show AS ?descripcion)

        FILTER(
          regex(str(?entidad), "${cleanText}", "i")
          ||
          regex(str(?labelDir), "${cleanText}", "i")
        )

        FILTER(
          lang(?labelDir) = ""
          ||
          lang(?labelDir) = "${queryLang}"
        )
      }

      UNION

      {
        ?show rdf:type dbo:TelevisionShow .
        ?show dbo:creator ?entidad .

        OPTIONAL {
          ?entidad rdfs:label ?labelCreator .
        }

        BIND("Productora" AS ?tipo)

        BIND(
          IF(
            BOUND(?labelCreator),
            ?labelCreator,
            "Creador/Productora de TV"
          ) AS ?nombre
        )

        BIND(?show AS ?descripcion)

        FILTER(
          regex(str(?entidad), "${cleanText}", "i")
          ||
          regex(str(?labelCreator), "${cleanText}", "i")
        )

        FILTER(
          lang(?labelCreator) = ""
          ||
          lang(?labelCreator) = "${queryLang}"
        )
      }

      UNION

      {
        ?entidad rdf:type dbo:Actor .
        ?entidad rdfs:label ?nombre .

        BIND("Actor/Actriz" AS ?tipo)
        BIND("Personalidad del elenco" AS ?descripcion)

        FILTER(
          regex(str(?entidad), "${cleanText}", "i")
          ||
          regex(str(?nombre), "${cleanText}", "i")
        )

        FILTER(
          lang(?nombre) = ""
          ||
          lang(?nombre) = "${queryLang}"
        )
      }

      UNION

      {
        ?show rdf:type dbo:TelevisionShow .
        ?show dbo:starring ?entidad .

        OPTIONAL {
          ?entidad rdfs:label ?nombre .
        }

        BIND("Actor/Actriz" AS ?tipo)
        BIND(?show AS ?descripcion)

        FILTER(
          regex(str(?entidad), "${cleanText}", "i")
          ||
          regex(str(?nombre), "${cleanText}", "i")
        )
      }

    }

    LIMIT 30
  `;

  // =====================================================
  // DBPEDIA ONLINE
  // =====================================================

  const queryOnline = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dbo: <http://dbpedia.org/ontology/>

    SELECT DISTINCT
      (?recurso AS ?entidad)
      (?label AS ?nombre)
      ?tipo
      (?extra AS ?descripcion)

    WHERE {

      {
        ?recurso rdf:type dbo:TelevisionShow .
        ?recurso rdfs:label ?label .

        OPTIONAL {
          ?recurso dbo:abstract ?extra .
        }

        BIND("Serie" AS ?tipo)
      }

      UNION

      {
        ?recurso rdf:type dbo:Actor .
        ?recurso rdfs:label ?label .

        OPTIONAL {
          ?recurso dbo:birthPlace ?bp .
          BIND(
            STRAFTER(
              STR(?bp),
              "/resource/"
            ) AS ?extra
          )
        }

        BIND("Actor/Actriz" AS ?tipo)
      }

      UNION

      {
        ?recurso rdf:type dbo:Person .
        ?recurso rdfs:label ?label .

        OPTIONAL {
          ?recurso dbo:occupation ?occ .
          BIND(STR(?occ) AS ?extra)
        }

        BIND("Persona" AS ?tipo)
      }

      UNION

      {
        ?recurso rdf:type dbo:TelevisionEpisode .
        ?recurso rdfs:label ?label .

        OPTIONAL {
          ?recurso dbo:series ?ser .
          BIND(
            STRAFTER(
              STR(?ser),
              "/resource/"
            ) AS ?extra
          )
        }

        BIND("Episodio" AS ?tipo)
      }

      FILTER(lang(?label) = "${queryLang}")

      FILTER(
        regex(
          str(?label),
          "${cleanText}",
          "i"
        )
      )
    }

    LIMIT 30
  `;

  return {
    fuseki: queryFuseki,
    offline: queryOffline,
    online: queryOnline
  };
};

export const construirQueryDetalleEntidad = (uriEntidad: string) => {
  // Aseguramos que si es una URI completa de DBpedia o Fuseki, se envuelva en < >
  const recursoFormateado = uriEntidad.startsWith('http') ? `<${uriEntidad}>` : uriEntidad;

  return `
    SELECT DISTINCT ?propiedad ?valor
    WHERE {
      ${recursoFormateado} ?propiedad ?valor .
    }
    LIMIT 150
  `;
};