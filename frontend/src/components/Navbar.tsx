import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { name: 'Beranda', path: '/' },
  { name: 'Produk', path: '/produk' },
  { name: 'Tentang Kami', path: '/tentang' },
  { name: 'Kontak', path: '/kontak' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-background" />
            </div>
            <span className="font-display text-xl font-semibold text-primary">Aqilah Cakes</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-accent",
                  location.pathname === link.path
                    ? "text-accent"
                    : "text-foreground/80"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            </Link>
            <Link to="/pesan">
              <Button variant="accent" size="sm">
                Pesan Sekarang
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-sm font-medium py-2 transition-colors hover:text-accent",
                    location.pathname === link.path
                      ? "text-accent"
                      : "text-foreground/80"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              </Link>
              <Link to="/pesan" onClick={() => setIsOpen(false)}>
                <Button variant="accent" size="sm" className="w-full">
                  Pesan Sekarang
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
