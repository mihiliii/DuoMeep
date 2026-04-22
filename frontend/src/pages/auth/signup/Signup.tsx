import '../Auth.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, type AuthResponse } from '../../../services/authService';

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const [error, setError] = useState('');

  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    setError('');

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!passwordRegex.test(password)) {
      setError('Password must be 8+ characters with at least one uppercase letter and one digit.');
      return;
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      return;
    }

    registerUser(username, email, password)
      .then((response: AuthResponse) => {
        if (!response.userId || !response.username) {
          throw Error('Invalid response from server: missing userId or username');
        }

        localStorage.setItem('userId', response.userId);
        localStorage.setItem('username', response.username);
        navigate(`/dashboard/${response.username}`, { replace: true });
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-title">Sign up</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Username
            <input
              className="auth-input"
              type="text"
              placeholder="meepQueen"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
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
          <label className="auth-label">
            Repeat password
            <input
              className="auth-input"
              type="password"
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          <button className="auth-button" type="submit">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
