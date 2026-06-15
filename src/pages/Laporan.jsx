import React, { useState, useEffect } from 'react'
import { FiDownload, FiPrinter, FiFileText, FiPackage, FiTool, FiClipboard, FiShoppingCart, FiDollarSign, FiAlertCircle, FiCheckCircle, FiClock, FiSend } from 'react-icons/fi'
import { Container, Row, Col, Card, Button, Form, Table, Spinner, Badge, Alert } from 'react-bootstrap'
import { useNotification } from '../components/ui/Notification'
import { getBahanBaku, getAlat, getProduksi, getPenjualan, getKeuangan, getLaporanKerusakan, updateStatusLaporan } from '../services/api'

const Laporan = () => {
  const { success, error } = useNotification()
  const [laporanType, setLaporanType] = useState('stok')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState({
    stok: [],
    alat: [],
    produksi: [],
    penjualan: [],
    keuangan: [],
    laporanKerusakan: []
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      const [stok, alat, produksi, penjualan, keuangan, laporanKerusakan] = await Promise.all([
        getBahanBaku().catch(() => []),
        getAlat().catch(() => []),
        getProduksi().catch(() => []),
        getPenjualan().catch(() => []),
        getKeuangan().catch(() => []),
        getLaporanKerusakan().catch(() => [])
      ])
      
      setData({
        stok: stok || [],
        alat: alat || [],
        produksi: produksi || [],
        penjualan: penjualan || [],
        keuangan: keuangan || [],
        laporanKerusakan: laporanKerusakan || []
      })
    } catch (err) {
      error('Gagal memuat data laporan')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadAllData() }, [])

  const filterByDate = (items, dateField) => {
    if (!startDate && !endDate) return items
    return items.filter(item => {
      const itemDate = item[dateField]
      if (!itemDate) return true
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate
      } else if (startDate) {
        return itemDate >= startDate
      } else if (endDate) {
        return itemDate <= endDate
      }
      return true
    })
  }

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka || 0)
  }

  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-'
    const parts = tanggal.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return tanggal
  }

  // ==================== EXPORT CSV ====================
  const exportToCSV = () => {
    let csvContent = ''
    let filename = ''
    let headers = []
    let rows = []
    let filteredData = []

    switch (laporanType) {
      case 'stok':
        filteredData = filterByDate(data.stok, 'created_at')
        headers = ['No', 'Nama Bahan', 'Satuan', 'Stok', 'Stok Minimum', 'Status']
        rows = filteredData.map((item, index) => [
          index + 1,
          item.nama || '-',
          item.satuan || '-',
          item.stok || 0,
          item.stok_minimum || 0,
          (item.stok || 0) <= (item.stok_minimum || 0) ? '⚠ Stok Menipis' : '✓ Aman'
        ])
        filename = `Laporan_Stok_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'alat':
        filteredData = filterByDate(data.alat, 'terakhir_perawatan')
        headers = ['No', 'Nama Alat', 'Kondisi', 'Terakhir Perawatan', 'Status']
        rows = filteredData.map((item, index) => [
          index + 1,
          item.nama_alat || '-',
          item.kondisi || '-',
          formatTanggal(item.terakhir_perawatan),
          item.kondisi === 'Baik' ? '✓ Siap Pakai' : (item.kondisi?.includes('Perlu') ? '⚠ Perlu Perawatan' : '✗ Rusak')
        ])
        filename = `Laporan_Alat_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'produksi':
        filteredData = filterByDate(data.produksi, 'tgl_produksi')
        headers = ['No', 'Tanggal', 'Target', 'Realisasi', 'Capaian (%)', 'Status']
        rows = filteredData.map((item, index) => {
          const capaian = item.target > 0 ? ((item.realisasi / item.target) * 100).toFixed(1) : 0
          let status = ''
          if (item.realisasi >= item.target) status = '✓ Tercapai'
          else if (item.realisasi >= item.target * 0.8) status = '⚠ Mendekati'
          else status = '✗ Kurang'
          return [
            index + 1,
            formatTanggal(item.tgl_produksi),
            item.target || 0,
            item.realisasi || 0,
            capaian,
            status
          ]
        })
        filename = `Laporan_Produksi_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'penjualan':
        filteredData = filterByDate(data.penjualan, 'tgl_jual')
        headers = ['No', 'Tanggal', 'Pelanggan', 'Jumlah', 'Total Harga', 'Status']
        rows = filteredData.map((item, index) => [
          index + 1,
          formatTanggal(item.tgl_jual),
          item.pelanggan || '-',
          item.qty || 0,
          formatRupiah(item.total_harga || 0),
          item.status || 'Lunas'
        ])
        filename = `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'keuangan':
        filteredData = filterByDate(data.keuangan, 'tgl_transaksi')
        headers = ['No', 'Tanggal', 'Jenis', 'Nominal', 'Keterangan']
        rows = filteredData.map((item, index) => [
          index + 1,
          formatTanggal(item.tgl_transaksi),
          item.jenis === 'pemasukan' ? '💰 Pemasukan' : '📤 Pengeluaran',
          formatRupiah(item.nominal || 0),
          item.keterangan || '-'
        ])
        const totalPemasukan = filteredData.filter(i => i.jenis === 'pemasukan').reduce((sum, i) => sum + (i.nominal || 0), 0)
        const totalPengeluaran = filteredData.filter(i => i.jenis === 'pengeluaran').reduce((sum, i) => sum + (i.nominal || 0), 0)
        rows.push(['', '', '', '', ''])
        rows.push(['', '', 'TOTAL PEMASUKAN', formatRupiah(totalPemasukan), ''])
        rows.push(['', '', 'TOTAL PENGELUARAN', formatRupiah(totalPengeluaran), ''])
        rows.push(['', '', 'SALDO', formatRupiah(totalPemasukan - totalPengeluaran), ''])
        filename = `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'laporan-kerusakan':
        filteredData = filterByDate(data.laporanKerusakan, 'tgl_laporan')
        headers = ['No', 'Tanggal', 'Nama Alat', 'Deskripsi Kerusakan', 'Status']
        rows = filteredData.map((item, index) => [
          index + 1,
          formatTanggal(item.tgl_laporan),
          item.nama_alat || '-',
          item.deskripsi_kerusakan || '-',
          item.status || 'Menunggu Perbaikan'
        ])
        filename = `Laporan_Kerusakan_Alat_${new Date().toISOString().split('T')[0]}.csv`
        break
      default:
        return
    }

    const csvRows = []
    csvRows.push(`"LAPORAN ${laporanType.toUpperCase()} SISMIA"`)
    csvRows.push(`"Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}"`)
    csvRows.push(`"Periode: ${startDate || 'Semua'} - ${endDate || 'Semua'}"`)
    csvRows.push('')
    csvRows.push(headers.join(','))
    
    for (const row of rows) {
      const escapedRow = row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      })
      csvRows.push(escapedRow.join(','))
    }
    
    csvRows.push('')
    csvRows.push(`"Total Data: ${rows.filter(r => r.length > 0 && r[0] !== '').length} record"`)
    csvRows.push(`"Dicetak oleh: SISMIA - Sistem Informasi Manajemen NOCOCO"`)

    csvContent = csvRows.join('\n')
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    success('Laporan berhasil diekspor')
  }

  // ==================== PRINT ====================
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    let title = ''
    let headers = []
    let rows = []
    let filteredData = []

    switch (laporanType) {
      case 'stok':
        filteredData = filterByDate(data.stok, 'created_at')
        title = 'LAPORAN STOK BAHAN BAKU'
        headers = ['No', 'Nama Bahan', 'Satuan', 'Stok', 'Stok Minimum', 'Status']
        rows = filteredData.map((item, index) => [
          index + 1,
          item.nama || '-',
          item.satuan || '-',
          (item.stok || 0).toLocaleString(),
          (item.stok_minimum || 0).toLocaleString(),
          (item.stok || 0) <= (item.stok_minimum || 0) ? '⚠️ Stok Menipis' : '✓ Aman'
        ])
        break
      case 'alat':
        filteredData = filterByDate(data.alat, 'terakhir_perawatan')
        title = 'LAPORAN ALAT PRODUKSI'
        headers = ['No', 'Nama Alat', 'Kondisi', 'Terakhir Perawatan', 'Status']
        rows = filteredData.map((item, index) => [
          index + 1,
          item.nama_alat || '-',
          item.kondisi || '-',
          formatTanggal(item.terakhir_perawatan),
          item.kondisi === 'Baik' ? '✓ Siap Pakai' : (item.kondisi?.includes('Perlu') ? '⚠️ Perlu Perawatan' : '✗ Rusak')
        ])
        break
      case 'produksi':
        filteredData = filterByDate(data.produksi, 'tgl_produksi')
        title = 'LAPORAN PRODUKSI'
        headers = ['No', 'Tanggal', 'Target', 'Realisasi', 'Capaian', 'Status']
        rows = filteredData.map((item, index) => {
          const capaian = item.target > 0 ? ((item.realisasi / item.target) * 100).toFixed(1) : 0
          let status = item.realisasi >= item.target ? '✓ Tercapai' : (item.realisasi >= item.target * 0.8 ? '⚠️ Mendekati' : '✗ Kurang')
          return [
            index + 1,
            formatTanggal(item.tgl_produksi),
            (item.target || 0).toLocaleString(),
            (item.realisasi || 0).toLocaleString(),
            capaian + '%',
            status
          ]
        })
        break
      case 'penjualan':
        filteredData = filterByDate(data.penjualan, 'tgl_jual')
        title = 'LAPORAN PENJUALAN'
        headers = ['No', 'Tanggal', 'Pelanggan', 'Jumlah', 'Total Harga', 'Status']
        rows = filteredData.map((item, index) => [
          index + 1,
          formatTanggal(item.tgl_jual),
          item.pelanggan || '-',
          (item.qty || 0).toLocaleString(),
          formatRupiah(item.total_harga || 0),
          item.status || 'Lunas'
        ])
        break
      case 'keuangan':
        filteredData = filterByDate(data.keuangan, 'tgl_transaksi')
        title = 'LAPORAN KEUANGAN'
        headers = ['No', 'Tanggal', 'Jenis', 'Nominal', 'Keterangan']
        rows = filteredData.map((item, index) => [
          index + 1,
          formatTanggal(item.tgl_transaksi),
          item.jenis === 'pemasukan' ? '💰 Pemasukan' : '📤 Pengeluaran',
          formatRupiah(item.nominal || 0),
          item.keterangan || '-'
        ])
        const totalPemasukan = filteredData.filter(i => i.jenis === 'pemasukan').reduce((sum, i) => sum + (i.nominal || 0), 0)
        const totalPengeluaran = filteredData.filter(i => i.jenis === 'pengeluaran').reduce((sum, i) => sum + (i.nominal || 0), 0)
        rows.push(['', '', '', '', ''])
        rows.push(['', '', 'TOTAL PEMASUKAN', formatRupiah(totalPemasukan), ''])
        rows.push(['', '', 'TOTAL PENGELUARAN', formatRupiah(totalPengeluaran), ''])
        rows.push(['', '', 'SALDO', formatRupiah(totalPemasukan - totalPengeluaran), ''])
        break
      case 'laporan-kerusakan':
        filteredData = filterByDate(data.laporanKerusakan, 'tgl_laporan')
        title = 'LAPORAN KERUSAKAN ALAT'
        headers = ['No', 'Tanggal', 'Nama Alat', 'Deskripsi Kerusakan', 'Status']
        rows = filteredData.map((item, index) => [
          index + 1,
          formatTanggal(item.tgl_laporan),
          item.nama_alat || '-',
          item.deskripsi_kerusakan || '-',
          item.status || 'Menunggu Perbaikan'
        ])
        break
      default:
        return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; background: white; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h1 { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
          .header h2 { font-size: 14px; font-weight: normal; margin-bottom: 5px; }
          .header p { font-size: 11px; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
          th { background: #2E7D32; color: white; padding: 8px 6px; text-align: center; border: 1px solid #1B5E20; font-weight: bold; }
          td { padding: 6px; border: 1px solid #ccc; vertical-align: top; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
          @media print { body { padding: 10px; } th { background: #2E7D32; color: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SISTEM INFORMASI MANAJEMEN NOCOCO (SISMIA)</h1>
          <h2>${title}</h2>
          <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Periode: ${startDate || 'Semua'} s/d ${endDate || 'Semua'}</p>
        </div>
        <table>
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        <div class="footer"><p>Dicetak oleh: SISMIA - Sistem Informasi Manajemen NOCOCO</p></div>
        <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Menunggu Perbaikan':
        return { bg: 'warning', text: 'Menunggu', icon: <FiClock className="me-1" /> }
      case 'Sedang Diperbaiki':
        return { bg: 'primary', text: 'Diproses', icon: <FiTool className="me-1" /> }
      case 'Selesai Diperbaiki':
        return { bg: 'success', text: 'Selesai', icon: <FiCheckCircle className="me-1" /> }
      default:
        return { bg: 'secondary', text: status, icon: <FiAlertCircle className="me-1" /> }
    }
  }

  const handleUpdateStatus = async (id, statusBaru) => {
    try {
      await updateStatusLaporan(id, statusBaru)
      success(`Status laporan berhasil diubah menjadi ${statusBaru}`)
      loadAllData()
    } catch (err) {
      error('Gagal mengupdate status')
    }
  }

  const menuItems = [
    { id: 'stok', name: 'Stok Bahan Baku', icon: <FiPackage />, variant: 'success' },
    { id: 'alat', name: 'Alat Produksi', icon: <FiTool />, variant: 'info' },
    { id: 'produksi', name: 'Produksi', icon: <FiClipboard />, variant: 'primary' },
    { id: 'penjualan', name: 'Penjualan', icon: <FiShoppingCart />, variant: 'warning' },
    { id: 'keuangan', name: 'Keuangan', icon: <FiDollarSign />, variant: 'danger' },
    { id: 'laporan-kerusakan', name: 'Kerusakan Alat', icon: <FiAlertCircle />, variant: 'secondary' },
  ]

  const getPreviewData = () => {
    switch (laporanType) {
      case 'stok': return filterByDate(data.stok, 'created_at')
      case 'alat': return filterByDate(data.alat, 'terakhir_perawatan')
      case 'produksi': return filterByDate(data.produksi, 'tgl_produksi')
      case 'penjualan': return filterByDate(data.penjualan, 'tgl_jual')
      case 'keuangan': return filterByDate(data.keuangan, 'tgl_transaksi')
      case 'laporan-kerusakan': return filterByDate(data.laporanKerusakan, 'tgl_laporan')
      default: return []
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <Container fluid className="p-3 p-md-4">
      <h1 className="h3 fw-bold text-dark mb-4">Laporan</h1>

      {/* Menu Pilihan */}
      <Row className="g-2 mb-4">
        {menuItems.map((item) => (
          <Col xs={6} sm={4} md={3} lg={2} key={item.id}>
            <Button
              variant={laporanType === item.id ? item.variant : 'outline-secondary'}
              className="w-100 py-3 d-flex align-items-center justify-content-center gap-2"
              onClick={() => setLaporanType(item.id)}
            >
              {item.icon}
              <span className="small fw-medium">{item.name}</span>
            </Button>
          </Col>
        ))}
      </Row>

      {/* Filter Tanggal */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-3 p-md-4">
          <Row className="g-3">
            <Col md={5}>
              <Form.Label className="small fw-medium">Tanggal Mulai</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Col>
            <Col md={5}>
              <Form.Label className="small fw-medium">Tanggal Akhir</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="secondary" onClick={() => { setStartDate(''); setEndDate('') }} className="w-100">
                Reset Filter
              </Button>
            </Col>
          </Row>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-primary" onClick={exportToCSV}>
              <FiDownload className="me-2" /> Export CSV
            </Button>
            <Button variant="primary" onClick={handlePrint}>
              <FiPrinter className="me-2" /> Print
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Preview Laporan - Stok, Alat, Produksi, Penjualan, Keuangan */}
      {laporanType !== 'laporan-kerusakan' && (
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white border-0 pt-4">
            <h2 className="h6 fw-semibold mb-0 d-flex align-items-center gap-2">
              <FiFileText /> Preview Laporan
            </h2>
          </Card.Header>
          <Card.Body className="p-0">
            {getPreviewData().length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FiFileText size={48} className="mb-3 opacity-25" />
                <p className="mb-0">Belum ada data untuk ditampilkan.</p>
                <p className="small mt-1">Silakan tambahkan data terlebih dahulu di menu yang sesuai.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      {(() => {
                        const previewData = getPreviewData()
                        if (previewData.length === 0) return null
                        const firstItem = previewData[0]
                        return Object.keys(firstItem).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'alat_id').map(key => (
                          <th key={key} className="small text-muted fw-medium">
                            {key.replace(/_/g, ' ').toUpperCase()}
                          </th>
                        ))
                      })()}
                    </tr>
                  </thead>
                  <tbody>
                    {getPreviewData().slice(0, 10).map((item, idx) => (
                      <tr key={idx}>
                        {Object.entries(item).filter(([key]) => key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'alat_id').map(([key, value], cellIdx) => (
                          <td key={cellIdx} className="small">
                            {key.includes('harga') || key === 'nominal' || key === 'total_harga' ? formatRupiah(value) : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {getPreviewData().length > 10 && (
                  <div className="text-center py-3 bg-light small text-muted border-top">
                    ... dan {getPreviewData().length - 10} data lainnya. Export CSV atau Print untuk melihat semua data.
                  </div>
                )}
                <div className="text-center py-2 small text-muted bg-light border-top">
                  Total Data: {getPreviewData().length} record
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Preview Laporan Kerusakan Alat */}
      {laporanType === 'laporan-kerusakan' && (
        <div className="mt-4">
          {data.laporanKerusakan.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FiSend size={48} className="text-muted mb-3 opacity-25" />
                <p className="text-muted mb-0">Belum ada laporan kerusakan alat</p>
                <p className="small text-muted mt-1">Laporan akan muncul setelah ada alat yang dilaporkan rusak</p>
              </Card.Body>
            </Card>
          ) : (
            getPreviewData().map((item) => {
              const statusBadge = getStatusBadge(item.status)
              return (
                <Card key={item.id} className="shadow-sm border-0 mb-3">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <h3 className="h6 fw-semibold mb-0">{item.nama_alat}</h3>
                          <Badge bg={statusBadge.bg} className="d-flex align-items-center gap-1 px-2 py-1">
                            {statusBadge.icon} {statusBadge.text}
                          </Badge>
                        </div>
                        <p className="small text-muted mb-2">
                          <strong>Tanggal Laporan:</strong> {formatTanggal(item.tgl_laporan)}
                        </p>
                        <div className="bg-light p-3 rounded-3 mt-2">
                          <p className="small text-dark mb-1"><strong>Deskripsi Kerusakan:</strong></p>
                          <p className="small text-secondary mb-0">{item.deskripsi_kerusakan}</p>
                        </div>
                      </div>
                      <div className="d-flex flex-column gap-2" style={{ minWidth: '140px' }}>
                        {item.status === 'Menunggu Perbaikan' && (
                          <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(item.id, 'Sedang Diperbaiki')}>
                            Mulai Perbaikan
                          </Button>
                        )}
                        {item.status === 'Sedang Diperbaiki' && (
                          <Button size="sm" variant="success" onClick={() => handleUpdateStatus(item.id, 'Selesai Diperbaiki')}>
                            Selesai Diperbaiki
                          </Button>
                        )}
                        {item.status === 'Selesai Diperbaiki' && (
                          <Badge bg="light" text="dark" className="text-center py-2">✓ Selesai</Badge>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              )
            })
          )}
        </div>
      )}
    </Container>
  )
}

export default Laporan