import React, { useState } from 'react';

function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', data.user.name);
        onLogin(data.user.name, data.user.email);
      } else {
        setError(data.message || 'Login failed!');
      }
    } catch (err) {
      setError('Server error! Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', height: '100vh',
      backgroundColor: '#121212'
    }}>
      <div style={{
        background: '#1e1e1e', padding: '40px',
        borderRadius: '12px', width: '350px', textAlign: 'center'
      }}>
        <h1 style={{ color: '#1db954', marginBottom: '10px' }}>🎵 Music App</h1>
        <p style={{ color: '#aaa', marginBottom: '30px' }}>Login to continue</p>

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%', padding: '12px', marginBottom: '15px',
            borderRadius: '8px', border: 'none', backgroundColor: '#333',
            color: 'white', fontSize: '16px'
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '12px', marginBottom: '20px',
            borderRadius: '8px', border: 'none', backgroundColor: '#333',
            color: 'white', fontSize: '16px'
          }}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', backgroundColor: '#1db954',
            color: 'white', border: 'none', borderRadius: '25px',
            fontSize: '16px', cursor: 'pointer', marginBottom: '15px'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p style={{ color: '#aaa', cursor: 'pointer' }} onClick={onRegister}>
          Don't have an account? <span style={{ color: '#1db954' }}>Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;