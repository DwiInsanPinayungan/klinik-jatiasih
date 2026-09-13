import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RegistrationForm from './components/RegistrationForm';
import VisitList from './components/VisitList';
import Reports from './components/Reports';
import PatientMaster from './components/PatientMaster';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'pendaftaran' && (
          <RegistrationForm onSuccess={() => setActiveTab('riwayat')} />
        )}
        {activeTab === 'riwayat' && <VisitList />}
        {activeTab === 'laporan' && <Reports />}
        {activeTab === 'pasien' && (
          <PatientMaster onSelectPasien={() => setActiveTab('pendaftaran')} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-sky-100 py-6 mt-16 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block animate-pulse"></span>
            <p className="font-bold text-slate-700 text-sm tracking-wide">KLINIK UTAMA JATI ASIH MEDIKA</p>
          </div>
          <p className="text-slate-500">Sistem Informasi Pendaftaran Pasien & Rekapitulasi Laporan Kunjungan &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}

