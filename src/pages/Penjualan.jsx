import React, { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiSearch, FiEdit2, FiShoppingCart } from 'react-icons/fi'
import { Container, Button, Form, Modal, Table, InputGroup, Spinner, Badge, Card } from 'react-bootstrap'
import { useNotification } from '../components/ui/Notification'
import { getPenjualan, addPenjualan, updatePenjualan, deletePenjualan } from '../services/api'

const Penjualan = () => {
  const { success, error } = useNotification()
  const [penjualan, setPenjualan] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDeleteId, setSelectedDeleteId] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ 
    tgl_jual: new Date().toISOString().split('T')[0], 
    pelanggan: '', 
    qty: '', 
    total_harga: '', 
    status: 'Lunas' 
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    try { 
      const data = await getPenjualan(); 
      setPenjualan(data || []) 
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
        tgl_jual: item.tgl_jual,
        pelanggan: item.pelanggan,
        qty: item.qty,
        total_harga: item.total_harga,
        status: item.status
      })
    } else {
      setEditingItem(null)
      setFormData({ 
        tgl_jual: new Date().toISOString().split('T')[0], 
        pelanggan: '', 
        qty: '', 
        total_harga: '', 
        status: 'Lunas' 
      })
    }
    setShowModal(true)
  }

  const filteredPenjualan = penjualan.filter(item => 
    item.pelanggan?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.pelanggan || !formData.qty || !formData.total_harga) { 
      error('Harap isi semua field!'); 
      return 
    }
    
    try {
      if (editingItem) {
        await updatePenjualan({ 
          id: editingItem.id,
          tgl_jual: formData.tgl_jual,
          pelanggan: formData.pelanggan,
          qty: parseInt(formData.qty), 
          total_harga: parseInt(formData.total_harga),
          status: formData.status
        })
        success('Data penjualan berhasil diupdate')
      } else {
        await addPenjualan({ 
          tgl_jual: formData.tgl_jual,
          pelanggan: formData.pelanggan,
          qty: parseInt(formData.qty), 
          total_harga: parseInt(formData.total_harga),
          status: formData.status
        })
        success('Data penjualan berhasil ditambahkan')
      }
      
      setShowModal(false)
      setEditingItem(null)
      setFormData({ 
        tgl_jual: new Date().toISOString().split('T')[0], 
        pelanggan: '', 
        qty: '', 
        total_harga: '', 
        status: 'Lunas' 
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
      await deletePenjualan(selectedDeleteId)
      success('Data penjualan berhasil dihapus')
      await loadData()
    } catch (err) { 
      error('Gagal menghapus data') 
    }
    setShowDeleteConfirm(false)
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
        <h1 className="h3 fw-bold text-dark mb-0">Manajemen Penjualan</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FiPlus className="me-2" /> Tambah Penjualan
        </Button>
      </div>

      {penjualan.length > 0 && (
        <InputGroup className="mb-4">
          <InputGroup.Text className="bg-white">
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Cari pelanggan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      )}

      {penjualan.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiShoppingCart size={48} className="text-muted mb-3 opacity-25" />
            <p className="text-muted mb-4">Belum ada data penjualan</p>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <FiPlus className="me-2" /> Tambah Penjualan Sekarang
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Total Harga</th>
                <th className="text-center">Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPenjualan.map((item) => (
                <tr key={item.id}>
                  <td>{item.tgl_jual}</td>
                  <td className="fw-medium">{item.pelanggan}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-end fw-medium">Rp {item.total_harga?.toLocaleString()}</td>
                  <td className="text-center">
                    <Badge bg={item.status === 'Lunas' ? 'success' : 'warning'} className={item.status !== 'Lunas' ? 'text-dark' : ''}>
                      {item.status}
                    </Badge>
                  </td>
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
          <Modal.Title>{editingItem ? "Edit Penjualan" : "Tambah Penjualan"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tanggal</Form.Label>
              <Form.Control
                type="date"
                value={formData.tgl_jual}
                onChange={(e) => setFormData({ ...formData, tgl_jual: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nama Pelanggan</Form.Label>
              <Form.Control
                type="text"
                value={formData.pelanggan}
                onChange={(e) => setFormData({ ...formData, pelanggan: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Jumlah (porsi)</Form.Label>
              <Form.Control
                type="number"
                value={formData.qty}
                onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Total Harga (Rp)</Form.Label>
              <Form.Control
                type="number"
                value={formData.total_harga}
                onChange={(e) => setFormData({ ...formData, total_harga: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Lunas">Lunas</option>
                <option value="Piutang">Piutang</option>
              </Form.Select>
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
          <p>Yakin ingin menghapus data penjualan ini?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Penjualan