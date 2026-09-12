import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../klinik_db.json');

// Initial seed data
const initialData = {
  pasien: [
    {
      id: 1,
      no_rm: 'RM-2026-0001',
      nama: 'Andi Pratama',
      nik: '3275011205900001',
      no_bpjs: '0001234567891',
      tanggal_lahir: '1990-05-12',
      jenis_kelamin: 'L',
      alamat: 'Jl. Jati Asih No. 12, Bekasi',
      no_hp: '081234567890',
      created_at: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 2,
      no_rm: 'RM-2026-0002',
      nama: 'Siti Nurhaliza',
      nik: '3275015508850002',
      no_bpjs: '',
      tanggal_lahir: '1985-08-15',
      jenis_kelamin: 'P',
      alamat: 'Jl. Kp. Sawah No. 45, Bekasi',
      no_hp: '081987654321',
      created_at: '2026-09-02T09:00:00.000Z'
    },
    {
      id: 3,
      no_rm: 'RM-2026-0003',
      nama: 'Muhammad Rizky',
      nik: '3275012010210003',
      no_bpjs: '0009876543210',
      tanggal_lahir: '2021-10-20',
      jenis_kelamin: 'L',
      alamat: 'Jl. Ratna No. 8, Jati Asih',
      no_hp: '085711223344',
      created_at: '2026-09-03T10:00:00.000Z'
    },
    {
      id: 4,
      no_rm: 'RM-2026-0004',
      nama: 'Eka Suryani',
      nik: '3275014304600004',
      no_bpjs: '',
      tanggal_lahir: '1960-04-03',
      jenis_kelamin: 'P',
      alamat: 'Jl. Wibawa Mukti II No. 19, Bekasi',
      no_hp: '081399887766',
      created_at: '2026-09-04T11:00:00.000Z'
    }
  ],
  poli: [
    { id: 1, nama_poli: 'Poli Umum' },
    { id: 2, nama_poli: 'Poli Gigi' },
    { id: 3, nama_poli: 'Poli KIA & Anak' },
    { id: 4, nama_poli: 'Poli Penyakit Dalam' },
    { id: 5, nama_poli: 'Poli Kebidanan & Kandungan' }
  ],
  dokter: [
    { id: 1, nama_dokter: 'dr. Ahmad Hidayat', spesialisasi: 'Dokter Umum', poli_id: 1 },
    { id: 2, nama_dokter: 'dr. Siti Rahmawati', spesialisasi: 'Dokter Gigi', poli_id: 2 },
    { id: 3, nama_dokter: 'dr. Budi Santoso, Sp.A', spesialisasi: 'Spesialis Anak', poli_id: 3 },
    { id: 4, nama_dokter: 'dr. Hendra Wijaya, Sp.PD', spesialisasi: 'Spesialis Penyakit Dalam', poli_id: 4 },
    { id: 5, nama_dokter: 'dr. Dewi Lestari, Sp.OG', spesialisasi: 'Spesialis Kebidanan', poli_id: 5 }
  ],
  kunjungan: [
    {
      id: 1,
      no_registrasi: 'REG-20260910-001',
      tanggal_kunjungan: '2026-09-10',
      waktu_kunjungan: '08:30',
      pasien_id: 1,
      status_pasien: 'Baru',
      poli_id: 1,
      dokter_id: 1,
      penjamin: 'BPJS/JKN',
      no_kartu_penjamin: '0001234567891',
      tindakan: 'Pemeriksaan Rutin & Resep Obat',
      catatan: 'Pasien mengeluh demam',
      created_at: '2026-09-10T08:30:00.000Z'
    },
    {
      id: 2,
      no_registrasi: 'REG-20260911-001',
      tanggal_kunjungan: '2026-09-11',
      waktu_kunjungan: '09:15',
      pasien_id: 2,
      status_pasien: 'Baru',
      poli_id: 2,
      dokter_id: 2,
      penjamin: 'Umum',
      no_kartu_penjamin: '',
      tindakan: 'Penambalan Gigi berlubang',
      catatan: 'Gigi geraham kanan',
      created_at: '2026-09-11T09:15:00.000Z'
    },
    {
      id: 3,
      no_registrasi: 'REG-20260911-002',
      tanggal_kunjungan: '2026-09-11',
      waktu_kunjungan: '10:00',
      pasien_id: 3,
      status_pasien: 'Baru',
      poli_id: 3,
      dokter_id: 3,
      penjamin: 'BPJS/JKN',
      no_kartu_penjamin: '0009876543210',
      tindakan: 'Imunisasi Balita',
      catatan: 'Batuk ringan',
      created_at: '2026-09-11T10:00:00.000Z'
    },
    {
      id: 4,
      no_registrasi: 'REG-20260912-001',
      tanggal_kunjungan: '2026-09-12',
      waktu_kunjungan: '08:00',
      pasien_id: 4,
      status_pasien: 'Baru',
      poli_id: 4,
      dokter_id: 4,
      penjamin: 'Umum',
      no_kartu_penjamin: '',
      tindakan: 'Pemeriksaan Hipertensi & EKG',
      catatan: 'Kontrol rutin Lansia',
      created_at: '2026-09-12T08:00:00.000Z'
    },
    {
      id: 5,
      no_registrasi: 'REG-20260912-002',
      tanggal_kunjungan: '2026-09-12',
      waktu_kunjungan: '10:30',
      pasien_id: 1,
      status_pasien: 'Lama',
      poli_id: 1,
      dokter_id: 1,
      penjamin: 'BPJS/JKN',
      no_kartu_penjamin: '0001234567891',
      tindakan: 'Kontrol Ulang Pasca Demam',
      catatan: 'Kondisi membaik',
      created_at: '2026-09-12T10:30:00.000Z'
    }
  ]
};

export async function readDb() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeDb(initialData);
      return initialData;
    }
    throw err;
  }
}

export async function writeDb(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
}
