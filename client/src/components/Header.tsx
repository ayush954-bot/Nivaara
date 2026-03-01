import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { MessageCircle } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/properties", label: "Properties" },
    { href: "/projects", label: "Projects" },
    { href: "/locations", label: "Locations" },
    { href: "/team", label: "Team" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo — extra right margin so "Home" nav link has breathing room */}
          <Link href="/" className="flex items-center gap-3 shrink-0 mr-4">
            <img src="/images/nivaara-logo.png" alt="Nivaara" className="h-10 sm:h-12 w-auto" />
            <div className="flex flex-col justify-center leading-none">
              <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Nivaara</span>
              <span className="text-[10px] sm:text-xs font-medium text-muted-foreground tracking-widest uppercase">Realty Solutions</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${
                  location === link.href ? "text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Call + WhatsApp + Get Started */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Call Button */}
            <a
              href="tel:+919764515697"
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-all relative group"
            >
              <div className="relative">
                <Phone className="h-4 w-4 animate-pulse" />
                <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping"></span>
              </div>
              <span className="hidden xl:inline bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent animate-pulse">
                +91 9764515697
              </span>
            </a>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/919764515697?text=Hi%2C%20I%27m%20interested%20in%20your%20properties"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>

            <Button asChild size="sm">
              <Link href="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary px-2 py-2 ${
                    location === link.href ? "text-primary" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Call and WhatsApp in Mobile */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                <a
                  href="tel:+919764515697"
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors py-2 px-4 border border-border rounded-md"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Now</span>
                </a>
                <a
                  href="https://wa.me/919764515697?text=Hi%2C%20I%27m%20interested%20in%20your%20properties"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors py-2 px-4 border border-green-600 rounded-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Mobile listing CTAs */}
              <div className="flex gap-2 mt-2">
                <Button asChild variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Link href="/list-property/submit" onClick={() => setMobileMenuOpen(false)}>
                    List Property
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="flex-1 text-muted-foreground">
                  <Link href="/my-listings" onClick={() => setMobileMenuOpen(false)}>
                    My Listings
                  </Link>
                </Button>
              </div>

              <Button asChild className="w-full mt-1">
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
