import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Building2, CalendarDays, Star, LogOut, ChevronLeft } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import logo from '@/assets/logo-algiers-tourism.png';

const navItems = [
  { title: 'Overview', icon: LayoutDashboard, path: '/admin' },
  { title: 'Properties', icon: Building2, path: '/admin/accommodations' },
  { title: 'Bookings', icon: CalendarDays, path: '/admin/bookings' },
  { title: 'Reviews', icon: Star, path: '/admin/reviews' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAdmin();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/');
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="p-5 border-b">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logo} alt="Algiers Tourism logo" className="h-9 w-9 object-contain" width={512} height={512} loading="lazy" />
            <div className="flex flex-col leading-none">
              <span className="font-heading text-lg tracking-tight text-foreground">Algiers</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Dashboard</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to site
          </Link>
          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
