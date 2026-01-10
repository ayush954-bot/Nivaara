import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";


export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");


  const createInquiry = trpc.inquiries.create.useMutation({
    onSuccess: () => {
      alert("Thanks for submitting. We will get back to you shortly.");
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setIsOpen(false);
    },
    onError: (error) => {
      alert("Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone || !message) {
      alert("Please fill in all fields");
      return;
    }

    createInquiry.mutate({
      name,
      email,
      phone,
      message,
      inquiryType: "general",
    });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">Chat with Us</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">
            <p className="text-sm text-gray-600">
              Send us a message and we'll get back to you shortly!
            </p>

            <div>
              <Input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={createInquiry.isPending}
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={createInquiry.isPending}
              />
            </div>

            <div>
              <Input
                type="tel"
                placeholder="Your Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={createInquiry.isPending}
              />
            </div>

            <div>
              <Textarea
                placeholder="Your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                disabled={createInquiry.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createInquiry.isPending}
            >
              {createInquiry.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
