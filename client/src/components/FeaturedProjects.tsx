import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  Home,
  ArrowRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getPropertyBadges } from "@/lib/badgeUtils";

export default function FeaturedProjects() {
  // Fetch featured projects
  const { data: projects = [], isLoading } = trpc.projects.featured.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Update itemsPerView based on window width for responsive carousel
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1); // Mobile: 1 card
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 cards
      } else {
        setItemsPerView(3); // Desktop: 3 cards
      }
    };

    // Set initial value
    updateItemsPerView();

    // Add resize listener
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const maxIndex = Math.max(0, projects.length - itemsPerView);

  useEffect(() => {
    if (!isAutoPlaying || projects.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, maxIndex, projects.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ready to Move":
        return "bg-green-500 text-white";
      case "Under Construction":
        return "bg-amber-500 text-white";
      case "Upcoming":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return null; // Don't show section if no featured projects
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Featured Builder Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore premium residential projects from top builders in Pune
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          {projects.length > itemsPerView && (
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

          {/* Projects Carousel */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {projects.map((project: any) => (
                <div
                  key={project.id}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3"
                >
                  <Link href={`/projects/${project.slug}`}>
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group h-full">
                      {/* Project Image */}
                      <div className="relative h-52 bg-secondary overflow-hidden">
                        {project.coverImage && !project.coverImage.includes('placeholder') ? (
                          <img
                            src={project.coverImage}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <Building2 className="h-16 w-16 text-primary/40" />
                          </div>
                        )}
                        
                        {/* Badges - Using badgeUtils */}
                        {(() => {
                          const badges = getPropertyBadges(project);
                          if (badges.length > 0) {
                            return (
                              <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {badges.map((badge, idx) => (
                                  <Badge key={idx} className={`${badge.colorClass} text-xs px-2 py-1 shadow-lg`}>
                                    {badge.text}
                                  </Badge>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Status Badge on right */}
                        <Badge className={`absolute top-3 right-3 text-xs ${getStatusColor(project.status)}`}>
                          {project.status}
                        </Badge>
                      </div>

                      <CardContent className="p-5">
                        {/* Builder Name */}
                        <p className="text-xs text-primary font-medium mb-1">
                          {project.builderName}
                        </p>
                        
                        {/* Project Name */}
                        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {project.name}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="text-sm">{project.location}, {project.city}</span>
                        </div>

                        {/* Price Range */}
                        <div className="flex items-center text-primary font-bold mb-3">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span className="text-base">{project.priceRange}</span>
                        </div>

                        {/* Configurations */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {project.configurations && (
                            <Badge variant="secondary" className="text-xs">
                              <Home className="h-3 w-3 mr-1" />
                              {project.configurations}
                            </Badge>
                          )}
                          {project.possessionDate && (
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(project.possessionDate).toLocaleDateString('en-IN', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </Badge>
                          )}
                        </div>

                        {/* View Details - matching Properties style */}
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <Link href="/contact">Inquire</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Indicators */}
          {projects.length > itemsPerView && (
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
            <Link href="/projects">
              View All Projects
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
