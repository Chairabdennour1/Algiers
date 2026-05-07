import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Menu, X, LayoutDashboard, Building2 } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo-algiers-tourism.png';
import UserAvatarMenu from '@/components/UserAvatarMenu';
import AlgiersWeatherWidget from '@/components/AlgiersWeatherWidget';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { Separator } from '@/components/ui/separator';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group relative">
          <img src={logo} alt="Algiers Tourism logo" className="h-20 w-20 object-contain group-hover:scale-105 transition-transform duration-300" width={512} height={512} />
          <div className="flex flex-col leading-none">
            <span className="font-heading text-2xl tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">Algiers</span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Tourism</span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <AlgiersWeatherWidget />
          <Separator orientation="vertical" className="h-6 mx-1" />
          <DarkModeToggle />
          <Link to="/search" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/80 transition-all duration-300 relative group/link">
            Explorer
            <span className="absolute bottom-1 left-4 right-4 h-px bg-primary scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          <Link to="/submit-property" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/80 transition-all duration-300 flex items-center gap-1.5 relative group/link">
            <Building2 className="h-4 w-4 transition-transform duration-300 group-hover/link:scale-110" /> Submit Property
            <span className="absolute bottom-1 left-4 right-4 h-px bg-primary scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/80 transition-all duration-300 flex items-center gap-1.5 relative group/link">
                  <LayoutDashboard className="h-4 w-4 transition-transform duration-300 group-hover/link:scale-110" /> Dashboard
                  <span className="absolute bottom-1 left-4 right-4 h-px bg-primary scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              )}
              <div className="ml-2">
                <UserAvatarMenu />
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')} className="ml-2">
                Connexion
              </Button>
              <Button size="sm" onClick={() => navigate('/auth/signup')} className="ml-1">
                S'inscrire
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 rounded-lg hover:bg-muted/80 transition-all duration-300 hover:scale-105 active:scale-95" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5 transition-transform duration-300 rotate-90" /> : <Menu className="h-5 w-5 transition-transform duration-300" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl p-4 space-y-1 animate-slide-up shadow-lg">
          <div className="flex justify-between items-center pb-2">
            <div className="flex-1 flex justify-center"><AlgiersWeatherWidget /></div>
            <DarkModeToggle />
          </div>
          <Link to="/search" className="block py-2.5 px-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>Explorer</Link>
          <Link to="/submit-property" className="block py-2.5 px-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>Submit Property</Link>
          {user ? (
            <>
              <Link to="/dashboard/bookings" className="block py-2.5 px-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>Mes Réservations</Link>
              {isAdmin && <Link to="/admin" className="block py-2.5 px-3 text-sm font-medium text-primary rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
              <button className="block py-2.5 px-3 text-sm font-medium text-destructive rounded-lg hover:bg-muted transition-colors w-full text-left" onClick={handleSignOut}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="block py-2.5 px-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>Connexion</Link>
              <Link to="/auth/signup" className="block py-2.5 px-3 text-sm font-medium text-primary rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(false)}>S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
