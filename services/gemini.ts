
import { GoogleGenAI, Type } from "@google/genai";
import { Lead } from "../types";

// Nueva función para escaneo automático total usando Google Search
export const automatedFetchLeads = async (): Promise<Lead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Usamos gemini-3-pro-preview porque soporta googleSearch para hallazgos precisos
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: "Busca y extrae la información más reciente del directorio público de empresas de vigilancia y seguridad privada de la página oficial de la Supervigilancia en Colombia (supervigilancia.gov.co). Necesito una lista de al menos 50 empresas que incluya: nombre de la empresa, nombre del representante legal, dirección física, ciudad, teléfono y correo electrónico de contacto. Devuelve la información estrictamente en formato JSON.",
    config: {
      tools: [{ googleSearch: {} }],
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
    return data.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      fechaExtraccion: new Date().toISOString().split('T')[0]
    }));
  } catch (e) {
    console.error("Error en la extracción automática", e);
    return [];
  }
};

export const parseRawData = async (rawText: string): Promise<Lead[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analiza el siguiente texto y devuelve una lista JSON de empresas. Texto: ${rawText}`,
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
    return data.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      fechaExtraccion: new Date().toISOString().split('T')[0]
    }));
  } catch (e) {
    return [];
  }
};

export const generatePersonalizedLetter = async (lead: Lead, config: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Genera una carta comercial formal para ${lead.nombreEmpresa}.
  Representante: ${lead.nombreRepresentante || "Señor(a) Representante"}
  Ciudad: ${lead.ciudad}
  Asunto: Buscador de Prospectos IA para Seguridad Privada.
  Contacto: ${config.emailComercial} | ${config.telefonoContacto}
  Fecha límite: ${config.fechaLimite}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });

  return response.text;
};
