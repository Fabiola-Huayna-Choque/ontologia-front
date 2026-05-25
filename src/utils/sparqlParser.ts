// utils/sparqlParser.ts
import { Serie } from '@/interfaces/series.interface';

// Tipo flexible para representar cualquier fila en formato Clave-Valor
export type KeyValueResult = Record<string, string | number>;

/**
 * Utilidad general para parsear respuestas del Backend con formato SPARQL-string.
 * Funciona de manera dinámica con cualquier propiedad devuelta.
 */
export class SparqlParser {

  /**
   * Parsea una única línea de texto del backend.
   * Ej de entrada: '( ?nombreDirector = "jkRowling" ) ( ?tituloEpisodio = "Pilot" )'
   * Ej de salida: { nombreDirector: "jkRowling", tituloEpisodio: "Pilot" }
   */
  public static parseRow(rowString: string): KeyValueResult {
    const resultObject: KeyValueResult = {};
    
    // Regex global para capturar las variables ?clave y sus respectivos valores
    const regex = /\?\s*(\w+)\s*=\s*([^)]+)/g;
    const matches = rowString.matchAll(regex);

    for (const match of matches) {
      const key = match[1]; // Nombre de la propiedad
      let value = match[2].trim(); // Valor crudo

      // 1. Limpieza de artefactos RDF / SPARQL / Jena
      value = value
        .replace(/^"|"$/g, '')       // Elimina comillas dobles externas
        .replace(/^<|>$/g, '')       // Elimina los brackets < > de las URIs
        .replace(/\^\^.*$/, '');     // Remueve tipos de datos explícitos como ^^xsd:dateTime

      // Opcional: Si el valor es una URI larga de tu ontología, extraer solo el fragmento final después del '#'
      if (value.includes('#')) {
        value = value.split('#')[1];
      }

      // 2. Conversión inteligente de tipos (Detectar si es un número)
      if (value !== '' && !isNaN(Number(value))) {
        resultObject[key] = Number(value);
      } else {
        resultObject[key] = value;
      }
    }

    return resultObject;
  }

  /**
   * Parsea un listado (Array) de respuestas provenientes del backend.
   * @param rows Array de strings con el formato de tuplas
   */
  public static parseResponse(rows: string[]): KeyValueResult[] {
    if (!rows || !Array.isArray(rows)) return [];
    return rows.map(row => this.parseRow(row));
  }
}

/**
 * Convierte los resultados crudos del backend SPARQL a objetos adaptados para la interfaz Serie.
 * @param rawData - Array de strings o bindings SPARQL
 * @returns Array de objetos Serie con tipado dinámico inyectado
 */
export function parseSparqlToSerie(rawData: any[]): Serie[] {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  const series: Serie[] = [];

  for (let i = 0; i < rawData.length; i++) {
    const item = rawData[i];
    
    // Si el item es un string simple (Formato Fuseki literal)
    if (typeof item === 'string') {
      // 1. Usamos tu nuevo SparqlParser dinámico para extraer el objeto plano
      const parsedRow = SparqlParser.parseRow(item);

      // 2. Buscamos un nombre/título representativo entre las variables extraídas
      const posiblesNombres = [
        parsedRow.nombre,
        parsedRow.tituloSerie,
        parsedRow.tituloDeLaSerie,
        parsedRow.nombrePersonage,
        parsedRow.nombreDelPersonaje,
        parsedRow.nombreEpisodio,
        parsedRow.tituloEpisodio,
        parsedRow.nombreActor,
        parsedRow.nombreDelActor,
        parsedRow.nombreActorYPersonaje,
        parsedRow.nombreDirector,
        parsedRow.nombrePlataforma,
        parsedRow.nombreProduc,
        parsedRow.nombrePremio,
        parsedRow.nombreDelPremio,
        parsedRow.subgenero,
        parsedRow.genero,
        parsedRow.serie,
        parsedRow.serie1
      ];

      const nombreDefinitivo = posiblesNombres.find(val => typeof val === 'string' && val.trim() !== '') || `Resultado ${i + 1}`;

      // 3. Construimos el objeto adaptado a Serie inyectándole dinámicamente todo lo parseado
      const serieAdaptada: Serie = {
        id: i,
        nombre: String(nombreDefinitivo),
        tipo: detectarTipoFromString(item),
        descripcion: item.length > 500 ? item.substring(0, 500) + '...' : item,
        ...parsedRow // 👈 Aquí se inyectan todas las claves dinámicas (?fecha1, ?cantidadSeries, etc.)
      };

      series.push(serieAdaptada);
    }
    // Si el item es un binding clásico por objeto (con .value)
    else if (item && typeof item === 'object') {
      series.push(parseBindingToSerie(item, i));
    }
  }

  return series;
}

/**
 * Parsea un binding SPARQL estándar (objeto con propiedades .value) a objeto Serie
 */
