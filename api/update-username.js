import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, newUsername, currentPassword } = req.body;

  if (!userId || !newUsername || !currentPassword) {
    return res.status(400).json({ error: 'Semua field required' });
  }

  if (newUsername.length < 3) {
    return res.status(400).json({ error: 'Username minimal 3 karakter' });
  }

  try {
    const pool = createPool({
      connectionString: process.env.POSTGRES_URL,
    });

    // Verifikasi password user
    const { rows: userCheck } = await pool.query(
      'SELECT id, role FROM users WHERE id = $1 AND password_hash = crypt($2, password_hash)',
      [userId, currentPassword]
    );

    if (userCheck.length === 0) {
      return res.status(401).json({ error: 'Password salah' });
    }

    // Cek username sudah dipakai atau belum
    const { rows: existingUser } = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [newUsername, userId]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Username sudah digunakan' });
    }

    // Update username
    await pool.query(
      'UPDATE users SET username = $1 WHERE id = $2',
      [newUsername, userId]
    );

    res.status(200).json({ success: true, message: 'Username berhasil diubah' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}