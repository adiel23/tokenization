import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Bitcoin, Check, X } from 'lucide-react';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { useAuth } from '@hooks';

const steps = [
  { title: 'Account', description: 'Basic info' },
  { title: 'Security', description: 'Create password' },
  { title: 'Complete', description: 'Ready to go' },
];

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password strength
  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-accent-red', 'bg-accent-bitcoin', 'bg-accent-green', 'bg-accent-green'];

  const canProceed = () => {
    if (currentStep === 0) {
      return email.length > 0 && email.includes('@');
    }
    if (currentStep === 1) {
      return password.length >= 8 && password === confirmPassword && agreedToTerms;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    const result = await register({
      email,
      password,
      referralCode: referralCode || undefined,
    });

    if (!result.success) {
      setError(result.error || 'Registration failed');
      setIsLoading(false);
    }
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

        {/* Progress steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  index <= currentStep
                    ? 'bg-accent-bitcoin text-background'
                    : 'bg-background-elevated text-foreground-secondary border border-border'
                )}
              >
                {index < currentStep ? <Check size={18} /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs mt-2',
                  index <= currentStep ? 'text-foreground' : 'text-foreground-secondary'
                )}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Registration card */}
        <div className="glass-card p-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Create your account</h2>
                <p className="text-foreground-secondary text-sm">
                  Start your journey into tokenized assets
                </p>
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftElement={<Mail size={18} />}
                required
              />

              <Input
                label="Referral Code (optional)"
                placeholder="Enter referral code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                leftElement={<User size={18} />}
                helperText="Earn rewards when you refer friends"
              />

              <Button
                fullWidth
                size="lg"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight size={18} />
              </Button>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Secure your account</h2>
                <p className="text-foreground-secondary text-sm">
                  Create a strong password to protect your funds
                </p>
              </div>

              {/* Password input */}
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

                {/* Password strength */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1 bg-background-elevated rounded-full overflow-hidden">
                        <div
                          className={cn('h-full transition-all', strengthColors[passwordStrength - 1])}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-foreground-secondary">
                        {strengthLabels[passwordStrength - 1]}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      'flex w-full rounded-md border border-border bg-background-elevated pl-10 pr-3 py-2 text-sm text-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bitcoin/50',
                      'placeholder:text-foreground-muted',
                      confirmPassword && confirmPassword !== password && 'border-accent-red focus-visible:ring-accent-red/50'
                    )}
                    required
                  />
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="mt-1 text-sm text-accent-red">Passwords do not match</p>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded border-border bg-background-elevated text-accent-bitcoin focus:ring-accent-bitcoin/50"
                />
                <span className="text-sm text-foreground-secondary">
                  I agree to the{' '}
                  <Link to="/terms" className="text-accent-bitcoin hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-accent-bitcoin hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {error && (
                <div className="p-3 rounded-md bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Continue
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto">
                <Check className="text-accent-green" size={40} />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">Almost done!</h2>
                <p className="text-foreground-secondary">
                  Click below to create your account and start exploring
                </p>
              </div>

              <div className="p-4 rounded-lg bg-background-elevated border border-border text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Email</span>
                  <span className="text-foreground">{email}</span>
                </div>
                {referralCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Referral Code</span>
                    <span className="text-accent-bitcoin">{referralCode}</span>
                  </div>
                )}
              </div>

              <Button
                fullWidth
                size="lg"
                isLoading={isLoading}
                loadingText="Creating account..."
                onClick={handleSubmit}
              >
                Create Account
              </Button>

              <Button
                variant="ghost"
                fullWidth
                onClick={handleBack}
                disabled={isLoading}
              >
                <X size={18} className="mr-2" />
                Go Back
              </Button>
            </div>
          )}
        </div>

        {/* Links */}
        <p className="text-center mt-6 text-sm text-foreground-secondary">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-accent-bitcoin hover:underline font-medium">
            Sign in
          </Link>
        </p>

        {/* Back to home */}
        <div className="text-center mt-4">
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
