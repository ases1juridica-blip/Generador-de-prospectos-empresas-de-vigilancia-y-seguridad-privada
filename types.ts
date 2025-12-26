
export interface Lead {
  id: string;
  nombreEmpresa: string;
  nombreRepresentante: string;
  direccionEmpresa: string;
  ciudad: string;
  telefonoFijo: string;
  telefonoCelular: string;
  correo: string;
  fechaExtraccion: string;
}

export interface CampaignBatch {
  id: string;
  name: string;
  leads: Lead[];
  createdAt: string;
}

// Removed apiKey field as per security and GenAI SDK guidelines.
export interface AppConfig {
  telefonoContacto: string;
  emailComercial: string;
  fechaLimite: string;
}
