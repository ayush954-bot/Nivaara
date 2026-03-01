import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Phone,
  Shield,
  Zap,
  IndianRupee,
  Clock,
  Users,
  Star,
  ArrowRight,
  Building2,
  Home,
  MapPin,
  Camera,
  FileText,
  TrendingUp,
} from "lucide-react";

const benefits = [
  {
    icon: Phone,
    title: "No Signup Required",
    description:
      "Just verify your mobile number with a one-time OTP. No email, no password, no lengthy registration forms.",
    highlight: true,
  },
  {
    icon: IndianRupee,
    title: "Completely Free",
    description:
      "List your property or project at zero cost. No listing fees, no commission, no hidden charges — ever.",
    highlight: true,
  },
  {
    icon: Shield,
    title: "Verified & Trusted Platform",
    description:
      "Every listing is reviewed by our team before going live, ensuring your property appears on a credible, spam-free platform.",
    highlight: false,
  },
  {
    icon: Zap,
    title: "Fast & Simple",
    description:
      "Our streamlined form takes under 5 minutes to complete. Add photos, price, location and you're done.",
    highlight: false,
  },
  {
    icon: Users,
    title: "Reach Real Buyers",
    description:
      "Nivaara connects you directly with serious buyers and investors actively searching for properties in your area.",
    highlight: false,
  },
  {
    icon: TrendingUp,
    title: "Maximum Visibility",
    description:
      "Your listing appears alongside professionally curated properties, giving it the same premium exposure.",
    highlight: false,
  },
];

const steps = [
  {
    step: "01",
    icon: Phone,
    title: "Verify Your Mobile",
    description: "Enter your phone number and confirm with a 6-digit OTP sent via SMS. Takes 30 seconds.",
  },
  {
    step: "02",
    icon: FileText,
    title: "Fill in Property Details",
    description: "Add title, location, price, type, and a description. Choose property or builder project.",
  },
  {
    step: "03",
    icon: Camera,
    title: "Upload Photos",
    description: "Add up to 10 photos (max 10 MB each). Good photos attract 3× more inquiries.",
  },
  {
    step: "04",
    icon: CheckCircle2,
    title: "Submit for Review",
    description: "Our team reviews your listing within 30 minutes. Once approved, it goes live instantly.",
  },
];

const listingTypes = [
  {
    icon: Home,
    title: "Residential Property",
    examples: "Flat, Villa, Row House, Plot",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    icon: Building2,
    title: "Commercial Property",
    examples: "Office, Shop, Showroom, Warehouse",
    color: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
  },
  {
    icon: MapPin,
    title: "Land / Plot",
    examples: "Agricultural, NA Plot, Industrial Land",
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
  },
  {
    icon: Building2,
    title: "Builder Project",
    examples: "New Launch, Under-Construction, Township",
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
  },
];

const faqs = [
  {
    q: "Is it really free to list my property?",
    a: "Yes, completely free. Nivaara does not charge any listing fee, subscription, or commission for public listings.",
  },
  {
    q: "How long does the review take?",
    a: "Our team reviews all submissions within 30 minutes. You will be notified once your listing is live.",
  },
  {
    q: "Can I edit my listing after submission?",
    a: "Yes. Once your listing is approved, you can re-verify your phone number and update your listing anytime.",
  },
  {
    q: "What if my listing is rejected?",
    a: "We will provide a reason for rejection. Common reasons include incomplete information or non-real estate content. You can resubmit after making corrections.",
  },
  {
    q: "Is my phone number safe?",
    a: "Your phone number is used only for OTP verification and is never displayed publicly on your listing.",
  },
  {
    q: "How many photos can I upload?",
    a: "Up to 10 photos per listing. Each file must be under 10 MB. We recommend at least 3 photos for best results.",
  },
];

export default function ListProperty() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#2a2a2a] to-[#1A1A1A] text-white py-20 md:py-28">
        {/* Decorative gold accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 hover:bg-primary/20 text-sm px-4 py-1">
              Free for Everyone · No Signup Needed
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              List Your Property{" "}
              <span className="text-primary">Free</span> on Nivaara
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
              Reach thousands of serious buyers and investors across India. No registration, no fees — just verify your mobile number and your listing goes live within 30 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/list-property/submit">
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full sm:w-auto">
                  List Your Property Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/properties">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                  Browse Listings
                </Button>
              </Link>
            </div>

            {/* Quick trust stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              {[
                { value: "₹0", label: "Listing Fee" },
                { value: "30m", label: "Review Time" },
                { value: "OTP", label: "Verification" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What You Can List */}
      <section className="py-16 bg-secondary/20">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            What Can You List?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Whether you're an individual owner, broker, or builder — all property types are welcome.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listingTypes.map((type) => (
              <div
                key={type.title}
                className={`rounded-xl border-2 p-6 text-center hover:shadow-lg transition-shadow ${type.color}`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-white mb-4 shadow-sm`}>
                  <type.icon className={`h-7 w-7 ${type.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{type.title}</h3>
                <p className="text-sm text-muted-foreground">{type.examples}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why List With Us */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Why List With Nivaara?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            We've made listing as simple and owner-friendly as possible.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className={`relative rounded-xl p-6 border transition-shadow hover:shadow-lg ${
                  benefit.highlight
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                {benefit.highlight && (
                  <div className="absolute -top-3 left-4">
                    <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
                      <Star className="h-3 w-3 mr-1 inline" />
                      Key Benefit
                    </Badge>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-secondary/30 to-background">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From verification to live listing in four simple steps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-primary/20 z-0" />
                )}
                <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-4 shadow-lg">
                  {step.step}
                </div>
                <div className="flex items-center justify-center mb-3">
                  <step.icon className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-background">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Everything you need to know about listing on Nivaara.
          </p>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-foreground">{faq.q}</span>
                  <span className={`shrink-0 text-primary transition-transform ${openFaq === index ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to List Your Property?
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto opacity-90">
            Join property owners across India who trust Nivaara to connect them with the right buyers. Free, fast, and verified.
          </p>
          <Link href="/list-property/submit">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 py-6 font-semibold"
            >
              Get Started — It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
