import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Bed,
  Bath,
  Square,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

export default function FeaturedProperties() {
  const { data: featuredProperties = [] } = trpc.properties.featured.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, featuredProperties.length - itemsPerView);

  useEffect(() => {
    if (!isAutoPlaying || featuredProperties.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex, featuredProperties.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
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

  if (featuredProperties.length === 0) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
            Featured Properties
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Handpicked properties for you
          </p>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No featured properties available at the moment.
            </p>
            <Button asChild>
              <Link href="/properties">View All Properties</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
          Featured Properties
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Handpicked properties for you
        </p>

        <div className="relative">
          {/* Navigation Buttons */}
          {featuredProperties.length > itemsPerView && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Properties Carousel */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {featuredProperties.map((property) => (
                <div
                  key={property.id}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3"
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                    <div className="relative overflow-hidden">
                      <img
                        src={property.imageUrl || "/images/placeholder-property.jpg"}
                        alt={property.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                        {property.status === "Under-Construction" ? "New Launch" : "Featured"}
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                        {property.title}
                      </h3>

                      <div className="flex items-center text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.location}</span>
                      </div>

                      <div className="text-2xl font-bold text-primary mb-4">
                        {property.priceLabel || formatPrice(property.price.toString())}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {property.bedrooms && property.bedrooms > 0 && (
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            <span>{property.bedrooms} Beds</span>
                          </div>
                        )}
                        {property.bathrooms && property.bathrooms > 0 && (
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            <span>{property.bathrooms} Baths</span>
                          </div>
                        )}
                        {property.area_sqft && (
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            <span>{property.area_sqft} sq ft</span>
                          </div>
                        )}
                      </div>

                      <Button asChild className="w-full">
                        <Link href={`/properties/${property.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          {featuredProperties.length > itemsPerView && (
            <div className="flex justify-center gap-2 mt-8">
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
                      : "w-2 bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" asChild>
            <Link href="/properties">View All Properties</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
