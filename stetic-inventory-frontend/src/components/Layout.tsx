import * as React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Layout.css';

const Layout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">Stetic Inventory</Link>
        </div>
        
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
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;