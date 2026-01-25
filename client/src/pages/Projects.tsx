import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Loader2, 
  Calendar, 
  Home,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";
import { getPropertyBadges } from "@/lib/badgeUtils";
// Header and Footer are already in App.tsx layout

export default function Projects() {
  const [location] = useLocation();
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [bhkFilter, setBhkFilter] = useState("all");

  // Read location parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locationParam = params.get('location');
    if (locationParam && locationParam !== 'all') {
      setLocationFilter(locationParam);
    }
  }, [location]);

  // Parse budget filter to min/max price
  const getBudgetRange = (budget: string): { minPrice?: number; maxPrice?: number } => {
    if (budget === "all") return {};
    
    const ranges: Record<string, { minPrice?: number; maxPrice?: number }> = {
      "0-50": { minPrice: 0, maxPrice: 5000000 },
      "50-100": { minPrice: 5000000, maxPrice: 10000000 },
      "100-150": { minPrice: 10000000, maxPrice: 15000000 },
      "150-200": { minPrice: 15000000, maxPrice: 20000000 },
      "200-plus": { minPrice: 20000000 },
    };
    
    return ranges[budget] || {};
  };

  const budgetRange = getBudgetRange(budgetFilter);

  // Fetch projects from database
  const { data: projects = [], isLoading } = trpc.projects.search.useQuery({
    location: locationFilter !== "all" ? locationFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    minPrice: budgetRange.minPrice,
    maxPrice: budgetRange.maxPrice,
    bedrooms: bhkFilter !== "all" ? parseInt(bhkFilter) : undefined,
  });

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header is already in App.tsx layout */}
      
      {/* Hero Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">Builder Projects</h1>
            <p className="text-xl text-muted-foreground">
              Explore premium residential projects from top builders in Pune
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-background border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 max-w-5xl mx-auto">
            {/* Location Filter */}
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Kharadi">Kharadi</SelectItem>
                <SelectItem value="Viman Nagar">Viman Nagar</SelectItem>
                <SelectItem value="Wagholi">Wagholi</SelectItem>
                <SelectItem value="Hinjewadi">Hinjewadi</SelectItem>
                <SelectItem value="Baner">Baner</SelectItem>
                <SelectItem value="Wakad">Wakad</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                <SelectItem value="Under Construction">Under Construction</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>

            {/* Budget Filter */}
            <Select value={budgetFilter} onValueChange={setBudgetFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="0-50">Under ₹50 Lakhs</SelectItem>
                <SelectItem value="50-100">₹50L - ₹1 Cr</SelectItem>
                <SelectItem value="100-150">₹1 Cr - ₹1.5 Cr</SelectItem>
                <SelectItem value="150-200">₹1.5 Cr - ₹2 Cr</SelectItem>
                <SelectItem value="200-plus">Above ₹2 Cr</SelectItem>
              </SelectContent>
            </Select>

            {/* BHK Filter */}
            <Select value={bhkFilter} onValueChange={setBhkFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="BHK" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All BHK</SelectItem>
                <SelectItem value="1">1 BHK</SelectItem>
                <SelectItem value="2">2 BHK</SelectItem>
                <SelectItem value="3">3 BHK</SelectItem>
                <SelectItem value="4">4 BHK</SelectItem>
                <SelectItem value="5">5+ BHK</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setLocationFilter("all");
                setStatusFilter("all");
                setBudgetFilter("all");
                setBhkFilter("all");
              }}
              className="w-full md:w-auto"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 bg-background flex-1">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to find more projects
              </p>
              <Button 
                onClick={() => {
                  setLocationFilter("all");
                  setStatusFilter("all");
                  setBudgetFilter("all");
                  setBhkFilter("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{projects.length}</span> projects
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any) => (
                  <Link key={project.id} href={`/projects/${project.slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                      {/* Project Image */}
                      <div className="relative h-48 bg-secondary overflow-hidden">
                        {project.coverImage && !project.coverImage.includes('placeholder') ? (
                          <img
                            src={project.coverImage}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                              <div className="absolute top-3 left-3 flex flex-col gap-1">
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
                        <Badge className={`absolute top-3 right-3 ${getStatusColor(project.status)}`}>
                          {project.status}
                        </Badge>
                        
                        {/* Featured Badge */}
                        {project.featured && (
                          <Badge className="absolute bottom-3 right-3 bg-primary text-primary-foreground">
                            Featured
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-5">
                        {/* Builder Name */}
                        <p className="text-sm text-primary font-medium mb-1">
                          {project.builderName}
                        </p>
                        
                        {/* Project Name */}
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {project.name}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{project.location}, {project.city}</span>
                        </div>

                        {/* Price Range */}
                        <div className="flex items-center text-lg font-bold text-primary mb-3">
                          <IndianRupee className="h-5 w-5 mr-1" />
                          <span>{project.priceRange}</span>
                        </div>

                        {/* Configurations & Possession */}
                        <div className="flex flex-wrap gap-2 mb-4">
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

                        {/* Amenities Preview */}
                        {project.amenities && project.amenities.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span>
                              {project.amenities.slice(0, 3).map((a: any) => a.name).join(', ')}
                              {project.amenities.length > 3 && ` +${project.amenities.length - 3} more`}
                            </span>
                          </div>
                        )}

                        {/* View Details Button */}
                        <Button className="w-full group-hover:bg-primary/90" size="sm">
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer is already in App.tsx layout */}
    </div>
  );
}
