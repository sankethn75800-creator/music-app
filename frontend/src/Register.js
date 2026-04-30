import React, { useState } from 'react';

function Register({ onRegister, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill all fields!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registered successfully! Please login.');
        onBack();
      } else {
        setError(data.message || 'Registration failed!');
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
        <p style={{ color: '#aaa', marginBottom: '30px' }}>Create your account</p>

        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            width: '100%', padding: '12px', marginBottom: '15px',
            borderRadius: '8px', border: 'none', backgroundColor: '#333',
            color: 'white', fontSize: '16px'
          }}
        />
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
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', backgroundColor: '#1db954',
            color: 'white', border: 'none', borderRadius: '25px',
            fontSize: '16px', cursor: 'pointer', marginBottom: '15px'
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p style={{ color: '#aaa', cursor: 'pointer' }} onClick={onBack}>
          Already have an account? <span style={{ color: '#1db954' }}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Register;