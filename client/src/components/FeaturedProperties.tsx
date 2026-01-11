import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

// Sample featured properties data
const featuredProperties = [
  {
    id: 1,
    title: "Luxury 3 BHK Apartment",
    location: "Kharadi, Pune",
    price: "₹1.15 Crores",
    bedrooms: 3,
    bathrooms: 2,
    area: "1450 sq ft",
    image: "/images/property-1.jpg",
    tag: "Featured",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Premium 2 BHK Flat",
    location: "Viman Nagar, Pune",
    price: "₹95 Lakhs",
    bedrooms: 2,
    bathrooms: 2,
    area: "1200 sq ft",
    image: "/images/property-2.jpg",
    tag: "Hot Deal",
    rating: 4.6,
  },
  {
    id: 3,
    title: "Spacious 4 BHK Villa",
    location: "Baner, Pune",
    price: "₹2.5 Crores",
    bedrooms: 4,
    bathrooms: 3,
    area: "2500 sq ft",
    image: "/images/property-3.jpg",
    tag: "New Launch",
    rating: 4.9,
  },
  {
    id: 4,
    title: "Commercial Office Space",
    location: "Hinjewadi, Pune",
    price: "₹75 Lakhs",
    bedrooms: 0,
    bathrooms: 2,
    area: "800 sq ft",
    image: "/images/property-4.jpg",
    tag: "Commercial",
    rating: 4.5,
  },
  {
    id: 5,
    title: "5 Acres Premium Land",
    location: "Purandar, Pune",
    price: "₹2.5 Crores",
    bedrooms: 0,
    bathrooms: 0,
    area: "5 Acres",
    image: "/images/property-5.jpg",
    tag: "Investment",
    rating: 4.7,
  },
  {
    id: 6,
    title: "Modern 3 BHK Penthouse",
    location: "Koregaon Park, Pune",
    price: "₹3.2 Crores",
    bedrooms: 3,
    bathrooms: 3,
    area: "2200 sq ft",
    image: "/images/property-6.jpg",
    tag: "Luxury",
    rating: 5.0,
  },
];

export default function FeaturedProperties() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, featuredProperties.length - itemsPerView);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const visibleProperties = featuredProperties.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  // If we don't have enough properties at the end, wrap around
  if (visibleProperties.length < itemsPerView) {
    visibleProperties.push(
      ...featuredProperties.slice(0, itemsPerView - visibleProperties.length)
    );
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-2">
              Featured Properties
            </h2>
            <p className="text-lg text-muted-foreground">
              Handpicked properties for you
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProperties.map((property, index) => (
            <Card
              key={`${property.id}-${index}`}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative h-48 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${property.image})`,
                    backgroundColor: "#1a1a1a",
                  }}
                />
                <div className="absolute top-3 left-3">
                  <Badge
                    className={`${
                      property.tag === "Featured"
                        ? "bg-primary"
                        : property.tag === "Hot Deal"
                        ? "bg-red-500"
                        : property.tag === "New Launch"
                        ? "bg-green-500"
                        : property.tag === "Commercial"
                        ? "bg-blue-500"
                        : property.tag === "Investment"
                        ? "bg-purple-500"
                        : "bg-amber-500"
                    } text-white`}
                  >
                    {property.tag}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{property.rating}</span>
                </div>
              </div>

              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {property.title}
                </h3>

                <div className="flex items-center text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>

                <div className="text-2xl font-bold text-primary mb-4">
                  {property.price}
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{property.bedrooms} Beds</span>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span>{property.bathrooms} Baths</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Square className="h-4 w-4" />
                    <span>{property.area}</span>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href="/properties">View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" variant="outline" asChild>
            <Link href="/properties">View All Properties</Link>
          </Button>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
