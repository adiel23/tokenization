import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Bitcoin } from 'lucide-react';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@hooks';

export function Login() {
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login({ email, password }, from);
    
    if (!result.success && result.error) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 data-grid opacity-20" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-bitcoin flex items-center justify-center">
              <Bitcoin className="text-background" size={28} />
            </div>
            <div>
              <h1 className="font-bold text-xl">RWA Platform</h1>
              <p className="text-xs text-foreground-secondary">Bitcoin Tokenization</p>
            </div>
          </Link>
        </div>

        {/* Login card */}
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
            <p className="text-foreground-secondary text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftElement={<Mail size={18} />}
              required
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    'flex w-full rounded-md border border-border bg-background-elevated pl-10 pr-10 py-2 text-sm text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bitcoin/50',
                    'placeholder:text-foreground-muted'
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign In
              <ArrowRight size={18} />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background-surface px-4 text-xs text-foreground-secondary">
                Or continue with
              </span>
            </div>
          </div>

          {/* Nostr login */}
          <Button
            variant="outline"
            fullWidth
            size="lg"
            leftIcon={<span className="text-accent-bitcoin font-bold">⚡</span>}
          >
            Nostr Login
          </Button>

          {/* Links */}
          <div className="mt-8 text-center space-y-3">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-accent-bitcoin hover:underline"
            >
              Forgot your password?
            </Link>
            <p className="text-sm text-foreground-secondary">
              Don't have an account?{' '}
              <Link to="/auth/register" className="text-accent-bitcoin hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-foreground-secondary hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
