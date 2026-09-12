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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">KLINIK UTAMA JATI ASIH MEDIKA &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">Sistem Input/Pendaftaran Pasien & Rekapitulasi Laporan (REQ-01 s/d REQ-10)</p>
        </div>
      </footer>
    </div>
  );
}
