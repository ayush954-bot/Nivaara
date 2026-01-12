import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Building2,
  Home,
  ArrowLeft,
  Phone,
  Mail,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PropertyDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const propertyId = params.id ? parseInt(params.id) : null;

  const { data: property, isLoading } = trpc.properties.getById.useQuery(
    { id: propertyId! },
    { enabled: !!propertyId }
  );

  const createInquiry = trpc.inquiries.create.useMutation({
    onSuccess: () => {
      toast.success("Inquiry submitted successfully! We'll contact you soon.");
      setShowInquiryForm(false);
      setInquiryForm({ name: "", email: "", phone: "", message: "" });
    },
    onError: () => {
      toast.error("Failed to submit inquiry. Please try again.");
    },
  });

  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    createInquiry.mutate({
      propertyId: property.id,
      ...inquiryForm,
    });
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(0)} L`;
    }
    return `₹${num.toLocaleString("en-IN")}`;
  };

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="text-center">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/properties")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Back Button */}
      <div className="container py-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/properties")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>
      </div>

      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={property.imageUrl || "/images/hero-building.jpg"}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        {property.featured && (
          <Badge className="absolute top-8 left-8 bg-primary text-primary-foreground flex items-center gap-1 text-base px-4 py-2">
            <Star className="h-4 w-4 fill-current" />
            Featured
          </Badge>
        )}
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{property.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{property.location}</span>
                {property.area && <span>• {property.area}</span>}
              </div>
              <div className="text-4xl font-bold text-primary">
                {property.priceLabel || formatPrice(property.price.toString())}
              </div>
            </div>

            {/* Property Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Property Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center text-center p-4 bg-secondary/50 rounded-lg">
                    <Home className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="font-semibold">{property.propertyType}</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-secondary/50 rounded-lg">
                    <Building2 className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="font-semibold">{property.status}</span>
                  </div>
                  {property.bedrooms && property.bedrooms > 0 && (
                    <div className="flex flex-col items-center text-center p-4 bg-secondary/50 rounded-lg">
                      <Bed className="h-8 w-8 text-primary mb-2" />
                      <span className="text-sm text-muted-foreground">Bedrooms</span>
                      <span className="font-semibold">{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && property.bathrooms > 0 && (
                    <div className="flex flex-col items-center text-center p-4 bg-secondary/50 rounded-lg">
                      <Bath className="h-8 w-8 text-primary mb-2" />
                      <span className="text-sm text-muted-foreground">Bathrooms</span>
                      <span className="font-semibold">{property.bathrooms}</span>
                    </div>
                  )}
                  {property.area_sqft && (
                    <div className="flex flex-col items-center text-center p-4 bg-secondary/50 rounded-lg">
                      <Square className="h-8 w-8 text-primary mb-2" />
                      <span className="text-sm text-muted-foreground">Area</span>
                      <span className="font-semibold">{property.area_sqft} sq ft</span>
                    </div>
                  )}
                  {property.builder && (
                    <div className="flex flex-col items-center text-center p-4 bg-secondary/50 rounded-lg col-span-2">
                      <Building2 className="h-8 w-8 text-primary mb-2" />
                      <span className="text-sm text-muted-foreground">Builder</span>
                      <span className="font-semibold">{property.builder}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Contact Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-4">Interested?</h3>
                <p className="text-muted-foreground mb-6">
                  Get in touch with us for more information about this property.
                </p>

                {!showInquiryForm ? (
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setShowInquiryForm(true)}
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Send Inquiry
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      asChild
                    >
                      <a href="tel:+919876543210">
                        <Phone className="h-5 w-5 mr-2" />
                        Call Now
                      </a>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryForm.name}
                        onChange={(e) =>
                          setInquiryForm({ ...inquiryForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={inquiryForm.email}
                        onChange={(e) =>
                          setInquiryForm({ ...inquiryForm, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryForm.phone}
                        onChange={(e) =>
                          setInquiryForm({ ...inquiryForm, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Message
                      </label>
                      <textarea
                        value={inquiryForm.message}
                        onChange={(e) =>
                          setInquiryForm({ ...inquiryForm, message: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                        rows={4}
                        placeholder="Any specific questions or requirements..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={createInquiry.isPending}
                      >
                        {createInquiry.isPending ? "Sending..." : "Submit"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowInquiryForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    We'll respond within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
