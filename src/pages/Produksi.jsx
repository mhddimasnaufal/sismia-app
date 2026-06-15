import React, { useState, useEffect } from 'react'
import { FiSave, FiClock, FiTrash2, FiEdit2 } from 'react-icons/fi'
import { Container, Button, Form, Modal, Table, Spinner, Badge, Card } from 'react-bootstrap'
import { useNotification } from '../components/ui/Notification'
import { getProduksi, addProduksi, updateProduksi, deleteProduksi } from '../services/api'

const Produksi = () => {
  const { success, error } = useNotification()
  const [produksi, setProduksi] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({ 
    tgl_produksi: new Date().toISOString().split('T')[0], 
    target: '', 
    realisasi: '' 
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    try { 
      const data = await getProduksi(); 
      setProduksi(data || []) 
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
        tgl_produksi: item.tgl_produksi,
        target: item.target,
        realisasi: item.realisasi
      })
    } else {
      setEditingItem(null)
      setFormData({ 
        tgl_produksi: new Date().toISOString().split('T')[0], 
        target: '', 
        realisasi: '' 
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.target || !formData.realisasi) { 
      error('Harap isi target dan realisasi!'); 
      return 
    }
    
    try {
      if (editingItem) {
        await updateProduksi({ 
          id: editingItem.id,
          tgl_produksi: formData.tgl_produksi, 
          target: parseInt(formData.target), 
          realisasi: parseInt(formData.realisasi) 
        })
        success('Data produksi berhasil diupdate!')
      } else {
        await addProduksi({ 
          tgl_produksi: formData.tgl_produksi, 
          target: parseInt(formData.target), 
          realisasi: parseInt(formData.realisasi) 
        })
        success('Data produksi berhasil ditambahkan!')
      }
      
      setShowModal(false)
      setEditingItem(null)
      setFormData({ 
        tgl_produksi: new Date().toISOString().split('T')[0], 
        target: '', 
        realisasi: '' 
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
      await deleteProduksi(selectedDeleteId)
      success('Data produksi berhasil dihapus')
      await loadData()
    } catch (err) { 
      error('Gagal menghapus data') 
    }
    setShowDeleteConfirm(false)
  }

  const getStatusBadge = (target, realisasi) => {
    if (realisasi >= target) return <Badge bg="success">✓ Tercapai</Badge>
    if (realisasi >= target * 0.8) return <Badge bg="warning" text="dark">⚠ Mendekati</Badge>
    return <Badge bg="danger">✗ Kurang</Badge>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-bold text-dark mb-0">Manajemen Produksi Harian</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FiSave className="me-2" /> Tambah Produksi
        </Button>
      </div>

      {produksi.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiClock size={48} className="text-muted mb-3 opacity-25" />
            <p className="text-muted mb-4">Belum ada data produksi</p>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <FiSave className="me-2" /> Tambah Produksi Sekarang
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>Tanggal</th>
                <th className="text-center">Target</th>
                <th className="text-center">Realisasi</th>
                <th className="text-center">Capaian</th>
                <th className="text-center">Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {produksi.map((item) => {
                const percentage = item.target > 0 ? (item.realisasi / item.target) * 100 : 0
                return (
                  <tr key={item.id}>
                    <td>{item.tgl_produksi}</td>
                    <td className="text-center">{item.target}</td>
                    <td className="text-center">{item.realisasi}</td>
                    <td className="text-center fw-medium">{percentage.toFixed(1)}%</td>
                    <td className="text-center">{getStatusBadge(item.target, item.realisasi)}</td>
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
                )
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modal Form */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditingItem(null); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? "Edit Data Produksi" : "Tambah Data Produksi"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal</Form.Label>
              <Form.Control
                type="date"
                value={formData.tgl_produksi}
                onChange={(e) => setFormData({ ...formData, tgl_produksi: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Target (porsi)</Form.Label>
              <Form.Control
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Realisasi (porsi)</Form.Label>
              <Form.Control
                type="number"
                value={formData.realisasi}
                onChange={(e) => setFormData({ ...formData, realisasi: e.target.value })}
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
          <p>Yakin ingin menghapus data produksi ini?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Produksi