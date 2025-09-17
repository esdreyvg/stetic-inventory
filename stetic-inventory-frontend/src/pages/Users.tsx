import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import type { User, CreateUserData, UserRole } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/Users.css';

const Users: React.FC = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@stetic.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'administrador',
      isActive: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      username: 'gerente',
      email: 'gerente@stetic.com',
      firstName: 'Manager',
      lastName: 'User',
      role: 'gerente',
      isActive: true,
      createdAt: '2024-01-01'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'usuario',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<CreateUserData>>({});

  const canManageUsers = useMemo(() => hasRole(['administrador']), [hasRole]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<CreateUserData> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!editingUser && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!editingUser && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, editingUser]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingUser) {
      // Update user
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData, password: undefined }
          : user
      ));
      setEditingUser(null);
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
    }

    resetForm();
  }, [formData, editingUser, validateForm]);

  const resetForm = useCallback(() => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      role: 'usuario',
      password: ''
    });
    setErrors({});
    setShowCreateForm(false);
    setEditingUser(null);
  }, []);

  const handleEdit = useCallback((user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: ''
    });
    setEditingUser(user);
    setShowCreateForm(true);
  }, []);

  const toggleUserStatus = useCallback((userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  }, []);

  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'administrador': return '#e74c3c';
      case 'gerente': return '#f39c12';
      case 'usuario': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  if (!canManageUsers) {
    return (
      <div className="users-container">
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para gestionar usuarios.</p>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-content">
        <div className="users-header">
          <h2>Gestión de Usuarios</h2>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            Crear Usuario
          </button>
        </div>

        {(showCreateForm || editingUser) && (
          <div className="user-form-overlay">
            <div className="user-form-modal">
              <div className="form-header">
                <h3>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
                <button 
                  className="btn-close"
                  onClick={resetForm}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Usuario</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className={errors.username ? 'error' : ''}
                    />
                    {errors.username && <span className="error-message">{errors.username}</span>}
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Apellido</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Rol</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    >
                      <option value="usuario">Usuario</option>
                      <option value="gerente">Gerente</option>
                      <option value="administrador">Administrador</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={errors.password ? 'error' : ''}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingUser ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span 
                      className="role-badge"
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                      >
                        Editar
                      </button>
                      <button 
                        className={`btn-toggle ${user.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => toggleUserStatus(user.id)}
                      >
                        {user.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
