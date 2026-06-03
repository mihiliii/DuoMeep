import '../Auth.css';
import * as zod from 'zod';
import { useState, useEffect, useContext } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { loginUser, type AuthResponse } from '../../../services/userService';
import { AuthContext, type IAuthContext } from '../../../context/AuthContext';

const loginValidator = zod.object({
  email: zod.email('Invalid email address.').min(1, 'Email is required.'),
  password: zod.string().min(1, 'Password is required.'),
});

function Login() {
  const navigate: NavigateFunction = useNavigate();

  const { userId, username, setUserId, setUsername }: IAuthContext = useContext(AuthContext);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (userId !== null && username !== null) {
      navigate(`/dashboard/${username}`, { replace: true });
    }
  }, [userId, username, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError('');

    try {
      loginValidator.parse({ email: emailInput, password: passwordInput });

      const response: AuthResponse = await loginUser(emailInput, passwordInput);

      setUserId(response.userId);
      setUsername(response.username);
      navigate(`/dashboard/${response.username}`, { replace: true });
    } catch (err) {
      if (err instanceof zod.ZodError) {
        setError(err.issues[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      }
    }
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
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="you@email.com"
              formNoValidate
            />
          </label>
          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
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
