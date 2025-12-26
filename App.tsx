
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
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Lead, AppConfig } from './types';
import { parseRawData, generatePersonalizedLetter } from './services/gemini';
import LeadTable from './components/LeadTable';
import BatchView from './components/BatchView';

const STORAGE_KEY = 'jgrouptech_leads_v1';
const CONFIG_KEY = 'jgrouptech_config';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'extractor' | 'database' | 'campaigns' | 'settings'>('extractor');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [letterContent, setLetterContent] = useState('');
  const [selectedBatchIndex, setSelectedBatchIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [config, setConfig] = useState<AppConfig>({
    apiKey: '',
    telefonoContacto: '310 123 4567',
    emailComercial: 'contacto@jgrouptech.com',
    fechaLimite: '31 de Octubre de 2024'
  });

  // Load initial state
  useEffect(() => {
    const savedLeads = localStorage.getItem(STORAGE_KEY);
    if (savedLeads) setLeads(JSON.parse(savedLeads));

    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  // Save state on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const handleSaveConfig = () => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    alert('Configuración comercial actualizada correctamente.');
  };

  const handleExtract = async () => {
    if (!rawInput.trim()) return;
    setIsLoading(true);
    try {
      const newLeads = await parseRawData(rawInput);
      setLeads(prev => [...newLeads, ...prev]);
      setRawInput('');
      setActiveTab('database');
    } catch (error) {
      alert('Error extrayendo datos. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(leads);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Base de Datos Completa");
    XLSX.writeFile(wb, `JGroupTech_Full_DB_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportAllBatches = () => {
    if (leads.length === 0) return;
    const wb = XLSX.utils.book_new();
    const totalBatches = Math.ceil(leads.length / 100);
    
    for (let i = 0; i < totalBatches; i++) {
      const batchLeads = leads.slice(i * 100, (i + 1) * 100);
      const ws = XLSX.utils.json_to_sheet(batchLeads);
      XLSX.utils.book_append_sheet(wb, ws, `Lote ${i + 1}`);
    }
    
    XLSX.writeFile(wb, `JGroupTech_Lotes_Campañas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleViewLetter = async (lead: Lead) => {
    setSelectedLead(lead);
    setIsLoading(true);
    try {
      const letter = await generatePersonalizedLetter(lead, config);
      setLetterContent(letter);
    } catch (error) {
      alert('Error al generar la propuesta personalizada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDatabase = () => {
    if (window.confirm('¿Deseas eliminar permanentemente todos los prospectos?')) {
      setLeads([]);
    }
  };

  // Filter Logic: Case-sensitive as requested
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    return leads.filter(lead => 
      lead.nombreEmpresa.includes(searchQuery) ||
      lead.ciudad.includes(searchQuery) ||
      (lead.nombreRepresentante && lead.nombreRepresentante.includes(searchQuery)) ||
      lead.correo.includes(searchQuery)
    );
  }, [leads, searchQuery]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const matches = new Set<string>();
    leads.forEach(lead => {
      if (lead.nombreEmpresa.includes(searchQuery)) matches.add(lead.nombreEmpresa);
      if (lead.ciudad.includes(searchQuery)) matches.add(lead.ciudad);
      if (lead.nombreRepresentante?.includes(searchQuery)) matches.add(lead.nombreRepresentante);
      if (lead.correo.includes(searchQuery)) matches.add(lead.correo);
    });
    return Array.from(matches).slice(0, 6);
  }, [leads, searchQuery]);

  const batchesCount = Math.ceil(leads.length / 100);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-[#0f172a] text-white p-8 lg:fixed lg:h-full lg:left-0 lg:top-0 z-30 shadow-2xl">
        <div className="flex items-center space-x-3 mb-12">
          <div className="p-2.5 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">JGroup<span className="text-blue-400">Tech</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Smart Extractor</p>
          </div>
        </div>

        <nav className="space-y-2">
          <button 
            onClick={() => { setActiveTab('extractor'); setSelectedBatchIndex(null); }}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'extractor' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Search size={20} />
            <span>Extracción de Leads</span>
          </button>
          <button 
            onClick={() => { setActiveTab('database'); setSelectedBatchIndex(null); }}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'database' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Database size={20} />
            <div className="flex-1 flex items-center justify-between">
              <span>Base de Datos</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'database' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {leads.length}
              </span>
            </div>
          </button>
          <button 
            onClick={() => { setActiveTab('campaigns'); setSelectedBatchIndex(null); }}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'campaigns' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Layers size={20} />
            <div className="flex-1 flex items-center justify-between">
              <span>Gestión de Lotes</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'campaigns' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {batchesCount}
              </span>
            </div>
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setSelectedBatchIndex(null); }}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings size={20} />
            <span>Configuración</span>
          </button>
        </nav>

        <div className="mt-auto lg:absolute lg:bottom-8 lg:left-8 lg:right-8">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2">
              <Activity size={12} />
              <span>Status Operativo</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Motor IA Gemini 2.5 activo.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 lg:p-12 min-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="animate-in slide-in-from-left duration-500">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'extractor' && 'Extraer Nuevos Prospectos'}
              {activeTab === 'database' && 'Explorador de Inteligencia'}
              {activeTab === 'campaigns' && 'Organización por Lotes de 100'}
              {activeTab === 'settings' && 'Personalización Comercial'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4 animate-in slide-in-from-right duration-500">
            {activeTab === 'campaigns' && leads.length > 0 && (
              <button 
                onClick={handleExportAllBatches}
                className="flex items-center space-x-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-600/20"
              >
                <FileSpreadsheet size={16} />
                <span>Exportar Todos los Lotes</span>
              </button>
            )}
            {leads.length > 0 && (
              <button 
                onClick={handleExportExcel}
                className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
              >
                <Download size={16} />
                <span>Exportar Full DB</span>
              </button>
            )}
          </div>
        </header>

        <div className="space-y-8">
          {activeTab === 'extractor' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="mb-6">
                    <label className="text-sm font-bold text-slate-900 uppercase tracking-widest block mb-4">Entrada de Datos Crudos</label>
                    <textarea 
                      value={rawInput}
                      onChange={(e) => setRawInput(e.target.value)}
                      placeholder="Pega aquí la información copiada del portal..."
                      className="w-full h-80 p-6 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all resize-none font-medium leading-relaxed"
                    ></textarea>
                  </div>
                  <button 
                    onClick={handleExtract}
                    disabled={isLoading || !rawInput}
                    className={`w-full py-5 rounded-2xl flex items-center justify-center space-x-3 font-black text-lg transition-all duration-300 ${
                      isLoading || !rawInput 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-900 text-white hover:bg-[#1e293b] shadow-2xl shadow-slate-900/20'
                    }`}
                  >
                    {isLoading ? <span>PROCESANDO...</span> : <span>ANALIZAR Y GUARDAR PROSPECTOS</span>}
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-2xl">
                  <h3 className="font-black text-xl mb-8">Métricas Globales</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">Total Leads</p>
                      <p className="text-4xl font-black">{leads.length}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-1">Lotes Listos</p>
                      <p className="text-4xl font-black">{batchesCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[600px]">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar (Nombre, Ciudad, Representante, Correo)..."
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none text-sm font-medium transition-all"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <button onClick={handleClearDatabase} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold">Vaciar Base</button>
                  <div className="text-xs font-bold text-blue-600">{filteredLeads.length} resultados</div>
                </div>
              </div>
              <LeadTable leads={filteredLeads} onSelectLead={handleViewLetter} />
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-8">
              {selectedBatchIndex === null ? (
                <>
                  <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                    <h3 className="text-4xl font-black mb-4">Segmentación por Lotes</h3>
                    <p className="text-slate-400 text-lg">Distribución de prospectos en lotes de 100 sin duplicados para campañas optimizadas.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {[...Array(batchesCount)].map((_, i) => (
                      <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col">
                        <div className="mb-8 flex-1">
                          <h4 className="font-black text-2xl text-slate-900 mb-2">Lote #{i + 1}</h4>
                          <p className="text-sm text-slate-500 font-medium">{Math.min(leads.length - (i*100), 100)} prospectos asignados.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setSelectedBatchIndex(i)} className="py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800">Gestionar</button>
                          <button 
                            onClick={() => {
                              const batch = leads.slice(i * 100, (i + 1) * 100);
                              const ws = XLSX.utils.json_to_sheet(batch);
                              const wb = XLSX.utils.book_new();
                              XLSX.utils.book_append_sheet(wb, ws, "Lote");
                              XLSX.writeFile(wb, `JGroupTech_Lote_${i+1}.xlsx`);
                            }} 
                            className="py-3.5 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-100 border border-slate-100"
                          >
                            Descargar
                          </button>
                        </div>
                      </div>
                    ))}
                    {batchesCount === 0 && <div className="col-span-full py-20 text-center text-slate-400">Sin datos para segmentar.</div>}
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

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 mb-10">Variables de Campaña</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">WhatsApp / Teléfono</label>
                      <input 
                        type="text" 
                        value={config.telefonoContacto}
                        onChange={(e) => setConfig({...config, telefonoContacto: e.target.value})}
                        className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Email Comercial</label>
                      <input 
                        type="email" 
                        value={config.emailComercial}
                        onChange={(e) => setConfig({...config, emailComercial: e.target.value})}
                        className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase mb-2">Vencimiento Oferta</label>
                      <input 
                        type="text" 
                        value={config.fechaLimite}
                        onChange={(e) => setConfig({...config, fechaLimite: e.target.value})}
                        className="w-full px-5 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all"
                      />
                    </div>
                  </div>
                </div>
                <button onClick={handleSaveConfig} className="px-12 py-4 bg-slate-900 text-white rounded-[1.25rem] font-black hover:bg-slate-800 flex items-center space-x-3">
                  <Save size={22} />
                  <span>GUARDAR CONFIGURACIÓN</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Proposition Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md no-print">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-10 py-6 bg-slate-50 border-b flex items-center justify-between">
              <h3 className="font-black text-xl text-slate-900">Propuesta: {selectedLead.nombreEmpresa}</h3>
              <button onClick={() => setSelectedLead(null)} className="p-2.5 hover:bg-slate-200 rounded-full">
                <ChevronRight size={28} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 bg-[#fafafa]">
              {isLoading ? <div className="text-center py-20 font-bold animate-pulse">Generando...</div> : (
                <div className="prose-lg max-w-none text-slate-800 leading-relaxed font-serif bg-white p-12 shadow-2xl rounded-xl border mx-auto max-w-[800px]">
                  <div className="whitespace-pre-wrap">{letterContent}</div>
                </div>
              )}
            </div>
            <div className="px-10 py-6 bg-slate-50 border-t flex items-center justify-end space-x-6">
              <button onClick={() => setSelectedLead(null)} className="px-8 py-3 text-slate-500 font-bold">Cerrar</button>
              <button onClick={() => window.print()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center space-x-3">
                <FileText size={20} />
                <span>IMPRIMIR / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Layer */}
      <div className="hidden print-only p-12 font-serif text-lg bg-white">
        <div className="whitespace-pre-wrap">{letterContent}</div>
      </div>
    </div>
  );
};

export default App;
