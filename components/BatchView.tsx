
import React from 'react';
import { Lead } from '../types';
import { Download, ArrowLeft, Building2, Mail, Phone, MapPin, User, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  batchIndex: number;
  leads: Lead[];
  onBack: () => void;
}

const BatchView: React.FC<Props> = ({ batchIndex, leads, onBack }) => {
  const handleExport = () => {
    const formatted = leads.map(l => ({
      NOMBRE_EMPRESA: l.nombreEmpresa,
      NOMBRE_REPRESENTANTE: l.nombreRepresentante || 'Representante Legal',
      DIRECCIÓN_EMPRESA: l.direccionEmpresa,
      CIUDAD: l.ciudad,
      TELÉFONO: l.telefonoCelular || l.telefonoFijo,
      CORREO: l.correo,
      FECHA_ACTUAL: new Date().toLocaleDateString('es-CO')
    }));
    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Prospectos");
    XLSX.writeFile(wb, `Lote_${batchIndex + 1}_Word_Ready.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-5">
          <button 
            onClick={onBack}
            className="p-4 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              Lote #{batchIndex + 1} <span className="text-blue-600">Comercial</span>
            </h3>
            <p className="text-sm text-slate-500 font-medium">Contiene {leads.length} prospectos optimizados para Microsoft Word.</p>
          </div>
        </div>

        <button 
          onClick={handleExport}
          className="flex items-center justify-center space-x-3 px-8 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-xl shadow-green-600/20"
        >
          <Download size={24} />
          <span>DESCARGAR PARA WORD</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
            <FileSpreadsheet size={14}/>
            <span>Vista Previa del Archivo Excel</span>
          </h4>
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">Columnas Optimizadas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Empresa</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Representante</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Correo</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Teléfono</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Building2 size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{lead.nombreEmpresa}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                      <User size={14} className="text-slate-400" />
                      <span>{lead.nombreRepresentante || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">{lead.correo}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900">{lead.telefonoCelular || lead.telefonoFijo || 'S/T'}</td>
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
