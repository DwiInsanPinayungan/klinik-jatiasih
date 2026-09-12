const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../klinik.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Gagal terhubung ke SQLite Database:', err.message);
  } else {
    console.log('Terhubung ke SQLite Database Klinik Utama Jati Asih Medika:', dbPath);
  }
});

// Helper for Promisified Queries
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initial Schema Setup & Seeding
const initDb = async () => {
  try {
    // Tabel Pasien
    await dbRun(`
      CREATE TABLE IF NOT EXISTS pasien (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        no_rm TEXT UNIQUE NOT NULL,
        nama TEXT NOT NULL,
        nik TEXT,
        no_bpjs TEXT,
        tanggal_lahir DATE NOT NULL,
        jenis_kelamin TEXT CHECK(jenis_kelamin IN ('L', 'P')) NOT NULL,
        alamat TEXT,
        no_hp TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabel Poli / Pelayanan
    await dbRun(`
      CREATE TABLE IF NOT EXISTS poli (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_poli TEXT UNIQUE NOT NULL
      )
    `);

    // Tabel Dokter
    await dbRun(`
      CREATE TABLE IF NOT EXISTS dokter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama_dokter TEXT NOT NULL,
        spesialisasi TEXT,
        poli_id INTEGER,
        FOREIGN KEY (poli_id) REFERENCES poli(id)
      )
    `);

    // Tabel Kunjungan
    await dbRun(`
      CREATE TABLE IF NOT EXISTS kunjungan (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        no_registrasi TEXT UNIQUE NOT NULL,
        tanggal_kunjungan DATE NOT NULL,
        waktu_kunjungan TIME NOT NULL,
        pasien_id INTEGER NOT NULL,
        status_pasien TEXT CHECK(status_pasien IN ('Baru', 'Lama')) NOT NULL,
        poli_id INTEGER NOT NULL,
        dokter_id INTEGER NOT NULL,
        penjamin TEXT CHECK(penjamin IN ('Umum', 'BPJS/JKN')) NOT NULL,
        no_kartu_penjamin TEXT,
        tindakan TEXT,
        catatan TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pasien_id) REFERENCES pasien(id),
        FOREIGN KEY (poli_id) REFERENCES poli(id),
        FOREIGN KEY (dokter_id) REFERENCES dokter(id)
      )
    `);

    // Seed Master Poli jika kosong
    const countPoli = await dbGet('SELECT COUNT(*) as count FROM poli');
    if (countPoli.count === 0) {
      await dbRun('INSERT INTO poli (nama_poli) VALUES ("Poli Umum"), ("Poli Gigi"), ("Poli KIA & Anak"), ("Poli Penyakit Dalam"), ("Poli Kebidanan & Kandungan")');
    }

    // Seed Master Dokter jika kosong
    const countDokter = await dbGet('SELECT COUNT(*) as count FROM dokter');
    if (countDokter.count === 0) {
      await dbRun('INSERT INTO dokter (nama_dokter, spesialisasi, poli_id) VALUES (?, ?, ?)', ['dr. Ahmad Hidayat', 'Dokter Umum', 1]);
      await dbRun('INSERT INTO dokter (nama_dokter, spesialisasi, poli_id) VALUES (?, ?, ?)', ['dr. Siti Rahmawati', 'Dokter Gigi', 2]);
      await dbRun('INSERT INTO dokter (nama_dokter, spesialisasi, poli_id) VALUES (?, ?, ?)', ['dr. Budi Santoso, Sp.A', 'Spesialis Anak', 3]);
      await dbRun('INSERT INTO dokter (nama_dokter, spesialisasi, poli_id) VALUES (?, ?, ?)', ['dr. Hendra Wijaya, Sp.PD', 'Spesialis Penyakit Dalam', 4]);
      await dbRun('INSERT INTO dokter (nama_dokter, spesialisasi, poli_id) VALUES (?, ?, ?)', ['dr. Dewi Lestari, Sp.OG', 'Spesialis Kebidanan', 5]);
    }

    // Seed Initial Data Pasien & Kunjungan jika kosong (agar dashboard langsung ber-isi data riil klinik)
    const countPasien = await dbGet('SELECT COUNT(*) as count FROM pasien');
    if (countPasien.count === 0) {
      // Seed Pasien
      const pas1 = await dbRun('INSERT INTO pasien (no_rm, nama, nik, no_bpjs, tanggal_lahir, jenis_kelamin, alamat, no_hp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['RM-2026-0001', 'Andi Pratama', '3275011205900001', '0001234567891', '1990-05-12', 'L', 'Jl. Jati Asih No. 12, Bekasi', '081234567890']);
      const pas2 = await dbRun('INSERT INTO pasien (no_rm, nama, nik, no_bpjs, tanggal_lahir, jenis_kelamin, alamat, no_hp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['RM-2026-0002', 'Siti Nurhaliza', '3275015508850002', '', '1985-08-15', 'P', 'Jl. Kp. Sawah No. 45, Bekasi', '081987654321']);
      const pas3 = await dbRun('INSERT INTO pasien (no_rm, nama, nik, no_bpjs, tanggal_lahir, jenis_kelamin, alamat, no_hp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['RM-2026-0003', 'Muhammad Rizky', '3275012010210003', '0009876543210', '2021-10-20', 'L', 'Jl. Ratna No. 8, Jati Asih', '085711223344']);
      const pas4 = await dbRun('INSERT INTO pasien (no_rm, nama, nik, no_bpjs, tanggal_lahir, jenis_kelamin, alamat, no_hp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['RM-2026-0004', 'Eka Suryani', '3275014304600004', '', '1960-04-03', 'P', 'Jl. Wibawa Mukti II No. 19, Bekasi', '081399887766']);

      // Seed Kunjungan
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

      await dbRun('INSERT INTO kunjungan (no_registrasi, tanggal_kunjungan, waktu_kunjungan, pasien_id, status_pasien, poli_id, dokter_id, penjamin, no_kartu_penjamin, tindakan, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['REG-20260910-001', twoDaysAgo, '08:30', pas1.lastID, 'Baru', 1, 1, 'BPJS/JKN', '0001234567891', 'Pemeriksaan Rutin & Resep Obat', 'Pasien mengeluh demam']);
      await dbRun('INSERT INTO kunjungan (no_registrasi, tanggal_kunjungan, waktu_kunjungan, pasien_id, status_pasien, poli_id, dokter_id, penjamin, no_kartu_penjamin, tindakan, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['REG-20260911-001', yesterday, '09:15', pas2.lastID, 'Baru', 2, 2, 'Umum', '', 'Penambalan Gigi berlubang', 'Gigi graham kanan']);
      await dbRun('INSERT INTO kunjungan (no_registrasi, tanggal_kunjungan, waktu_kunjungan, pasien_id, status_pasien, poli_id, dokter_id, penjamin, no_kartu_penjamin, tindakan, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['REG-20260911-002', yesterday, '10:00', pas3.lastID, 'Baru', 3, 3, 'BPJS/JKN', '0009876543210', 'Imunisasi Balita', 'Batuk ringan']);
      await dbRun('INSERT INTO kunjungan (no_registrasi, tanggal_kunjungan, waktu_kunjungan, pasien_id, status_pasien, poli_id, dokter_id, penjamin, no_kartu_penjamin, tindakan, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['REG-20260912-001', today, '08:00', pas4.lastID, 'Baru', 4, 4, 'Umum', '', 'Pemeriksaan Hipertensi & EKG', 'Kontrol rutin Lansia']);
      await dbRun('INSERT INTO kunjungan (no_registrasi, tanggal_kunjungan, waktu_kunjungan, pasien_id, status_pasien, poli_id, dokter_id, penjamin, no_kartu_penjamin, tindakan, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['REG-20260912-002', today, '10:30', pas1.lastID, 'Lama', 1, 1, 'BPJS/JKN', '0001234567891', 'Kontrol Ulang Pasca Demam', 'Kondisi membaik']);
    }

    console.log('Database Klinik Utama Jati Asih Medika berhasil diinisialisasi & di-seed.');
  } catch (err) {
    console.error('Error inisialisasi database:', err);
  }
};

initDb();

module.exports = {
  db,
  dbRun,
  dbAll,
  dbGet
};
