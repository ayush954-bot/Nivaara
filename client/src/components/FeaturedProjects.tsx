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
} from "lucide-react";

export default function FeaturedProjects() {
  // Fetch featured projects
  const { data: projects = [], isLoading } = trpc.projects.featured.useQuery();

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project: any) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                {/* Project Image */}
                <div className="relative h-40 bg-secondary overflow-hidden">
                  {project.coverImage && !project.coverImage.includes('placeholder') ? (
                    <img
                      src={project.coverImage}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Building2 className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <Badge className={`absolute top-2 left-2 text-xs ${getStatusColor(project.status)}`}>
                    {project.status}
                  </Badge>
                </div>

                <CardContent className="p-4">
                  {/* Builder Name */}
                  <p className="text-xs text-primary font-medium mb-1">
                    {project.builderName}
                  </p>
                  
                  {/* Project Name */}
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {project.name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="text-xs">{project.location}, {project.city}</span>
                  </div>

                  {/* Price Range */}
                  <div className="flex items-center text-primary font-bold mb-2">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    <span className="text-sm">{project.priceRange}</span>
                  </div>

                  {/* Configurations */}
                  <div className="flex flex-wrap gap-1 mb-3">
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

                  {/* View Details */}
                  <Button className="w-full" size="sm" variant="outline">
                    View Details
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
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
