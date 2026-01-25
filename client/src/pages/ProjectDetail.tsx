import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  IndianRupee,
  Loader2,
  ArrowLeft,
  Phone,
  CheckCircle2,
  Bed,
  Bath,
  Ruler,
  Play,
  FileText,
  Shield,
  Layers,
  Users,
  Waves,
  Dumbbell,
  Baby,
  Trees,
  Zap,
  Car,
  Activity,
  Gamepad2,
  Heart,
  Smartphone,
  Circle,
  Music,
  BookOpen,
  Home,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Icon mapping for amenities
const iconMap: Record<string, any> = {
  Waves,
  Dumbbell,
  Home,
  Baby,
  Trees,
  Shield,
  Zap,
  Car,
  Activity,
  Gamepad2,
  Heart,
  Smartphone,
  Users,
  Circle,
  Music,
  BookOpen,
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch project details
  const { data: project, isLoading, error } = trpc.projects.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );

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

  // Format price for display
  const formatPrice = (price: string | number | null) => {
    if (!price) return "Price on Request";
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(0)} L`;
    }
    return `₹${numPrice.toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading project details...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/projects">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-secondary/30 py-4">
        <div className="container">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">Home</Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/projects" className="text-muted-foreground hover:text-primary">Projects</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{project.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-8 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Image */}
            <div className="lg:col-span-2">
              <div className="relative h-[400px] rounded-xl overflow-hidden bg-secondary">
                {project.coverImage && !project.coverImage.includes('placeholder') ? (
                  <img
                    src={project.coverImage}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Building2 className="h-24 w-24 text-primary/40" />
                  </div>
                )}
                
                {/* Status Badge */}
                <Badge className={`absolute top-4 left-4 text-sm px-3 py-1 ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
                
                {/* Featured Badge */}
                {project.featured && (
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-sm px-3 py-1">
                    Featured Project
                  </Badge>
                )}
              </div>
            </div>

            {/* Project Info Card */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardContent className="p-6">
                  {/* Builder Name */}
                  <p className="text-sm text-primary font-medium mb-2">
                    {project.builderName}
                  </p>
                  
                  {/* Project Name */}
                  <h1 className="text-2xl font-bold mb-3">{project.name}</h1>

                  {/* Location */}
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{project.location}, {project.city}</span>
                  </div>

                  {/* Price Range */}
                  <div className="bg-primary/5 rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Price Range</p>
                    <div className="flex items-center text-2xl font-bold text-primary">
                      <IndianRupee className="h-6 w-6 mr-1" />
                      <span>{project.priceRange}</span>
                    </div>
                  </div>

                  {/* Key Details */}
                  <div className="space-y-3 mb-6">
                    {project.configurations && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Configurations</span>
                        <span className="font-medium">{project.configurations}</span>
                      </div>
                    )}
                    {project.possessionDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Possession</span>
                        <span className="font-medium">
                          {new Date(project.possessionDate).toLocaleDateString('en-IN', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                    {project.reraNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">RERA No.</span>
                        <span className="font-medium text-xs">{project.reraNumber}</span>
                      </div>
                    )}
                    {project.totalUnits && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Units</span>
                        <span className="font-medium">{project.totalUnits}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact Button */}
                  <Link href="/contact">
                    <Button className="w-full" size="lg">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact for Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-8 bg-secondary/20 flex-1">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-8 bg-background">
              <TabsTrigger value="overview" className="px-6">Overview</TabsTrigger>
              <TabsTrigger value="floorplans" className="px-6">Floor Plans</TabsTrigger>
              <TabsTrigger value="amenities" className="px-6">Amenities</TabsTrigger>
              <TabsTrigger value="gallery" className="px-6">Gallery</TabsTrigger>
              <TabsTrigger value="location" className="px-6">Location</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Highlights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {project.towers && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Layers className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{project.towers} Towers</p>
                            <p className="text-sm text-muted-foreground">
                              {project.floors} floors each
                            </p>
                          </div>
                        </div>
                      )}
                      {project.totalUnits && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{project.totalUnits} Units</p>
                            <p className="text-sm text-muted-foreground">Total apartments</p>
                          </div>
                        </div>
                      )}
                      {project.reraNumber && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">RERA Registered</p>
                            <p className="text-sm text-muted-foreground">{project.reraNumber}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Floor Plans Tab */}
            <TabsContent value="floorplans">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {project.floorPlans && project.floorPlans.length > 0 ? (
                  project.floorPlans.map((plan: any) => (
                    <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-4">{plan.name}</h3>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-muted-foreground">
                              <Bed className="h-4 w-4 mr-2" />
                              <span>Bedrooms</span>
                            </div>
                            <span className="font-medium">{plan.bedrooms}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-muted-foreground">
                              <Bath className="h-4 w-4 mr-2" />
                              <span>Bathrooms</span>
                            </div>
                            <span className="font-medium">{plan.bathrooms}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-muted-foreground">
                              <Ruler className="h-4 w-4 mr-2" />
                              <span>Area</span>
                            </div>
                            <span className="font-medium">{plan.area} sq.ft</span>
                          </div>
                        </div>

                        <div className="bg-primary/5 rounded-lg p-3 text-center">
                          <p className="text-sm text-muted-foreground">Starting from</p>
                          <p className="text-xl font-bold text-primary">
                            {formatPrice(plan.price)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Floor plans coming soon</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Amenities Tab */}
            <TabsContent value="amenities">
              <Card>
                <CardHeader>
                  <CardTitle>Project Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.amenities && project.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {project.amenities.map((amenity: any) => {
                        const IconComponent = iconMap[amenity.icon] || CheckCircle2;
                        return (
                          <div key={amenity.id} className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-secondary/50 transition-colors">
                            <div className="p-3 bg-primary/10 rounded-full mb-3">
                              <IconComponent className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{amenity.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Amenities information coming soon</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <Card>
                <CardHeader>
                  <CardTitle>Project Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.images && project.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {project.images.map((image: any) => (
                        <div key={image.id} className="aspect-video rounded-lg overflow-hidden bg-secondary">
                          <img
                            src={image.imageUrl}
                            alt={image.caption || project.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Gallery images coming soon</p>
                    </div>
                  )}

                  {/* Videos Section */}
                  {project.videos && project.videos.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Videos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.videos.map((video: any) => (
                          <div key={video.id} className="aspect-video rounded-lg overflow-hidden bg-secondary">
                            {video.videoType === 'youtube' ? (
                              <iframe
                                src={video.videoUrl.replace('watch?v=', 'embed/')}
                                title={video.title || 'Project Video'}
                                className="w-full h-full"
                                allowFullScreen
                              />
                            ) : (
                              <a
                                href={video.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-full flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors"
                              >
                                <Play className="h-12 w-12 text-primary" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>Project Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-lg">{project.location}, {project.city}</span>
                  </div>
                  
                  {project.latitude && project.longitude ? (
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782!2d${project.longitude}!3d${project.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDMxJzQ4LjAiTiA3M8KwNTYnMjQuMCJF!5e0!3m2!1sen!2sin!4v1234567890`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Map location coming soon</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Interested in {project.name}?</h2>
          <p className="text-lg mb-6 opacity-90">
            Contact us today for exclusive offers and site visits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                <Phone className="h-4 w-4 mr-2" />
                Schedule a Visit
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
