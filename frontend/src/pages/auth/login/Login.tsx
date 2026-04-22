import '../Auth.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, type AuthResponse } from '../../../services/authService';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('username') !== null) {
      navigate(`/dashboard/${localStorage.getItem('username')}`, { replace: true });
    }
  }, [navigate]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    loginUser(email, password)
      .then((response: AuthResponse) => {
        if (!response.userId || !response.username) {
          throw new Error('Invalid response from server: missing userId or username');
        }

        localStorage.setItem('userId', response.userId);
        localStorage.setItem('username', response.username);

        window.dispatchEvent(new Event('storageChanged'));

        navigate(`/dashboard/${response.username}`, { replace: true });
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-title">Log in</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              formNoValidate
            />
          </label>
          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="auth-button" type="submit">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
