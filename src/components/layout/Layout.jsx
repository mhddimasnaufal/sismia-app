import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { FiMenu } from 'react-icons/fi'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay d-md-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar bg-primary-dark ${sidebarOpen ? 'show' : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        <main className="flex-grow-1 overflow-auto p-3 p-md-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout