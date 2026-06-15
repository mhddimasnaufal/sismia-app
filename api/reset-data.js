import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Hapus semua data dari semua tabel (termasuk laporan_kerusakan)
    await sql`DELETE FROM bahan_baku`;
    await sql`DELETE FROM alat`;
    await sql`DELETE FROM produksi`;
    await sql`DELETE FROM penjualan`;
    await sql`DELETE FROM keuangan`;
    await sql`DELETE FROM laporan_kerusakan`; // TAMBAHKAN INI
    
    // Reset sequence/auto-increment ke 1 untuk semua tabel
    await sql`ALTER SEQUENCE bahan_baku_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE alat_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE produksi_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE penjualan_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE keuangan_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE laporan_kerusakan_id_seq RESTART WITH 1`; // TAMBAHKAN INI
    
    // Insert data default untuk alat (opsional)
    await sql`
      INSERT INTO alat (nama_alat, kondisi, terakhir_perawatan) 
      VALUES 
        ('Mixer', 'Baik', CURRENT_DATE),
        ('Oven', 'Baik', CURRENT_DATE),
        ('Kompor', 'Baik', CURRENT_DATE)
    `;
    
    return res.status(200).json({ 
      success: true, 
      message: 'Semua data berhasil direset termasuk laporan kerusakan' 
    });
  } catch (error) {
    console.error('Reset error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}