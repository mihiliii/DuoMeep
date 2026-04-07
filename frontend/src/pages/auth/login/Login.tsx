import '../Auth.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, type AuthResponse } from '../../../services/authService';
import { useAuth } from '../../../App';

function Login() {
  const navigate = useNavigate();
  const { isAuthed, handleLogin } = useAuth();

  useEffect(() => {
    if (isAuthed) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthed, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    loginUser(email, password)
      .then((response: AuthResponse) => {
        if (!response.userId) {
          console.error('Invalid response in loginUser:', response);
          return;
        }
        handleLogin(response.userId);
        navigate('/dashboard');
      })
      .catch((err: { message: string }) => {
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
