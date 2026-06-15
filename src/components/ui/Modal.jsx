import React, { useState } from 'react'
import { Modal as BootstrapModal, Button, Form } from 'react-bootstrap'
import { FiX } from 'react-icons/fi'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer = null,
  customFooter = null,
  isLoading = false,
  className = ''
}) => {
  // Size mapping untuk Bootstrap
  const sizeMap = {
    sm: 'sm',
    md: undefined,
    lg: 'lg',
    xl: 'xl',
    full: 'xl'
  }
  
  const bsSize = sizeMap[size]
  
  // Untuk full screen
  const fullscreen = size === 'full'
  
  return (
    <BootstrapModal 
      show={isOpen} 
      onHide={onClose} 
      size={bsSize}
      fullscreen={fullscreen}
      backdrop={closeOnOverlayClick ? true : 'static'}
      keyboard={closeOnEscape}
      centered
      className={className}
    >
      <BootstrapModal.Header closeButton={showCloseButton}>
        {typeof title === 'string' ? (
          <BootstrapModal.Title className="fw-semibold">{title}</BootstrapModal.Title>
        ) : (
          title
        )}
      </BootstrapModal.Header>
      
      <BootstrapModal.Body>
        {children}
      </BootstrapModal.Body>
      
      {(footer || customFooter) && (
        <BootstrapModal.Footer>
          {customFooter ? (
            customFooter
          ) : (
            <>
              <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                Batal
              </Button>
              {footer}
            </>
          )}
        </BootstrapModal.Footer>
      )}
    </BootstrapModal>
  )
}

// Modal dengan form sederhana
export const FormModal = ({
  isOpen,
  onClose,
  title,
  fields = [],
  onSubmit,
  submitText = 'Simpan',
  cancelText = 'Batal',
  isLoading = false,
  size = 'md'
}) => {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  
  React.useEffect(() => {
    if (isOpen) {
      const initialData = {}
      fields.forEach(field => {
        initialData[field.name] = field.defaultValue || ''
      })
      setFormData(initialData)
      setErrors({})
    }
  }, [isOpen, fields])
  
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = {}
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} wajib diisi`
      }
      if (field.minLength && formData[field.name]?.length < field.minLength) {
        newErrors[field.name] = `${field.label} minimal ${field.minLength} karakter`
      }
      if (field.pattern && !field.pattern.test(formData[field.name])) {
        newErrors[field.name] = field.patternMessage || `${field.label} tidak valid`
      }
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onSubmit(formData)
  }
  
  const renderField = (field) => {
    const value = formData[field.name] || ''
    const isError = !!errors[field.name]
    
    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
      case 'password':
        return (
          <Form.Control
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            isInvalid={isError}
            placeholder={field.placeholder}
            disabled={isLoading}
          />
        )
      
      case 'textarea':
        return (
          <Form.Control
            as="textarea"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            isInvalid={isError}
            rows={field.rows || 3}
            placeholder={field.placeholder}
            disabled={isLoading}
          />
        )
      
      case 'select':
        return (
          <Form.Select
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            isInvalid={isError}
            disabled={isLoading}
          >
            <option value="">Pilih {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Form.Select>
        )
      
      case 'checkbox':
        return (
          <Form.Check
            type="checkbox"
            id={`checkbox-${field.name}`}
            label={field.checkboxLabel}
            checked={value}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            disabled={isLoading}
          />
        )
      
      default:
        return null
    }
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      isLoading={isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : submitText}
          </Button>
        </>
      }
    >
      <Form>
        {fields.map((field) => (
          <Form.Group key={field.name} className="mb-3">
            {field.type !== 'checkbox' && (
              <Form.Label className="small fw-medium">
                {field.label}
                {field.required && <span className="text-danger ms-1">*</span>}
              </Form.Label>
            )}
            {renderField(field)}
            {errors[field.name] && (
              <Form.Text className="text-danger small">{errors[field.name]}</Form.Text>
            )}
            {field.helpText && !errors[field.name] && (
              <Form.Text className="text-muted small">{field.helpText}</Form.Text>
            )}
          </Form.Group>
        ))}
      </Form>
    </Modal>
  )
}

// Modal konfirmasi sederhana
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya',
  cancelText = 'Batal',
  variant = 'primary',
  isLoading = false
}) => {
  const variantMap = {
    primary: 'primary',
    danger: 'danger',
    warning: 'warning'
  }
  
  const bsVariant = variantMap[variant] || 'primary'
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      isLoading={isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant={bsVariant} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : confirmText}
          </Button>
        </>
      }
    >
      <p className="text-secondary mb-0">{message}</p>
    </Modal>
  )
}

export default Modal