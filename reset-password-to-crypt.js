// reset-password-to-crypt.js
import { createPool } from '@vercel/postgres';

const connectionString = 'postgresql://neondb_owner:npg_iXKa3OEDtz6A@ep-raspy-morning-aohx012p-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = createPool({ connectionString });

async function resetPasswords() {
  try {
    console.log('Resetting passwords to use crypt...');
    
    // Reset admin password
    await pool.query(
      "UPDATE users SET password_hash = crypt('admin123', gen_salt('bf')) WHERE username = 'admin'"
    );
    console.log('✓ Admin password reset to: admin123');
    
    // Reset produksi password
    await pool.query(
      "UPDATE users SET password_hash = crypt('produksi123', gen_salt('bf')) WHERE username = 'produksi'"
    );
    console.log('✓ Produksi password reset to: produksi123');
    
    // Reset semua user lain yang password_hash-nya tidak dimulai dengan '$2' (plain text)
    await pool.query(
      "UPDATE users SET password_hash = crypt(password_hash, gen_salt('bf')) WHERE password_hash NOT LIKE '$2%' AND password_hash IS NOT NULL"
    );
    console.log('✓ All plain text passwords converted to crypt');
    
    console.log('\n✅ Done! Now you can login with:');
    console.log('   Admin: admin / admin123');
    console.log('   Produksi: produksi / produksi123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetPasswords();