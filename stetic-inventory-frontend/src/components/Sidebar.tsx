import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ClipboardList, 
  ShoppingCart, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    {
      path: '/',
      icon: Home,
      label: 'Dashboard',
      requiredRoles: []
    },
    {
      path: '/inventory',
      icon: Package,
      label: 'Inventario',
      requiredRoles: []
    },
    {
      path: '/products',
      icon: ShoppingCart,
      label: 'Productos',
      requiredRoles: ['administrador', 'gerente']
    },
    {
      path: '/recipes',
      icon: ClipboardList,
      label: 'Recetas',
      requiredRoles: ['administrador', 'gerente']
    },
    {
      path: '/users',
      icon: Users,
      label: 'Usuarios',
      requiredRoles: ['administrador']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.requiredRoles.length === 0 || hasRole(item.requiredRoles as any)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Package className="brand-icon" />
            <span className="brand-text">Stetic Inventory</span>
          </div>
          <button className="sidebar-toggle mobile-only" onClick={onToggle}>
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path} className="nav-item">
                  <Link 
                    to={item.path} 
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => window.innerWidth <= 768 && onToggle()}
                  >
                    <Icon className="nav-icon" size={20} />
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut className="nav-icon" size={20} />
            <span className="nav-label">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;