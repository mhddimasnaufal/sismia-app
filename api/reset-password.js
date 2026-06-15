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

  const { username, newPassword } = req.body;

  console.log('=== RESET PASSWORD API CALLED ===');
  console.log('Username:', username);

  if (!username || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Username dan password minimal 6 karakter required' });
  }

  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL tidak ditemukan');
    return res.status(500).json({ error: 'Konfigurasi database tidak lengkap' });
  }

  try {
    const pool = createPool({
      connectionString: process.env.POSTGRES_URL,
    });

    const { rows: userCheck } = await pool.query(
      'SELECT id, role FROM users WHERE username = $1',
      [username]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'Username tidak ditemukan' });
    }

    if (userCheck[0].role !== 'admin') {
      return res.status(403).json({ error: 'Hanya admin yang dapat reset password via fitur ini' });
    }

    // Update password dengan crypt (gunakan single quotes)
    await pool.query(
      `UPDATE users SET password_hash = crypt($1, gen_salt('bf')) WHERE username = $2`,
      [newPassword, username]
    );

    return res.status(200).json({ success: true, message: 'Password berhasil direset' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
}