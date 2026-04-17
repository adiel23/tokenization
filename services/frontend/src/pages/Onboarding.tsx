import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Check, 
  AlertCircle, 
  ArrowRight,
  Lock,
  CreditCard,
  Globe,
  Zap,
  UserCheck
} from 'lucide-react';
import { cn, formatSats } from '@lib/utils';
import { Layout, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@components';
import type { OnboardingSummary, FiatProvider } from '@types';

// Mock data
const mockOnboarding: OnboardingSummary = {
  custody_configured: true,
  kyc_status: 'none',
  kyc_provider_required: false,
  fiat_onramp_ready: true,
  available_providers: [
    {
      id: 'provider1',
      name: 'MoonPay',
      logo_url: '/moonpay.svg',
      supported_fiat_currencies: ['USD', 'EUR', 'GBP'],
      supported_countries: ['US', 'EU', 'UK'],
      requires_kyc: true,
    },
    {
      id: 'provider2',
      name: 'Simplex',
      logo_url: '/simplex.svg',
      supported_fiat_currencies: ['USD', 'EUR'],
      supported_countries: ['US', 'EU'],
      requires_kyc: false,
    },
  ],
};

const steps = [
  { id: 'security', title: 'Account Security', icon: Shield },
  { id: 'kyc', title: 'Verification', icon: UserCheck },
  { id: 'funding', title: 'Add Funds', icon: CreditCard },
];

function SecurityStep({ completed }: { completed: boolean }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="text-accent-green" size={32} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Your Wallet is Ready</h3>
        <p className="text-foreground-secondary max-w-md mx-auto">
          We've created a secure, self-custodial wallet for you. Your keys are encrypted 
          with AES-256-GCM and only you have access.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-background-elevated space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-foreground-secondary">Custody</span>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-accent-green" />
            <span className="font-medium">Self-Custody</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground-secondary">Encryption</span>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-accent-green" />
            <span className="font-medium">AES-256-GCM</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-foreground-secondary">Backup</span>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-accent-bitcoin" />
            <span className="font-medium">Recommended</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-accent-bitcoin/10 border border-accent-bitcoin/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-accent-bitcoin shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-medium text-sm">Important</p>
            <p className="text-sm text-foreground-secondary">
              Withdrawals require 2FA verification. Set up 2FA in your settings for added security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KYCStep({ status, onComplete }: { status: string; onComplete: () => void }) {
  const isVerified = status === 'verified';
  const isPending = status === 'pending';

  if (isVerified) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
          <Check className="text-accent-green" size={32} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Verification Complete</h3>
        <p className="text-foreground-secondary">Your identity has been verified.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent-bitcoin/10 flex items-center justify-center mx-auto mb-4">
          <UserCheck className="text-accent-bitcoin" size={32} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Identity Verification</h3>
        <p className="text-foreground-secondary max-w-md mx-auto">
          Verify your identity to unlock higher trading limits and fiat on-ramps.
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-background-elevated">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Current Status</span>
            <Badge variant={isPending ? 'warning' : 'secondary'}>
              {status === 'none' ? 'Not Started' : status}
            </Badge>
          </div>
          <p className="text-sm text-foreground-secondary">
            Basic account with no verification required to start.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-background-elevated text-center">
            <p className="font-mono font-medium">{formatSats(10000000)}</p>
            <p className="text-xs text-foreground-secondary">Trade Limit (no KYC)</p>
          </div>
          <div className="p-3 rounded-lg bg-accent-green/10 border border-accent-green/20 text-center">
            <p className="font-mono font-medium text-accent-green">Unlimited</p>
            <p className="text-xs text-foreground-secondary">With KYC</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" fullWidth>
          Skip for Now
        </Button>
        <Button fullWidth onClick={onComplete}>
          Verify Identity
        </Button>
      </div>
    </div>
  );
}

function FundingStep({ providers }: { providers: FiatProvider[] }) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="text-accent-green" size={32} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Add Funds</h3>
        <p className="text-foreground-secondary max-w-md mx-auto">
          Buy Bitcoin instantly with your credit card or bank transfer.
        </p>
      </div>

      {/* Providers */}
      <div className="space-y-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => setSelectedProvider(provider.id)}
            className={cn(
              'w-full p-4 rounded-lg border text-left transition-all',
              selectedProvider === provider.id
                ? 'border-accent-bitcoin bg-accent-bitcoin/10'
                : 'border-border bg-background-elevated hover:border-accent-bitcoin/30'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{provider.name}</p>
                <p className="text-xs text-foreground-secondary">
                  {provider.supported_fiat_currencies.join(', ')}
                </p>
              </div>
              <Badge variant={provider.requires_kyc ? 'warning' : 'success'} size="sm">
                {provider.requires_kyc ? 'KYC Required' : 'No KYC'}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 rounded border-border bg-background-elevated text-accent-bitcoin"
        />
        <span className="text-sm text-foreground-secondary">
          I understand that I will be redirected to a third-party provider. 
          The provider's terms, pricing, and compliance policies apply.
        </span>
      </label>

      <Button 
        fullWidth 
        disabled={!selectedProvider || !agreed}
        leftIcon={<Zap size={18} />}
      >
        Launch Provider
      </Button>
    </div>
  );
}

export function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [kycStatus, setKycStatus] = useState(mockOnboarding.kyc_status);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleKycComplete = () => {
    setKycStatus('pending');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome to RWA Platform</h1>
          <p className="text-foreground-secondary">Complete these steps to get started</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    isCompleted
                      ? 'bg-accent-green text-background'
                      : isActive
                      ? 'bg-accent-bitcoin text-background'
                      : 'bg-background-elevated text-foreground-secondary border border-border'
                  )}
                >
                  {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <span className="text-xs mt-2">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-6">
            {currentStep === 0 && <SecurityStep completed={mockOnboarding.custody_configured} />}
            {currentStep === 1 && <KYCStep status={kycStatus} onComplete={handleKycComplete} />}
            {currentStep === 2 && <FundingStep providers={mockOnboarding.available_providers} />}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {currentStep > 0 ? (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
          ) : (
            <Link to="/dashboard">
              <Button variant="ghost">Skip All</Button>
            </Link>
          )}
          
          <Button onClick={handleNext} rightIcon={<ArrowRight size={18} />}>
            {currentStep === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