function parseBindingToSerie(binding: any, index: number): Serie {
  const nombre = 
    binding.nombre?.value ||
    binding.tituloSerie?.value ||
    binding.nombrePersonage?.value ||
    binding.nombreEpisodio?.value ||
    binding.nombrePlataforma?.value ||
    binding.nombreProduc?.value ||
    binding.nombrePremio?.value ||
    `Resultado ${index + 1}`;

  const tipo = detectarTipoFromBinding(binding);

  const serie: Serie = {
    id: index,
    nombre: nombre,
    tipo: tipo,
    descripcion: binding.descripcion?.value || binding.sinopsisGeneral?.value || '',
  };

  // Propiedades de la ontología mapeadas desde el binding
  if (binding.numeroTemporadas?.value) serie.numeroTemporadas = parseInt(binding.numeroTemporadas.value);
  if (binding.numeroEpisodios?.value) serie.numeroEpisodios = parseInt(binding.numeroEpisodios.value);
  if (binding.estadoSerie?.value) serie.estadoSerie = binding.estadoSerie.value;
  if (binding.paisProduccion?.value) serie.paisProduccion = binding.paisProduccion.value;
  if (binding.genero?.value) serie.genero = binding.genero.value;
  if (binding.productora?.value) serie.productora = binding.productora.value;
  if (binding.plataforma?.value) serie.plataforma = binding.plataforma.value;
  if (binding.puntuacionPromedioCritica?.value) serie.puntuacionPromedioCritica = parseFloat(binding.puntuacionPromedioCritica.value);
  if (binding.rolNarrativo?.value) serie.rolNarrativo = binding.rolNarrativo.value;
  if (binding.tipoPersonaje?.value) serie.tipoPersonaje = binding.tipoPersonaje.value;
  if (binding.motivacionPrincipal?.value) serie.motivacionPrincipal = binding.motivacionPrincipal.value;
  if (binding.tipoConflicto?.value) serie.tipoConflicto = binding.tipoConflicto.value;
  if (binding.actorInterpretadoPor?.value) serie.actorInterpretadoPor = binding.actorInterpretadoPor.value;
  if (binding.serie?.value) serie.serie = binding.serie.value;
  if (binding.duracionMinutos?.value) serie.duracionMinutos = parseInt(binding.duracionMinutos.value);
  if (binding.numeroEpisodio?.value) serie.numeroEpisodio = parseInt(binding.numeroEpisodio.value);
  if (binding.nombreEpisodio?.value) serie.nombreEpisodio = binding.nombreEpisodio.value;
  if (binding.numeroTemporada?.value) serie.numeroTemporada = parseInt(binding.numeroTemporada.value);
  if (binding.totalEpisodios?.value) serie.totalEpisodios = parseInt(binding.totalEpisodios.value);
  if (binding.nombreProduc?.value) serie.nombreProduc = binding.nombreProduc.value;
  if (binding.paisOrigen?.value) serie.paisOrigen = binding.paisOrigen.value;
  if (binding.especialidadGenero?.value) serie.especialidadGenero = binding.especialidadGenero.value;
  if (binding.nombrePlataforma?.value) serie.nombrePlataforma = binding.nombrePlataforma.value;
  if (binding.coberturaGeografica?.value) serie.coberturaGeografica = binding.coberturaGeografica.value;
  if (binding.nombrePremio?.value) serie.nombrePremio = binding.nombrePremio.value;
  if (binding.anio?.value) serie.anio = parseInt(binding.anio.value);
  if (binding.categoria?.value) serie.categoria = binding.categoria.value;

  return serie;
}

/**
 * Detecta el tipo ontológico desde un string plano
 */
function detectarTipoFromString(str: string): Serie['tipo'] {
  const lowerStr = str.toLowerCase();
  
  if (lowerStr.includes('protagonista')) return 'Protagonista';
  if (lowerStr.includes('antagonista')) return 'Antagonista';
  if (lowerStr.includes('personaje') || lowerStr.includes('personage')) return 'Personaje';
  if (lowerStr.includes('episodio')) return 'Episodio';
  if (lowerStr.includes('temporada')) return 'Temporada';
  if (lowerStr.includes('productora') || lowerStr.includes('produc')) return 'Productora';
  if (lowerStr.includes('plataforma')) return 'PlataformaEmision';
  if (lowerStr.includes('premio')) return 'PremioNominacion';
  if (lowerStr.includes('actor') || lowerStr.includes('actriz')) return 'Actor/Actriz';
  if (lowerStr.includes('director')) return 'Director';
  if (lowerStr.includes('subgenero') || lowerStr.includes('genero')) return 'Genero';
  if (lowerStr.includes('serie')) return 'Serie';
  
  return 'Serie';
}

/**
 * Detectar el tipo ontológico desde un binding clásico
 */
function detectarTipoFromBinding(binding: any): Serie['tipo'] {
  if (binding.tipo?.value) {
    const tipoStr = binding.tipo.value;
    if (tipoStr.includes('Protagonista')) return 'Protagonista';
    if (tipoStr.includes('Antagonista')) return 'Antagonista';
    if (tipoStr.includes('Personaje')) return 'Personaje';
    if (tipoStr.includes('Episodio')) return 'Episodio';
    if (tipoStr.includes('Temporada')) return 'Temporada';
    if (tipoStr.includes('Productora')) return 'Productora';
    if (tipoStr.includes('Plataforma')) return 'PlataformaEmision';
    if (tipoStr.includes('Premio')) return 'PremioNominacion';
    if (tipoStr.includes('Actor')) return 'Actor/Actriz';
    if (tipoStr.includes('Director')) return 'Director';
    if (tipoStr.includes('Genero')) return 'Genero';
  }

  if (binding.motivacionPrincipal?.value) return 'Protagonista';
  if (binding.tipoConflicto?.value) return 'Antagonista';
  if (binding.rolNarrativo?.value) return 'Personaje';
  if (binding.numeroEpisodio?.value) return 'Episodio';
  if (binding.numeroTemporada?.value) return 'Temporada';
  if (binding.nombreProduc?.value) return 'Productora';
  if (binding.nombrePlataforma?.value) return 'PlataformaEmision';
  if (binding.nombrePremio?.value) return 'PremioNominacion';
  if (binding.actorInterpretadoPor?.value) return 'Actor/Actriz';
  if (binding.nombreDirector?.value) return 'Director';
  if (binding.nombreGenero?.value) return 'Genero';

  return 'Serie';
}