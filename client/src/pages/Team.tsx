import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Target, Heart } from "lucide-react";

export default function Team() {
  const founders = [
    {
      name: "Paresh",
      role: "Co-Founder & Partner",
      expertise: "Residential Real Estate & Builder Relations",
      bio: "With extensive experience in residential property transactions, Paresh brings deep relationships with Pune's top builders and developers. His expertise in project evaluation and market analysis helps clients make informed decisions.",
      specialties: ["Builder Partnerships", "Project Assessment", "Market Analysis"],
    },
    {
      name: "Anshul",
      role: "Co-Founder & Partner",
      expertise: "Commercial Real Estate & Investment Strategy",
      bio: "Anshul specializes in commercial property transactions and investment advisory. His strategic approach to real estate investment has helped numerous clients build profitable property portfolios across Pune.",
      specialties: ["Commercial Properties", "Investment Planning", "Portfolio Management"],
    },
    {
      name: "Anuj",
      role: "Co-Founder & Partner",
      expertise: "Legal Documentation & Compliance",
      bio: "Anuj ensures all transactions are legally sound and compliant. His meticulous attention to documentation and regulatory requirements provides clients with complete peace of mind throughout their property journey.",
      specialties: ["Legal Compliance", "Documentation", "Title Verification"],
    },
    {
      name: "Ayush",
      role: "Co-Founder & Partner",
      expertise: "Client Relations & Operations",
      bio: "Ayush focuses on delivering exceptional client experiences and managing operational excellence. His commitment to transparency and client satisfaction has been instrumental in building Nivaara's reputation.",
      specialties: ["Client Service", "Operations Management", "Process Excellence"],
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
              Meet the partners behind Nivaara's success
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
              Nivaara is led by four partners who share a common vision: to transform Pune's real estate landscape through ethical practices, transparency, and client-focused service. Each partner brings unique expertise and experience, ensuring comprehensive guidance across all aspects of real estate transactions.
            </p>
          </div>

          {/* Founders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {founders.map((founder, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mx-auto mb-6">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold mb-2">{founder.name}</h3>
                    <p className="text-primary font-semibold mb-2">{founder.role}</p>
                    <Badge variant="secondary">{founder.expertise}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 text-center">{founder.bio}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-center mb-2">Key Specialties:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {founder.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                <h3 className="text-xl font-semibold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  We strive for excellence in every interaction, ensuring the highest standards of service and professionalism.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Integrity</h3>
                <p className="text-muted-foreground">
                  Complete transparency and honesty form the foundation of our relationships with clients and partners.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Commitment</h3>
                <p className="text-muted-foreground">
                  Your success is our priority. We're committed to going above and beyond to meet your real estate goals.
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
            <h2 className="text-4xl font-bold mb-6 text-foreground">Collective Expertise</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Together, our partners bring decades of combined experience across all facets of real estate — from residential and commercial transactions to legal compliance, investment strategy, and client service. This diverse expertise ensures that Nivaara clients receive comprehensive guidance throughout their property journey.
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
                <p className="text-muted-foreground">Pune Locations</p>
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
            Experience the Nivaara difference. Let our expert team guide you to your perfect property.
          </p>
        </div>
      </section>
    </div>
  );
}
