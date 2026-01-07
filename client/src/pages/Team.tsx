import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Target, Heart, Code, TrendingUp } from "lucide-react";

export default function Team() {
  const founders = [
    {
      name: "Paresh Gurav",
      role: "Co-Founder & Real Estate Expert",
      expertise: "Real Estate Property Dealing & Market Analysis",
      bio: "Paresh brings extensive experience in real estate property dealing, builder relations, and market analysis. With deep knowledge of the Pune real estate market and strong relationships with developers, he ensures clients get the best deals and trusted properties.",
      specialties: ["Property Dealing", "Builder Partnerships", "Market Analysis", "Client Advisory"],
      icon: Award,
    },
    {
      name: "Ayush Agrawal",
      role: "Co-Founder & Technology Lead",
      expertise: "Technology & Innovation in Real Estate",
      bio: "Bringing technology and innovation to real estate with a strong Software Engineering background. Ayush leverages modern technology to streamline property transactions, enhance customer experience, and build data-driven solutions for smarter real estate decisions.",
      specialties: ["Software Engineering", "Digital Innovation", "Process Automation", "Tech Solutions"],
      icon: Code,
    },
    {
      name: "Anuj Agrawal",
      role: "Co-Founder & Property Consultant",
      expertise: "Real Estate Dealing & Technical Solutions",
      bio: "Anuj combines real estate property dealing expertise with a Software Engineering background. His unique blend of technical knowledge and market insight helps clients navigate complex property transactions with confidence and transparency.",
      specialties: ["Property Consulting", "Software Engineering", "Transaction Management", "Client Relations"],
      icon: TrendingUp,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">Our Team</h1>
            <p className="text-xl text-muted-foreground">
              Meet the founders behind Nivaara - combining real estate expertise with technological innovation
            </p>
          </div>
        </div>
      </section>

      {/* Team Introduction */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">Leadership That Builds Trust</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Nivaara is led by three partners who share a common vision: to transform the real estate landscape through ethical practices, transparency, and client-focused service. Our unique combination of real estate expertise and software engineering background enables us to deliver innovative, efficient, and trustworthy property solutions.
            </p>
          </div>

          {/* Founders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {founders.map((founder, index) => {
              const Icon = founder.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mx-auto mb-6">
                      <Icon className="h-12 w-12 text-primary" />
                    </div>
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold mb-2">{founder.name}</h3>
                      <p className="text-primary font-semibold mb-2">{founder.role}</p>
                      <Badge variant="secondary" className="text-xs">{founder.expertise}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-6 text-center leading-relaxed">{founder.bio}</p>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-center mb-2">Key Specialties:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {founder.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Values */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
              What Drives Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real Estate Expertise</h3>
                <p className="text-muted-foreground">
                  Deep market knowledge and strong relationships with builders, developers, and property owners across India.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Technology Innovation</h3>
                <p className="text-muted-foreground">
                  Leveraging software engineering expertise to build modern, efficient, and transparent real estate solutions.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Client-First Mindset</h3>
                <p className="text-muted-foreground">
                  Combining industry experience with technical innovation to deliver exceptional value and service to every client.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collective Experience */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-foreground">Our Unique Advantage</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              What sets Nivaara apart is our unique combination of real estate expertise and software engineering background. This allows us to not only understand the property market deeply but also leverage technology to provide faster, more transparent, and more efficient service to our clients.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">100+</div>
                <p className="text-muted-foreground">Happy Clients</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <p className="text-muted-foreground">Builder Partners</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">200+</div>
                <p className="text-muted-foreground">Properties Sold</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10+</div>
                <p className="text-muted-foreground">Cities Covered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Work With Our Team</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the Nivaara difference. Let our expert team guide you to your perfect property with the perfect blend of expertise and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground hover:bg-background/90 h-11 px-8"
            >
              Contact Us
            </a>
            <a
              href="/properties"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-background/20 bg-transparent hover:bg-background/10 text-background h-11 px-8"
            >
              View Properties
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
