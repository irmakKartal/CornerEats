import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets, url } from '../../assets/assets';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${url}/api/user/admin-login`, { email, password });
      if (response.data.success) {
        onLogin(response.data.token);
      } else {
        toast.error(response.data.message || 'Unable to sign in');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to connect to the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login">
      <form className="admin-login-form" onSubmit={submitLogin}>
        <img src={assets.logo} alt="CornerEats" />
        <h1>Admin sign in</h1>
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <div 
          style={{
            background: '#f1f5f9',
            border: '1px dashed #94a3b8',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '13px',
            color: '#334155',
            marginTop: '4px',
            cursor: 'pointer',
            lineHeight: '1.4'
          }}
          onClick={() => {
            setEmail('admin@admin.com');
            setPassword('admin123');
          }}
          title="Click to auto-fill demo credentials"
        >
          <div style={{ fontWeight: 600, color: '#df5b35', marginBottom: '2px' }}>
            ⚡ Demo Credentials (Click to fill):
          </div>
          <div><strong>Email:</strong> admin@admin.com</div>
          <div><strong>Password:</strong> admin123</div>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;