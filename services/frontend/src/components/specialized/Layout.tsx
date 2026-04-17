import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  Wallet, 
  LayoutDashboard, 
  Building2, 
  Store, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  ChevronDown,
  Zap
} from 'lucide-react';
import { cn } from '@lib/utils';
import { useAuthStore, useNotificationStore } from '@stores';
import { Button } from '@components/ui/Button';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export function Layout({ children, requireAuth = true, adminOnly = false }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, logout, user } = useAuthStore();
  const { success } = useNotificationStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      navigate('/auth/login', { state: { from: location.pathname } });
      return;
    }
    if (adminOnly && !isAdmin()) {
      navigate('/dashboard');
      return;
    }
  }, [requireAuth, isAuthenticated, adminOnly, isAdmin, navigate, location]);

  const handleLogout = () => {
    logout();
    success('Logged out', 'You have been logged out successfully');
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/assets', label: 'Assets', icon: Building2 },
    { path: '/marketplace', label: 'Marketplace', icon: Store },
    { path: '/education', label: 'Education', icon: GraduationCap },
  ];

  const adminNavItems = [
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-background-surface fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-bitcoin flex items-center justify-center">
              <span className="text-white font-bold text-lg">₿</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground">RWA Platform</h1>
              <p className="text-xs text-foreground-secondary">Bitcoin Tokenization</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-accent-bitcoin/10 text-accent-bitcoin'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-background-elevated'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}

          {isAdmin() && (
            <>
              <div className="pt-4 mt-4 border-t border-border">
                <p className="px-4 text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-2">
                  Admin
                </p>
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all',
                        isActive
                          ? 'bg-accent-bitcoin/10 text-accent-bitcoin'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-background-elevated'
                      )}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-background-elevated transition-all"
          >
            <Settings size={18} />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-foreground-secondary hover:text-accent-red hover:bg-accent-red/10 transition-all w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background-surface border-b border-border z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-bitcoin flex items-center justify-center">
            <span className="text-white font-bold">₿</span>
          </div>
          <span className="font-bold text-foreground">RWA</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-foreground"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-background z-30 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium',
                    isActive
                      ? 'bg-accent-bitcoin/10 text-accent-bitcoin'
                      : 'text-foreground-secondary'
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-border space-y-1">
              <Link
                to="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-foreground-secondary"
              >
                <Settings size={18} />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-foreground-secondary w-full"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
