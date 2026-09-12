import React, { useState, useEffect } from 'react';
import { Search, Edit3, Trash2, Calendar, UserCheck, ShieldCheck, Stethoscope, CheckCircle2, X } from 'lucide-react';

export default function VisitList() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [penjaminFilter, setPenjaminFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Master lists for modal dropdowns
  const [poliList, setPoliList] = useState([]);
  const [dokterList, setDokterList] = useState([]);

  // Edit Modal state (REQ-04)
  const [editingVisit, setEditingVisit] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        penjamin: penjaminFilter,
        status_pasien: statusFilter
      }).toString();

      const res = await fetch(`/api/kunjungan?${query}`);
      const data = await res.json();
      if (data.success) {
        setVisits(data.data);
      }
    } catch (err) {
      console.error('Error fetching visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/master')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setPoliList(res.poli);
          setDokterList(res.dokter);
        }
      });
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [search, penjaminFilter, statusFilter]);

  // Open Edit Modal (REQ-04)
  const handleEditClick = (visit) => {
    setEditingVisit(visit);
    setEditForm({
      tanggal_kunjungan: visit.tanggal_kunjungan,
      waktu_kunjungan: visit.waktu_kunjungan,
      poli_id: visit.poli_id,
      dokter_id: visit.dokter_id,
      penjamin: visit.penjamin,
      no_kartu_penjamin: visit.no_kartu_penjamin || '',
      tindakan: visit.tindakan || '',
      catatan: visit.catatan || '',
      status_pasien: visit.status_pasien
    });
  };

  // Save Perbaikan Data (REQ-04)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/kunjungan/${editingVisit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        setEditingVisit(null);
        fetchVisits();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Gagal memperbaiki data: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Visit
  const handleDeleteVisit = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data kunjungan ini?')) return;
    try {
      const res = await fetch(`/api/kunjungan/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchVisits();
      }
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-sky-600" />
              <span>Kelola & Edit Data Kunjungan Pasien</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              REQ-04: Fasilitas Perbaikan/Ubah Data Kunjungan sebelum masuk Rekapitulasi Laporan.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
            Total {visits.length} Kunjungan
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari Nama, No. RM, Reg..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
            />
          </div>

          <select
            value={penjaminFilter}
            onChange={(e) => setPenjaminFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          >
            <option value="">Semua Penjamin (REQ-06)</option>
            <option value="BPJS/JKN">BPJS / JKN</option>
            <option value="Umum">Umum</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          >
            <option value="">Semua Status Pasien (REQ-03)</option>
            <option value="Baru">Pasien Baru</option>
            <option value="Lama">Pasien Lama</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat data kunjungan...</div>
        ) : visits.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Tidak ada data kunjungan pasien ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">No. Reg / Tgl</th>
                  <th className="px-4 py-3.5">Pasien & No. RM</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Gender / Usia</th>
                  <th className="px-4 py-3.5">Poli & Dokter</th>
                  <th className="px-4 py-3.5">Penjamin</th>
                  <th className="px-4 py-3.5">Tindakan</th>
                  <th className="px-4 py-3.5 text-center">Aksi (REQ-04)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map(v => (
                  <tr key={v.id} className="hover:bg-sky-50/50 transition">
                    
                    <td className="px-4 py-3 font-mono">
                      <span className="font-bold text-slate-800">{v.no_registrasi}</span>
                      <p className="text-slate-400 text-[11px]">{v.tanggal_kunjungan} ({v.waktu_kunjungan})</p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-bold text-sky-700 text-sm">{v.nama_pasien}</span>
                      <p className="text-slate-500 font-mono text-[11px]">{v.no_rm}</p>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        v.status_pasien === 'Baru'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        Pasien {v.status_pasien}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700">{v.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</span>
                      <p className="text-slate-500 text-[11px]">{v.usia} th ({v.rentang_usia})</p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{v.nama_poli}</span>
                      <p className="text-slate-500 text-[11px]">{v.nama_dokter}</p>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        v.penjamin === 'BPJS/JKN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {v.penjamin}
                      </span>
                    </td>

                    <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                      {v.tindakan || '-'}
                    </td>

                    {/* Aksi Perbaiki Data (REQ-04) */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(v)}
                          title="Perbaiki Data Kunjungan (REQ-04)"
                          className="p-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition flex items-center space-x-1 font-semibold"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteVisit(v.id)}
                          title="Hapus Kunjungan"
                          className="p-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PERBAIKI DATA KUNJUNGAN (REQ-04) */}
      {editingVisit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-amber-500" />
                  <span>Perbaiki Data Kunjungan (REQ-04)</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{editingVisit.no_registrasi} - {editingVisit.nama_pasien}</p>
              </div>
              <button
                onClick={() => setEditingVisit(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Kunjungan</label>
                  <input
                    type="date"
                    value={editForm.tanggal_kunjungan}
                    onChange={(e) => setEditForm({ ...editForm, tanggal_kunjungan: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Waktu</label>
                  <input
                    type="time"
                    value={editForm.waktu_kunjungan}
                    onChange={(e) => setEditForm({ ...editForm, waktu_kunjungan: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Pasien (REQ-03)</label>
                  <select
                    value={editForm.status_pasien}
                    onChange={(e) => setEditForm({ ...editForm, status_pasien: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="Baru">Pasien Baru</option>
                    <option value="Lama">Pasien Lama</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penjamin (REQ-06)</label>
                  <select
                    value={editForm.penjamin}
                    onChange={(e) => setEditForm({ ...editForm, penjamin: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    <option value="BPJS/JKN">BPJS / JKN</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Poli / Pelayanan</label>
                  <select
                    value={editForm.poli_id}
                    onChange={(e) => setEditForm({ ...editForm, poli_id: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    {poliList.map(p => (
                      <option key={p.id} value={p.id}>{p.nama_poli}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dokter</label>
                  <select
                    value={editForm.dokter_id}
                    onChange={(e) => setEditForm({ ...editForm, dokter_id: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  >
                    {dokterList.map(d => (
                      <option key={d.id} value={d.id}>{d.nama_dokter}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tindakan Medis</label>
                <input
                  type="text"
                  value={editForm.tindakan}
                  onChange={(e) => setEditForm({ ...editForm, tindakan: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={editForm.catatan}
                  onChange={(e) => setEditForm({ ...editForm, catatan: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVisit(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-700 shadow-sm"
                >
                  {savingEdit ? 'Menyimpan...' : 'Simpan Perbaikan'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
