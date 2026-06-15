import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Container, Row, Col, Card, Form, Button, Alert, Modal } from 'react-bootstrap'
import { FiKey } from 'react-icons/fi'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotUsername, setForgotUsername] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')
  const [forgotIsError, setForgotIsError] = useState(false)
  
  const { login, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const success = await login(username, password, role)
      if (success) {
        if (!localStorage.getItem('sismia_bahanBaku')) localStorage.setItem('sismia_bahanBaku', JSON.stringify([]))
        if (!localStorage.getItem('sismia_alat')) localStorage.setItem('sismia_alat', JSON.stringify([]))
        if (!localStorage.getItem('sismia_produksi')) localStorage.setItem('sismia_produksi', JSON.stringify([]))
        if (!localStorage.getItem('sismia_penjualan')) localStorage.setItem('sismia_penjualan', JSON.stringify([]))
        if (!localStorage.getItem('sismia_keuangan')) localStorage.setItem('sismia_keuangan', JSON.stringify([]))
        
        navigate('/dashboard', { replace: true })
      } else {
        setError('Username atau password salah')
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotUsername) {
      setForgotMessage('Harap masukkan username!')
      setForgotIsError(true)
      setTimeout(() => setForgotMessage(''), 3000)
      return
    }
    if (!forgotNewPassword || !forgotConfirmPassword) {
      setForgotMessage('Harap isi password baru!')
      setForgotIsError(true)
      setTimeout(() => setForgotMessage(''), 3000)
      return
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotMessage('Password baru tidak cocok!')
      setForgotIsError(true)
      setTimeout(() => setForgotMessage(''), 3000)
      return
    }
    if (forgotNewPassword.length < 6) {
      setForgotMessage('Password minimal 6 karakter!')
      setForgotIsError(true)
      setTimeout(() => setForgotMessage(''), 3000)
      return
    }

    try {
      const result = await resetPassword(forgotUsername, forgotNewPassword)
      if (result.success) {
        setForgotMessage('Password berhasil diubah! Silakan login.')
        setForgotIsError(false)
        setTimeout(() => {
          setForgotMessage('')
          setShowForgotModal(false)
          setForgotUsername('')
          setForgotNewPassword('')
          setForgotConfirmPassword('')
        }, 2000)
      } else {
        setForgotMessage(result.message || 'Gagal mengubah password')
        setForgotIsError(true)
        setTimeout(() => setForgotMessage(''), 3000)
      }
    } catch (error) {
      setForgotMessage('Terjadi kesalahan, coba lagi!')
      setForgotIsError(true)
      setTimeout(() => setForgotMessage(''), 3000)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ 
      background: 'linear-gradient(135deg, #0a5c2e 0%, #064e1f 100%)'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={11} sm={10} md={8} lg={5} xl={4}>
            <Card className="shadow-lg border-0 rounded-4 overflow-hidden">
              {/* Header */}
              <div className="text-center py-4" style={{ background: 'linear-gradient(135deg, #0a5c2e 0%, #064e1f 100%)' }}>
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 70, height: 70 }}>
                  <span className="text-success fw-bold fs-2">S</span>
                </div>
                <h1 className="text-white fw-bold mb-0 fs-2">SISMIA</h1>
                <p className="text-white-50 small mb-0">Sistem Informasi Manajemen NOCOCO</p>
              </div>

              {/* Form */}
              <Card.Body className="p-4 p-md-5">
                {role === 'admin' && (
                  <button
                    onClick={() => setShowForgotModal(true)}
                    className="position-absolute top-0 end-0 p-2 border-0 bg-transparent"
                    style={{ opacity: 0.5 }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                  >
                    {/* <FiKey size={16} /> */}
                  </button>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Role</Form.Label>
                    <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="admin">👑 Admin (Pemilik)</option>
                      <option value="produksi">👥 Tim Produksi</option>
                    </Form.Select>
                  </Form.Group>

                  {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                  <Button 
                    type="submit" 
                    variant="success" 
                    className="w-100 py-2 fw-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Memproses...' : 'Login'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal Forgot Password */}
      <Modal show={showForgotModal} onHide={() => setShowForgotModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Lupa Password Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">Masukkan username admin dan password baru.</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Username Admin</Form.Label>
              <Form.Control type="text" value={forgotUsername} onChange={(e) => setForgotUsername(e.target.value)} placeholder="Username admin" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password Baru</Form.Label>
              <Form.Control type="password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} placeholder="Minimal 6 karakter" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Konfirmasi Password Baru</Form.Label>
              <Form.Control type="password" value={forgotConfirmPassword} onChange={(e) => setForgotConfirmPassword(e.target.value)} placeholder="Ketik ulang password" />
            </Form.Group>
          </Form>
          {forgotMessage && <Alert variant={forgotIsError ? 'danger' : 'success'} className="mt-3 py-2 small">{forgotMessage}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForgotModal(false)}>Batal</Button>
          <Button variant="success" onClick={handleForgotPassword}>Reset Password</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Login