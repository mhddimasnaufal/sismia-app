import React from 'react'
import { Button as BootstrapButton, Spinner } from 'react-bootstrap'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Map size ke Bootstrap size
  const sizeMap = {
    sm: 'sm',
    md: undefined,
    lg: 'lg'
  }
  
  const bsSize = sizeMap[size]
  
  // Variant yang valid di Bootstrap
  const validVariants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline-primary', 'outline-secondary', 'outline-danger', 'outline-success', 'outline-warning', 'outline-info']
  const bsVariant = validVariants.includes(variant) ? variant : 'primary'
  
  // Width style
  const widthStyle = fullWidth ? { width: '100%' } : {}
  
  return (
    <BootstrapButton
      type={type}
      variant={bsVariant}
      size={bsSize}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`d-inline-flex align-items-center justify-content-center gap-2 ${className}`}
      style={widthStyle}
      {...props}
    >
      {isLoading && (
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
      )}
      {!isLoading && icon && iconPosition === 'left' && icon}
      {children}
      {!isLoading && icon && iconPosition === 'right' && icon}
    </BootstrapButton>
  )
}

// Button Group component
export const ButtonGroup = ({ children, className = '', orientation = 'horizontal', size = 'md' }) => {
  const groupClasses = orientation === 'horizontal' 
    ? 'd-flex flex-row gap-2' 
    : 'd-flex flex-column gap-2'
  
  // Clone children to pass size
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === Button) {
      return React.cloneElement(child, { size })
    }
    return child
  })
  
  return (
    <div className={`${groupClasses} ${className}`}>
      {enhancedChildren}
    </div>
  )
}

// Icon Button component
export const IconButton = ({ 
  icon, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '',
  title = '',
  ...props 
}) => {
  const sizeMap = {
    sm: 'sm',
    md: undefined,
    lg: 'lg'
  }
  
  const validVariants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
  const bsVariant = validVariants.includes(variant) ? variant : 'primary'
  const bsSize = sizeMap[size]
  
  // Size style untuk padding
  const paddingStyle = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-2'
  }
  
  const iconSize = {
    sm: 14,
    md: 18,
    lg: 20
  }
  
  const clonedIcon = React.cloneElement(icon, { size: iconSize[size] })
  
  return (
    <BootstrapButton
      variant={bsVariant}
      size={bsSize}
      onClick={onClick}
      className={`d-inline-flex align-items-center justify-content-center ${paddingStyle[size]} rounded-circle ${className}`}
      title={title}
      {...props}
    >
      {clonedIcon}
    </BootstrapButton>
  )
}

export default Button