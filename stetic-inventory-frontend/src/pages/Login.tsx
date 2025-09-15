import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginCredentials } from '@/types/auth';
import '@/styles/Login.css';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    if (!credentials.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }

    if (!credentials.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const success = await login(credentials);
      if (success) {
        navigate('/', { replace: true });
      } else {
        setLoginError('Usuario o contraseña incorrectos');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLoginError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Stetic Inventory</h1>
          <p>Sistema de Inventario Integral</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="Ingresa tu usuario"
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Ingresa tu contraseña"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {loginError && <div className="login-error">{loginError}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="demo-credentials">
          <h4>Credenciales de prueba:</h4>
          <p><strong>Admin:</strong> admin / password123</p>
          <p><strong>Gerente:</strong> gerente / password123</p>
          <p><strong>Usuario:</strong> usuario / password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;