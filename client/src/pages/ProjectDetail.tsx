import { useState, useMemo } from "react";
import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getPropertyBadges } from "@/lib/badgeUtils";
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
  Download,
  Share2,
  Calendar,
  Calculator,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Award,
  Building,
  Clock,
  Star,
  Image as ImageIcon,
  Video,
} from "lucide-react";
// Header and Footer are provided by App.tsx layout

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
  Building,
  Star,
};

// Helper to extract YouTube video ID
const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showEmiCalculator, setShowEmiCalculator] = useState(false);
  
  // EMI Calculator state
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);

  // Fetch project details by slug
  const { data: project, isLoading, error } = trpc.projects.getBySlug.useQuery(
    { slug: id || "" },
    { enabled: !!id }
  );

  // Calculate EMI
  const emi = useMemo(() => {
    const principal = loanAmount;
    const rate = interestRate / 12 / 100;
    const time = loanTenure * 12;
    const emiValue = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
    return Math.round(emiValue);
  }, [loanAmount, interestRate, loanTenure]);

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

  // Get all images for gallery
  const allImages = useMemo(() => {
    if (!project) return [];
    const images = [];
    if (project.coverImage) {
      images.push({ url: project.coverImage, caption: "Cover Image" });
    }
    if (project.masterPlanUrl) {
      images.push({ url: project.masterPlanUrl, caption: "Master Plan" });
    }
    if (project.images) {
      project.images.forEach((img: any) => {
        images.push({ url: img.imageUrl, caption: img.caption || "Project Image" });
      });
    }
    return images;
  }, [project]);

  // Open lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Navigate lightbox
  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    } else {
      setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading project details...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16">
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
    );
  }

  return (
    <div className="flex flex-col">

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="h-8 w-8" />
          </button>
          <button
            onClick={() => navigateLightbox('prev')}
            className="absolute left-4 text-white hover:text-gray-300"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>
          <div className="max-w-5xl max-h-[80vh] px-16">
            <img
              src={allImages[lightboxIndex]?.url}
              alt={allImages[lightboxIndex]?.caption}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <p className="text-white text-center mt-4">
              {allImages[lightboxIndex]?.caption} ({lightboxIndex + 1} / {allImages.length})
            </p>
          </div>
          <button
            onClick={() => navigateLightbox('next')}
            className="absolute right-4 text-white hover:text-gray-300"
          >
            <ChevronRight className="h-12 w-12" />
          </button>
        </div>
      )}

      {/* Back Button */}
      <div className="container py-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/projects")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      {/* Hero Section */}
      <section className="py-8 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Image with Gallery Preview */}
            <div className="lg:col-span-2">
              <div 
                className="relative h-[400px] rounded-xl overflow-hidden bg-secondary cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                {project.coverImage && !project.coverImage.includes('placeholder') ? (
                  <img
                    src={project.coverImage}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Building2 className="h-24 w-24 text-primary/40" />
                  </div>
                )}
                
                {/* Badges - Using badgeUtils like Properties section */}
                {(() => {
                  const badges = getPropertyBadges(project);
                  if (badges.length > 0) {
                    return (
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {badges.map((badge, idx) => (
                          <Badge key={idx} className={`${badge.colorClass} text-sm px-3 py-1 shadow-lg`}>
                            {badge.text}
                          </Badge>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* Status Badge on right */}
                <Badge className={`absolute top-4 right-4 text-sm px-3 py-1 ${getStatusColor(project.status)}`}>
                  {project.status}
                </Badge>
                
                {/* Featured Badge */}
                {project.featured && (
                  <Badge className="absolute top-16 right-4 bg-primary text-primary-foreground text-sm px-3 py-1">
                    Featured Project
                  </Badge>
                )}

                {/* View Gallery Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p className="font-medium">View Gallery ({allImages.length} images)</p>
                  </div>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {allImages.slice(0, 6).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => openLightbox(idx)}
                      className="flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all"
                    >
                      <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {allImages.length > 6 && (
                    <div
                      onClick={() => openLightbox(6)}
                      className="flex-shrink-0 w-20 h-16 rounded-lg bg-secondary flex items-center justify-center cursor-pointer hover:bg-secondary/80"
                    >
                      <span className="text-sm font-medium">+{allImages.length - 6}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Project Info Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
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
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <a href="tel:+919764515697" className="block">
                      <Button className="w-full" size="lg">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    </a>
                    <a 
                      href={`https://wa.me/919764515697?text=Hi, I'm interested in ${project.name} project in ${project.location}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                    </a>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowEmiCalculator(!showEmiCalculator)}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        EMI
                      </Button>
                      {project.brochureUrl && (
                        <a 
                          href={project.brochureUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1"
                          download
                          onClick={(e) => {
                            // For external URLs, open in new tab instead of download
                            const url = project.brochureUrl;
                            if (url && !url.includes(window.location.hostname) && 
                                !url.includes('s3.') && 
                                !url.includes('amazonaws.com')) {
                              e.preventDefault();
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Brochure
                          </Button>
                        </a>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => {
                          navigator.share?.({
                            title: project.name,
                            text: `Check out ${project.name} by ${project.builderName}`,
                            url: window.location.href
                          });
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* EMI Calculator */}
                  {showEmiCalculator && (
                    <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Calculator className="h-4 w-4 mr-2" />
                        EMI Calculator
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">Loan Amount: ₹{(loanAmount / 100000).toFixed(0)} L</Label>
                          <Slider
                            value={[loanAmount]}
                            onValueChange={(v) => setLoanAmount(v[0])}
                            min={1000000}
                            max={50000000}
                            step={500000}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Interest Rate: {interestRate}%</Label>
                          <Slider
                            value={[interestRate]}
                            onValueChange={(v) => setInterestRate(v[0])}
                            min={6}
                            max={15}
                            step={0.1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Tenure: {loanTenure} years</Label>
                          <Slider
                            value={[loanTenure]}
                            onValueChange={(v) => setLoanTenure(v[0])}
                            min={5}
                            max={30}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3 text-center">
                          <p className="text-sm text-muted-foreground">Monthly EMI</p>
                          <p className="text-2xl font-bold text-primary">
                            ₹{emi.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tour Section */}
      {project.videoUrl && (
        <section className="py-8 bg-secondary/20">
          <div className="container">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Video className="h-6 w-6 mr-2 text-primary" />
              Video Tour
            </h2>
            <div className="aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
              {getYouTubeId(project.videoUrl) ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(project.videoUrl)}`}
                  title="Project Video Tour"
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <a
                  href={project.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-full flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Play className="h-16 w-16 text-primary" />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tabs Section */}
      <section className="py-8 bg-background flex-1">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-8 bg-white border border-gray-200 shadow-sm rounded-xl h-auto p-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
              <TabsTrigger value="overview" className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-gray-100">Overview</TabsTrigger>
              <TabsTrigger value="floorplans" className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-gray-100">Floor Plans</TabsTrigger>
              <TabsTrigger value="amenities" className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-gray-100">Amenities</TabsTrigger>
              <TabsTrigger value="gallery" className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-gray-100">Gallery</TabsTrigger>
              <TabsTrigger value="builder" className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-gray-100">Builder</TabsTrigger>
              <TabsTrigger value="location" className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 hover:bg-gray-100">Location</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About {project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {project.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Price Table */}
                  {project.floorPlans && project.floorPlans.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Price List</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[400px]">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-2 sm:px-4 font-semibold whitespace-nowrap">Configuration</th>
                                <th className="text-left py-3 px-2 sm:px-4 font-semibold whitespace-nowrap">Area (sq.ft)</th>
                                <th className="text-left py-3 px-2 sm:px-4 font-semibold whitespace-nowrap">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {project.floorPlans.map((plan: any) => (
                                <tr key={plan.id} className="border-b hover:bg-secondary/30">
                                  <td className="py-3 px-2 sm:px-4 whitespace-nowrap">{plan.name}</td>
                                  <td className="py-3 px-2 sm:px-4 whitespace-nowrap">{plan.area}</td>
                                  <td className="py-3 px-2 sm:px-4 font-semibold text-primary whitespace-nowrap">{formatPrice(plan.price)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="lg:col-span-1 space-y-6">
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
                      {project.possessionDate && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Possession</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(project.possessionDate).toLocaleDateString('en-IN', { 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Master Plan */}
                  {project.masterPlanUrl && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Master Plan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div 
                          className="rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => {
                            const idx = allImages.findIndex(img => img.url === project.masterPlanUrl);
                            if (idx >= 0) openLightbox(idx);
                          }}
                        >
                          <img
                            src={project.masterPlanUrl}
                            alt="Master Plan"
                            className="w-full h-auto hover:scale-105 transition-transform"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Floor Plans Tab */}
            <TabsContent value="floorplans">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.floorPlans && project.floorPlans.length > 0 ? (
                  project.floorPlans.map((plan: any) => (
                    <Card key={plan.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                      {plan.imageUrl && (
                        <div className="aspect-[4/3] bg-secondary">
                          <img
                            src={plan.imageUrl}
                            alt={plan.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {project.amenities.map((amenity: any) => {
                        const IconComponent = iconMap[amenity.icon] || CheckCircle2;
                        const hasImage = amenity.imageUrl && amenity.imageUrl.trim();
                        return (
                          <div 
                            key={amenity.id} 
                            className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all duration-300"
                          >
                            {hasImage ? (
                              <>
                                <div className="aspect-[4/3] overflow-hidden">
                                  <img 
                                    src={amenity.imageUrl} 
                                    alt={amenity.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                                      <IconComponent className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-white font-medium text-sm">{amenity.name}</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="p-6 flex flex-col items-center text-center">
                                <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                                  <IconComponent className="h-8 w-8 text-primary" />
                                </div>
                                <span className="font-medium">{amenity.name}</span>
                              </div>
                            )}
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
                  {allImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {allImages.map((image, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => openLightbox(idx)}
                          className="aspect-video rounded-lg overflow-hidden bg-secondary cursor-pointer group"
                        >
                          <img
                            src={image.url}
                            alt={image.caption}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Video className="h-5 w-5 mr-2 text-primary" />
                        Project Videos
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.videos.map((video: any) => {
                          const videoId = getYouTubeId(video.videoUrl);
                          return (
                            <div key={video.id} className="aspect-video rounded-lg overflow-hidden bg-secondary">
                              {videoId ? (
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}`}
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
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Builder Tab */}
            <TabsContent value="builder">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {project.builderLogo && (
                      <img 
                        src={project.builderLogo} 
                        alt={project.builderName}
                        className="h-12 w-12 object-contain rounded-lg"
                      />
                    )}
                    <div>
                      <p className="text-xl">{project.builderName}</p>
                      {project.builderEstablished && (
                        <p className="text-sm text-muted-foreground font-normal">
                          Established {project.builderEstablished}
                        </p>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      {project.builderDescription ? (
                        <div className="prose prose-sm max-w-none">
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {project.builderDescription}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          {project.builderName} is a reputed real estate developer known for quality construction and timely delivery. 
                          Contact us for more information about the builder's track record and completed projects.
                        </p>
                      )}
                    </div>
                    <div className="lg:col-span-1">
                      <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
                        <h4 className="font-semibold">Builder Highlights</h4>
                        {project.builderEstablished && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Established</p>
                              <p className="font-medium">{project.builderEstablished}</p>
                            </div>
                          </div>
                        )}
                        {project.builderProjects && (
                          <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Total Projects</p>
                              <p className="font-medium">{project.builderProjects}+ Projects</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Trust Factor</p>
                            <p className="font-medium">RERA Registered</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                        src={`https://www.google.com/maps?q=${project.latitude},${project.longitude}&z=15&output=embed`}
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

                  {/* Connectivity Section */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-secondary/50 rounded-lg text-center">
                      <Car className="h-6 w-6 mx-auto text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Airport</p>
                      <p className="font-medium">15-20 mins</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg text-center">
                      <Building2 className="h-6 w-6 mx-auto text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">IT Hub</p>
                      <p className="font-medium">5-10 mins</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg text-center">
                      <Heart className="h-6 w-6 mx-auto text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Hospital</p>
                      <p className="font-medium">10 mins</p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg text-center">
                      <BookOpen className="h-6 w-6 mx-auto text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Schools</p>
                      <p className="font-medium">5 mins</p>
                    </div>
                  </div>
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
            <a href="tel:+919764515697">
              <Button size="lg" variant="secondary">
                <Phone className="h-4 w-4 mr-2" />
                Call: +91 9764515697
              </Button>
            </a>
            <a 
              href={`https://wa.me/919764515697?text=Hi, I want to schedule a site visit for ${project.name}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Site Visit
              </Button>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
