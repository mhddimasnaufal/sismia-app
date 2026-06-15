import React, { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiTrendingUp, FiTrendingDown, FiEdit2 } from 'react-icons/fi'
import { Container, Row, Col, Card, Button, Form, Modal, Table, Spinner, Badge } from 'react-bootstrap'
import { useNotification } from '../components/ui/Notification'
import { getKeuangan, addKeuangan, updateKeuangan, deleteKeuangan } from '../services/api'

const Keuangan = () => {
  const { success, error } = useNotification()
  const [keuangan, setKeuangan] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDeleteId, setSelectedDeleteId] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ 
    tgl_transaksi: new Date().toISOString().split('T')[0], 
    jenis: 'pemasukan', 
    nominal: '', 
    keterangan: '' 
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    try { 
      const data = await getKeuangan(); 
      setKeuangan(data || []) 
    } catch (err) { 
      error('Gagal memuat data') 
    } finally { 
      setIsLoading(false) 
    }
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        tgl_transaksi: item.tgl_transaksi,
        jenis: item.jenis,
        nominal: item.nominal,
        keterangan: item.keterangan
      })
    } else {
      setEditingItem(null)
      setFormData({ 
        tgl_transaksi: new Date().toISOString().split('T')[0], 
        jenis: 'pemasukan', 
        nominal: '', 
        keterangan: '' 
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.nominal || !formData.keterangan) { 
      error('Harap isi nominal dan keterangan!'); 
      return 
    }
    
    try {
      if (editingItem) {
        await updateKeuangan({ 
          id: editingItem.id,
          tgl_transaksi: formData.tgl_transaksi,
          jenis: formData.jenis,
          nominal: parseInt(formData.nominal),
          keterangan: formData.keterangan
        })
        success('Transaksi keuangan berhasil diupdate')
      } else {
        await addKeuangan({ 
          tgl_transaksi: formData.tgl_transaksi,
          jenis: formData.jenis,
          nominal: parseInt(formData.nominal),
          keterangan: formData.keterangan
        })
        success('Transaksi keuangan berhasil ditambahkan')
      }
      
      setShowModal(false)
      setEditingItem(null)
      setFormData({ 
        tgl_transaksi: new Date().toISOString().split('T')[0], 
        jenis: 'pemasukan', 
        nominal: '', 
        keterangan: '' 
      })
      await loadData()
      
    } catch (err) { 
      error('Gagal menyimpan data: ' + (err.message || 'Unknown error')) 
    }
  }

  const handleDeleteClick = (id) => { 
    setSelectedDeleteId(id)
    setShowDeleteConfirm(true)
  }
  
  const handleDelete = async () => {
    try { 
      await deleteKeuangan(selectedDeleteId)
      success('Transaksi keuangan berhasil dihapus')
      await loadData()
    } catch (err) { 
      error('Gagal menghapus data') 
    }
    setShowDeleteConfirm(false)
  }

  const totalPemasukan = keuangan.filter(k => k.jenis === 'pemasukan').reduce((sum, k) => sum + (k.nominal || 0), 0)
  const totalPengeluaran = keuangan.filter(k => k.jenis === 'pengeluaran').reduce((sum, k) => sum + (k.nominal || 0), 0)
  const saldo = totalPemasukan - totalPengeluaran

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <Container fluid className="p-3 p-md-4">
      <h1 className="h3 fw-bold text-dark mb-4">Manajemen Keuangan</h1>

      {/* Summary Cards */}
      <Row className="g-3 g-md-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-success bg-opacity-10">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Total Pemasukan</p>
                  <h3 className="h4 fw-bold text-success mb-0">Rp {totalPemasukan.toLocaleString()}</h3>
                </div>
                <div className="bg-success rounded-3 p-3">
                  <FiTrendingUp size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-danger bg-opacity-10">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Total Pengeluaran</p>
                  <h3 className="h4 fw-bold text-danger mb-0">Rp {totalPengeluaran.toLocaleString()}</h3>
                </div>
                <div className="bg-danger rounded-3 p-3">
                  <FiTrendingDown size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 bg-primary bg-opacity-10">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Saldo</p>
                  <h3 className={`h4 fw-bold mb-0 ${saldo >= 0 ? 'text-primary' : 'text-danger'}`}>
                    Rp {saldo.toLocaleString()}
                  </h3>
                  {saldo === 0 && <p className="small text-muted mb-0 mt-1">Saldo habis / nol</p>}
                </div>
                <div className="bg-primary rounded-3 p-3">
                  <span className="fs-3">💰</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mb-4">
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FiPlus className="me-2" /> Tambah Transaksi
        </Button>
      </div>

      {keuangan.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <span className="fs-1 opacity-25">💰</span>
            <p className="text-muted mt-3 mb-4">Belum ada data transaksi</p>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <FiPlus className="me-2" /> Tambah Transaksi Sekarang
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th className="text-end">Nominal</th>
                <th>Keterangan</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {keuangan.map((item) => (
                <tr key={item.id}>
                  <td>{item.tgl_transaksi}</td>
                  <td>
                    <Badge bg={item.jenis === 'pemasukan' ? 'success' : 'danger'} className="px-2 py-1">
                      {item.jenis === 'pemasukan' ? '💰 Pemasukan' : '📤 Pengeluaran'}
                    </Badge>
                  </td>
                  <td className="text-end fw-medium">Rp {item.nominal?.toLocaleString()}</td>
                  <td>{item.keterangan}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleOpenModal(item)}>
                        <FiEdit2 />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteClick(item.id)}>
                        <FiTrash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal Form */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditingItem(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? "Edit Transaksi" : "Tambah Transaksi"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal</Form.Label>
              <Form.Control
                type="date"
                value={formData.tgl_transaksi}
                onChange={(e) => setFormData({ ...formData, tgl_transaksi: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Jenis</Form.Label>
              <Form.Select
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
              >
                <option value="pemasukan">Pemasukan 💰</option>
                <option value="pengeluaran">Pengeluaran 📤</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nominal (Rp)</Form.Label>
              <Form.Control
                type="number"
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                placeholder="Masukkan nominal"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Keterangan</Form.Label>
              <Form.Control
                type="text"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Contoh: Pembelian bahan baku, Hasil penjualan, dll"
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => { setShowModal(false); setEditingItem(null); }}>
                Batal
              </Button>
              <Button type="submit" variant="primary">
                {editingItem ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal show={showDeleteConfirm} onHide={() => { setShowDeleteConfirm(false); setSelectedDeleteId(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Hapus Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Yakin ingin menghapus transaksi ini?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Keuangan