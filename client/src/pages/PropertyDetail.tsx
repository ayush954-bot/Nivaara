import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import YouTubeEmbed from "@/components/YouTubeEmbed";
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
  Share2,
  Download,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getPropertyBadges } from "@/lib/badgeUtils";
import { ShareWithImage } from "@/components/ShareWithImage";

export default function PropertyDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const slug = params.slug || "";

  const { data: property, isLoading } = trpc.properties.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: propertyImages = [] } = trpc.admin.properties.images.list.useQuery(
    { propertyId: property?.id! },
    { enabled: !!property?.id }
  );

  const { data: propertyVideos = [] } = trpc.admin.properties.videos.list.useQuery(
    { propertyId: property?.id! },
    { enabled: !!property?.id }
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Determine which images to display
  const displayImages = propertyImages.length > 0 
    ? propertyImages.map(img => img.imageUrl)
    : property?.imageUrl 
    ? [property.imageUrl] 
    : ["/images/hero-building.jpg"];

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

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const extractVimeoId = (url: string): string => {
    const regExp = /vimeo.*\/(\d+)/i;
    const match = url.match(regExp);
    return match ? match[1] : '';
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

      {/* Image Gallery */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-black">
        <img
          src={displayImages[selectedImageIndex]}
          alt={`${property.title} - Image ${selectedImageIndex + 1}`}
          className="w-full h-full object-contain"
        />
        {/* Badge Display */}
        {(() => {
          const badges = getPropertyBadges(property);
          if (badges.length > 0) {
            return (
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                {badges.map((badge, idx) => (
                  <Badge key={idx} className={`${badge.colorClass} text-base px-4 py-2 shadow-lg`}>
                    {badge.text}
                  </Badge>
                ))}
              </div>
            );
          }
          return null;
        })()}
        
        {/* Image navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-colors"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full transition-colors"
              aria-label="Next image"
            >
              →
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>
      
      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div className="container py-4">
          <div className="flex gap-2 overflow-x-auto">
            {displayImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImageIndex === index 
                    ? "border-primary ring-2 ring-primary/20" 
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

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

            {/* Video Gallery */}
            {propertyVideos.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">
                    {propertyVideos.length === 1 ? 'Video Tour' : 'Video Gallery'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {propertyVideos.map((video, index) => (
                      <div key={video.id || index} className="space-y-2">
                        {video.videoType === 'youtube' && (
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <iframe
                              src={`https://www.youtube.com/embed/${extractYouTubeId(video.videoUrl)}`}
                              title={`${property.title} - Video ${index + 1}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        )}
                        {video.videoType === 'vimeo' && (
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <iframe
                              src={`https://player.vimeo.com/video/${extractVimeoId(video.videoUrl)}`}
                              title={`${property.title} - Video ${index + 1}`}
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        )}
                        {(video.videoType === 'virtual_tour' || video.videoType === 'other') && (
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <iframe
                              src={video.videoUrl}
                              title={`${property.title} - Video ${index + 1}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <Badge variant="outline">
                            {video.videoType === 'youtube' && 'YouTube'}
                            {video.videoType === 'vimeo' && 'Vimeo'}
                            {video.videoType === 'virtual_tour' && 'Virtual Tour'}
                            {video.videoType === 'other' && 'Video'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Contact Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                {/* For public listings, show the submitter's contact; otherwise show Nivaara contact */}
                {property?.listingSource === 'public' && property?.submitterName && property?.submitterPhone ? (
                  <>
                    <h3 className="text-2xl font-bold mb-1">Contact Owner</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      This property is listed by the owner directly.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-lg">
                            {property.submitterName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{property.submitterName}</p>
                          <p className="text-xs text-muted-foreground">Property Owner</p>
                        </div>
                      </div>
                      <Button className="w-full" size="lg" asChild>
                        <a href={`tel:${property.submitterPhone}`}>
                          <Phone className="h-5 w-5 mr-2" />
                          Call Owner
                        </a>
                      </Button>
                      <Button variant="outline" className="w-full border-green-500 text-green-700 hover:bg-green-50" size="lg" asChild>
                        <a
                          href={`https://wa.me/${property.submitterPhone.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%27m%20interested%20in%20your%20property%20listed%20on%20Nivaara%3A%20${encodeURIComponent(property.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp Owner
                        </a>
                      </Button>
                      <p className="text-xs text-muted-foreground text-center pt-1">
                        Listed via Nivaara · Contact directly
                      </p>
                    </div>
                  </>
                ) : (
                  <>
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
                          <a href="tel:+919764515697">
                            <Phone className="h-5 w-5 mr-2" />
                            Call Now
                          </a>
                        </Button>
                        <p className="text-sm text-muted-foreground text-center pt-2">
                          We'll respond within 24 hours
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleInquirySubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Name *</label>
                          <input
                            type="text"
                            required
                            value={inquiryForm.name}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email *</label>
                          <input
                            type="email"
                            required
                            value={inquiryForm.email}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Phone *</label>
                          <input
                            type="tel"
                            required
                            value={inquiryForm.phone}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Message</label>
                          <textarea
                            value={inquiryForm.message}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                            rows={4}
                            placeholder="Any specific questions or requirements..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1" disabled={createInquiry.isPending}>
                            {createInquiry.isPending ? "Sending..." : "Submit"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowInquiryForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Share and Brochure Buttons */}
                    <div className="mt-6 pt-6 border-t space-y-3">
                      <div className="flex gap-2">
                        <ShareWithImage
                          title={property.title}
                          text={`Check out ${property.title} - ${property.bedrooms} BHK ${property.propertyType} in ${property.location}`}
                          url={window.location.href}
                          imageUrl={property.imageUrl || undefined}
                          location={property.location}
                          price={property.priceLabel || `₹${property.price}`}
                          badges={getPropertyBadges(property).map(b => b.text)}
                          variant="outline"
                          className="flex-1"
                        />
                        {property.brochureUrl && (
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              const url = property.brochureUrl;
                              if (url) window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Brochure
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
