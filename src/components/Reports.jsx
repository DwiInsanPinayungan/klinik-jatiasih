import React, { useState, useEffect } from 'react';
import { FileBarChart, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [penjaminFilter, setPenjaminFilter] = useState('');

  const [data, setData] = useState({ summary: {}, detail: [] });
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        penjamin: penjaminFilter
      }).toString();

      const res = await fetch(`/api/rekapitulasi?${query}`);
      const result = await res.json();
      if (result.success) {
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate, penjaminFilter]);

  // Preset Periode Shortcuts
  const setTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
  };

  const setMonthFilter = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setPenjaminFilter('');
  };

  const { summary = {}, detail = [] } = data;

  const filterInfo = {
    periode: startDate && endDate ? `${startDate} s/d ${endDate}` : (startDate ? `Sejak ${startDate}` : 'Semua Periode (REQ-05)'),
    penjamin: penjaminFilter || 'Semua Penjamin (Umum & BPJS - REQ-06)'
  };

  const handleExportExcel = () => {
    if (!detail || detail.length === 0) {
      alert('Tidak ada data kunjungan untuk periode filter ini.');
    }
    exportToExcel(detail, summary, filterInfo);
  };

  const handleExportPDF = () => {
    if (!detail || detail.length === 0) {
      alert('Tidak ada data kunjungan untuk periode filter ini.');
    }
    exportToPDF(detail, summary, filterInfo);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <FileBarChart className="w-6 h-6 text-sky-600" />
            <span>Rekapitulasi & Pelaporan Kunjungan Pasien</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Klinik Utama Jati Asih Medika &bull; Memenuhi REQ-05, REQ-06, REQ-07, REQ-08, dan REQ-09.
          </p>
        </div>

        {/* Export Buttons (REQ-09) */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 active:scale-95 transition flex items-center space-x-2 shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (REQ-09)</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 active:scale-95 transition flex items-center space-x-2 shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF (REQ-09)</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar (REQ-05 & REQ-06) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>Filter Laporan Rekapitulasi</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={setTodayFilter}
              className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg hover:bg-sky-100"
            >
              Hari Ini
            </button>
            <button
              onClick={setMonthFilter}
              className="text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg hover:bg-sky-100"
            >
              Bulan Ini
            </button>
            <button
              onClick={clearFilter}
              className="text-xs text-slate-500 hover:text-slate-700 underline font-medium"
            >
              Reset Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Tanggal Awal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Periode Tanggal Awal (REQ-05)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Tanggal Akhir */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Periode Tanggal Akhir (REQ-05)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Filter Penjamin (REQ-06) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Filter Penjamin (REQ-06)</label>
            <select
              value={penjaminFilter}
              onChange={(e) => setPenjaminFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            >
              <option value="">Semua Penjamin (Umum & BPJS/JKN)</option>
              <option value="BPJS/JKN">BPJS / JKN Saja</option>
              <option value="Umum">Umum Saja</option>
            </select>
          </div>

        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Kunjungan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Kunjungan</p>
          <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{summary.totalKunjungan || 0}</h3>
          <p className="text-xs text-slate-400 mt-1">Pasien Baru: {summary.statusCounts?.Baru || 0} &bull; Lama: {summary.statusCounts?.Lama || 0}</p>
        </div>

        {/* Penjamin Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Penjamin (REQ-06)</p>
          <div className="flex justify-between items-baseline mt-1">
            <div>
              <span className="text-2xl font-extrabold text-indigo-600">{summary.penjaminCounts?.['BPJS/JKN'] || 0}</span>
              <span className="text-xs text-slate-500 block">BPJS / JKN</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-emerald-600">{summary.penjaminCounts?.Umum || 0}</span>
              <span className="text-xs text-slate-500 block">Umum</span>
            </div>
          </div>
        </div>

        {/* Gender Breakdown (REQ-07) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Jenis Kelamin (REQ-07)</p>
          <div className="flex justify-between items-baseline mt-1">
            <div>
              <span className="text-2xl font-extrabold text-blue-600">{summary.genderCounts?.L || 0}</span>
              <span className="text-xs text-slate-500 block">Laki-Laki (L)</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-pink-600">{summary.genderCounts?.P || 0}</span>
              <span className="text-xs text-slate-500 block">Perempuan (P)</span>
            </div>
          </div>
        </div>

        {/* Rentang Usia (REQ-08) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Kelompok Usia (REQ-08)</p>
          <p className="text-xs text-slate-600 mt-2 font-medium">
            Dominan: {
              Object.entries(summary.ageGroupCounts || {})
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
            }
          </p>
          <span className="text-[11px] text-sky-600 font-semibold mt-1 block">5 Kategori Usia Klinik</span>
        </div>

      </div>

      {/* Tabel Detail Rekapitulasi */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-3">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Tabel Rincian Rekapitulasi Pasien</h3>
          <span className="text-xs text-slate-400">Diurutkan berdasarkan tanggal kunjungan</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat rekapitulasi...</div>
        ) : detail.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Tidak ada data untuk periode filter ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">No. Reg / Tgl</th>
                  <th className="px-4 py-3">No. RM</th>
                  <th className="px-4 py-3">Nama Pasien</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Gender (REQ-07)</th>
                  <th className="px-4 py-3">Usia & Kategori (REQ-08)</th>
                  <th className="px-4 py-3">Poli / Dokter</th>
                  <th className="px-4 py-3">Penjamin (REQ-06)</th>
                  <th className="px-4 py-3">Tindakan Medis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono">
                      <span className="font-bold text-slate-800">{item.no_registrasi}</span>
                      <p className="text-slate-400 text-[11px]">{item.tanggal_kunjungan}</p>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-sky-700">{item.no_rm}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{item.nama_pasien}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.status_pasien === 'Baru' ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {item.status_pasien}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {item.jenis_kelamin === 'L' ? <span className="text-blue-600">Laki-Laki</span> : <span className="text-pink-600">Perempuan</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-700">{item.usia} th</span>
                      <p className="text-slate-400 text-[11px]">{item.rentang_usia}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{item.nama_poli}</span>
                      <p className="text-slate-400 text-[11px]">{item.nama_dokter}</p>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      <span className={item.penjamin === 'BPJS/JKN' ? 'text-indigo-600' : 'text-emerald-600'}>
                        {item.penjamin}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.tindakan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
