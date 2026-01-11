import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  variant?: "fixed" | "inline";
  message?: string;
  phoneNumber?: string;
}

export default function WhatsAppButton({
  variant = "fixed",
  message = "Hi, I'm interested in learning more about your real estate services.",
  phoneNumber = "919022813423", // Default: +91 9022813423
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  if (variant === "fixed") {
    return (
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-24 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group animate-bounce-slow"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat with us on WhatsApp
        </span>
        {/* Online indicator */}
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
      </button>
    );
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
      size="lg"
    >
      <MessageCircle className="h-5 w-5 mr-2" />
      WhatsApp Us
    </Button>
  );
}
