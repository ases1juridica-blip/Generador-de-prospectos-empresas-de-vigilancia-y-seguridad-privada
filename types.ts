
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

export interface AppConfig {
  apiKey: string;
  telefonoContacto: string;
  emailComercial: string;
  fechaLimite: string;
}
