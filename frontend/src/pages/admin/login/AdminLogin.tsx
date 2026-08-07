import * as zod from 'zod';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, type AdminAuthResponse } from '../../../services/adminService';
import { AdminContext, type AdminContextType } from '../../../context/AdminContext';

const adminLoginValidator = zod.object({
  username: zod.string().min(1, 'Username is required.'),
  password: zod.string().min(1, 'Password is required.'),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const adminContext: AdminContextType = useContext(AdminContext);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (adminContext.adminId !== null) {
      navigate('/admin/panel', { replace: true });
    }
  }, [adminContext.adminId, navigate]);

  async function handleSubmitButton(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError('');
    try {
      adminLoginValidator.parse({ username: usernameInput, password: passwordInput });
      const response: AdminAuthResponse = await loginAdmin(usernameInput, passwordInput);

      adminContext.setAdminId(response.adminId);
      navigate('/admin/panel', { replace: true });
    } catch (err) {
      if (err instanceof zod.ZodError) {
        setError(err.issues[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      }
    }
  }

  return (
    <div className="auth center">
      <div className="auth-card">
        <h1 className="auth-title">Admin log in</h1>
        <form className="auth-form" onSubmit={handleSubmitButton}>
          <label className="form-label">
            Username
            <input
              className="form-input"
              type="text"
              value={usernameInput}
              onChange={(event) => setUsernameInput(event.target.value)}
              placeholder="Your username..."
            />
          </label>
          <label className="form-label">
            Password
            <input
              className="form-input"
              type="password"
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              placeholder="••••••••"
            />
          </label>
          {error ? <p className="auth-error error-text">{error}</p> : null}
          <button className="auth-button" type="submit">
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
