// setup-db.js
// Jalankan dengan: node setup-db.js

import { createPool } from '@vercel/postgres';

// Connection string dari database Neon kamu
const connectionString = 'postgresql://neondb_owner:npg_iXKa3OEDtz6A@ep-raspy-morning-aohx012p-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = createPool({ connectionString });

async function setup() {
  console.log('========================================');
  console.log('SETUP DATABASE NEON UNTUK SISMIA');
  console.log('========================================\n');

  try {
    // 1. Tes koneksi
    console.log('📡 Menghubungkan ke Neon PostgreSQL...');
    await pool.query('SELECT 1');
    console.log('✅ Koneksi berhasil!\n');

    // 2. Enable extension pgcrypto
    console.log('🔧 Mengaktifkan extension pgcrypto...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    console.log('✅ Extension pgcrypto aktif\n');

    // 3. Hapus tabel users
    console.log('🗑️  Menghapus tabel users (jika ada)...');
    await pool.query('DROP TABLE IF EXISTS users');
    console.log('✅ Tabel users dihapus (jika ada)\n');

    // 4. Buat tabel users
    console.log('📋 Membuat tabel users...');
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        name VARCHAR(200),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tabel users berhasil dibuat\n');

    // 5. Insert default users
    console.log('👤 Memasukkan data user default...');
    await pool.query(`
      INSERT INTO users (username, password_hash, role, name) VALUES 
      ('admin', crypt('admin123', gen_salt('bf')), 'admin', 'Administrator Utama'),
      ('produksi', crypt('produksi123', gen_salt('bf')), 'produksi', 'Tim Produksi NOCOCO')
    `);
    console.log('✅ 2 user default berhasil dimasukkan:\n');
    console.log('   - admin / admin123 (role: admin)');
    console.log('   - produksi / produksi123 (role: produksi)\n');

    // 6. Tampilkan hasil
    console.log('📊 Data users saat ini:');
    const { rows } = await pool.query('SELECT id, username, role, name, created_at FROM users ORDER BY id');
    console.table(rows);

    // 7. Cek jumlah users
    const { rows: countRows } = await pool.query('SELECT COUNT(*) as total FROM users');
    console.log(`\n📈 Total user: ${countRows[0].total}`);

    console.log('\n========================================');
    console.log('✅ SETUP DATABASE SELESAI!');
    console.log('========================================');
    console.log('\nSekarang kamu bisa:');
    console.log('1. Deploy ulang aplikasi ke Vercel');
    console.log('2. Login dengan username: admin | password: admin123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR TERJADI:');
    console.error('========================================');
    console.error('Pesan error:', error.message);
    console.error('========================================\n');
    
    if (error.message.includes('password authentication failed')) {
      console.error('💡 Solusi: Password database salah. Cek kembali connection string di file setup-db.js');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Solusi: Koneksi timeout. Periksa koneksi internetmu');
    } else if (error.message.includes('does not exist')) {
      console.error('💡 Solusi: Database tidak ditemukan. Cek nama database di connection string');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Solusi: Host database tidak dapat dijangkau. Cek kembali host di connection string');
    }
    
    process.exit(1);
  }
}

setup();