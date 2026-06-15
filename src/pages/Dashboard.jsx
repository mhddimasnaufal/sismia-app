import React, { useState, useEffect } from 'react'
import { FiPackage, FiClipboard, FiShoppingCart, FiAlertCircle, FiTool } from 'react-icons/fi'
import { getBahanBaku, getProduksi, getPenjualan, getAlat } from '../services/api'
import BarChart from '../components/charts/BarChart'
import LineChart from '../components/charts/LineChart'
import { Container, Row, Col, Card, Spinner, Alert, Button as Btn } from 'react-bootstrap'

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    totalStok: 0, 
    produksiHariIni: 0, 
    penjualanBulanIni: 0, 
    stokMenipis: [], 
    alatRusak: 0,
    alatDiperbaiki: 0
  })
  const [produksiChartData, setProduksiChartData] = useState([])
  const [penjualanChartData, setPenjualanChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let bahanBaku = []
      let produksi = []
      let penjualan = []
      let alat = []
      
      try {
        const bahanBakuRaw = await getBahanBaku()
        bahanBaku = Array.isArray(bahanBakuRaw) ? bahanBakuRaw : []
      } catch (err) {
        bahanBaku = []
      }
      
      try {
        const produksiRaw = await getProduksi()
        produksi = Array.isArray(produksiRaw) ? produksiRaw : []
      } catch (err) {
        produksi = []
      }
      
      try {
        const penjualanRaw = await getPenjualan()
        penjualan = Array.isArray(penjualanRaw) ? penjualanRaw : []
      } catch (err) {
        penjualan = []
      }
      
      try {
        const alatRaw = await getAlat()
        alat = Array.isArray(alatRaw) ? alatRaw : []
      } catch (err) {
        alat = []
      }

      const totalStok = bahanBaku.reduce((sum, item) => sum + (Number(item?.stok) || 0), 0)
      
      const stokMenipis = bahanBaku
        .filter(item => Number(item?.stok) <= Number(item?.stok_minimum))
        .map(item => `${item?.nama || 'Unknown'} (stok: ${item?.stok || 0} ${item?.satuan || ''})`)
      
      const today = new Date().toISOString().split('T')[0]
      const produksiHariIni = produksi
        .filter(p => p?.tgl_produksi?.split('T')[0] === today)
        .reduce((sum, p) => sum + (Number(p?.realisasi) || 0), 0)
      
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0')
      const currentYear = new Date().getFullYear()
      const penjualanBulanIni = penjualan
        .filter(p => {
          if (!p?.tgl_jual) return false
          if (p?.status !== 'Lunas') return false
          const [year, month] = p.tgl_jual.split('T')[0].split('-')
          return month === currentMonth && year === String(currentYear)
        })
        .reduce((sum, p) => sum + (Number(p?.total_harga) || 0), 0)
      
      const alatRusak = alat.filter(a => a?.kondisi?.includes('Rusak') || a?.kondisi === 'Rusak - Perlu Perbaikan').length
      const alatDiperbaiki = alat.filter(a => a?.kondisi === 'Sedang Diperbaiki').length

      setStats({ totalStok, produksiHariIni, penjualanBulanIni, stokMenipis, alatRusak, alatDiperbaiki })

      if (produksi.length > 0) {
        const sortedProduksi = [...produksi]
          .filter(p => p?.tgl_produksi)
          .sort((a, b) => new Date(a.tgl_produksi) - new Date(b.tgl_produksi))
          .slice(-5)
          .map(p => ({
            name: p.tgl_produksi.split('T')[0].split('-').slice(1).join('/'),
            target: Number(p?.target) || 0,
            realisasi: Number(p?.realisasi) || 0
          }))
        setProduksiChartData(sortedProduksi)
      } else {
        setProduksiChartData([])
      }

      if (penjualan.length > 0) {
        const last7Penjualan = [...penjualan]
          .filter(p => p?.tgl_jual && p?.status === 'Lunas')
          .sort((a, b) => new Date(a.tgl_jual) - new Date(b.tgl_jual))
          .slice(-7)
          .reduce((acc, p) => {
            const dateObj = new Date(p.tgl_jual)
            const date = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`
            const existing = acc.find(item => item.name === date)
            if (existing) {
              existing.value += Number(p?.total_harga) || 0
            } else {
              acc.push({ name: date, value: Number(p?.total_harga) || 0 })
            }
            return acc
          }, [])
        setPenjualanChartData(last7Penjualan)
      } else {
        setPenjualanChartData([])
      }

    } catch (err) { 
      setError('Gagal memuat data dashboard. Silakan refresh halaman.')
    } finally { 
      setIsLoading(false) 
    }
  }

  useEffect(() => { loadData() }, [])

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted">Memuat data dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Alert variant="danger" className="text-center">
          <FiAlertCircle size={32} className="mb-2" />
          <p>{error}</p>
          <Btn variant="primary" onClick={loadData}>Coba Lagi</Btn>
        </Alert>
      </div>
    )
  }

  return (
    <Container fluid className="p-3 p-md-4">
      <h1 className="h3 fw-bold text-dark mb-4">Dashboard</h1>
      
      <Row className="g-3 g-md-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Total Stok Bahan</p>
                  <h2 className="h3 fw-bold text-dark mb-0">{stats.totalStok} unit</h2>
                </div>
                <div className="bg-success bg-opacity-10 rounded-3 p-3">
                  <FiPackage size={24} className="text-success" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Produksi Hari Ini</p>
                  <h2 className="h3 fw-bold text-dark mb-0">{stats.produksiHariIni} porsi</h2>
                </div>
                <div className="bg-info bg-opacity-10 rounded-3 p-3">
                  <FiClipboard size={24} className="text-info" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Penjualan Bulan Ini</p>
                  <h2 className="h3 fw-bold text-dark mb-0">Rp {(stats.penjualanBulanIni || 0).toLocaleString()}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-3 p-3">
                  <FiShoppingCart size={24} className="text-warning" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Alat Rusak</p>
                  <h2 className="h3 fw-bold text-danger mb-0">{stats.alatRusak} alat</h2>
                  <p className="small text-primary mb-0">🛠️ {stats.alatDiperbaiki} sedang diperbaiki</p>
                </div>
                <div className="bg-danger bg-opacity-10 rounded-3 p-3">
                  <FiTool size={24} className="text-danger" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {stats.stokMenipis && stats.stokMenipis.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
            <div className="d-flex align-items-center">
              <FiAlertCircle className="me-2" />
              <strong>Peringatan Stok Menipis:</strong>
            </div>
            <ul className="d-flex flex-wrap gap-2 mb-0 ms-md-3">
              {stats.stokMenipis.map((item, i) => (
                <li key={i} className="badge bg-warning text-dark px-2 py-1 rounded-pill">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={6}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h3 className="h6 fw-semibold text-dark mb-0">Target vs Realisasi Produksi (5 Hari Terakhir)</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {produksiChartData && produksiChartData.length > 0 ? (
                <div className="w-100 overflow-auto">
                  <div style={{ minWidth: '300px' }}>
                    <BarChart 
                      data={produksiChartData} 
                      nameKey="name" 
                      multipleBars={[
                        { dataKey: 'target', name: 'Target', color: '#81C784' }, 
                        { dataKey: 'realisasi', name: 'Realisasi', color: '#2E7D32' }
                      ]} 
                      height={300} 
                      tooltipFormatter={(value) => `${value} porsi`} 
                      yAxisLabel="Jumlah (porsi)" 
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <FiClipboard size={40} className="mb-2 opacity-25" />
                  <p className="mb-0">Belum ada data produksi</p>
                  <p className="small mt-1">Tambahkan data produksi di menu Produksi</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h3 className="h6 fw-semibold text-dark mb-0">Tren Penjualan (7 Hari Terakhir)</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {penjualanChartData && penjualanChartData.length > 0 ? (
                <div className="w-100 overflow-auto">
                  <div style={{ minWidth: '300px' }}>
                    <LineChart 
                      data={penjualanChartData} 
                      dataKey="value" 
                      nameKey="name" 
                      height={300} 
                      showArea={false}
                      tooltipFormatter={(value) => `Rp ${Number(value).toLocaleString()}`} 
                      yAxisLabel="Nominal (Rp)" 
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                  <FiShoppingCart size={40} className="mb-2 opacity-25" />
                  <p className="mb-0">Belum ada data penjualan</p>
                  <p className="small mt-1">Tambahkan data penjualan di menu Penjualan</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard