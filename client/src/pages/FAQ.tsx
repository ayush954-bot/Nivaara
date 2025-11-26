import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FAQ() {
  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What services does Nivaara provide?",
          answer: "Nivaara offers comprehensive real estate solutions including residential and commercial property buying/selling, rentals, land deals, under-construction project consultation, investment advisory, property documentation support, and assistance with bank-mortgaged properties. We handle everything from property search to final paperwork.",
        },
        {
          question: "Which areas in Pune do you cover?",
          answer: "We operate across all major areas of Pune including Kharadi, Viman Nagar, Wagholi, Kalyani Nagar, Hadapsar, Magarpatta, Koregaon Park, Hinjewadi, Balewadi, Baner, and many more locations. Our office is based in Kharadi, but we serve clients throughout Pune.",
        },
        {
          question: "Do you charge any consultation fees?",
          answer: "Initial consultations are complimentary. We believe in understanding your requirements first and providing value before discussing our service fees. Our transparent pricing structure will be shared with you during the consultation based on your specific needs.",
        },
      ],
    },
    {
      category: "Buying Process",
      questions: [
        {
          question: "How does the property buying process work?",
          answer: "Our process begins with understanding your requirements and budget. We then shortlist suitable properties, arrange site visits, verify all documentation, assist with price negotiation, guide you through the legal paperwork, and support you until possession. We ensure complete transparency at every step.",
        },
        {
          question: "How do you verify property documents?",
          answer: "We conduct thorough due diligence including title deed verification, checking for any legal encumbrances, verifying builder credentials, ensuring all approvals are in place, and confirming that the property complies with local regulations. Our team works with legal experts to ensure complete documentation safety.",
        },
        {
          question: "Can you help with home loan arrangements?",
          answer: "Yes, we have strong relationships with major banks and financial institutions. We can guide you through the home loan process, help with documentation, and connect you with the right lenders to get competitive interest rates. However, the final loan approval depends on the bank's assessment.",
        },
        {
          question: "What is the advantage of buying under-construction properties?",
          answer: "Under-construction properties typically offer better prices compared to ready-to-move-in properties, flexible payment plans, opportunity to customize interiors, and potential for appreciation by the time of possession. We help you assess the builder's track record and project viability to minimize risks.",
        },
      ],
    },
    {
      category: "Selling Process",
      questions: [
        {
          question: "How do you help in selling my property?",
          answer: "We provide end-to-end selling support including property valuation, marketing to our extensive buyer network, arranging viewings, negotiating with potential buyers, handling all documentation, and facilitating a smooth transaction. Our goal is to get you the best price in the shortest time.",
        },
        {
          question: "How long does it take to sell a property?",
          answer: "The timeline varies based on property type, location, pricing, and market conditions. Typically, well-priced properties in good locations can sell within 1-3 months. We use our market expertise and buyer network to expedite the process while ensuring you get fair value.",
        },
      ],
    },
    {
      category: "Investment & Advisory",
      questions: [
        {
          question: "Is real estate a good investment in Pune?",
          answer: "Pune's real estate market has shown consistent growth due to its strong IT sector, educational institutions, and infrastructure development. However, investment success depends on choosing the right location, property type, and timing. Our investment advisory service helps you make informed decisions based on market trends and your financial goals.",
        },
        {
          question: "Which areas in Pune have the best investment potential?",
          answer: "Areas like Kharadi, Hinjewadi, Wagholi, and Baner have shown strong growth potential due to IT development and infrastructure projects. However, the best investment depends on your budget, timeline, and objectives. We provide detailed location analysis and growth projections to help you choose wisely.",
        },
        {
          question: "Should I invest in residential or commercial property?",
          answer: "Both have their advantages. Residential properties offer steady appreciation and easier liquidity, while commercial properties can provide higher rental yields. The choice depends on your investment goals, risk appetite, and capital availability. We help you evaluate both options based on your specific situation.",
        },
      ],
    },
    {
      category: "Documentation & Legal",
      questions: [
        {
          question: "What documents are required for property purchase?",
          answer: "Key documents include sale deed, title deed, property tax receipts, encumbrance certificate, building approval plans, completion certificate (for ready properties), and builder-buyer agreement (for under-construction). We provide a complete checklist and verify all documents on your behalf.",
        },
        {
          question: "How do you ensure legal compliance?",
          answer: "We work with experienced legal professionals to verify all property documents, ensure clear title, check for any pending litigations, confirm all government approvals are in place, and ensure the transaction complies with all applicable laws including RERA regulations.",
        },
        {
          question: "What is RERA and why is it important?",
          answer: "RERA (Real Estate Regulatory Authority) is a regulatory body that protects homebuyers' interests. All projects above a certain size must be RERA registered. We ensure that the properties we recommend are RERA compliant, giving you legal protection and transparency in your transaction.",
        },
      ],
    },
    {
      category: "About Nivaara",
      questions: [
        {
          question: "What makes Nivaara different from other real estate consultants?",
          answer: "Nivaara stands out through our commitment to transparency, comprehensive end-to-end service, strong builder relationships, deep market knowledge, and client-first approach. We don't just facilitate transactions; we build long-term relationships based on trust. Our name itself means 'shelter' and 'protection', reflecting our commitment to your interests.",
        },
        {
          question: "Do you work with all builders in Pune?",
          answer: "We have partnerships with most reputed builders in Pune and can access properties from virtually any developer. Our strong network gives you access to both listed and unlisted properties, often with exclusive deals and pre-launch opportunities.",
        },
        {
          question: "Can I trust Nivaara with my property transaction?",
          answer: "Trust is the foundation of our business. We maintain complete transparency, provide verified information, never push unsuitable properties, and ensure all legal aspects are properly handled. Our growing client base and referrals are testimony to the trust we've built in Pune's real estate market.",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about our services and the real estate process
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-3xl font-bold mb-6 text-foreground">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faqIndex}
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border rounded-lg px-6 bg-card"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-semibold">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Can't find the answer you're looking for? Our team is here to help. Reach out to us and we'll get back to you promptly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a
                  href="https://wa.me/91XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">
              Quick Tips for Property Buyers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Research the Location",
                  tip: "Study the area's connectivity, amenities, future development plans, and price trends before making a decision.",
                },
                {
                  title: "Verify All Documents",
                  tip: "Never skip document verification. Ensure clear title, all approvals, and RERA registration are in place.",
                },
                {
                  title: "Check Builder Reputation",
                  tip: "Research the builder's track record, previous projects, delivery timelines, and customer reviews.",
                },
                {
                  title: "Plan Your Finances",
                  tip: "Factor in registration costs, stamp duty, maintenance charges, and keep a buffer for unexpected expenses.",
                },
                {
                  title: "Visit Multiple Properties",
                  tip: "Don't rush. Visit several properties, compare options, and take time to make an informed decision.",
                },
                {
                  title: "Get Professional Help",
                  tip: "Work with experienced consultants who can guide you through the process and protect your interests.",
                },
              ].map((item, index) => (
                <div key={index} className="p-6 border rounded-lg bg-card">
                  <h3 className="text-lg font-semibold mb-2 text-primary">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
