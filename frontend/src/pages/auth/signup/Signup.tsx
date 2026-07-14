import '../Auth.css';
import * as zod from 'zod';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, type AuthResponse } from '../../../services/userService';
import { AuthContext, type AuthContextType } from '../../../context/AuthContext';

const inputValidator = zod
  .object({
    username: zod.string().min(1, 'Username is required.').max(24, 'Username must be at most 24 characters.'),
    email: zod.email('Invalid email address.').min(1, 'Email is required.'),
    password: zod
      .string()
      .regex(/^(?=.*[A-Z])(?=.*\d).{8,}$/, 'Password must be at least 8 characters, one uppercase and one number.'),
    repeatPassword: zod.string().min(1, 'Please repeat your password.'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Passwords do not match.',
    path: ['repeatPassword'],
  });

export default function Signup() {
  const navigate = useNavigate();
  const authContext: AuthContextType = useContext(AuthContext);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [repeatPasswordInput, setRepeatPasswordInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (authContext.userId !== null) {
      navigate(`/dashboard/${authContext.userId}`, { replace: true });
    }
  }, [authContext.userId, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError('');
    try {
      inputValidator.parse({
        username: usernameInput,
        email: emailInput,
        password: passwordInput,
        repeatPassword: repeatPasswordInput,
      });
      const response: AuthResponse = await registerUser(usernameInput, emailInput, passwordInput);

      authContext.setUserId(response?.userId);
      navigate(`/dashboard/${response.userId}`, { replace: true });
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
        <h1 className="auth-title">Sign up</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Username
            <input
              className="auth-input"
              type="text"
              placeholder="Your username"
              value={usernameInput}
              onChange={(event) => setUsernameInput(event.target.value)}
            />
          </label>
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
          <label className="auth-label">
            Repeat password
            <input
              className="auth-input"
              type="password"
              value={repeatPasswordInput}
              onChange={(event) => setRepeatPasswordInput(event.target.value)}
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
