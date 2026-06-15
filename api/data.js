// api/data.js - Gabungan semua CRUD data
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { table } = req.query; // table = bahan_baku, alat, produksi, penjualan, keuangan, laporan_kerusakan

  try {
    // ==================== BAHAN BAKU ====================
    if (table === 'bahan_baku') {
      await sql`
        CREATE TABLE IF NOT EXISTS bahan_baku (
          id SERIAL PRIMARY KEY,
          nama VARCHAR(200) NOT NULL,
          satuan VARCHAR(50),
          stok INTEGER DEFAULT 0,
          stok_minimum INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      if (req.method === 'GET') {
        const result = await sql`SELECT * FROM bahan_baku ORDER BY nama`;
        return res.status(200).json(result.rows);
      }
      if (req.method === 'POST') {
        const { nama, satuan, stok, stok_minimum } = req.body;
        const result = await sql`
          INSERT INTO bahan_baku (nama, satuan, stok, stok_minimum)
          VALUES (${nama}, ${satuan}, ${stok}, ${stok_minimum})
          RETURNING *
        `;
        return res.status(201).json(result.rows[0]);
      }
      if (req.method === 'PUT') {
        const { id, nama, satuan, stok, stok_minimum } = req.body;
        const result = await sql`
          UPDATE bahan_baku SET nama=${nama}, satuan=${satuan}, stok=${stok}, stok_minimum=${stok_minimum}
          WHERE id=${id} RETURNING *
        `;
        return res.status(200).json(result.rows[0]);
      }
      if (req.method === 'DELETE') {
        const { id } = req.body;
        await sql`DELETE FROM bahan_baku WHERE id=${id}`;
        return res.status(200).json({ success: true });
      }
    }

    // ==================== ALAT ====================
    if (table === 'alat') {
      await sql`
        CREATE TABLE IF NOT EXISTS alat (
          id SERIAL PRIMARY KEY,
          nama_alat VARCHAR(200) NOT NULL,
          kondisi VARCHAR(50) DEFAULT 'Baik',
          terakhir_perawatan DATE,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      if (req.method === 'GET') {
        const result = await sql`SELECT * FROM alat ORDER BY nama_alat`;
        return res.status(200).json(result.rows);
      }
      if (req.method === 'POST') {
        const { nama_alat, kondisi, terakhir_perawatan } = req.body;
        const result = await sql`
          INSERT INTO alat (nama_alat, kondisi, terakhir_perawatan)
          VALUES (${nama_alat}, ${kondisi}, ${terakhir_perawatan})
          RETURNING *
        `;
        return res.status(201).json(result.rows[0]);
      }
      if (req.method === 'PUT') {
        const { id, nama_alat, kondisi, terakhir_perawatan } = req.body;
        const result = await sql`
          UPDATE alat SET nama_alat=${nama_alat}, kondisi=${kondisi}, terakhir_perawatan=${terakhir_perawatan}
          WHERE id=${id} RETURNING *
        `;
        return res.status(200).json(result.rows[0]);
      }
      if (req.method === 'DELETE') {
        const { id } = req.body;
        await sql`DELETE FROM alat WHERE id=${id}`;
        return res.status(200).json({ success: true });
      }
    }

    // ==================== PRODUKSI ====================
    if (table === 'produksi') {
      await sql`
        CREATE TABLE IF NOT EXISTS produksi (
          id SERIAL PRIMARY KEY,
          tgl_produksi DATE NOT NULL,
          target INTEGER DEFAULT 0,
          realisasi INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      if (req.method === 'GET') {
        const result = await sql`SELECT * FROM produksi ORDER BY tgl_produksi DESC`;
        return res.status(200).json(result.rows);
      }
      if (req.method === 'POST') {
        const { tgl_produksi, target, realisasi } = req.body;
        const result = await sql`
          INSERT INTO produksi (tgl_produksi, target, realisasi)
          VALUES (${tgl_produksi}, ${target}, ${realisasi})
          RETURNING *
        `;
        return res.status(201).json(result.rows[0]);
      }
      if (req.method === 'PUT') {
        const { id, tgl_produksi, target, realisasi } = req.body;
        const result = await sql`
          UPDATE produksi SET tgl_produksi=${tgl_produksi}, target=${target}, realisasi=${realisasi}
          WHERE id=${id} RETURNING *
        `;
        return res.status(200).json(result.rows[0]);
      }
      if (req.method === 'DELETE') {
        const { id } = req.body;
        await sql`DELETE FROM produksi WHERE id=${id}`;
        return res.status(200).json({ success: true });
      }
    }

    // ==================== PENJUALAN ====================
    if (table === 'penjualan') {
      await sql`
        CREATE TABLE IF NOT EXISTS penjualan (
          id SERIAL PRIMARY KEY,
          tgl_jual DATE NOT NULL,
          pelanggan TEXT NOT NULL,
          qty INTEGER DEFAULT 0,
          total_harga INTEGER DEFAULT 0,
          status TEXT DEFAULT 'Lunas',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      if (req.method === 'GET') {
        const result = await sql`SELECT * FROM penjualan ORDER BY tgl_jual DESC`;
        return res.status(200).json(result.rows);
      }
      if (req.method === 'POST') {
        const { tgl_jual, pelanggan, qty, total_harga, status } = req.body;
        const result = await sql`
          INSERT INTO penjualan (tgl_jual, pelanggan, qty, total_harga, status)
          VALUES (${tgl_jual}, ${pelanggan}, ${qty}, ${total_harga}, ${status})
          RETURNING *
        `;
        return res.status(201).json(result.rows[0]);
      }
      if (req.method === 'PUT') {
        const { id, tgl_jual, pelanggan, qty, total_harga, status } = req.body;
        const result = await sql`
          UPDATE penjualan SET tgl_jual=${tgl_jual}, pelanggan=${pelanggan}, qty=${qty}, 
            total_harga=${total_harga}, status=${status}
          WHERE id=${id} RETURNING *
        `;
        return res.status(200).json(result.rows[0]);
      }
      if (req.method === 'DELETE') {
        const { id } = req.body;
        await sql`DELETE FROM penjualan WHERE id=${id}`;
        return res.status(200).json({ success: true });
      }
    }

    // ==================== KEUANGAN ====================
    if (table === 'keuangan') {
      await sql`
        CREATE TABLE IF NOT EXISTS keuangan (
          id SERIAL PRIMARY KEY,
          tgl_transaksi DATE NOT NULL,
          jenis TEXT NOT NULL,
          nominal INTEGER DEFAULT 0,
          keterangan TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      if (req.method === 'GET') {
        const result = await sql`SELECT * FROM keuangan ORDER BY tgl_transaksi DESC`;
        return res.status(200).json(result.rows);
      }
      if (req.method === 'POST') {
        const { tgl_transaksi, jenis, nominal, keterangan } = req.body;
        const result = await sql`
          INSERT INTO keuangan (tgl_transaksi, jenis, nominal, keterangan)
          VALUES (${tgl_transaksi}, ${jenis}, ${nominal}, ${keterangan})
          RETURNING *
        `;
        return res.status(201).json(result.rows[0]);
      }
      if (req.method === 'PUT') {
        const { id, tgl_transaksi, jenis, nominal, keterangan } = req.body;
        const result = await sql`
          UPDATE keuangan SET tgl_transaksi=${tgl_transaksi}, jenis=${jenis}, nominal=${nominal}, keterangan=${keterangan}
          WHERE id=${id} RETURNING *
        `;
        return res.status(200).json(result.rows[0]);
      }
      if (req.method === 'DELETE') {
        const { id } = req.body;
        await sql`DELETE FROM keuangan WHERE id=${id}`;
        return res.status(200).json({ success: true });
      }
    }

    // ==================== LAPORAN KERUSAKAN ====================
    if (table === 'laporan_kerusakan') {
      await sql`
        CREATE TABLE IF NOT EXISTS laporan_kerusakan (
          id SERIAL PRIMARY KEY,
          alat_id INTEGER NOT NULL,
          nama_alat VARCHAR(200) NOT NULL,
          deskripsi_kerusakan TEXT NOT NULL,
          tgl_laporan DATE DEFAULT NOW(),
          status VARCHAR(50) DEFAULT 'Menunggu Perbaikan',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      if (req.method === 'GET') {
        const result = await sql`SELECT * FROM laporan_kerusakan ORDER BY tgl_laporan DESC`;
        return res.status(200).json(result.rows);
      }

      if (req.method === 'POST') {
        const { alat_id, nama_alat, deskripsi_kerusakan, tgl_laporan, status } = req.body;
        
        if (!alat_id || !nama_alat || !deskripsi_kerusakan) {
          return res.status(400).json({ error: 'Semua field required' });
        }

        // Insert laporan
        const result = await sql`
          INSERT INTO laporan_kerusakan (alat_id, nama_alat, deskripsi_kerusakan, tgl_laporan, status)
          VALUES (${alat_id}, ${nama_alat}, ${deskripsi_kerusakan}, ${tgl_laporan || new Date().toISOString().split('T')[0]}, ${status || 'Menunggu Perbaikan'})
          RETURNING *
        `;
        
        // Update kondisi alat menjadi 'Rusak - Perlu Perbaikan'
        await sql`
          UPDATE alat 
          SET kondisi = 'Rusak - Perlu Perbaikan'
          WHERE id = ${alat_id}
        `;
        
        return res.status(201).json(result.rows[0]);
      }

      if (req.method === 'PUT') {
        const { id, status } = req.body;
        
        if (!id || !status) {
          return res.status(400).json({ error: 'ID dan status required' });
        }

        // Update status laporan
        const result = await sql`
          UPDATE laporan_kerusakan 
          SET status = ${status}
          WHERE id = ${id}
          RETURNING *
        `;

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Laporan tidak ditemukan' });
        }

        const laporan = result.rows[0];
        const alat_id = laporan.alat_id;

        // Update kondisi alat berdasarkan status laporan
        if (status === 'Sedang Diperbaiki') {
          await sql`
            UPDATE alat 
            SET kondisi = 'Sedang Diperbaiki'
            WHERE id = ${alat_id}
          `;
        } else if (status === 'Selesai Diperbaiki') {
          await sql`
            UPDATE alat 
            SET kondisi = 'Baik'
            WHERE id = ${alat_id}
          `;
        }

        return res.status(200).json({ success: true, data: result.rows[0], message: 'Status berhasil diupdate' });
      }

      if (req.method === 'DELETE') {
        const { id } = req.body;
        await sql`DELETE FROM laporan_kerusakan WHERE id = ${id}`;
        return res.status(200).json({ success: true });
      }
    }

    return res.status(404).json({ error: 'Table not found' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}