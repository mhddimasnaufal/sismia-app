import React, { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi'
import { Container, Button, Form, Modal, Table, InputGroup, Spinner, Badge, Card } from 'react-bootstrap'
import { useNotification } from '../components/ui/Notification'
import { getBahanBaku, addBahanBaku, updateBahanBaku, deleteBahanBaku } from '../services/api'

const BahanBaku = () => {
  const { success, error } = useNotification()
  const [bahan, setBahan] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentBahan, setCurrentBahan] = useState({ id: null, nama: '', satuan: '', stok: '', stok_minimum: '' })
  const [selectedDeleteId, setSelectedDeleteId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await getBahanBaku()
      setBahan(data)
    } catch (err) {
      error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredBahan = bahan.filter(item =>
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditMode(false)
    setCurrentBahan({ id: null, nama: '', satuan: '', stok: '', stok_minimum: '' })
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditMode(true)
    setCurrentBahan(item)
    setShowModal(true)
  }

  const handleDeleteClick = (id) => {
    setSelectedDeleteId(id)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    try {
      await deleteBahanBaku(selectedDeleteId)
      success('Data bahan baku berhasil dihapus')
      loadData()
    } catch (err) {
      error('Gagal menghapus data')
    }
    setShowDeleteConfirm(false)
  }

  const handleSave = async () => {
    if (!currentBahan.nama || !currentBahan.satuan) {
      error('Harap isi nama bahan dan satuan!')
      return
    }

    try {
      if (editMode) {
        await updateBahanBaku({
          id: currentBahan.id,
          nama: currentBahan.nama,
          satuan: currentBahan.satuan,
          stok: parseInt(currentBahan.stok) || 0,
          stok_minimum: parseInt(currentBahan.stok_minimum) || 0
        })
        success('Data bahan baku berhasil diupdate')
      } else {
        await addBahanBaku({
          nama: currentBahan.nama,
          satuan: currentBahan.satuan,
          stok: parseInt(currentBahan.stok) || 0,
          stok_minimum: parseInt(currentBahan.stok_minimum) || 0
        })
        success('Data bahan baku berhasil ditambahkan')
      }
      loadData()
      setShowModal(false)
    } catch (err) {
      error('Gagal menyimpan data')
    }
  }

  const getStokStatus = (stok, min) => {
    if (stok <= min) return <Badge bg="warning" text="dark">⚠️ Stok Menipis</Badge>
    return <Badge bg="success">✓ Aman</Badge>
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
        <h1 className="h3 fw-bold text-dark mb-0">Manajemen Bahan Baku</h1>
        <Button variant="primary" onClick={handleAdd}>
          <FiPlus className="me-2" /> Tambah Bahan
        </Button>
      </div>

      {bahan.length > 0 && (
        <InputGroup className="mb-4">
          <InputGroup.Text className="bg-white">
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Cari bahan baku..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      )}

      {bahan.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiPackage size={48} className="text-muted mb-3 opacity-25" />
            <p className="text-muted mb-4">Belum ada data bahan baku</p>
            <Button variant="primary" onClick={handleAdd}>
              <FiPlus className="me-2" /> Tambah Bahan Sekarang
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>Nama Bahan</th>
                <th>Satuan</th>
                <th className="text-center">Stok</th>
                <th className="text-center">Stok Minimum</th>
                <th className="text-center">Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBahan.map((item) => (
                <tr key={item.id}>
                  <td className="fw-medium">{item.nama}</td>
                  <td>{item.satuan}</td>
                  <td className="text-center">{item.stok}</td>
                  <td className="text-center">{item.stok_minimum}</td>
                  <td className="text-center">{getStokStatus(item.stok, item.stok_minimum)}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit Bahan Baku' : 'Tambah Bahan Baku'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nama Bahan</Form.Label>
              <Form.Control
                type="text"
                value={currentBahan.nama}
                onChange={(e) => setCurrentBahan({ ...currentBahan, nama: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Satuan</Form.Label>
              <Form.Control
                type="text"
                value={currentBahan.satuan}
                onChange={(e) => setCurrentBahan({ ...currentBahan, satuan: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stok</Form.Label>
              <Form.Control
                type="number"
                value={currentBahan.stok}
                onChange={(e) => setCurrentBahan({ ...currentBahan, stok: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stok Minimum</Form.Label>
              <Form.Control
                type="number"
                value={currentBahan.stok_minimum}
                onChange={(e) => setCurrentBahan({ ...currentBahan, stok_minimum: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
          <Button variant="primary" onClick={handleSave}>Simpan</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Hapus Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Yakin ingin menghapus data bahan baku ini?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default BahanBaku