
import React from 'react';
import { Lead } from '../types';
import { Mail, Phone, MapPin, User, Building2 } from 'lucide-react';

interface Props {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
}

const LeadTable: React.FC<Props> = ({ leads, onSelectLead }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Representante</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ubicación</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-blue-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Building2 size={20} />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{lead.nombreEmpresa}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User size={14} className="mr-2" />
                  {lead.nombreRepresentante || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Mail size={14} className="mr-2 text-gray-400" />
                    {lead.correo}
                  </div>
                  <div className="flex items-center">
                    <Phone size={14} className="mr-2 text-gray-400" />
                    {lead.telefonoCelular || lead.telefonoFijo}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin size={14} className="mr-2 text-gray-400" />
                    {lead.ciudad}
                  </div>
                  <div className="text-xs text-gray-400 ml-5 truncate max-w-[150px]">{lead.direccionEmpresa}</div>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onSelectLead?.(lead)}
                  className="inline-flex items-center px-3 py-1 border border-blue-600 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Ver Carta
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className="py-12 text-center text-gray-500 italic">
          No hay prospectos cargados. Usa el extractor para iniciar.
        </div>
      )}
    </div>
  );
};

export default LeadTable;
