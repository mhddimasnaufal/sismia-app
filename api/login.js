import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password required' });
  }

  try {
    // Langsung pakai sql template literal
    const { rows } = await sql`
      SELECT id, username, role, name 
      FROM users 
      WHERE username = ${username} 
      AND password_hash = crypt(${password}, password_hash)
    `;

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const user = rows[0];
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}