import React, { useState } from 'react';
import { useAuth } from '../useAuth';
import { useNavigate } from 'react-router-dom';

const LoginView: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login({ username, password });
      navigate('/ur/breakdowns');
    } catch (err: any) {
      setError('Błędny login lub hasło');
      console.error('Login error:', err);
    }
  };

  const styles = {
    container: { display: 'flex', justifyContent: 'center', marginTop: '100px' },
    card: { padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', width: '300px' },
    input: { display: 'block', width: '100%', marginBottom: '10px', padding: '8px' },
    button: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Zaloguj się</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Użytkownik"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <button type="submit" style={styles.button}>Zaloguj</button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;