import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Building2,
  FileText,
  Home,
  Key,
  Landmark,
  MapPin,
  ShieldCheck,
  Store,
  TrendingUp,
} from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: Home,
      title: "Residential Buy & Sell",
      description: "Complete assistance in buying and selling residential properties across Pune. We work with top builders and have access to premium residential projects, ensuring you get the best options that match your requirements and budget.",
      features: [
        "Access to premium residential projects",
        "Direct builder relationships",
        "Price negotiation support",
        "Site visits and property verification",
      ],
    },
    {
      icon: Building2,
      title: "Under-Construction Project Expertise",
      description: "Specialized guidance for under-construction and pre-launch projects. We help you navigate the complexities of buying properties that are still being built, ensuring you make informed decisions with complete transparency.",
      features: [
        "Builder reputation verification",
        "Project timeline assessment",
        "Payment plan guidance",
        "Construction quality monitoring",
      ],
    },
    {
      icon: ShieldCheck,
      title: "Luxury & Premium Projects",
      description: "Exclusive access to luxury residential developments and premium properties in Pune's most sought-after locations. Our network includes the city's finest builders and developers.",
      features: [
        "Exclusive luxury listings",
        "Premium location properties",
        "High-end amenities focus",
        "Investment value assessment",
      ],
    },
    {
      icon: Key,
      title: "Residential & Commercial Rentals",
      description: "Comprehensive rental solutions for both residential and commercial properties. Whether you're looking to rent or lease out a property, we match the right tenants with the right spaces.",
      features: [
        "Tenant verification services",
        "Rental agreement support",
        "Property management assistance",
        "Market rate analysis",
      ],
    },
    {
      icon: MapPin,
      title: "Land Deals",
      description: "Expert guidance on land acquisition and sale across Pune. We help you identify land parcels with high potential, conduct due diligence, and complete transactions with complete legal compliance.",
      features: [
        "Land title verification",
        "Zoning and regulation guidance",
        "Market value assessment",
        "Development potential analysis",
      ],
    },
    {
      icon: Store,
      title: "Commercial Property Sales",
      description: "Specialized services for commercial real estate including offices, showrooms, and retail spaces. We understand the unique requirements of commercial buyers and provide tailored solutions.",
      features: [
        "Prime location identification",
        "Footfall and visibility analysis",
        "ROI calculation support",
        "Lease vs. buy consultation",
      ],
    },
    {
      icon: Landmark,
      title: "Bank Mortgage & Distress Sales",
      description: "Assistance with bank-mortgaged properties and distress sales. We help buyers find value opportunities and support sellers in navigating complex situations with sensitivity and professionalism.",
      features: [
        "Bank auction property guidance",
        "Legal clearance support",
        "Valuation services",
        "Quick closure facilitation",
      ],
    },
    {
      icon: FileText,
      title: "Property Documentation Support",
      description: "End-to-end documentation assistance for all property transactions. Our team ensures all paperwork is accurate, complete, and legally compliant, giving you peace of mind.",
      features: [
        "Title deed verification",
        "Agreement drafting",
        "Registration support",
        "Legal compliance check",
      ],
    },
    {
      icon: TrendingUp,
      title: "Investment Strategy & Consultation",
      description: "Strategic investment advisory for Pune's real estate market. We help you identify high-potential investment opportunities based on market trends, location analysis, and growth projections.",
      features: [
        "Market trend analysis",
        "Location growth potential",
        "Portfolio diversification advice",
        "Exit strategy planning",
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">Our Services</h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive real estate solutions tailored to your needs. From search to paperwork — we manage everything.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <service.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm flex items-start">
                        <span className="text-primary mr-2">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-foreground">Areas We Cover</h2>
            <p className="text-lg text-muted-foreground mb-8">
              All our services are available across Pune's key locations, with special expertise in:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                "Kharadi",
                "Viman Nagar",
                "Wagholi",
                "Kalyani Nagar",
                "Hadapsar",
                "Magarpatta",
                "Koregaon Park",
                "Hinjewadi",
                "Balewadi",
                "Baner",
              ].map((area) => (
                <div
                  key={area}
                  className="bg-card text-card-foreground p-3 rounded-lg text-center font-medium"
                >
                  {area}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center text-foreground">
              Our Process
            </h2>
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Understanding Your Needs",
                  description: "We begin with a detailed consultation to understand your requirements, budget, and preferences.",
                },
                {
                  step: "2",
                  title: "Property Research & Shortlisting",
                  description: "Our team identifies suitable properties based on your criteria and provides comprehensive market insights.",
                },
                {
                  step: "3",
                  title: "Site Visits & Verification",
                  description: "We arrange property visits and conduct thorough verification of documents and builder credentials.",
                },
                {
                  step: "4",
                  title: "Negotiation & Deal Closure",
                  description: "We negotiate on your behalf to secure the best terms and facilitate smooth deal closure.",
                },
                {
                  step: "5",
                  title: "Documentation & Legal Support",
                  description: "Complete assistance with all paperwork, legal compliance, and registration processes.",
                },
                {
                  step: "6",
                  title: "Post-Transaction Support",
                  description: "Our relationship continues beyond the transaction with ongoing support and guidance.",
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-lg">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let us help you navigate Pune's real estate market with confidence and ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Contact Us Today</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link href="/properties">View Properties</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
