import React, { useState, useEffect } from 'react';
import { UserPlus, Search, UserCheck, CheckCircle2, AlertCircle, Calendar, Clock, Stethoscope, ShieldCheck, FileText, Hash } from 'lucide-react';

export default function RegistrationForm({ onSuccess }) {
  const [isPasienBaru, setIsPasienBaru] = useState(true);
  const [poliList, setPoliList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  
  // Quick Search Pasien Lama
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPasien, setSelectedPasien] = useState(null);

  // Form Pasien Baru (REQ-01)
  const [pasienBaruForm, setPasienBaruForm] = useState({
    nama: '',
    nik: '',
    no_bpjs: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    alamat: '',
    no_hp: '',
    custom_no_rm: ''
  });

  // Form Data Kunjungan (REQ-02)
  const [kunjunganForm, setKunjunganForm] = useState({
    tanggal_kunjungan: new Date().toISOString().split('T')[0],
    waktu_kunjungan: new Date().toTimeString().split(' ')[0].substring(0, 5),
    poli_id: '',
    dokter_id: '',
    penjamin: 'BPJS/JKN',
    no_kartu_penjamin: '',
    tindakan: 'Pemeriksaan Medis & Konsultasi',
    catatan: ''
  });

  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Load Master Poli & Dokter
  useEffect(() => {
    fetch('/api/master')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setPoliList(res.poli);
          setDokterList(res.dokter);
          if (res.poli.length > 0) {
            setKunjunganForm(prev => ({ ...prev, poli_id: res.poli[0].id }));
          }
        }
      });
  }, []);

  // Filter Dokter saat Poli berubah
  const filteredDokter = dokterList.filter(
    d => !kunjunganForm.poli_id || d.poli_id === Number(kunjunganForm.poli_id)
  );

  useEffect(() => {
    if (filteredDokter.length > 0 && !filteredDokter.some(d => d.id === Number(kunjunganForm.dokter_id))) {
      setKunjunganForm(prev => ({ ...prev, dokter_id: filteredDokter[0].id }));
    }
  }, [kunjunganForm.poli_id, dokterList]);

  // Search Pasien Lama
  useEffect(() => {
    if (!isPasienBaru && searchQuery.trim().length >= 2) {
      fetch(`/api/pasien?search=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(res => {
          if (res.success) setSearchResults(res.data);
        });
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, isPasienBaru]);

  // Handler Submit Pendaftaran Kunjungan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMsg(null);

    try {
      let targetPasienId = null;

      if (isPasienBaru) {
        // Step 1: Input Pasien Baru (REQ-01)
        if (!pasienBaruForm.nama || !pasienBaruForm.tanggal_lahir) {
          setAlertMsg({ type: 'error', text: 'Nama Pasien dan Tanggal Lahir wajib diisi.' });
          setLoading(false);
          return;
        }

        const pasienRes = await fetch('/api/pasien', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pasienBaruForm)
        });
        const pasienData = await pasienRes.json();

        if (!pasienData.success) {
          setAlertMsg({ type: 'error', text: pasienData.message });
          setLoading(false);
          return;
        }

        targetPasienId = pasienData.data.id;
      } else {
        // Pasien Lama
        if (!selectedPasien) {
          setAlertMsg({ type: 'error', text: 'Silakan pilih pasien lama terlebih dahulu.' });
          setLoading(false);
          return;
        }
        targetPasienId = selectedPasien.id;
      }

      // Step 2: Input Data Kunjungan (REQ-02 & REQ-03)
      const visitPayload = {
        ...kunjunganForm,
        pasien_id: targetPasienId,
        no_kartu_penjamin: kunjunganForm.penjamin === 'BPJS/JKN' ? (kunjunganForm.no_kartu_penjamin || (selectedPasien?.no_bpjs || pasienBaruForm.no_bpjs)) : ''
      };

      const visitRes = await fetch('/api/kunjungan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitPayload)
      });
      const visitData = await visitRes.json();

      if (visitData.success) {
        setAlertMsg({
          type: 'success',
          text: `Pendaftaran berhasil! Registrasi No: ${visitData.no_registrasi} (${visitData.status_pasien === 'Baru' ? 'Pasien Baru (REQ-01)' : 'Pasien Lama (REQ-03)'}).`
        });

        // Reset form
        setPasienBaruForm({
          nama: '', nik: '', no_bpjs: '', tanggal_lahir: '', jenis_kelamin: 'L', alamat: '', no_hp: '', custom_no_rm: ''
        });
        setSelectedPasien(null);
        setSearchQuery('');

        if (onSuccess) onSuccess();
      } else {
        setAlertMsg({ type: 'error', text: visitData.message });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: 'Terjadi kesalahan sistem: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <UserPlus className="w-6 h-6 text-sky-600" />
            <span>Form Pendaftaran & Pencatatan Kunjungan Pasien</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Klinik Utama Jati Asih Medika &bull; Alur Pendaftaran sesuai Flowchart Observasi & Interview.
          </p>
        </div>

        {/* Toggle Mode Pasien Baru vs Pasien Lama */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => { setIsPasienBaru(true); setSelectedPasien(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              isPasienBaru
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Pasien Baru (REQ-01)
          </button>
          <button
            type="button"
            onClick={() => { setIsPasienBaru(false); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              !isPasienBaru
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Search Pasien Lama (REQ-03)
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-3 ${
          alertMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {alertMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* SECTION 1: DATA PASIEN */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-sky-600" />
              <span>1. DATA PASIEN</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700">
              {isPasienBaru ? 'Pasien Baru' : 'Pasien Lama'}
            </span>
          </div>

          {/* Mode Pasien Baru */}
          {isPasienBaru ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Pasien <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Andi Pratama"
                  value={pasienBaruForm.nama}
                  onChange={(e) => setPasienBaruForm({ ...pasienBaruForm, nama: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Rekam Medis (Auto / Custom)
                </label>
                <input
                  type="text"
                  placeholder="Kosongkan untuk No. RM Otomatis (RM-2026-XXXX)"
                  value={pasienBaruForm.custom_no_rm}
                  onChange={(e) => setPasienBaruForm({ ...pasienBaruForm, custom_no_rm: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={pasienBaruForm.tanggal_lahir}
                  onChange={(e) => setPasienBaruForm({ ...pasienBaruForm, tanggal_lahir: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select
                  value={pasienBaruForm.jenis_kelamin}
                  onChange={(e) => setPasienBaruForm({ ...pasienBaruForm, jenis_kelamin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                >
                  <option value="L">Laki-Laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIK (KTP)</label>
                <input
                  type="text"
                  placeholder="3275xxxxxxxxxxxx"
                  value={pasienBaruForm.nik}
                  onChange={(e) => setPasienBaruForm({ ...pasienBaruForm, nik: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. BPJS / JKN</label>
                <input
                  type="text"
                  placeholder="000xxxxxxxxxxxx"
                  value={pasienBaruForm.no_bpjs}
                  onChange={(e) => setPasienBaruForm({ ...pasienBaruForm, no_bpjs: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. Handphone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={pasienBaruForm.no_hp}
                  onChange={(e) => setPasienBaruForm({ ...pasienBaruForm, no_hp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  placeholder="Jl. Jati Asih No..."
                  value={pasienBaruForm.alamat}
                  onChange={(e) => setPasienBaruForm({ ...pasienBaruForm, alamat: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          ) : (
            /* Mode Pasien Lama - Search & Auto-Select */
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cari Pasien Lama (Ketik Nama / No. RM / NIK)
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Contoh: Andi, RM-2026-0001, atau 3275..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Dropdown Live Results */}
              {searchResults.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedPasien(p); setSearchResults([]); setSearchQuery(p.nama); }}
                      className="p-3 hover:bg-sky-50 cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800 text-sm">{p.nama}</span>
                        <span className="text-xs text-sky-700 ml-2 font-mono bg-sky-100 px-2 py-0.5 rounded">{p.no_rm}</span>
                        <p className="text-xs text-slate-500">NIK: {p.nik || '-'} &bull; Tgl Lahir: {p.tanggal_lahir}</p>
                      </div>
                      <span className="text-xs font-semibold text-sky-600">Pilih &rarr;</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Pasien Card */}
              {selectedPasien && (
                <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Pasien Terpilih:</span>
                    <h4 className="text-base font-extrabold text-slate-800">{selectedPasien.nama} ({selectedPasien.no_rm})</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Gender: {selectedPasien.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'} &bull; Lahir: {selectedPasien.tanggal_lahir} &bull; BPJS: {selectedPasien.no_bpjs || '-'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPasien(null)}
                    className="text-xs text-red-600 underline font-semibold hover:text-red-800"
                  >
                    Ganti Pasien
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: DATA KUNJUNGAN (REQ-02) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-sky-600" />
              <span>2. DATA KUNJUNGAN & MEDIS</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">REQ-02</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tanggal & Waktu */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Kunjungan</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={kunjunganForm.tanggal_kunjungan}
                  onChange={(e) => setKunjunganForm({ ...kunjunganForm, tanggal_kunjungan: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu Kunjungan</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="time"
                  required
                  value={kunjunganForm.waktu_kunjungan}
                  onChange={(e) => setKunjunganForm({ ...kunjunganForm, waktu_kunjungan: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            {/* Pelayanan / Poli */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pelayanan / Poli Tujuan <span className="text-red-500">*</span></label>
              <select
                required
                value={kunjunganForm.poli_id}
                onChange={(e) => setKunjunganForm({ ...kunjunganForm, poli_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              >
                {poliList.map(p => (
                  <option key={p.id} value={p.id}>{p.nama_poli}</option>
                ))}
              </select>
            </div>

            {/* Dokter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dokter Pemeriksa <span className="text-red-500">*</span></label>
              <select
                required
                value={kunjunganForm.dokter_id}
                onChange={(e) => setKunjunganForm({ ...kunjunganForm, dokter_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              >
                {filteredDokter.map(d => (
                  <option key={d.id} value={d.id}>{d.nama_dokter} ({d.spesialisasi})</option>
                ))}
              </select>
            </div>

            {/* Penjamin (REQ-06) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Penjamin / Pembayaran <span className="text-red-500">*</span></label>
              <select
                required
                value={kunjunganForm.penjamin}
                onChange={(e) => setKunjunganForm({ ...kunjunganForm, penjamin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              >
                <option value="BPJS/JKN">BPJS / JKN (REQ-06)</option>
                <option value="Umum">Umum (REQ-06)</option>
              </select>
            </div>

            {/* No. Kartu BPJS (Jika BPJS) */}
            {kunjunganForm.penjamin === 'BPJS/JKN' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. Kartu BPJS / JKN</label>
                <input
                  type="text"
                  placeholder="000xxxxxxxxxxxx"
                  value={kunjunganForm.no_kartu_penjamin || selectedPasien?.no_bpjs || pasienBaruForm.no_bpjs}
                  onChange={(e) => setKunjunganForm({ ...kunjunganForm, no_kartu_penjamin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                />
              </div>
            )}

            {/* Tindakan */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tindakan / Pelayanan Medis</label>
              <input
                type="text"
                placeholder="Contoh: Pemeriksaan Umum, Imunisasi, Penambalan Gigi..."
                value={kunjunganForm.tindakan}
                onChange={(e) => setKunjunganForm({ ...kunjunganForm, tindakan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

            {/* Catatan Medis */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan / Keluhan Utama</label>
              <textarea
                rows={2}
                placeholder="Keluhan pasien atau catatan administrasi..."
                value={kunjunganForm.catatan}
                onChange={(e) => setKunjunganForm({ ...kunjunganForm, catatan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-sky-600 to-sky-700 text-white font-bold rounded-xl shadow-md hover:from-sky-700 hover:to-sky-800 transition duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>SIMPAN DATA KUNJUNGAN</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
