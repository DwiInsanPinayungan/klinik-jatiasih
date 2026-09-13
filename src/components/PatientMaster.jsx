import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Phone, MapPin, CreditCard, Calendar, Hash, ArrowRight } from 'lucide-react';

export default function PatientMaster({ onSelectPasien }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pasien?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.data);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  function getAge(birthDateStr) {
    if (!birthDateStr) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 0 ? 0 : age;
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Master Database Pasien
            </h2>
            <p className="text-xs text-sky-600 font-medium mt-0.5">
              Direktori seluruh pasien terdaftar dan riwayat rekam medis klinik.
            </p>
          </div>
        </div>

        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari Nama Pasien, No. RM, NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="p-12 text-center text-sky-600 font-semibold animate-pulse">Memuat database pasien...</div>
      ) : patients.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-sky-100">
          Tidak ada data pasien terdaftar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm hover:shadow-md transition-all duration-200 space-y-3.5 flex flex-col justify-between group">
              
              <div className="space-y-3">
                <div className="flex items-start justify-between border-b border-sky-100/70 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base group-hover:text-sky-700 transition-colors">{p.nama}</h3>
                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100 mt-1 inline-block">
                      {p.no_rm}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                    p.jenis_kelamin === 'L' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}>
                    {p.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>Tgl Lahir: <strong className="text-slate-800">{p.tanggal_lahir}</strong> ({getAge(p.tanggal_lahir)} th)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>NIK: <strong className="text-slate-800">{p.nik || '-'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>No. BPJS: <strong className="text-slate-800">{p.no_bpjs || '-'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                    <span>HP: <strong className="text-slate-800">{p.no_hp || '-'}</strong></span>
                  </div>
                  <div className="flex items-start space-x-2 pt-0.5">
                    <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-slate-500">{p.alamat || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-sky-100/70 flex justify-end">
                <button
                  onClick={() => onSelectPasien(p)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50/80 hover:bg-sky-100 px-3.5 py-1.5 rounded-xl border border-sky-100 transition-all flex items-center space-x-1.5 group-hover:bg-sky-600 group-hover:text-white"
                >
                  <span>Daftarkan Kunjungan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

