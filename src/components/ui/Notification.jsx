import React, { useState, useEffect, createContext, useContext } from 'react'
import { Toast, ToastContainer, Badge, Dropdown } from 'react-bootstrap'
import { 
  FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle, 
  FiX, FiBell, FiTrash2 
} from 'react-icons/fi'

// Notification Context
const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [notificationHistory, setNotificationHistory] = useState([])
  const [position, setPosition] = useState('top-end')

  const addNotification = (notification) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 6)
    const newNotification = {
      id,
      type: notification.type || 'info',
      title: notification.title || '',
      message: notification.message,
      duration: notification.duration || 5000,
      timestamp: new Date().toISOString(),
      read: false,
      action: notification.action || null,
      ...notification
    }
    
    setNotifications(prev => [...prev, newNotification])
    setNotificationHistory(prev => [newNotification, ...prev])
    
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }
  
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }
  
  const markAsRead = (id) => {
    setNotificationHistory(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotificationHistory(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const clearHistory = () => {
    setNotificationHistory([])
  }

  const removeFromHistory = (id) => {
    setNotificationHistory(prev => prev.filter(notif => notif.id !== id))
  }
  
  const clearAll = () => {
    setNotifications([])
  }
  
  const success = (message, options = {}) => {
    return addNotification({ type: 'success', message, ...options })
  }
  
  const error = (message, options = {}) => {
    return addNotification({ type: 'error', message, ...options })
  }
  
  const warning = (message, options = {}) => {
    return addNotification({ type: 'warning', message, ...options })
  }
  
  const info = (message, options = {}) => {
    return addNotification({ type: 'info', message, ...options })
  }
  
  const setPositionConfig = (newPosition) => {
    setPosition(newPosition)
  }
  
  return (
    <NotificationContext.Provider value={{
      notifications,
      notificationHistory,
      unreadCount: notificationHistory.filter(n => !n.read).length,
      addNotification,
      removeNotification,
      clearAll,
      success,
      error,
      warning,
      info,
      setPositionConfig,
      markAsRead,
      markAllAsRead,
      clearHistory,
      removeFromHistory
    }}>
      {children}
      <ToastContainer position={position} className="p-3" style={{ zIndex: 1060 }}>
        {notifications.map(notification => (
          <NotificationToast key={notification.id} notification={notification} onClose={removeNotification} />
        ))}
      </ToastContainer>
    </NotificationContext.Provider>
  )
}

// Toast Component
const NotificationToast = ({ notification, onClose }) => {
  const [show, setShow] = useState(true)
  
  const getVariant = () => {
    switch (notification.type) {
      case 'success': return 'success'
      case 'error': return 'danger'
      case 'warning': return 'warning'
      default: return 'info'
    }
  }
  
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <FiCheckCircle size={20} className="text-success" />
      case 'error': return <FiXCircle size={20} className="text-danger" />
      case 'warning': return <FiAlertCircle size={20} className="text-warning" />
      default: return <FiInfo size={20} className="text-info" />
    }
  }
  
  const handleClose = () => {
    setShow(false)
    setTimeout(() => onClose(notification.id), 300)
  }
  
  return (
    <Toast show={show} onClose={handleClose} delay={notification.duration} autohide bg="white" className="shadow-sm border-0 mb-2">
      <Toast.Header className="border-0 bg-white">
        <div className="rounded-circle me-2">{getIcon()}</div>
        <strong className="me-auto">
          {notification.title || (notification.type === 'success' ? 'Berhasil' : notification.type === 'error' ? 'Gagal' : notification.type === 'warning' ? 'Peringatan' : 'Informasi')}
        </strong>
        <small className="text-muted">baru saja</small>
        <button type="button" className="btn-close btn-close-sm ms-2" onClick={handleClose} aria-label="Close" />
      </Toast.Header>
      <Toast.Body className="text-secondary small">
        {notification.message}
        {notification.action && (
          <div className="mt-2">
            <button
              onClick={() => {
                notification.action.onClick()
                handleClose()
              }}
              className="btn btn-sm btn-link p-0 text-decoration-none"
            >
              {notification.action.label}
            </button>
          </div>
        )}
      </Toast.Body>
    </Toast>
  )
}

