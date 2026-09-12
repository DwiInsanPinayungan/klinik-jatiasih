import React, { useState, useEffect } from 'react';
import { Activity, LayoutDashboard, UserPlus, ClipboardList, FileBarChart, Users, Database } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const [dbStatus, setDbStatus] = useState(null);

  useEffect(() => {
    fetch('/api/database-status')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDbStatus(data);
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pendaftaran', label: 'Pendaftaran Kunjungan', icon: UserPlus },
    { id: 'riwayat', label: 'Data Kunjungan', icon: ClipboardList },
    { id: 'laporan', label: 'Laporan & Rekapitulasi', icon: FileBarChart },
    { id: 'pasien', label: 'Master Pasien', icon: Users },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              <Activity className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                  KLINIK UTAMA JATI ASIH MEDIKA
                </h1>

                {/* Status Database Badge */}
                {dbStatus && (
                  <span className={`hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                    dbStatus.is_mysql
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-sky-100 text-sky-800 border border-sky-300'
                  }`}>
                    <Database className="w-3 h-3" />
                    <span>DB: {dbStatus.engine}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-sky-600 font-semibold tracking-wide uppercase">
                Sistem Pendaftaran & Rekapitulasi Kunjungan Pasien
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-sky-700 shadow-sm border border-slate-200/60 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto pb-3 pt-1 space-x-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
