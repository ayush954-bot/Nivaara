import { Link } from "wouter";
import { Building2, Mail, MapPin, Phone } from "lucide-react";
import { APP_TITLE } from "@/const";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">{APP_TITLE}</span>
            </div>
            <p className="text-sm text-background/80">
              We Build Trust. Your trusted real estate partner across India and international markets.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Office No. 203, Zen Square, Kharadi, Pune</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-primary transition-colors">
                  Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Residential Buy/Sell</li>
              <li>Commercial Properties</li>
              <li>Rentals</li>
              <li>Land Deals</li>
              <li>Investment Advisory</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span>+91 9764515697</span>
                  <span>+91 9022813423</span>
                </div>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@nivaararealty.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/70">
          <p>&copy; 2026 Nivaara Realty Solutions LLP. All rights reserved.</p>
          <p className="mt-2">RERA Registered | Transparency. Trust. Excellence.</p>
        </div>
      </div>
    </footer>
  );
}
