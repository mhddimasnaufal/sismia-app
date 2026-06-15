import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, oldPassword, newPassword } = req.body;

  console.log('=== UPDATE PASSWORD API CALLED ===');
  console.log('UserId:', userId);

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Semua field required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL tidak ditemukan');
    return res.status(500).json({ error: 'Konfigurasi database tidak lengkap' });
  }

  try {
    const pool = createPool({
      connectionString: process.env.POSTGRES_URL,
    });

    // Verifikasi password lama dengan crypt (gunakan single quotes)
    const { rows: userCheck } = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND password_hash = crypt($2, password_hash)`,
      [userId, oldPassword]
    );

    console.log('Password match:', userCheck.length > 0);

    if (userCheck.length === 0) {
      return res.status(401).json({ error: 'Password lama salah' });
    }

    // Update password baru dengan crypt (gunakan single quotes)
    await pool.query(
      `UPDATE users SET password_hash = crypt($1, gen_salt('bf')) WHERE id = $2`,
      [newPassword, userId]
    );
    
    console.log('Password updated successfully');

    return res.status(200).json({ success: true, message: 'Password berhasil diubah' });
    
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}