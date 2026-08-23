import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as zod from 'zod';

import AuthForm, { type AuthField } from '@/components/auth-form/AuthForm';
import { SessionContext, type SessionContextType } from '@/context/SessionContext';
import { loginUser, type AuthResponse } from '@/services/userService';

const loginValidator = zod.object({
  email: zod.email('Invalid email address.').min(1, 'Email is required.'),
  password: zod.string().min(1, 'Password is required.'),
});

const loginFields: AuthField[] = [
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
];

export default function Login() {
  const navigate = useNavigate();
  const session: SessionContextType = useContext(SessionContext);

  async function handleLogin(values: Record<string, string>): Promise<void> {
    const response: AuthResponse = await loginUser(values.email, values.password);

    session.setUserId(response.userId);
    navigate(`/dashboard/${response.userId}`, { replace: true });
  }

  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      fields={loginFields}
      validator={loginValidator}
      redirectTo={session.userId !== null ? `/dashboard/${session.userId}` : null}
      onSubmit={handleLogin}
    />
  );
}
