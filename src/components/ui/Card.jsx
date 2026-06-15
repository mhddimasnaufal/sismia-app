import React from 'react'
import { Card as BootstrapCard } from 'react-bootstrap'

const Card = ({ children, title, subtitle, className = '', footer = null, headerAction = null }) => {
  return (
    <BootstrapCard className={`shadow-sm border-0 rounded-3 ${className}`}>
      {(title || headerAction) && (
        <BootstrapCard.Header className="bg-white border-bottom-0 pt-3 px-3 d-flex justify-content-between align-items-center">
          <div>
            {title && <BootstrapCard.Title className="h5 mb-0 fw-semibold">{title}</BootstrapCard.Title>}
            {subtitle && <BootstrapCard.Subtitle className="text-muted small mt-1">{subtitle}</BootstrapCard.Subtitle>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </BootstrapCard.Header>
      )}
      <BootstrapCard.Body className="p-3">
        {children}
      </BootstrapCard.Body>
      {footer && (
        <BootstrapCard.Footer className="bg-white border-top-0 pt-0 pb-3 px-3">
          {footer}
        </BootstrapCard.Footer>
      )}
    </BootstrapCard>
  )
}

// Card with hover effect
export const HoverCard = ({ children, title, subtitle, className = '', onClick = null }) => {
  return (
    <div 
      className={`card shadow-sm border-0 rounded-3 transition-all cursor-pointer ${className}`}
      style={{ transition: 'all 0.3s ease', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 1rem 2rem rgba(0,0,0,0.1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)' }}
    >
      <div className="card-body p-4">
        {title && <h5 className="card-title fw-semibold mb-1">{title}</h5>}
        {subtitle && <h6 className="card-subtitle mb-2 text-muted small">{subtitle}</h6>}
        {children}
      </div>
    </div>
  )
}

// Stats Card untuk Dashboard
export const StatsCard = ({ title, value, icon, color = 'primary', change = null, changeType = 'increase' }) => {
  const colorMap = {
    primary: { bg: 'bg-primary bg-opacity-10', text: 'text-primary' },
    success: { bg: 'bg-success bg-opacity-10', text: 'text-success' },
    danger: { bg: 'bg-danger bg-opacity-10', text: 'text-danger' },
    warning: { bg: 'bg-warning bg-opacity-10', text: 'text-warning' },
    info: { bg: 'bg-info bg-opacity-10', text: 'text-info' },
    purple: { bg: 'bg-purple bg-opacity-10', text: 'text-purple' }
  }
  
  const colors = colorMap[color] || colorMap.primary
  
  return (
    <div className="card shadow-sm border-0 rounded-3 h-100">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted small mb-1 fw-medium">{title}</p>
            <h2 className={`display-6 fw-bold mb-0 ${colors.text}`}>{value}</h2>
            {change && (
              <p className={`small mt-2 mb-0 ${changeType === 'increase' ? 'text-success' : 'text-danger'}`}>
                {changeType === 'increase' ? '↑' : '↓'} {change} dari bulan lalu
              </p>
            )}
          </div>
          <div className={`${colors.bg} rounded-3 p-3`}>
            <span className={`${colors.text} fs-4`}>{icon}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card