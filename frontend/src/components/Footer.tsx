import { Link } from 'react-router-dom';
import { ShoppingBag, Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#6B3B1E] text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-foreground flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-foreground" />
              </div>
              <span className="font-display text-xl font-semibold">Aqilah Cakes</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Menyajikan kue-kue tradisional dan modern dengan cita rasa autentik rumahan yang selalu dinanti keluarga.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Menu</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/produk" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Produk
                </Link>
              </li>
              <li>
                <Link to="/tentang" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/pesan" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Pesan
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone className="w-4 h-4" />
                <span>+62 812-9720-4088</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Mail className="w-4 h-4" />
                <span>aqilahcakes@gmail.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Perum cikarang permai, ciantra, Cikarang Selatan</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-display font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
           Semua hak dilindungi. | 
            <span className="ml-1">Diamankan dengan enkripsi AES-256</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
