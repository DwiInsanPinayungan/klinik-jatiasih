import React, { useEffect, useState } from 'react';
import { Users, UserCheck, ShieldCheck, UserPlus, HeartPulse, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/rekapitulasi');
      const result = await res.json();
      if (result.success) {
        setData(result.summary);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!data) return null;

  // Chart Data Configurations
  const statusChartData = {
    labels: ['Pasien Baru', 'Pasien Lama'],
    datasets: [{
      data: [data.statusCounts?.Baru || 0, data.statusCounts?.Lama || 0],
      backgroundColor: ['#0284c7', '#38bdf8'],
      borderWidth: 0
    }]
  };

  const penjaminChartData = {
    labels: ['Umum', 'BPJS / JKN'],
    datasets: [{
      data: [data.penjaminCounts?.Umum || 0, data.penjaminCounts?.['BPJS/JKN'] || 0],
      backgroundColor: ['#10b981', '#6366f1'],
      borderWidth: 0
    }]
  };

  const genderChartData = {
    labels: ['Laki-Laki (L)', 'Perempuan (P)'],
    datasets: [{
      data: [data.genderCounts?.L || 0, data.genderCounts?.P || 0],
      backgroundColor: ['#3b82f6', '#ec4899'],
      borderWidth: 0
    }]
  };

  const ageChartData = {
    labels: Object.keys(data.ageGroupCounts || {}),
    datasets: [{
      label: 'Jumlah Pasien',
      data: Object.values(data.ageGroupCounts || {}),
      backgroundColor: ['#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'],
      borderRadius: 6
    }]
  };

  const poliChartData = {
    labels: Object.keys(data.poliCounts || {}),
    datasets: [{
      label: 'Jumlah Kunjungan',
      data: Object.values(data.poliCounts || {}),
      backgroundColor: '#0284c7',
      borderRadius: 6
    }]
  };

  return (
    <div className="space-y-6">
      
      {/* Banner / Greeting */}
      <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-sky-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Dashboard Rekapitulasi Kunjungan Pasien
          </h2>
          <p className="text-sky-100 text-sm mt-1">
            Klinik Utama Jati Asih Medika &bull; Pemantauan Real-Time Pasien Baru, Pasien Lama, Penjamin, & Demografi.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('pendaftaran')}
          className="bg-white text-sky-800 font-semibold px-5 py-2.5 rounded-xl hover:bg-sky-50 transition-all duration-200 flex items-center space-x-2 shadow-sm shrink-0"
        >
          <UserPlus className="w-5 h-5 text-sky-600" />
          <span>+ Daftar Kunjungan Pasien</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Kunjungan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kunjungan</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{data.totalKunjungan}</h3>
            <span className="text-xs text-sky-600 font-medium mt-1 inline-block">Keseluruhan Pasien</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Pasien Baru vs Lama */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pasien Baru / Lama</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-sky-600">{data.statusCounts?.Baru || 0}</span>
              <span className="text-xs text-slate-400 font-normal">Baru</span>
              <span className="text-slate-300">/</span>
              <span className="text-2xl font-extrabold text-sky-800">{data.statusCounts?.Lama || 0}</span>
              <span className="text-xs text-slate-400 font-normal">Lama</span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-1 inline-block">REQ-03 Status Riwayat</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Penjamin BPJS vs Umum */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Penjamin BPJS / Umum</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-indigo-600">{data.penjaminCounts?.['BPJS/JKN'] || 0}</span>
              <span className="text-xs text-slate-400 font-normal">BPJS</span>
              <span className="text-slate-300">/</span>
              <span className="text-2xl font-extrabold text-emerald-600">{data.penjaminCounts?.Umum || 0}</span>
              <span className="text-xs text-slate-400 font-normal">Umum</span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-1 inline-block">REQ-06 Filter Penjamin</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Gender Laki / Perempuan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Demografi Gender</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-extrabold text-blue-600">{data.genderCounts?.L || 0}</span>
              <span className="text-xs text-slate-400 font-normal">L</span>
              <span className="text-slate-300">/</span>
              <span className="text-2xl font-extrabold text-pink-500">{data.genderCounts?.P || 0}</span>
              <span className="text-xs text-slate-400 font-normal">P</span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-1 inline-block">REQ-07 Jenis Kelamin</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Visualisation Charts Section (REQ-10) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Doughnut: Pasien Baru vs Pasien Lama */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-sky-600" />
              <span>Pasien Baru vs Pasien Lama</span>
            </h3>
            <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">REQ-03</span>
          </div>
          <div className="w-48 h-48 mx-auto my-2">
            <Doughnut data={statusChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-around text-center">
            <div>
              <p className="font-bold text-sky-600 text-sm">{data.statusCounts?.Baru || 0}</p>
              <p>Pasien Baru</p>
            </div>
            <div>
              <p className="font-bold text-sky-800 text-sm">{data.statusCounts?.Lama || 0}</p>
              <p>Pasien Lama</p>
            </div>
          </div>
        </div>

        {/* Pie: Penjamin Umum vs BPJS/JKN */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Distribusi Penjamin</span>
            </h3>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">REQ-06</span>
          </div>
          <div className="w-48 h-48 mx-auto my-2">
            <Pie data={penjaminChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-around text-center">
            <div>
              <p className="font-bold text-emerald-600 text-sm">{data.penjaminCounts?.Umum || 0}</p>
              <p>Umum</p>
            </div>
            <div>
              <p className="font-bold text-indigo-600 text-sm">{data.penjaminCounts?.['BPJS/JKN'] || 0}</p>
              <p>BPJS / JKN</p>
            </div>
          </div>
        </div>

        {/* Doughnut: Gender L/P */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
              <HeartPulse className="w-5 h-5 text-pink-500" />
              <span>Proporsi Jenis Kelamin</span>
            </h3>
            <span className="text-xs font-semibold bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full">REQ-07</span>
          </div>
          <div className="w-48 h-48 mx-auto my-2">
            <Doughnut data={genderChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-around text-center">
            <div>
              <p className="font-bold text-blue-600 text-sm">{data.genderCounts?.L || 0}</p>
              <p>Laki-Laki</p>
            </div>
            <div>
              <p className="font-bold text-pink-600 text-sm">{data.genderCounts?.P || 0}</p>
              <p>Perempuan</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bar Charts Row: Rentang Usia & Per Poli */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Rentang Usia Pasien (REQ-08) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <span>Rekapitulasi Kunjungan Berdasarkan Rentang Usia</span>
            </h3>
            <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">REQ-08</span>
          </div>
          <div className="h-64">
            <Bar data={ageChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        {/* Bar Chart: Kunjungan per Poli / Pelayanan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-sky-600" />
              <span>Distribusi Kunjungan per Poli / Pelayanan</span>
            </h3>
            <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full">REQ-02</span>
          </div>
          <div className="h-64">
            <Bar data={poliChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

      </div>

    </div>
  );
}
