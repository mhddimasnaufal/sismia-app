import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  FiHome, 
  FiPackage, 
  FiTool, 
  FiClipboard, 
  FiShoppingCart, 
  FiDollarSign, 
  FiFileText,
  FiLogOut,
  FiX
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'

const Sidebar = ({ onClose }) => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FiHome size={18} />, role: 'all' },
    { path: '/bahan-baku', name: 'Bahan Baku', icon: <FiPackage size={18} />, role: 'admin' },
    { path: '/alat', name: 'Alat Produksi', icon: <FiTool size={18} />, role: 'admin' },
    { path: '/produksi', name: 'Produksi', icon: <FiClipboard size={18} />, role: 'all' },
    { path: '/penjualan', name: 'Penjualan', icon: <FiShoppingCart size={18} />, role: 'admin' },
    { path: '/keuangan', name: 'Keuangan', icon: <FiDollarSign size={18} />, role: 'admin' },
    { path: '/laporan', name: 'Laporan', icon: <FiFileText size={18} />, role: 'admin' },
  ]

  const filteredMenu = menuItems.filter(item => 
    item.role === 'all' || (item.role === 'admin' && isAdmin)
  )

  const handleLogout = () => {
    if (logout && typeof logout === 'function') {
      logout()
    }
    navigate('/login', { replace: true })
  }

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <div className="p-3 border-bottom border-white border-opacity-25">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="text-white fs-4 fw-bold mb-0">SISMIA</h1>
            <p className="text-white-50 small mb-0">NOCOCO</p>
          </div>
          <button 
            className="btn btn-link text-white d-md-none p-0"
            onClick={onClose}
          >
            <FiX size={24} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow-1 p-3">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-2 px-3 py-2 mb-1 ${
                isActive ? 'active' : ''
              }`
            }
            onClick={() => onClose && onClose()}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-top border-white border-opacity-25">
        <button
          onClick={handleLogout}
          className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 w-100 px-3 py-2"
        >
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar