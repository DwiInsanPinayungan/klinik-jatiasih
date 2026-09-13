import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic MySQL Configuration
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || process.env.MYSQL__HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || process.env.MYSQL__PORT) || 3306,
  user: process.env.MYSQL_USER || process.env.MYSQL__USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.MYSQL__PASSWORD || '',
};

const DB_NAME = process.env.MYSQL_DB || process.env.MYSQL__DB || 'klinik_jati_asih_medika';

let pool = null;
let isMysqlActive = false;

// Initial Seed Data (Fallback & MySQL Initial Seeding)
const initialSeed = {
  pasien: [
    {
      no_rm: 'RM-2026-0001',
      nama: 'Andi Pratama',
      nik: '3275011205900001',
      no_bpjs: '0001234567891',
      tanggal_lahir: '1990-05-12',
      jenis_kelamin: 'L',
      alamat: 'Jl. Jati Asih No. 12, Bekasi',
      no_hp: '081234567890'
    },
    {
      no_rm: 'RM-2026-0002',
      nama: 'Siti Nurhaliza',
      nik: '3275015508850002',
      no_bpjs: '',
      tanggal_lahir: '1985-08-15',
      jenis_kelamin: 'P',
      alamat: 'Jl. Kp. Sawah No. 45, Bekasi',
      no_hp: '081987654321'
    },
    {
      no_rm: 'RM-2026-0003',
      nama: 'Muhammad Rizky',
      nik: '3275012010210003',
      no_bpjs: '0009876543210',
      tanggal_lahir: '2021-10-20',
      jenis_kelamin: 'L',
      alamat: 'Jl. Ratna No. 8, Jati Asih',
      no_hp: '085711223344'
    },
    {
      no_rm: 'RM-2026-0004',
      nama: 'Eka Suryani',
      nik: '3275014304600004',
      no_bpjs: '',
      tanggal_lahir: '1960-04-03',
      jenis_kelamin: 'P',
      alamat: 'Jl. Wibawa Mukti II No. 19, Bekasi',
      no_hp: '081399887766'
    }
  ],
  poli: [
    { nama_poli: 'Poli Umum' },
    { nama_poli: 'Poli Gigi' },
    { nama_poli: 'Poli KIA & Anak' },
    { nama_poli: 'Poli Penyakit Dalam' },
    { nama_poli: 'Poli Kebidanan & Kandungan' }
  ],
  dokter: [
    { nama_dokter: 'dr. Ahmad Hidayat', spesialisasi: 'Dokter Umum', poli_id: 1 },
    { nama_dokter: 'dr. Siti Rahmawati', spesialisasi: 'Dokter Gigi', poli_id: 2 },
    { nama_dokter: 'dr. Budi Santoso, Sp.A', spesialisasi: 'Spesialis Anak', poli_id: 3 },
    { nama_dokter: 'dr. Hendra Wijaya, Sp.PD', spesialisasi: 'Spesialis Penyakit Dalam', poli_id: 4 },
    { nama_dokter: 'dr. Dewi Lestari, Sp.OG', spesialisasi: 'Spesialis Kebidanan', poli_id: 5 }
  ],
  kunjungan: [
    {
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
      catatan: 'Pasien mengeluh demam'
    },
    {
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
      catatan: 'Gigi geraham kanan'
    },
    {
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
      catatan: 'Batuk ringan'
    },
    {
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
      catatan: 'Kontrol rutin Lansia'
    },
    {
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
      catatan: 'Kondisi membaik'
    }
  ]
};

