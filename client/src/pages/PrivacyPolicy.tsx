import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <section className="bg-foreground text-background py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-background/70 hover:text-background transition-colors mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-3 text-background/70 text-sm">Last updated: April 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container max-w-4xl mx-auto px-4 prose prose-slate max-w-none">
          <div className="space-y-8 text-foreground/80 leading-relaxed">

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">1. Introduction</h2>
              <p>
                Nivaara Realty Solutions LLP ("Nivaara", "we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>nivaararealty.com</strong> or contact us for real estate services.
              </p>
              <p className="mt-3">
                By using our website or services, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-semibold text-foreground mb-2">a. Information You Provide Directly</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name, phone number, and email address submitted via contact forms or inquiry forms</li>
                <li>Property preferences, budget range, and location requirements shared during consultations</li>
                <li>Messages or queries sent through our chat widget or WhatsApp</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">b. Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Browser type, operating system, and device information</li>
                <li>IP address and approximate geographic location</li>
                <li>Pages visited, time spent on pages, and navigation patterns (via Google Analytics)</li>
                <li>Referring website or search query that brought you to our site</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Respond to your property inquiries and schedule consultations</li>
                <li>Send you property listings, updates, and relevant real estate information</li>
                <li>Improve our website content and user experience</li>
                <li>Analyse website traffic and usage patterns to enhance our services</li>
                <li>Comply with legal obligations under applicable Indian laws</li>
                <li>Prevent fraud and ensure website security</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">4. Sharing Your Information</h2>
              <p>We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>With builders and developers</strong> — only when you have expressed interest in a specific project and have consented to be contacted</li>
                <li><strong>With service providers</strong> — trusted third-party services that assist us in operating our website (e.g., email delivery, analytics), bound by confidentiality agreements</li>
                <li><strong>Legal requirements</strong> — when required by law, court order, or governmental authority</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">5. Cookies and Tracking Technologies</h2>
              <p>
                Our website uses cookies and similar tracking technologies (including Google Analytics) to enhance your browsing experience and analyse site traffic. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of our website may not function properly without cookies.
              </p>
              <p className="mt-3">
                Google Analytics collects anonymised data about your interactions with our website. You can opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">6. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfil the purposes outlined in this policy, or as required by applicable law. Inquiry data is typically retained for up to 3 years for follow-up and legal compliance purposes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">7. Data Security</h2>
              <p>
                We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. Our website uses HTTPS encryption for all data transmission. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">8. Your Rights</h2>
              <p>Under applicable Indian data protection laws, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate or incomplete information</li>
                <li>Request deletion of your personal information (subject to legal obligations)</li>
                <li>Withdraw consent for marketing communications at any time</li>
                <li>Lodge a complaint with the relevant data protection authority</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, please contact us at <strong>info@nivaararealty.com</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">9. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites (such as builder websites, Google Maps, or social media platforms). We are not responsible for the privacy practices or content of those websites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">10. Children's Privacy</h2>
              <p>
                Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such information, please contact us immediately.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">11. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically to stay informed about how we protect your information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">12. Contact Us</h2>
              <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
              <div className="mt-3 bg-secondary/30 rounded-lg p-4 text-sm space-y-1">
                <p><strong>Nivaara Realty Solutions LLP</strong></p>
                <p>Office No. 203, Sr No.69/4, Plot.B Zen Square, Kharadi, Pune – 411014, Maharashtra, India</p>
                <p>Email: <a href="mailto:info@nivaararealty.com" className="text-primary hover:underline">info@nivaararealty.com</a></p>
                <p>Phone: <a href="tel:+919764515697" className="text-primary hover:underline">+91 9764515697</a></p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
