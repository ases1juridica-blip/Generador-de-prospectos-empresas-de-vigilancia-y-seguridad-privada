
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Database, 
  FileText, 
  Download, 
  Layers, 
  TrendingUp,
  Activity,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Save,
  Trash2,
  Settings,
  Briefcase,
  X,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  Globe,
  Zap,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Lead, AppConfig } from './types';
import { parseRawData, generatePersonalizedLetter, automatedFetchLeads } from './services/gemini';
import LeadTable from './components/LeadTable';
import BatchView from './components/BatchView';

const STORAGE_KEY = 'jgrouptech_leads_v1';
const CONFIG_KEY = 'jgrouptech_config';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'extractor' | 'database' | 'campaigns' | 'settings'>('extractor');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [letterContent, setLetterContent] = useState('');
  const [selectedBatchIndex, setSelectedBatchIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [config, setConfig] = useState<AppConfig>({
    telefonoContacto: '310 123 4567',
    emailComercial: 'contacto@jgrouptech.com',
    fechaLimite: '31 de Octubre de 2024'
  });

  useEffect(() => {
    const savedLeads = localStorage.getItem(STORAGE_KEY);
    if (savedLeads) setLeads(JSON.parse(savedLeads));
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const handleSaveConfig = () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    alert('✅ Configuración guardada correctamente.');
  };

  const handleClearDatabase = () => {
    if (window.confirm('¿Deseas vaciar toda la base de datos?')) {
      setLeads([]);
    }
  };

  const handleAutoScan = async () => {
    setIsAutoScanning(true);
    setIsLoading(true);
    try {
      const newLeads = await automatedFetchLeads();
      if (newLeads.length > 0) {
        setLeads(prev => {
          // Evitar duplicados por nombre
          const existingNames = new Set(prev.map(l => l.nombreEmpresa.toLowerCase()));
          const filtered = newLeads.filter(l => !existingNames.has(l.nombreEmpresa.toLowerCase()));
          return [...filtered, ...prev];
        });
        setActiveTab('campaigns');
      } else {
        alert('No se encontraron nuevos leads en este momento. Intenta de nuevo más tarde.');
      }
    } catch (error) {
      alert('Error en el escaneo automático.');
    } finally {
      setIsAutoScanning(false);
      setIsLoading(false);
    }
  };

  const handleManualExtract = async () => {
    if (!rawInput.trim()) return;
    setIsLoading(true);
    try {
      const newLeads = await parseRawData(rawInput);
      setLeads(prev => [...newLeads, ...prev]);
      setRawInput('');
      setActiveTab('campaigns');
    } catch (error) {
      alert('❌ Error procesando texto.');
    } finally {
      setIsLoading(false);
    }
  };

  const prepareDataForExcel = (leadList: Lead[]) => {
    return leadList.map(l => ({
      NOMBRE_EMPRESA: l.nombreEmpresa,
      NOMBRE_REPRESENTANTE: l.nombreRepresentante || 'Representante Legal',
      DIRECCIÓN_EMPRESA: l.direccionEmpresa,
      CIUDAD: l.ciudad,
      TELÉFONO: l.telefonoCelular || l.telefonoFijo,
      CORREO: l.correo,
      FECHA_ACTUAL: new Date().toLocaleDateString('es-CO')
    }));
  };

  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Prospectos");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const handleExportAllBatches = () => {
    const wb = XLSX.utils.book_new();
    const totalBatches = Math.ceil(leads.length / 100);
    for (let i = 0; i < totalBatches; i++) {
      const batch = leads.slice(i * 100, (i + 1) * 100);
      const ws = XLSX.utils.json_to_sheet(prepareDataForExcel(batch));
      XLSX.utils.book_append_sheet(wb, ws, `Lote ${i + 1}`);
    }
    XLSX.writeFile(wb, `Campana_Total_JGroupTech.xlsx`);
  };

  const handleViewLetter = async (lead: Lead) => {
    setSelectedLead(lead);
    setIsLoading(true);
    try {
      const letter = await generatePersonalizedLetter(lead, config);
      setLetterContent(letter);
    } catch (error) {
      alert('Error al generar propuesta.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    return leads.filter(l => 
      l.nombreEmpresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.ciudad.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leads, searchQuery]);

  const batchesCount = Math.ceil(leads.length / 100);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-[#0F172A] text-white p-8 lg:fixed lg:h-full z-30 flex flex-col">
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black leading-none">JGroup<span className="text-blue-400">Tech</span></h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI Automation v3.0</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem active={activeTab === 'extractor'} onClick={() => {setActiveTab('extractor'); setSelectedBatchIndex(null);}} icon={<Globe size={20}/>} label="Automatización Total" />
          <NavItem active={activeTab === 'campaigns'} onClick={() => {setActiveTab('campaigns'); setSelectedBatchIndex(null);}} icon={<Layers size={20}/>} label="Lotes de 100" badge={batchesCount} />
          <NavItem active={activeTab === 'database'} onClick={() => {setActiveTab('database'); setSelectedBatchIndex(null);}} icon={<Database size={20}/>} label="Base de Datos" badge={leads.length} />
          <NavItem active={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setSelectedBatchIndex(null);}} icon={<Settings size={20}/>} label="Configuración" />
        </nav>

        <div className="mt-6 bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold mb-2">
            <Zap size={14} />
            <span>Sistema Autónomo</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Ahora el sistema escanea el portal oficial automáticamente usando IA y Búsqueda de Google.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 p-6 lg:p-12">
        <div className="max-w-6xl mx-auto">
          
          {activeTab === 'extractor' && (
            <div className="space-y-10">
              {/* Auto Scan Banner */}
              <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-200 text-center animate-in zoom-in-95 duration-500 overflow-hidden relative">
                <div className="relative z-10">
                  <div className="inline-flex p-5 bg-blue-50 text-blue-600 rounded-3xl mb-8">
                    {isAutoScanning ? <Loader2 size={48} className="animate-spin" /> : <Globe size={48} />}
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Extracción Automática de la Supervigilancia</h2>
                  <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-10 font-medium">
                    Haz clic en el botón para que nuestra IA navegue por el portal oficial, encuentre los directorios públicos y extraiga los leads por ti.
                  </p>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={handleAutoScan}
                      disabled={isLoading}
                      className="w-full md:w-auto px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center space-x-3 active:scale-95"
                    >
                      {isAutoScanning ? (
                        <>
                          <Loader2 className="animate-spin" size={24} />
                          <span>ESCANEANDO WEB...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={24} />
                          <span>INICIAR ESCANEO TOTAL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
              </div>

              {/* Manual Backup */}
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-3">
                  <div className="w-2 h-6 bg-slate-300 rounded-full"></div>
                  <span>Extracción Manual (Backup)</span>
                </h3>
                <textarea 
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Si tienes un listado específico, pégalo aquí..."
                  className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-blue-500 focus:outline-none transition-all resize-none text-slate-700 font-medium"
                />
                <button 
                  onClick={handleManualExtract}
                  disabled={isLoading || !rawInput}
                  className="mt-4 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Procesar Texto Pegado
                </button>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {selectedBatchIndex === null ? (
                <>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] border border-slate-200">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Lotes de Email Marketing</h2>
                      <p className="text-slate-500 font-medium">Base dividida en grupos de 100 para evitar bloqueos y spam.</p>
                    </div>
                    {leads.length > 0 && (
                      <button onClick={handleExportAllBatches} className="flex items-center space-x-3 px-8 py-4 bg-green-600 text-white rounded-2xl font-black hover:bg-green-700 transition-all shadow-xl shadow-green-600/20">
                        <FileSpreadsheet size={24} />
                        <span>EXPORTAR TODA LA CAMPAÑA</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(batchesCount)].map((_, i) => (
                      <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">{i + 1}</div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Segmentado</span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mb-2">Lote #{i+1}</h4>
                        <p className="text-sm text-slate-500 font-medium mb-8 flex-1">
                          {Math.min(leads.length - (i*100), 100)} Prospectos listos para Word.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setSelectedBatchIndex(i)} className="py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800">Ver Detalles</button>
                          <button onClick={() => exportToExcel(prepareDataForExcel(leads.slice(i*100, (i+1)*100)), `Lote_${i+1}_Excel`)} className="py-3.5 bg-green-50 text-green-700 rounded-2xl text-xs font-black hover:bg-green-100 border border-green-100 flex items-center justify-center space-x-2">
                            <Download size={16} />
                            <span>Descargar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <BatchView 
                  batchIndex={selectedBatchIndex}
                  leads={leads.slice(selectedBatchIndex * 100, (selectedBatchIndex + 1) * 100)}
                  onBack={() => setSelectedBatchIndex(null)}
                />
              )}
            </div>
          )}

          {activeTab === 'database' && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[600px] animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filtrar por empresa o ciudad..." className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:outline-none font-bold transition-all" />
                </div>
                <div className="flex items-center space-x-4">
                  <button onClick={handleClearDatabase} className="text-red-500 hover:bg-red-50 px-5 py-2 rounded-xl text-sm font-black">VACIAR DB</button>
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{filteredLeads.length} Entradas</p>
                </div>
              </div>
              <LeadTable leads={filteredLeads} onSelectLead={handleViewLetter} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
              <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                <h3 className="text-3xl font-black text-slate-900 mb-2">Configuración JGroupTech</h3>
                <p className="text-slate-500 font-medium mb-10">Datos de remitente para la propuesta en Word.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <InputGroup label="Tu Teléfono / WA" value={config.telefonoContacto} onChange={(v: string) => setConfig({...config, telefonoContacto: v})} />
                  <InputGroup label="Tu Email" value={config.emailComercial} onChange={(v: string) => setConfig({...config, emailComercial: v})} />
                  <InputGroup label="Vencimiento Oferta" value={config.fechaLimite} onChange={(v: string) => setConfig({...config, fechaLimite: v})} />
                </div>
                <button onClick={handleSaveConfig} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-2xl">
                  <Save size={24} />
                  <span>GUARDAR CONFIGURACIÓN</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Propuesta */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm no-print animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-500">
            <div className="px-10 py-6 bg-slate-50 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white"><FileText size={20}/></div>
                <h3 className="font-black text-xl text-slate-900">Propuesta: {selectedLead.nombreEmpresa}</h3>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-3 hover:bg-slate-200 rounded-full transition-colors"><X size={28}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
              {isLoading ? (
                 <div className="flex flex-col items-center justify-center h-80 space-y-4">
                    <Loader2 size={48} className="animate-spin text-blue-600" />
                    <p className="font-black text-slate-900">Redactando propuesta personalizada...</p>
                 </div>
              ) : (
                <div className="prose-xl max-w-none text-slate-800 leading-relaxed font-serif bg-white p-12 md:p-20 shadow-2xl rounded-2xl border border-slate-100 mx-auto max-w-[850px] whitespace-pre-wrap">
                  {letterContent}
                </div>
              )}
            </div>
            <div className="px-10 py-6 bg-white border-t flex items-center justify-end space-x-6">
              <button onClick={() => setSelectedLead(null)} className="px-8 py-3 text-slate-500 font-bold hover:text-slate-900 transition-colors">Cerrar</button>
              <button onClick={() => window.print()} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-500/30 flex items-center space-x-3 transition-all active:scale-95">
                <FileText size={20} />
                <span>IMPRIMIR / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capa de Impresión */}
      <div className="hidden print-only p-12 font-serif text-xl leading-relaxed bg-white">
        <div className="whitespace-pre-wrap">{letterContent}</div>
      </div>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, badge }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-200 ${
      active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
    {badge !== undefined && (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
        {badge}
      </span>
    )}
  </button>
);

const InputGroup = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</label>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:border-blue-500 focus:outline-none font-bold transition-all text-slate-900"
    />
  </div>
);

export default App;
