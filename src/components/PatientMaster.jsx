import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Phone, MapPin, CreditCard, Calendar, Hash } from 'lucide-react';

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
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Users className="w-6 h-6 text-sky-600" />
            <span>Master Data Pasien</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Klinik Utama Jati Asih Medika &bull; Database Pasien Terdaftar & Rekam Medis.
          </p>
        </div>

        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari Nama, No. RM, NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Memuat database pasien...</div>
      ) : patients.length === 0 ? (
        <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Tidak ada data pasien terdaftar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {patients.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-3">
              
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">{p.nama}</h3>
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 mt-1 inline-block">
                    {p.no_rm}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  p.jenis_kelamin === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                }`}>
                  {p.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Tgl Lahir: <strong className="text-slate-800">{p.tanggal_lahir}</strong> ({getAge(p.tanggal_lahir)} tahun)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>NIK: <strong className="text-slate-800">{p.nik || '-'}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>No. BPJS: <strong className="text-slate-800">{p.no_bpjs || '-'}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>HP: <strong className="text-slate-800">{p.no_hp || '-'}</strong></span>
                </div>
                <div className="flex items-start space-x-2 pt-1">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{p.alamat || '-'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => onSelectPasien(p)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
                >
                  <span>Daftarkan Kunjungan &rarr;</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
