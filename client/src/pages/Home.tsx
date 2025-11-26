import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Building2,
  CheckCircle2,
  Home as HomeIcon,
  Key,
  MapPin,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url(/images/hero-building.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.4)",
          }}
        />
        <div className="container relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            We Build Trust
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your trusted real estate partner across India and international markets. Every property. Every solution. One name — Nivaara.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg">
              <Link href="/properties">Explore Properties</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

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

      {/* Services Overview */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: HomeIcon,
                title: "Buy & Sell Properties",
                description: "Residential and commercial property transactions with trusted builders",
              },
              {
                icon: Building2,
                title: "Under-Construction Projects",
                description: "Expert guidance on pre-launch and under-construction developments",
              },
              {
                icon: Key,
                title: "Rentals",
                description: "Residential and commercial rental solutions across Pune",
              },
              {
                icon: TrendingUp,
                title: "Investment Advisory",
                description: "Strategic investment planning in Pune's real estate market",
              },
              {
                icon: MapPin,
                title: "Land Deals",
                description: "Land acquisition and sale with complete legal support",
              },
              {
                icon: Shield,
                title: "Documentation Support",
                description: "End-to-end property documentation and legal assistance",
              },
              {
                icon: Building2,
                title: "Commercial Spaces",
                description: "Offices, showrooms, and shops in prime locations",
              },
              {
                icon: CheckCircle2,
                title: "Distress Sales",
                description: "Bank mortgage and distress property solutions",
              },
            ].map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <service.icon className="h-12 w-12 text-primary mb-4" />
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

      {/* Why Choose Nivaara */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            Why Choose Nivaara
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Trust & Transparency",
                description: "Complete transparency in every transaction with verified properties and honest guidance",
              },
              {
                icon: Users,
                title: "Expert Network",
                description: "Strong relationships with top builders and comprehensive market knowledge",
              },
              {
                icon: CheckCircle2,
                title: "End-to-End Support",
                description: "From search to paperwork, we manage everything for a seamless experience",
              },
              {
                icon: TrendingUp,
                title: "Market Expertise",
                description: "Deep understanding of Pune's real estate market and investment opportunities",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Areas */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            Our Geographic Reach
          </h2>
          <div className="max-w-4xl mx-auto text-center mb-8">
            <p className="text-lg text-muted-foreground mb-6">
              Serving clients across India and international markets with local expertise
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { name: "Pune (All Zones)", highlight: true },
              { name: "Mumbai", highlight: false },
              { name: "Delhi NCR", highlight: false },
              { name: "Bangalore", highlight: false },
              { name: "Hyderabad", highlight: false },
              { name: "Chennai", highlight: false },
              { name: "Dubai, UAE", highlight: true },
              { name: "More Cities", highlight: false },
            ].map((location) => (
              <div
                key={location.name}
                className={`p-4 rounded-lg text-center font-medium transition-colors cursor-pointer ${
                  location.highlight
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {location.name}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button size="lg" variant="outline" asChild>
              <Link href="/locations">View All Locations & Pune Zones</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Rajesh Kumar",
                location: "Kharadi",
                text: "Nivaara helped us find our dream home in Kharadi. Their transparency and professionalism made the entire process smooth and stress-free.",
              },
              {
                name: "Priya Sharma",
                location: "Viman Nagar",
                text: "Excellent service for commercial property rental. The team understood our requirements perfectly and delivered beyond expectations.",
              },
              {
                name: "Amit Patel",
                location: "Hinjewadi",
                text: "Best real estate consultancy in Pune. Their market knowledge and investment advisory helped us make the right property decision.",
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
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
