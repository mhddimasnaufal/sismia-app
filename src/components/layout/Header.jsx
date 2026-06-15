import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification, NotificationBell } from '../ui/Notification'
import { resetAllData } from '../../services/api'
import { 
  FiUser, FiLock, FiKey, FiUsers, 
  FiLogOut, FiChevronDown, FiX, 
  FiAlertCircle, FiTrash2, FiRefreshCw, FiMenu
} from 'react-icons/fi'
import { Button, Modal, Form } from 'react-bootstrap'

const Header = ({ onMenuClick }) => {
  const { user, logout, updatePassword, updateUsername, getAllUsers } = useAuth()
  const { success, error, warning, info } = useNotification()
  const [showProfile, setShowProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showChangeUsername, setShowChangeUsername] = useState(false)
  const [showManageTeam, setShowManageTeam] = useState(false)
  const [showResetData, setShowResetData] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newTeamPassword, setNewTeamPassword] = useState('')
  const [newTeamConfirmPassword, setNewTeamConfirmPassword] = useState('')
  const [teamUsers, setTeamUsers] = useState([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const dropdownRef = useRef(null)

  const [currentTime, setCurrentTime] = useState(new Date())

  const currentDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const currentClock = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const isAdmin = user?.role === 'admin'

  // Timer untuk jam
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load team users
  useEffect(() => {
    if (isAdmin && getAllUsers && typeof getAllUsers === 'function') {
      const loadTeamUsers = async () => {
        try {
          const users = await getAllUsers()
          if (Array.isArray(users)) {
            setTeamUsers(users.filter(u => u?.role === 'produksi'))
          } else {
            setTeamUsers([])
          }
        } catch (err) {
          console.error('Error loading team users:', err)
          setTeamUsers([])
        }
      }
      loadTeamUsers()
    }
  }, [isAdmin, getAllUsers])

  const showMessage = (msg, type = 'success') => {
    setMessage(msg)
    setMessageType(type)
    if (type === 'success' && success) success(msg)
    else if (type === 'error' && error) error(msg)
    else if (type === 'warning' && warning) warning(msg)
    else if (info) info(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  // ==================== UBAH PASSWORD SENDIRI ====================
  const handleChangeOwnPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showMessage('Harap isi kedua password!', 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      showMessage('Password baru tidak cocok!', 'error')
      return
    }

    if (newPassword.length < 6) {
      showMessage('Password minimal 6 karakter!', 'error')
      return
    }

    try {
      const result = await updatePassword(user?.id, oldPassword, newPassword)
      if (result && result.success) {
        showMessage('Password berhasil diubah!', 'success')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowChangePassword(false)
      } else {
        showMessage(result?.message || 'Gagal mengubah password', 'error')
      }
    } catch (err) {
      console.error('Change password error:', err)
      showMessage('Terjadi kesalahan', 'error')
    }
  }

  // ==================== UBAH USERNAME SENDIRI (HANYA UNTUK ADMIN) ====================
  const handleChangeOwnUsername = async () => {
    if (!isAdmin) {
      showMessage('Tim produksi tidak dapat mengubah username!', 'error')
      setShowChangeUsername(false)
      return
    }

    if (!newUsername) {
      showMessage('Harap masukkan username baru!', 'error')
      return
    }

    if (newUsername.length < 3) {
      showMessage('Username minimal 3 karakter!', 'error')
      return
    }

    try {
      const result = await updateUsername(user?.id, newUsername, oldPassword)
      if (result && result.success) {
        showMessage('Username berhasil diubah! Silakan login ulang.', 'success')
        setTimeout(() => {
          if (logout && typeof logout === 'function') {
            logout()
          }
          window.location.href = '/login'
        }, 2000)
      } else {
        showMessage(result?.message || 'Gagal mengubah username', 'error')
      }
    } catch (err) {
      console.error('Change username error:', err)
      showMessage('Terjadi kesalahan', 'error')
    }
  }

  // ==================== UBAH PASSWORD TEAM PRODUKSI ====================
  const handleChangeTeamPassword = async () => {
    if (!selectedUser) {
      showMessage('Pilih akun tim produksi terlebih dahulu!', 'error')
      return
    }

    if (!newTeamPassword || !newTeamConfirmPassword) {
      showMessage('Harap isi password baru!', 'error')
      return
    }

    if (newTeamPassword !== newTeamConfirmPassword) {
      showMessage('Password baru tidak cocok!', 'error')
      return
    }

    if (newTeamPassword.length < 6) {
      showMessage('Password minimal 6 karakter!', 'error')
      return
    }

    try {
      const result = await updatePassword(selectedUser.id, null, newTeamPassword)
      if (result && result.success) {
        showMessage(`Password untuk ${selectedUser.username} berhasil diubah!`, 'success')
        setNewTeamPassword('')
        setNewTeamConfirmPassword('')
        setSelectedUser(null)
        setShowManageTeam(false)
      } else {
        showMessage(result?.message || 'Gagal mengubah password', 'error')
      }
    } catch (err) {
      console.error('Change team password error:', err)
      showMessage('Terjadi kesalahan', 'error')
    }
  }

  // ==================== RESET SEMUA DATA ====================
  const handleResetAllData = async () => {
    if (resetConfirmText !== 'RESET DATA') {
      showMessage('Ketik "RESET DATA" untuk konfirmasi penghapusan semua data!', 'error')
      return
    }

    if (!window.confirm('⚠️ PERINGATAN AKHIR: Anda yakin ingin menghapus SEMUA data? Tindakan ini TIDAK DAPAT DIBATALKAN!')) {
      return
    }

    setIsResetting(true)
    try {
      const result = await resetAllData()
      
      if (result && result.success) {
        showMessage('Semua data berhasil direset! Halaman akan direfresh.', 'success')
        setResetConfirmText('')
        setShowResetData(false)
        
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        showMessage(result?.message || 'Gagal mereset data', 'error')
      }
    } catch (err) {
      console.error('Error saat reset:', err)
      showMessage('Terjadi kesalahan: ' + (err.message || 'Gagal mereset data'), 'error')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm px-3 px-md-4 py-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-link text-dark p-0 d-md-none"
            onClick={onMenuClick}
          >
            <FiMenu size={24} />
          </button>
          <div>
            <h2 className="h6 mb-0 fw-semibold text-dark">
              Selamat datang, {user?.name || (user?.role === 'admin' ? 'Admin' : 'Tim Produksi')}
            </h2>
            <p className="small text-muted mb-0">{currentDate}</p>
            <p className="small text-primary mb-0">🕒 {currentClock}</p>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          <NotificationBell />

          {isAdmin && (
            <button
              onClick={() => setShowManageTeam(true)}
              className="btn btn-light rounded-circle p-2 position-relative"
              title="Kelola Akun Tim Produksi"
            >
              <FiUsers size={18} />
            </button>
          )}

          <div className="position-relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-2"
            >
              <div className="bg-primary-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                <span className="text-primary-dark fw-bold">
                  {user?.role === 'admin' ? 'A' : 'P'}
                </span>
              </div>
              <FiChevronDown size={14} className="text-muted" />
            </button>
            
            {showProfile && (
              <div className="dropdown-menu show position-absolute end-0 mt-2 shadow" style={{ minWidth: '250px' }}>
                <div className="px-3 py-2 bg-primary-dark text-white rounded-top">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                      <span className="text-primary-dark fw-bold">{user?.role === 'admin' ? 'A' : 'P'}</span>
                    </div>
                    <div>
                      <p className="fw-bold mb-0">{user?.name || (user?.role === 'admin' ? 'Administrator' : 'Tim Produksi')}</p>
                      <p className="small opacity-75 mb-0">@{user?.username}</p>
                      <p className="small opacity-75 mb-0">{user?.role === 'admin' ? '👑 Administrator' : '👥 Tim Produksi'}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => { setShowProfile(false); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); setShowChangePassword(true); }}>
                    <FiKey size={16} /> Ubah Password Saya
                  </button>
                  {isAdmin && (
                    <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => { setShowProfile(false); setOldPassword(''); setNewUsername(''); setShowChangeUsername(true); }}>
                      <FiUser size={16} /> Ubah Username Saya
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <hr className="dropdown-divider" />
                      <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => { setShowProfile(false); setSelectedUser(null); setNewTeamPassword(''); setNewTeamConfirmPassword(''); setShowManageTeam(true); }}>
                        <FiUsers size={16} /> Kelola Akun Tim Produksi
                      </button>
                      <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => { setShowProfile(false); setResetConfirmText(''); setShowResetData(true); }}>
                        <FiTrash2 size={16} /> Reset Seluruh Data
                      </button>
                    </>
                  )}
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={() => { setShowProfile(false); logout(); }}>
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MODAL UBAH PASSWORD */}
      <Modal show={showChangePassword} onHide={() => setShowChangePassword(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FiKey className="me-2" /> Ubah Password Saya</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Password Lama</Form.Label>
              <Form.Control type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Masukkan password lama" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password Baru</Form.Label>
              <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Konfirmasi Password Baru</Form.Label>
              <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ketik ulang password baru" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangePassword(false)}>Batal</Button>
          <Button variant="primary" onClick={handleChangeOwnPassword}>Simpan Password</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL UBAH USERNAME */}
      <Modal show={showChangeUsername} onHide={() => setShowChangeUsername(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FiUser className="me-2" /> Ubah Username Saya</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Password untuk Verifikasi</Form.Label>
              <Form.Control type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Masukkan password Anda" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username Baru</Form.Label>
              <Form.Control type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Minimal 3 karakter" />
            </Form.Group>
            <div className="alert alert-warning small">
              <FiAlertCircle className="me-1" />
              Perhatian: Setelah mengubah username, Anda akan logout dan harus login ulang.
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangeUsername(false)}>Batal</Button>
          <Button variant="primary" onClick={handleChangeOwnUsername}>Simpan Username</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL KELOLA TIM PRODUKSI */}
      <Modal show={showManageTeam} onHide={() => setShowManageTeam(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title><FiUsers className="me-2" /> Kelola Akun Tim Produksi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!selectedUser ? (
            <>
              <p className="text-muted small mb-3">Pilih akun tim produksi yang akan diubah passwordnya:</p>
              <div className="list-group">
                {!teamUsers || teamUsers.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <FiUsers size={32} className="mb-2 text-muted" />
                    <p className="mb-0">Belum ada akun tim produksi</p>
                  </div>
                ) : (
                  teamUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <p className="fw-semibold mb-0">{u.username}</p>
                        <p className="small text-muted mb-0">{u.name || 'Tim Produksi'}</p>
                      </div>
                      <FiChevronDown size={16} />
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="bg-light p-3 rounded mb-3">
                <p className="small text-muted mb-0">Mengubah password untuk:</p>
                <p className="fw-semibold mb-0">{selectedUser.username}</p>
              </div>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Password Baru</Form.Label>
                  <Form.Control type="password" value={newTeamPassword} onChange={(e) => setNewTeamPassword(e.target.value)} placeholder="Minimal 6 karakter" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Konfirmasi Password Baru</Form.Label>
                  <Form.Control type="password" value={newTeamConfirmPassword} onChange={(e) => setNewTeamConfirmPassword(e.target.value)} placeholder="Ketik ulang password baru" />
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedUser ? (
            <>
              <Button variant="secondary" onClick={() => setSelectedUser(null)}>Kembali</Button>
              <Button variant="primary" onClick={handleChangeTeamPassword}>Simpan Password</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setShowManageTeam(false)}>Tutup</Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* MODAL RESET DATA */}
      <Modal show={showResetData} onHide={() => !isResetting && setShowResetData(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-danger"><FiTrash2 className="me-2" /> Reset Seluruh Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            <FiAlertCircle className="me-2" />
            <strong>Peringatan!</strong> Tindakan ini akan menghapus SEMUA data berikut secara permanen:
            <ul className="mt-2 mb-0">
              <li>Bahan Baku</li>
              <li>Alat Produksi</li>
              <li>Data Produksi Harian</li>
              <li>Data Penjualan</li>
              <li>Data Keuangan</li>
              <li>Dan lain-lain</li>
            </ul>
            <p className="mt-2 fw-semibold mb-0">Data yang sudah dihapus TIDAK DAPAT DIKEMBALIKAN!</p>
          </div>
          <Form.Group>
            <Form.Label>
              Ketik <span className="fw-bold text-danger">"RESET DATA"</span> untuk konfirmasi
            </Form.Label>
            <Form.Control 
              type="text" 
              value={resetConfirmText} 
              onChange={(e) => setResetConfirmText(e.target.value)} 
              placeholder="Ketik: RESET DATA"
              disabled={isResetting}
            />
          </Form.Group>
          {message && showResetData && (
            <div className={`alert mt-3 ${messageType === 'success' ? 'alert-success' : 'alert-danger'} py-2`}>
              {message}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetData(false)} disabled={isResetting}>Batal</Button>
          <Button variant="danger" onClick={handleResetAllData} disabled={isResetting}>
            {isResetting ? <><FiRefreshCw className="spinner-border spinner-border-sm me-1" /> Memproses...</> : <><FiTrash2 /> Hapus Semua Data</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Header