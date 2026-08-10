import * as zod from 'zod';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm, { type AuthField } from '@/components/auth-form/AuthForm';
import { loginAdmin, type AdminAuthResponse } from '@/services/adminService';
import { SessionContext, type SessionContextType } from '@/context/SessionContext';

const adminLoginValidator = zod.object({
  username: zod.string().min(1, 'Username is required.'),
  password: zod.string().min(1, 'Password is required.'),
});

const adminLoginFields: AuthField[] = [
  { name: 'username', label: 'Username', type: 'text', placeholder: 'Your username...' },
  { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const session: SessionContextType = useContext(SessionContext);

  async function handleSubmit(values: Record<string, string>): Promise<void> {
    const response: AdminAuthResponse = await loginAdmin(values.username, values.password);

    session.setAdminId(response.adminId);
    navigate('/admin/panel', { replace: true });
  }

  return (
    <AuthForm
      title="Admin log in"
      submitLabel="Log in"
      fields={adminLoginFields}
      validator={adminLoginValidator}
      redirectTo={session.adminId !== null ? '/admin/panel' : null}
      onSubmit={handleSubmit}
    />
  );
}
