import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  ClipboardList, 
  ShoppingCart, 
  Users, 
  Monitor,
  PillBottle,
  CreditCard,
  BarChart3,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Sidebar.css';
import type { UserRole } from '@/types/auth';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleMobileNavClick = useCallback(() => {
    if (window.innerWidth <= 768) {
      onToggle();
    }
  }, [onToggle]);

  const menuItems = useMemo(() => [
    {
      path: '/',
      icon: BarChart3,
      label: 'Reportería',
      requiredRoles: ['administrador', 'gerente']
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
      path: '/assets',
      icon: Monitor,
      label: 'Activos Fijos',
      requiredRoles: ['administrador', 'gerente']
    },
    {
      path: '/supplies',
      icon: PillBottle,
      label: 'Suministros',
      requiredRoles: ['administrador', 'gerente']
    },
    {
      path: '/accounts',
      icon: CreditCard,
      label: 'Cuentas por Cobrar',
      requiredRoles: ['administrador', 'gerente']
    },
    {
      path: '/users',
      icon: Users,
      label: 'Usuarios',
      requiredRoles: ['administrador']
    }
  ], []);

  const filteredMenuItems = useMemo(() => 
    menuItems.filter(item => 
      item.requiredRoles.length === 0 || hasRole(item.requiredRoles as UserRole[])
    ), [menuItems, hasRole]
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
                    onClick={handleMobileNavClick}
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