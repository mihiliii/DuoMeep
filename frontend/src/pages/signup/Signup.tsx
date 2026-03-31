import './Auth.css';

function Signup() {
  return (
    <div className="auth">
      <div className="auth-card">
        <h1 className="auth-title">Sign up</h1>
        <form className="auth-form">
          <label className="auth-label">
            Username
            <input className="auth-input" type="text" placeholder="meepQueen" />
          </label>
          <label className="auth-label">
            Email
            <input className="auth-input" type="email" placeholder="you@email.com" />
          </label>
          <label className="auth-label">
            Password
            <input className="auth-input" type="password" placeholder="••••••••" />
          </label>
          <button className="auth-button" type="submit">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