// Notification Bell Component (di Header)
export const NotificationBell = () => {
  const [showDropdown, setShowDropdown] = useState(false)
  const { notificationHistory, unreadCount, markAsRead, markAllAsRead, clearHistory, removeFromHistory } = useNotification()
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    return `${diffDays} hari lalu`
  }
  
  const getIconByType = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle size={14} className="text-success" />
      case 'error':
        return <FiXCircle size={14} className="text-danger" />
      case 'warning':
        return <FiAlertCircle size={14} className="text-warning" />
      default:
        return <FiInfo size={14} className="text-info" />
    }
  }
  
  return (
    <Dropdown show={showDropdown} onToggle={setShowDropdown} align="end">
      <Dropdown.Toggle as="button" className="btn btn-light rounded-circle p-2 position-relative">
        <FiBell size={18} className="text-secondary" />
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            pill 
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '10px', padding: '2px 6px' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>
      
      <Dropdown.Menu className="shadow-sm border-0 mt-2" style={{ width: '380px' }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <span className="fw-semibold">Notifikasi</span>
          <div className="d-flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn btn-sm btn-link text-decoration-none text-muted p-0"
              >
                Tandai semua sudah dibaca
              </button>
            )}
            {notificationHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="btn btn-sm btn-link text-danger text-decoration-none p-0"
              >
                Hapus semua
              </button>
            )}
          </div>
        </div>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {notificationHistory.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FiBell size={32} className="mb-2 opacity-25" />
              <p className="small mb-0">Belum ada notifikasi</p>
              <p className="small text-muted mt-1">Notifikasi akan muncul di sini saat ada aktivitas</p>
            </div>
          ) : (
            notificationHistory.map(notif => (
              <div 
                key={notif.id} 
                className={`dropdown-item p-3 border-bottom ${!notif.read ? 'bg-light' : ''}`}
                onClick={() => markAsRead(notif.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      {getIconByType(notif.type)}
                      <span className={`small ${!notif.read ? 'text-primary fw-semibold' : 'text-muted'}`}>
                        {!notif.read ? 'Baru' : formatTime(notif.timestamp)}
                      </span>
                    </div>
                    <p className="small text-dark mb-1">{notif.message}</p>
                    <p className="small text-muted mb-0">{formatTime(notif.timestamp)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromHistory(notif.id)
                    }}
                    className="btn btn-sm btn-link text-muted p-0"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notificationHistory.length > 0 && (
          <div className="px-3 py-2 border-top bg-light text-center">
            <p className="small text-muted mb-0">
              {notificationHistory.length} total notifikasi
            </p>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

// Inline Notification
export const InlineNotification = ({ type = 'info', title, message, onClose, className = '' }) => {
  const variantMap = {
    success: 'success',
    error: 'danger',
    warning: 'warning',
    info: 'info'
  }
  
  const variant = variantMap[type] || 'info'
  
  const iconMap = {
    success: <FiCheckCircle size={18} />,
    error: <FiXCircle size={18} />,
    warning: <FiAlertCircle size={18} />,
    info: <FiInfo size={18} />
  }
  
  return (
    <div className={`alert alert-${variant} d-flex align-items-center justify-content-between p-3 mb-3 ${className}`}>
      <div className="d-flex align-items-center gap-2">
        {iconMap[type]}
        {title && <strong className="me-1">{title}</strong>}
        {message && <span>{message}</span>}
      </div>
      {onClose && (
        <button onClick={onClose} className="btn-close" aria-label="Close" />
      )}
    </div>
  )
}

export default Notification