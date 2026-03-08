import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!usernameOrEmail || !password) { setError('All fields are required'); return; }
    const err = login(usernameOrEmail, password);
    if (err) { setError(err); return; }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 font-poppins">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Icon icon="mdi:clock-fast" width={48} className="text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to ShiftTap</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">{error}</div>}

          <div>
            <label className="text-sm text-muted-foreground">Username or Email</label>
            <input type="text" value={usernameOrEmail} onChange={e => setUsernameOrEmail(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50"
              placeholder="Enter username or email" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50"
              placeholder="Enter password" />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)}
                className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm text-muted-foreground">See password</span>
            </label>
          </div>

          <button type="submit" className="w-full p-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:opacity-90">
            Sign In
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/signup" className="text-primary font-medium">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
