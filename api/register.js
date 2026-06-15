import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authToken = req.headers.authorization?.replace('Bearer ', '');
  const { username, password, role, name } = req.body;

  if (!username || !password || !role || !name) {
    return res.status(400).json({ error: 'Semua field required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username minimal 3 karakter' });
  }

  try {
    const pool = createPool({
      connectionString: process.env.POSTGRES_URL,
    });

    // Verifikasi token dan role admin
    if (!authToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = parseInt(Buffer.from(authToken, 'base64').toString().split(':')[0]);
    
    const { rows: adminCheck } = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (adminCheck.length === 0 || adminCheck[0].role !== 'admin') {
      return res.status(403).json({ error: 'Hanya admin yang dapat register user baru' });
    }

    // Cek username sudah ada
    const { rows: existingUser } = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Username sudah digunakan' });
    }

    // Insert user baru
    await pool.query(
      'INSERT INTO users (username, password_hash, role, name) VALUES ($1, crypt($2, gen_salt("bf")), $3, $4)',
      [username, password, role, name]
    );

    res.status(201).json({ success: true, message: 'User berhasil ditambahkan' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}