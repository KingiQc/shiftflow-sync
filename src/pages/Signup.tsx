import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup: React.FC = () => {
  const { signup } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password) { setError('All fields are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const err = signup(username, email, password);
    if (err) { setError(err); return; }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 font-poppins">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Icon icon="mdi:clock-fast" width={48} className="text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-1">Start tracking with ShiftTap</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">{error}</div>}

          <div>
            <label className="text-sm text-muted-foreground">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50"
              placeholder="Choose a username" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50"
              placeholder="Enter your email" />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-secondary/60 text-foreground border border-border/50 outline-none focus:border-primary/50"
              placeholder="Create a password" />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={showPassword} onChange={e => setShowPassword(e.target.checked)}
                className="w-4 h-4 rounded accent-primary" />
              <span className="text-sm text-muted-foreground">See password</span>
            </label>
          </div>

          <button type="submit" className="w-full p-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:opacity-90">
            Sign Up
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
