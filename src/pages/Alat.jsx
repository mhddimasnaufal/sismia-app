import React, { useState, useEffect } from 'react'
import { FiPlus, FiTrash2, FiSearch, FiAlertCircle, FiSend, FiTool } from 'react-icons/fi'
import { Container, Row, Col, Card, Button, Form, Modal, Table, Badge, InputGroup, Spinner, Alert } from 'react-bootstrap'
import { useNotification } from '../components/ui/Notification'
import { getAlat, addAlat, deleteAlat, addLaporanKerusakan } from '../services/api'

const Alat = () => {
  const { success, error } = useNotification()
  const [alat, setAlat] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRepairModal, setShowRepairModal] = useState(false)
  const [selectedDeleteId, setSelectedDeleteId] = useState(null)
  const [selectedAlat, setSelectedAlat] = useState(null)
  const [repairDesc, setRepairDesc] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({ nama_alat: '', kondisi: 'Baik', terakhir_perawatan: new Date().toISOString().split('T')[0] })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    try { 
      const data = await getAlat(); 
      setAlat(data || []) 
    } catch (err) { 
      error('Gagal memuat data') 
    } finally { 
      setIsLoading(false) 
    }
  }

  const filteredAlat = alat.filter(item => 
    item.nama_alat?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setFormData({ nama_alat: '', kondisi: 'Baik', terakhir_perawatan: new Date().toISOString().split('T')[0] })
    setShowModal(true)
  }

  const handleDeleteClick = (id) => { 
    setSelectedDeleteId(id)
    setShowDeleteConfirm(true)
  }
  
  const handleDelete = async () => {
    try { 
      await deleteAlat(selectedDeleteId)
      success('Data alat berhasil dihapus')
      loadData() 
    } catch (err) { 
      error('Gagal menghapus data') 
    }
    setShowDeleteConfirm(false)
  }

  const handleSave = async () => {
    if (!formData.nama_alat) { 
      error('Harap isi nama alat!')
      return 
    }
    try {
      await addAlat(formData)
      success('Data alat berhasil ditambahkan')
      loadData()
      setShowModal(false)
    } catch (err) { 
      error('Gagal menyimpan data') 
    }
  }

  const openRepairModal = (item) => { 
    setSelectedAlat(item)
    setRepairDesc('')
    setShowRepairModal(true)
  }
  
  const handleReportRepair = async () => {
    if (!repairDesc) { 
      error('Harap isi deskripsi kerusakan!')
      return 
    }
    try {
      await addLaporanKerusakan({
        alat_id: selectedAlat.id,
        nama_alat: selectedAlat.nama_alat,
        deskripsi_kerusakan: repairDesc,
        tgl_laporan: new Date().toISOString().split('T')[0],
        status: 'Menunggu Perbaikan'
      })
      
      success(`Laporan kerusakan untuk ${selectedAlat.nama_alat} telah dikirim`)
      await loadData()
      setShowRepairModal(false)
      setRepairDesc('')
    } catch (err) { 
      error('Gagal mengirim laporan: ' + (err.message || 'Unknown error')) 
    }
  }

  const getKondisiBadge = (kondisi) => {
    if (kondisi === 'Baik') return <Badge bg="success">{kondisi}</Badge>
    if (kondisi === 'Sedang Diperbaiki') return <Badge bg="primary">🔧 {kondisi}</Badge>
    if (kondisi === 'Rusak - Perlu Perbaikan') return <Badge bg="warning" text="dark">{kondisi}</Badge>
    if (kondisi?.includes('Rusak')) return <Badge bg="danger">{kondisi}</Badge>
    return <Badge bg="secondary">{kondisi}</Badge>
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
        <h1 className="h3 fw-bold text-dark mb-0">Manajemen Alat Produksi</h1>
        <Button variant="primary" onClick={handleAdd}>
          <FiPlus className="me-2" /> Tambah Alat
        </Button>
      </div>

      {alat.length > 0 && (
        <InputGroup className="mb-4">
          <InputGroup.Text className="bg-white">
            <FiSearch />
          </InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Cari alat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      )}

      {alat.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiTool size={48} className="text-muted mb-3 opacity-25" />
            <p className="text-muted mb-4">Belum ada data alat produksi</p>
            <Button variant="primary" onClick={handleAdd}>
              <FiPlus className="me-2" /> Tambah Alat Sekarang
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>Nama Alat</th>
                <th className="text-center">Kondisi</th>
                <th className="text-center">Terakhir Perawatan</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlat.map((item) => (
                <tr key={item.id}>
                  <td className="fw-medium">{item.nama_alat}</td>
                  <td className="text-center">{getKondisiBadge(item.kondisi)}</td>
                  <td className="text-center">{item.terakhir_perawatan}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => openRepairModal(item)}
                        title="Lapor Kerusakan"
                      >
                        <FiAlertCircle />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(item.id)}
                        title="Hapus"
                      >
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

      {/* Modal Tambah/Edit Alat */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Alat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nama Alat</Form.Label>
              <Form.Control
                type="text"
                value={formData.nama_alat}
                onChange={(e) => setFormData({ ...formData, nama_alat: e.target.value })}
                placeholder="Masukkan nama alat"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kondisi</Form.Label>
              <Form.Select
                value={formData.kondisi}
                onChange={(e) => setFormData({ ...formData, kondisi: e.target.value })}
              >
                <option>Baik</option>
                <option>Perlu Perawatan</option>
                <option>Rusak Ringan</option>
                <option>Rusak Berat</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Terakhir Perawatan</Form.Label>
              <Form.Control
                type="date"
                value={formData.terakhir_perawatan}
                onChange={(e) => setFormData({ ...formData, terakhir_perawatan: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
          <Button variant="primary" onClick={handleSave}>Simpan</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Lapor Kerusakan */}
      <Modal show={showRepairModal} onHide={() => setShowRepairModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Lapor Kerusakan Alat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-3">
            <strong>Alat:</strong> {selectedAlat?.nama_alat}<br />
            <strong>Kondisi Saat Ini:</strong> {selectedAlat?.kondisi}
          </Alert>
          <Form.Group>
            <Form.Label>Deskripsi Kerusakan <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={repairDesc}
              onChange={(e) => setRepairDesc(e.target.value)}
              placeholder="Jelaskan kerusakan yang terjadi secara detail..."
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRepairModal(false)}>Batal</Button>
          <Button variant="warning" onClick={handleReportRepair}>
            <FiSend className="me-2" /> Kirim Laporan
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Hapus Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Yakin ingin menghapus data alat ini?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Alat