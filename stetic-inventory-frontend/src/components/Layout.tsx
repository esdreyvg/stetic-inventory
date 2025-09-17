import * as React from 'react';
import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import '@/styles/Layout.css';

const Layout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="layout-content">
        {/* Mobile Header */}
        <header className="mobile-header">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <h1 className="mobile-title">Stetic Inventory</h1>
        </header>

        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/inventory">Inventario</Link>
          {hasRole(['administrador', 'gerente']) && (
            <Link to="/products">Productos</Link>
          )}
          {hasRole(['administrador']) && (
            <Link to="/users">Usuarios</Link>
          )}
        </div>

        <div className="nav-user">
          <span>Hola, {user?.firstName}</span>
          <span className="user-role">({user?.role})</span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;