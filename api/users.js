import { createPool } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authToken = req.headers.authorization?.replace('Bearer ', '');

  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const pool = createPool({
      connectionString: process.env.POSTGRES_URL,
    });

    // Parse token untuk dapatkan userId
    const userId = parseInt(Buffer.from(authToken, 'base64').toString().split(':')[0]);
    
    if (isNaN(userId)) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Cek role user
    const { rows: userRole } = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userRole.length === 0 || userRole[0].role !== 'admin') {
      return res.status(403).json({ error: 'Hanya admin yang dapat mengakses' });
    }

    // Ambil semua users
    const { rows } = await pool.query(
      'SELECT id, username, role, name, created_at FROM users ORDER BY id'
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}