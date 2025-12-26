
import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const parseRawData = async (rawText: string): Promise<Lead[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analiza el siguiente texto extraído del portal de la Supervigilancia de Colombia y devuelve una lista JSON de empresas con sus campos. 
    Texto: ${rawText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            nombreEmpresa: { type: Type.STRING },
            nombreRepresentante: { type: Type.STRING },
            direccionEmpresa: { type: Type.STRING },
            ciudad: { type: Type.STRING },
            telefonoFijo: { type: Type.STRING },
            telefonoCelular: { type: Type.STRING },
            correo: { type: Type.STRING },
          },
          required: ["nombreEmpresa", "ciudad", "correo"],
        },
      },
    },
  });

  try {
    const data = JSON.parse(response.text);
    return data.map((item: any, index: number) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      fechaExtraccion: new Date().toISOString().split('T')[0]
    }));
  } catch (e) {
    console.error("Error parsing Gemini response", e);
    return [];
  }
};

export const generatePersonalizedLetter = async (lead: Lead, config: any): Promise<string> => {
  const prompt = `Genera una carta comercial formal basada en la siguiente plantilla para la empresa ${lead.nombreEmpresa}.
  
  Plantilla:
  [NOMBRE_EMPRESA]
  [NOMBRE_REPRESENTANTE]
  Representante Legal
  [DIRECCIÓN_EMPRESA]
  [CIUDAD], Colombia
  Fecha: [FECHA_ACTUAL]

  Asunto: Presentamos Buscador de Prospectos – Su aliado para captar leads en propiedad horizontal

  Estimado(a) [NOMBRE_REPRESENTANTE],

  En [NOMBRE_EMPRESA], líder en vigilancia y seguridad privada en Colombia, sabemos que el área comercial enfrenta el desafío constante de identificar y contactar conjuntos residenciales en el sector de propiedad horizontal – un trabajo pesado de investigación manual que consume tiempo valioso.

  Por eso, en JGroupTech Agencia de inteligencia artificial y marketing digital, hemos desarrollado un Buscador de Prospectos para empresas de seguridad en Colombia, el cual es una plataforma innovadora que automatiza la captación de leads potenciales (conjuntos residenciales) en las zonas donde opera su empresa. 

  Esta herramienta elimina el esfuerzo de búsquedas dispersas en bases públicas y privadas, entregando datos precisos de prospectos listos para contactar – ideal para potenciar sus ventas en donde Ustedes realmente están en capacidad de operar, pero también como herramienta de crecimiento en cualquier lugar del territorio nacional.

  Beneficios Clave
  •	Ahorro inmediato: Reduzca horas de investigación manual en un 80%, enfocando su equipo en cierres reales.
  •	Leads geolocalizados: Prospectos en el radio de sus servicios actuales, así como en conjuntos residenciales en donde quieran empezar a operar.
  •	Fácil integración: Acceso web simple, con exportación a Excel para su CRM – sin necesidad de experticia técnica.
  •	Resultados probados: Empresas similares han duplicado sus contactos cualificados en cuestión de semanas. 

  Pruebe nuestro Buscador de Prospectos GRATIS. Responda este email o llame al [TELÉFONO_CONTACTO] antes del [FECHA_LIMITE] para agendar su demo personalizada y obtenga 100 prospectos en el lugar geográfico de su elección, para empezar a generar leads hoy mismo.

  Atentamente,

  JAIRO SEGURA ARENAS
  CEO
  JGroupTech 
  [CORREO] | [TELÉFONO COMERCIAL]
  https://agencia.jgrouptech.com/#abouthubspot

  DATOS PARA REEMPLAZAR:
  NOMBRE_EMPRESA: ${lead.nombreEmpresa}
  NOMBRE_REPRESENTANTE: ${lead.nombreRepresentante || "Señor(a) Representante"}
  DIRECCIÓN_EMPRESA: ${lead.direccionEmpresa}
  CIUDAD: ${lead.ciudad}
  FECHA_ACTUAL: ${new Date().toLocaleDateString('es-CO')}
  TELÉFONO_CONTACTO: ${config.telefonoContacto}
  FECHA_LIMITE: ${config.fechaLimite}
  CORREO: ${config.emailComercial}
  TELÉFONO COMERCIAL: ${config.telefonoContacto}

  Devuelve el texto completo de la carta con un formato limpio.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text;
};
