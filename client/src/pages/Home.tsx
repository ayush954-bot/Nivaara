import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import Partners from "@/components/Partners";
import { PropertySearchSection } from "@/components/PropertySearchSection";
import { ProjectSearchSection } from "@/components/ProjectSearchSection";
import FeaturedProperties from "@/components/FeaturedProperties";
import FeaturedProjects from "@/components/FeaturedProjects";

import TrustIndicators from "@/components/TrustIndicators";
import InteractivePuneMap from "@/components/InteractivePuneMap";
import EMICalculator from "@/components/EMICalculator";
import {
  Building2,
  CheckCircle2,
  Home as HomeIcon,
  Key,
  MapPin,
  Shield,
  TrendingUp,
  Users,
  ArrowRight,
  IndianRupee,
  Zap,
} from "lucide-react";

export default function Home() {
  const { data: testimonials = [] } = trpc.testimonials.list.useQuery();

  return (
    <div className="flex flex-col">


      {/* Hero Section with Search */}
      <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden pb-16 md:pb-0">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url(https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/jTkCDCbsQAjfpSvs.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4)",
          }}
        />
        <div className="container relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            We Build Trust
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            Your trusted real estate partner across India and international markets. Every property. Every solution. One name — Nivaara.
          </p>
          
          {/* Search Boxes Overlay */}
          <div className="max-w-5xl mx-auto mb-12">
            <Tabs defaultValue="properties" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/20 backdrop-blur-md">
                <TabsTrigger value="properties" className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Find Properties</TabsTrigger>
                <TabsTrigger value="projects" className="text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Find Projects</TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="bg-white/95 backdrop-blur-md rounded-lg p-6 shadow-2xl">
                <PropertySearchSection />
              </TabsContent>
              <TabsContent value="projects" className="bg-white/95 backdrop-blur-md rounded-lg p-6 shadow-2xl">
                <ProjectSearchSection />
              </TabsContent>
            </Tabs>
          </div>

          {/* Hero action row: consultation + list/my listings */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 md:mb-0">
            <Button size="lg" variant="outline" asChild className="text-lg bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20">
              <Link href="/contact">Schedule Consultation</Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-white/50 hidden sm:inline text-sm">|</span>
              <Button size="sm" variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10 border border-white/30">
                <Link href="/list-property/submit">+ List Your Property</Link>
              </Button>
              <Button size="sm" variant="ghost" asChild className="text-white/60 hover:text-white/90 hover:bg-white/10">
                <Link href="/my-listings">My Listings</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <TrustIndicators />

      {/* Introduction Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Complete Real Estate Solutions Across India & Beyond
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Nivaara is your comprehensive real estate consultancy partner, operating across India and international markets including Dubai. From residential flats to commercial spaces, land deals to investment advisory, we provide end-to-end solutions with complete transparency and professionalism. Based in Pune with expertise spanning major Indian cities, our name means shelter, protection, and settlement — values we bring to every client relationship worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <FeaturedProperties />

      {/* Featured Projects Section */}
      <FeaturedProjects />

      {/* Services Overview */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/NKaLkvvRuqtXHXOS.jpg",
                title: "Buy & Sell Properties",
                description: "Residential and commercial property transactions with trusted builders",
              },
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/YLHFkgRcQmMQXdWA.jpg",
                title: "Under-Construction Projects",
                description: "Expert guidance on pre-launch and under-construction developments",
              },
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/KbEMaRIjYwCrLnhi.jpg",
                title: "Rentals",
                description: "Residential and commercial rental solutions across Pune",
              },
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/DacjyBYTMUPcttuM.jpg",
                title: "Investment Advisory",
                description: "Strategic investment planning in Pune's real estate market",
              },
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/PEfJyQnARRyIgtBC.jpg",
                title: "Land Deals",
                description: "Land acquisition and sale with complete legal support",
              },
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/xxqlpvhIuOtFXJwc.jpg",
                title: "Documentation Support",
                description: "End-to-end property documentation and legal assistance",
              },
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/lWRFnEnDTfnzZRYN.jpg",
                title: "Commercial Spaces",
                description: "Offices, showrooms, and shops in prime locations",
              },
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/JOHvqZynlpIyZtYT.jpg",
                title: "Distress Sales",
                description: "Bank mortgage and distress property solutions",
              },
            ].map((service, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardContent className="pt-4 pb-6">
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" asChild>
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* List Property Promo Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#1A1A1A] via-[#2d2d2d] to-[#1A1A1A] py-12">
        {/* Decorative gold top line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: headline */}
            <div className="text-center md:text-left">
              <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">For Property Owners & Builders</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                Own a property? List it <span className="text-primary">free</span> in 5 minutes
              </h2>
              <p className="text-gray-400 mt-2 text-sm md:text-base max-w-lg">
                No signup, no fees, no middlemen — just verify your mobile number and reach thousands of serious buyers across India.
              </p>
            </div>
            {/* Right: trust pills + CTA */}
            <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
              <div className="flex flex-wrap gap-3 justify-center md:justify-end">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300">
                  <IndianRupee className="h-3.5 w-3.5 text-primary" />
                  <span>Zero listing fee</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span>Live in 30 minutes</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span>OTP verified only</span>
                </div>
              </div>
              <Link href="/list-property">
                <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors text-sm md:text-base">
                  List Your Property Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </section>

      {/* Why Choose Nivaara */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            Why Choose Nivaara
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/tgEJlapDdTfhMdzL.jpg",
                title: "Trust & Transparency",
                description: "Complete transparency in every transaction with verified properties and honest guidance",
              },
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/NIxqEwiihscOwOmh.jpg",
                title: "Expert Network",
                description: "Strong relationships with top builders and comprehensive market knowledge",
              },
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/OzjGKRIDbeVkdkVE.jpg",
                title: "End-to-End Support",
                description: "From search to paperwork, we manage everything for a seamless experience",
              },
              {
                image: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/GBIJAGQzHQMrGsPN.jpg",
                title: "Market Expertise",
                description: "Deep understanding of Pune's real estate market and investment opportunities",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Pune Map */}
      <InteractivePuneMap />

      {/* EMI Calculator */}
      <EMICalculator />

      {/* Partners Section */}
      <Partners />

      {/* Testimonials */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.slice(0, 3).map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 fill-amber-400 text-amber-400"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Perfect Property?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your peace, our priority. Let's make your real estate journey seamless and successful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/properties">Browse Properties</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link href="/contact">Schedule Consultation</Link>
            </Button>

          </div>
        </div>
      </section>
    </div>
  );
}
