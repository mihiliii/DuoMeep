import * as zod from 'zod';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type AuthField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password';
  placeholder: string;
};

export type AuthFormProps = {
  title: string;
  submitLabel: string;
  fields: AuthField[];
  validator: zod.ZodType;
  redirectTo: string | null;
  onSubmit: (values: Record<string, string>) => Promise<void>;
};

export default function AuthForm({ title, submitLabel, fields, validator, redirectTo, onSubmit }: AuthFormProps) {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((field) => [field.name, ''])),
  );
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (redirectTo !== null) {
      navigate(redirectTo, { replace: true });
    }
  }, [redirectTo, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError('');
    try {
      validator.parse(values);
      await onSubmit(values);
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
        <h1 className="auth-title">{title}</h1>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {fields.map((field) => (
            <label className="form-label" key={field.name}>
              {field.label}
              <input
                className="form-input"
                type={field.type}
                value={values[field.name]}
                onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                placeholder={field.placeholder}
              />
            </label>
          ))}
          {error ? <p className="auth-error error-text">{error}</p> : null}
          <button className="auth-button" type="submit">
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