// Inisialisasi Koneksi & Skema MySQL
export async function initMysql() {
  try {
    // Step 1: Connect tanpa database terlebih dahulu
    const conn = await mysql.createConnection(MYSQL_CONFIG);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await conn.end();

    // Step 2: Connection Pool ke Database Klinik
    pool = mysql.createPool({
      ...MYSQL_CONFIG,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test query pool
    await pool.query('SELECT 1');
    isMysqlActive = true;
    console.log(`✅ Sukses terhubung ke Database MySQL: ${DB_NAME} (Host: ${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port})`);

    // Step 3: Auto Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pasien (
        id INT AUTO_INCREMENT PRIMARY KEY,
        no_rm VARCHAR(50) UNIQUE NOT NULL,
        nama VARCHAR(100) NOT NULL,
        nik VARCHAR(50),
        no_bpjs VARCHAR(50),
        tanggal_lahir DATE NOT NULL,
        jenis_kelamin ENUM('L', 'P') NOT NULL,
        alamat TEXT,
        no_hp VARCHAR(30),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS poli (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_poli VARCHAR(100) UNIQUE NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS dokter (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_dokter VARCHAR(100) NOT NULL,
        spesialisasi VARCHAR(100),
        poli_id INT,
        FOREIGN KEY (poli_id) REFERENCES poli(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS kunjungan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        no_registrasi VARCHAR(50) UNIQUE NOT NULL,
        tanggal_kunjungan DATE NOT NULL,
        waktu_kunjungan VARCHAR(10) NOT NULL,
        pasien_id INT NOT NULL,
        status_pasien ENUM('Baru', 'Lama') NOT NULL,
        poli_id INT NOT NULL,
        dokter_id INT NOT NULL,
        penjamin ENUM('Umum', 'BPJS/JKN') NOT NULL,
        no_kartu_penjamin VARCHAR(50),
        tindakan TEXT,
        catatan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pasien_id) REFERENCES pasien(id) ON DELETE CASCADE,
        FOREIGN KEY (poli_id) REFERENCES poli(id) ON DELETE CASCADE,
        FOREIGN KEY (dokter_id) REFERENCES dokter(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Step 4: Seed jika tabel kosong
    const [rowsPoli] = await pool.query('SELECT COUNT(*) as count FROM poli');
    if (rowsPoli[0].count === 0) {
      for (const p of initialSeed.poli) {
        await pool.query('INSERT INTO poli (nama_poli) VALUES (?)', [p.nama_poli]);
      }
    }

    const [rowsDokter] = await pool.query('SELECT COUNT(*) as count FROM dokter');
    if (rowsDokter[0].count === 0) {
      for (const d of initialSeed.dokter) {
        await pool.query('INSERT INTO dokter (nama_dokter, spesialisasi, poli_id) VALUES (?, ?, ?)', [d.nama_dokter, d.spesialisasi, d.poli_id]);
      }
    }

    const [rowsPasien] = await pool.query('SELECT COUNT(*) as count FROM pasien');
    if (rowsPasien[0].count === 0) {
      for (const p of initialSeed.pasien) {
        await pool.query(
          'INSERT INTO pasien (no_rm, nama, nik, no_bpjs, tanggal_lahir, jenis_kelamin, alamat, no_hp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [p.no_rm, p.nama, p.nik, p.no_bpjs, p.tanggal_lahir, p.jenis_kelamin, p.alamat, p.no_hp]
        );
      }
    }

    const [rowsKunjungan] = await pool.query('SELECT COUNT(*) as count FROM kunjungan');
    if (rowsKunjungan[0].count === 0) {
      for (const k of initialSeed.kunjungan) {
        await pool.query(
          'INSERT INTO kunjungan (no_registrasi, tanggal_kunjungan, waktu_kunjungan, pasien_id, status_pasien, poli_id, dokter_id, penjamin, no_kartu_penjamin, tindakan, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [k.no_registrasi, k.tanggal_kunjungan, k.waktu_kunjungan, k.pasien_id, k.status_pasien, k.poli_id, k.dokter_id, k.penjamin, k.no_kartu_penjamin, k.tindakan, k.catatan]
        );
      }
    }

    return true;
  } catch (err) {
    isMysqlActive = false;
    console.warn(`⚠️ MySQL belum aktif atau tidak dapat terhubung: (${err.message}). Menggunakan mode persitensi berkas data.`);
    return false;
  }
}

// Fetch all data from MySQL in same object format as JSON dbStore
export async function readDbFromMysql() {
  if (!isMysqlActive || !pool) return null;
  try {
    const [pasien] = await pool.query('SELECT * FROM pasien ORDER BY id ASC');
    const [poli] = await pool.query('SELECT * FROM poli ORDER BY id ASC');
    const [dokter] = await pool.query('SELECT * FROM dokter ORDER BY id ASC');
    const [kunjungan] = await pool.query('SELECT * FROM kunjungan ORDER BY id ASC');

    // Format tanggal ke YYYY-MM-DD string
    const formattedPasien = pasien.map(p => ({
      ...p,
      tanggal_lahir: p.tanggal_lahir ? new Date(p.tanggal_lahir).toISOString().split('T')[0] : ''
    }));

    const formattedKunjungan = kunjungan.map(k => ({
      ...k,
      tanggal_kunjungan: k.tanggal_kunjungan ? new Date(k.tanggal_kunjungan).toISOString().split('T')[0] : ''
    }));

    return {
      pasien: formattedPasien,
      poli,
      dokter,
      kunjungan: formattedKunjungan
    };
  } catch (err) {
    console.error('Error readDbFromMysql:', err);
    return null;
  }
}

export function isMysqlConnected() {
  return isMysqlActive;
}

export { pool };
