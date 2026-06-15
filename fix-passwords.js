// fix-passwords.js
// Jalankan dengan: node fix-passwords.js

import { createPool } from '@vercel/postgres';

const connectionString = 'postgresql://neondb_owner:npg_iXKa3OEDtz6A@ep-raspy-morning-aohx012p-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = createPool({ connectionString });

async function fixPasswords() {
  console.log('========================================');
  console.log('FIXING PASSWORDS TO USE CRYPT');
  console.log('========================================\n');

  try {
    console.log('📡 Menghubungkan ke Neon PostgreSQL...');
    await pool.query('SELECT 1');
    console.log('✅ Koneksi berhasil!\n');

    // Reset password admin (gunakan single quotes)
    await pool.query(
      `UPDATE users SET password_hash = crypt('admin123', gen_salt('bf')) WHERE username = 'admin'`
    );
    console.log('✓ Admin password reset to: admin123');

    // Reset password produksi (gunakan single quotes)
    await pool.query(
      `UPDATE users SET password_hash = crypt('produksi123', gen_salt('bf')) WHERE username = 'produksi'`
    );
    console.log('✓ Produksi password reset to: produksi123');

    // Cek hasil
    const { rows: users } = await pool.query('SELECT id, username, role FROM users');
    console.log('\n📊 Users in database:');
    console.table(users);

    console.log('\n========================================');
    console.log('✅ SEMUA PASSWORD TELAH DIPERBAIKI!');
    console.log('========================================');
    console.log('\nSilakan login dengan:');
    console.log('   👑 Admin: admin / admin123');
    console.log('   👥 Produksi: produksi / produksi123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

fixPasswords();