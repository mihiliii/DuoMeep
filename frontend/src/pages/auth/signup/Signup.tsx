import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as zod from 'zod';

import AuthForm, { type AuthField } from '@/components/auth-form/AuthForm';
import { SessionContext, type SessionContextType } from '@/context/SessionContext';
import { registerUser, type AuthResponse } from '@/services/userService';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const signupValidator = zod
  .object({
    username: zod.string().min(1, 'Username is required.').max(24, 'Username must be at most 24 characters.'),
    email: zod.email('Invalid email address.').min(1, 'Email is required.'),
    password: zod
      .string()
      .regex(passwordRegex, 'Password must be at least 8 characters, one uppercase and one number.'),
    repeatPassword: zod.string().min(1, 'Repeat password field is empty.'),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Passwords do not match.',
    path: ['repeatPassword'],
  });

const signupFields: AuthField[] = [
  { name: 'username', label: 'Username', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'password', label: 'Password', type: 'password' },
  { name: 'repeatPassword', label: 'Repeat password', type: 'password' },
];

export default function Signup() {
  const navigate = useNavigate();
  const session: SessionContextType = useContext(SessionContext);

  async function handleSignup(values: Record<string, string>): Promise<void> {
    const response: AuthResponse = await registerUser(values.username, values.email, values.password);

    session.setAdminId(null);
    session.setUserId(response.userId);
    navigate(`/dashboard/${response.userId}`, { replace: true });
  }

  return (
    <AuthForm
      title="Sign up"
      submitLabel="Create account"
      fields={signupFields}
      validator={signupValidator}
      redirectTo={session.userId !== null ? `/dashboard/${session.userId}` : null}
      onSubmit={handleSignup}
    />
  );
}
