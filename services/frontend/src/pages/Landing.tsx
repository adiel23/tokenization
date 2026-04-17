import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  TrendingUp, 
  Lock,
  Building2,
  GraduationCap
} from 'lucide-react';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/Button';

// Animated Bitcoin node background
function NodeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create nodes
    const nodes: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(247, 147, 26, 0.6)';
        ctx.fill();

        // Draw connections
        nodes.slice(i + 1).forEach((other) => {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(247, 147, 26, ${0.2 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.3 }}
    />
  );
}

// Animated stats counter
function StatCounter({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-mono font-bold text-gradient-bitcoin">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-foreground-secondary mt-1">{label}</div>
    </div>
  );
}

const features = [
  {
    icon: Shield,
    title: 'Self-Custodial',
    description: 'You control your keys. We never have access to your funds.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant transactions with Bitcoin Lightning Network.',
  },
  {
    icon: Lock,
    title: 'Multisig Escrow',
    description: '2-of-3 multisig escrow for secure P2P trading.',
  },
  {
    icon: TrendingUp,
    title: 'Yield Accrual',
    description: 'Earn yield on your tokenized asset holdings.',
  },
];

const assetCategories = [
  { icon: Building2, name: 'Real Estate', count: 124 },
  { icon: Globe, name: 'Infrastructure', count: 56 },
  { icon: GraduationCap, name: 'Education', count: 89 },
];

export function Landing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <NodeBackground />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-bitcoin/10 border border-accent-bitcoin/20 mb-8',
            'transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <span className="w-2 h-2 rounded-full bg-accent-bitcoin animate-pulse" />
            <span className="text-sm text-accent-bitcoin font-medium">Now on Liquid Network</span>
          </div>

          {/* Main heading */}
          <h1 className={cn(
            'text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight',
            'transition-all duration-700 delay-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            Tokenize Real Assets on{' '}
            <span className="text-gradient-bitcoin">Bitcoin</span>
          </h1>

          {/* Subheading */}
          <p className={cn(
            'text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto mb-10',
            'transition-all duration-700 delay-200',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            The first platform for tokenizing real-world assets using Bitcoin-native technology. 
            Self-custodial, transparent, and built for the future of finance.
          </p>

          {/* CTA Buttons */}
          <div className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-4',
            'transition-all duration-700 delay-300',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <Link to="/auth/register">
              <Button size="lg" className="gap-2 min-w-[180px]">
                Get Started
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/assets">
              <Button variant="outline" size="lg" className="min-w-[180px]">
                Explore Assets
              </Button>
            </Link>
          </div>

          {/* Live Stats */}
          <div className={cn(
            'grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto',
            'transition-all duration-700 delay-500',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            <StatCounter label="Assets Tokenized" value={269} />
            <StatCounter label="Trading Volume" value={45} suffix="M" />
            <StatCounter label="Active Users" value={12847} />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-foreground-secondary/30 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-foreground-secondary/50 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-background-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Security</h2>
            <p className="text-foreground-secondary max-w-xl mx-auto">
              Every component of our platform is designed with security and transparency in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={cn(
                    'p-6 rounded-lg bg-background-elevated border border-border',
                    'hover:border-accent-bitcoin/30 transition-all duration-300'
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-accent-bitcoin/10 flex items-center justify-center mb-4">
                    <Icon className="text-accent-bitcoin" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-foreground-secondary">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Asset Categories */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Asset Categories</h2>
            <p className="text-foreground-secondary max-w-xl mx-auto">
              Tokenize a diverse range of real-world assets and trade them fractionally.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {assetCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.name}
                  to="/assets"
                  className={cn(
                    'group p-6 rounded-lg bg-background-surface border border-border',
                    'hover:border-accent-bitcoin/30 transition-all duration-300'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-lg bg-accent-bitcoin/10 flex items-center justify-center group-hover:bg-accent-bitcoin/20 transition-colors">
                      <Icon className="text-accent-bitcoin" size={28} />
                    </div>
                    <span className="text-sm text-foreground-secondary">{category.count} assets</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-accent-bitcoin transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    Browse and invest in tokenized {category.name.toLowerCase()} assets.
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-background-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to start your journey?
          </h2>
          <p className="text-foreground-secondary mb-8 max-w-xl mx-auto">
            Join thousands of investors already tokenizing real-world assets on Bitcoin.
            Create your account in less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth/register">
              <Button size="lg" className="min-w-[200px]">
                Create Account
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-bitcoin flex items-center justify-center">
              <span className="text-white font-bold">₿</span>
            </div>
            <span className="font-semibold">RWA Platform</span>
          </div>
          <p className="text-sm text-foreground-secondary">
            © 2026 RWA Tokenization Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
