import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary tracking-tight">SmileCare</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link href="/services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Services</Link>
            <Link href="/gallery" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Gallery</Link>
            <Link href="/promotions" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Promotions</Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hidden md:block hover:text-primary transition-colors">Staff Login</Link>
            <Link href="/book">
              <Button data-testid="button-book-nav">Book Now</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/40 py-12">
        <div className="container grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">SmileCare Dental</h3>
            <p className="text-sm text-muted-foreground">Premium private dental care for your perfect smile.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
              <li><Link href="/services" className="hover:text-primary">Services</Link></li>
              <li><Link href="/gallery" className="hover:text-primary">Gallery</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>123 Clinic Ave, Medical District</li>
              <li>+60 12 345 6789</li>
              <li>hello@smilecare.com</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hours</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Mon - Fri: 9am - 6pm</li>
              <li>Saturday: 9am - 2pm</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/60123456789"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:-translate-y-1 transition-transform"
        data-testid="link-whatsapp-floating"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40">
        <Link href="/book" className="w-full">
          <Button className="w-full" size="lg" data-testid="button-book-mobile-sticky">Book Appointment</Button>
        </Link>
      </div>
    </div>
  );
}
