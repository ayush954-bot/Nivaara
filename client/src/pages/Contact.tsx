import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const createInquiry = trpc.inquiries.create.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your inquiry! We'll get back to you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    },
    onError: (error) => {
      toast.error("Failed to submit inquiry. Please try again.");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInquiry.mutate({
      ...formData,
      inquiryType: "general",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">Contact Us</h1>
            <p className="text-xl text-muted-foreground">
              Get in touch with our team. We're here to help with all your real estate needs.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  Let's Connect
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Whether you're buying, selling, or investing in Pune real estate, our team is ready to assist you. Reach out to us through any of the channels below.
                </p>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Office Location</h3>
                        <p className="text-muted-foreground">
                          Office No. 203, Sr No.69/4,<br />
                          Plot.B Zen Square, Kharadi,<br />
                          Pune (MH), India
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Phone</h3>
                        <p className="text-muted-foreground">
                          +91 9764515697<br />
                          <span className="text-sm">Mon-Sat: 9:00 AM - 7:00 PM</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Email</h3>
                        <p className="text-muted-foreground">
                          info@nivaararealty.com<br />
                          <span className="text-sm">We'll respond within 24 hours</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">WhatsApp</h3>
                        <p className="text-muted-foreground mb-2">
                          Quick response via WhatsApp
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href="https://wa.me/919764515697"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Chat on WhatsApp
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us about your requirements..."
                        rows={5}
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Submit Inquiry
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            Visit Our Office
          </h2>
          <div className="rounded-lg overflow-hidden shadow-lg h-[400px]">
            <MapView
              onMapReady={(map: any) => {
                // Center map on Kharadi, Pune
                const kharadiLocation = { lat: 18.5515, lng: 73.9474 };
                map.setCenter(kharadiLocation);
                map.setZoom(14);

                // Add marker for office location
                new (window as any).google.maps.Marker({
                  position: kharadiLocation,
                  map: map,
                  title: "Nivaara - Kharadi Office",
                });
              }}
            />
          </div>
        </div>
      </section>

      {/* Office Hours */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
              Availability
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">We're Available</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Monday to Sunday</span>
                      </div>
                      <p className="text-sm">
                        Available all 7 days for your convenience. Contact us anytime via phone, WhatsApp, or email.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Flexible Consultation</h3>
                    <p className="text-muted-foreground mb-2">
                      We understand real estate decisions don't follow a 9-to-5 schedule. Reach out to us any day of the week, and we'll arrange a consultation at your convenience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
