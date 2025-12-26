
import React from 'react';
import { Lead } from '../types';
import { Download, ArrowLeft, Building2, Mail, Phone, MapPin, User } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  batchIndex: number;
  leads: Lead[];
  onBack: () => void;
}

const BatchView: React.FC<Props> = ({ batchIndex, leads, onBack }) => {
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(leads);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Lote ${batchIndex + 1}`);
    XLSX.writeFile(wb, `JGroupTech_Lote_${batchIndex + 1}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              Lote #{batchIndex + 1}
            </h3>
            <p className="text-sm text-slate-500 font-medium">Gestionando {leads.length} prospectos únicos de este segmento.</p>
          </div>
        </div>

        <button 
          onClick={handleExport}
          className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-xl shadow-green-600/20"
        >
          <Download size={18} />
          <span>Exportar Lote a Excel</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">#</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Empresa</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Representante</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Ubicación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead, idx) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-black">
                    {(batchIndex * 100) + idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Building2 size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-900">{lead.nombreEmpresa}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                      <User size={14} className="text-slate-400" />
                      <span>{lead.nombreRepresentante || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-slate-600 font-medium">
                        <Mail size={12} className="mr-2 text-slate-400" />
                        {lead.correo}
                      </div>
                      <div className="flex items-center text-xs text-slate-600 font-medium">
                        <Phone size={12} className="mr-2 text-slate-400" />
                        {lead.telefonoCelular || lead.telefonoFijo || 'S/T'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-xs text-slate-600 font-bold">
                      <MapPin size={12} className="mr-2 text-slate-400" />
                      {lead.ciudad}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BatchView;
