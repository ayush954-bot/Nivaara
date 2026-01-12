import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloatingCallButton() {
  return (
    <a
      href="tel:+919764515697"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Call Nivaara Realty"
    >
      <Button
        size="lg"
        className="h-16 w-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-primary hover:bg-primary/90"
      >
        <Phone className="h-7 w-7 text-primary-foreground" />
      </Button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
          Call Now: +91 9764515697
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
        </div>
      </div>
    </a>
  );
}
