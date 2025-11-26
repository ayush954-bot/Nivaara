import { Card, CardContent } from "@/components/ui/card";
import { Award, Heart, Shield, Target } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">About Nivaara</h1>
            <p className="text-xl text-muted-foreground">
              Building trust, one property at a time
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-foreground">Our Story</h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Nivaara was founded with a simple yet powerful vision: to transform the real estate experience across India and international markets by building relationships based on trust, transparency, and excellence. The name "Nivaara" itself embodies our core purpose — it means shelter, protection, and settlement in Sanskrit, reflecting our commitment to helping people find not just properties, but homes and opportunities that truly serve their needs.
              </p>
              <p>
                Based in the heart of Kharadi, Pune, we have expanded our operations across major Indian cities and international markets including Dubai. Our team combines deep market knowledge with strong relationships across India's real estate ecosystem, from established builders to emerging developers, from residential communities to commercial hubs.
              </p>
              <p>
                What sets us apart is our holistic approach and geographic reach. We don't just facilitate transactions; we provide end-to-end support throughout your real estate journey across India and beyond. Whether you're a first-time homebuyer in Pune, a seasoned investor exploring opportunities in Mumbai or Dubai, or a business looking for the perfect commercial space in Bangalore, we bring the same level of dedication, professionalism, and transparency to every engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <Target className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To provide comprehensive, transparent, and client-focused real estate solutions that empower individuals and businesses to make confident property decisions in Pune's dynamic market.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Award className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  To be recognized as Pune's most trusted real estate consultancy, known for our integrity, market expertise, and unwavering commitment to client success.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Heart className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Values</h3>
                <ul className="text-muted-foreground space-y-2">
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Trust and transparency in every interaction</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Client-first approach</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Professional excellence</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Market expertise</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-foreground text-center">
              What Makes Us Different
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: "Complete Solutions",
                  description: "From property search to documentation, we handle every aspect of your real estate journey under one roof.",
                },
                {
                  title: "Builder Relationships",
                  description: "Direct partnerships with Pune's top builders give you access to premium projects and exclusive deals.",
                },
                {
                  title: "Market Intelligence",
                  description: "Deep understanding of Pune's micro-markets helps you make informed investment decisions.",
                },
                {
                  title: "Transparent Process",
                  description: "No hidden costs, no surprises. We believe in complete transparency at every step.",
                },
                {
                  title: "Legal Support",
                  description: "Comprehensive documentation assistance ensures all your paperwork is handled professionally.",
                },
                {
                  title: "After-Sales Service",
                  description: "Our relationship doesn't end at the transaction. We're here for ongoing support and guidance.",
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-foreground">Our Leadership</h2>
            <p className="text-lg text-muted-foreground mb-12">
              Nivaara is led by four partners who bring together decades of combined experience in real estate, finance, and business development. Paresh, Anshul, Anuj, and Ayush share a common vision of transforming Pune's real estate landscape through ethical practices and client-focused service.
            </p>
            <p className="text-lg text-muted-foreground">
              Each partner brings unique expertise to the table, ensuring that our clients benefit from comprehensive guidance across all aspects of real estate transactions. Together, they have built Nivaara into a trusted name in Pune's property market.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Promise */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Our Promise to You</h2>
            <p className="text-xl mb-8">
              Every property. Every solution. One name — Nivaara.
            </p>
            <p className="text-lg opacity-90">
              From search to paperwork — we manage everything. Your peace, our priority.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
