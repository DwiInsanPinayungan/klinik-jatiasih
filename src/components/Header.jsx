import React, { useState, useEffect } from 'react';
import { Activity, LayoutDashboard, UserPlus, ClipboardList, FileBarChart, Users, Database, Cross } from 'lucide-react';

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
    <header className="bg-white/90 backdrop-blur-md border-b border-sky-100 sticky top-0 z-30 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3.5 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-400 flex items-center justify-center text-white shadow-md shadow-sky-500/25 ring-4 ring-sky-50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sky-500/40 shrink-0">
              <Activity className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight leading-tight group-hover:text-sky-700 transition-colors">
                  KLINIK UTAMA JATI ASIH MEDIKA
                </h1>

                {/* Status Database Badge */}
                {dbStatus && (
                  <span className={`hidden lg:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-xs ${
                    dbStatus.is_mysql
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}>
                    <Database className="w-3 h-3" />
                    <span>DB: {dbStatus.engine}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-sky-600 font-semibold tracking-wide flex items-center space-x-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block"></span>
                <span>Sistem Pendaftaran & Rekapitulasi Kunjungan Pasien</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-sky-50/70 p-1.5 rounded-2xl border border-sky-100/80 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-sky-700 shadow-md shadow-sky-500/10 border border-sky-100 font-bold'
                      : 'text-slate-600 hover:text-sky-700 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto pb-3 pt-1 space-x-2 scrollbar-none border-t border-sky-100/60 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'bg-sky-50 text-slate-700 hover:bg-sky-100'
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

