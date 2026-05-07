import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-react';
import logo from '@/assets/logo-algiers-tourism.png';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={logo} alt="Algiers Tourism logo" className="h-10 w-10 object-contain group-hover:scale-105 transition-transform duration-300" width={512} height={512} loading="lazy" />
              <div className="flex flex-col leading-none">
                <span className="font-heading text-lg">Algiers</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Tourism</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your trusted platform for discovering and booking the finest accommodations in Algiers, Algeria.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wide">Navigation</h4>
            <div className="space-y-3">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">Accueil</Link>
              <Link to="/search" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">Explorer</Link>
              <Link to="/search?type=hotel" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">Hôtels</Link>
              <Link to="/search?type=budget" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">Auberges & Locations</Link>
              <Link to="/submit-property" className="block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:translate-x-1 transform">Submit Property</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wide">Contact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                <span>Algiers, Algeria</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-primary/70" />
                <a href="mailto:contact@algierstourism.dz" className="hover:text-foreground transition-colors duration-200">contact@algierstourism.dz</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-primary/70" />
                <a href="tel:+213555123456" className="hover:text-foreground transition-colors duration-200">+213 555 123 456</a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold mb-4 tracking-wide">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Subscribe to get exclusive deals and travel tips for Algiers.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm bg-muted/50 rounded-lg border border-border/50 outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-border/30 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Algiers Tourism — All rights reserved
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors duration-200">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
