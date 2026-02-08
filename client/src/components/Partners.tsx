import { Building2, Landmark } from "lucide-react";

const builders = [
  { name: "Lodha Group", logo: "/images/partners/lodha.png" },
  { name: "Godrej Properties", logo: "/images/partners/godrej.png" },
  { name: "Kolte-Patil Developers", logo: "/images/partners/kolte-patil.jpg" },
  { name: "Rohan Builders", logo: "/images/partners/rohan.png" },
  { name: "Shapoorji Pallonji", logo: "/images/partners/shapoorji.jpeg" },
  { name: "Goel Ganga Developments", logo: "/images/partners/goel-ganga.png" },
  { name: "Mahindra Lifespaces", logo: "/images/partners/mahindra.webp" },
  { name: "Kalpataru Group", logo: "/images/partners/kalpataru.png" },
  { name: "Runwal Group", logo: "/images/partners/runwal.jpg" },
  { name: "Vilas Javdekar Developers", logo: "/images/partners/vilas-javdekar.png" },
  { name: "Kumar Properties", logo: "/images/partners/kumar-properties.png" },
  { name: "Panchshil Realty", logo: "/images/partners/panchshil.jpeg" },
  { name: "Nyati Group", logo: "/images/partners/nyati.jpg" },
  { name: "Gera Developments", logo: "/images/partners/gera.jpg" },
  { name: "Paranjape Schemes (PSPL)", logo: "/images/partners/paranjape.gif" },
  { name: "BramhaCorp", logo: "/images/partners/brahmacorp.png" },
  { name: "Marvel Realtors", logo: "/images/partners/marvel.webp" },
  { name: "Mittal Brothers", logo: "/images/partners/mittal.png" },
  { name: "Mantra Properties", logo: "/images/partners/mantra.png" },
  { name: "Sobha Limited", logo: "/images/partners/sobha.png" },
];

const banks = [
  { name: "State Bank of India", logo: "/images/partners/sbi.png" },
  { name: "HDFC Bank", logo: "/images/partners/hdfc.png" },
  { name: "ICICI Bank", logo: "/images/partners/icici.png" },
  { name: "Axis Bank", logo: "/images/partners/axis-bank.png" },
  { name: "Punjab National Bank", logo: "/images/partners/pnb.png" },
  { name: "Bank of Baroda", logo: "/images/partners/bob.png" },
  { name: "Union Bank of India", logo: "/images/partners/union-bank.png" },
  { name: "Canara Bank", logo: "/images/partners/canara.png" },
  { name: "Kotak Mahindra Bank", logo: "/images/partners/kotak.png" },
  { name: "IDFC FIRST Bank", logo: "/images/partners/idfc.png" },
  { name: "Bajaj Housing Finance", logo: "/images/partners/bajaj-housing.jpg" },
  { name: "LIC Housing Finance", logo: "/images/partners/lic-hfl.png" },
  { name: "PNB Housing Finance", logo: "/images/partners/pnb-hfl.jpg" },
  { name: "Tata Capital Housing Finance", logo: "/images/partners/tata-capital.jpg" },
  { name: "Home First Finance", logo: "/images/partners/home-first.jpg" },
  { name: "Piramal Finance", logo: "/images/partners/piramal.jpg" },
  { name: "L&T Finance", logo: "/images/partners/lt-finance.png" },
  { name: "Mahindra Finance", logo: "/images/partners/mahindra-finance.jpg" },
];

export default function Partners() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Builder Partners */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h2 className="text-4xl font-bold text-gray-900">
                Our Builder Partners
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We collaborate with Pune's most trusted and reputed builders to bring you the finest residential and commercial properties
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {builders.map((builder, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group"
              >
                {builder.logo ? (
                  <div className="w-full h-20 flex items-center justify-center mb-3">
                    <img
                      src={builder.logo}
                      alt={builder.name}
                      className="max-w-full max-h-full object-contain transition-all duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                )}
                <p className="text-sm font-medium text-gray-800 text-center leading-tight">
                  {builder.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Partners */}
        <div>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Landmark className="w-8 h-8 text-green-600" />
              <h2 className="text-4xl font-bold text-gray-900">
                Our Financial Partners
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Partnering with leading banks to bring you exclusive opportunities in distressed sales, bank auctions, and foreclosed properties
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {banks.map((bank, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group"
              >
                {bank.logo ? (
                  <div className="w-full h-16 flex items-center justify-center mb-2">
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      className="max-w-full max-h-full object-contain transition-all duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Landmark className="w-6 h-6 text-green-600" />
                  </div>
                )}
                <p className="text-xs font-medium text-gray-700 text-center leading-tight">
                  {bank.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Testimonials */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Partners Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trusted relationships built on successful collaborations and professional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Lodha Group</h4>
                  <p className="text-sm text-gray-500">Premium Builder</p>
                </div>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "Nivaara has been an excellent broker partner, consistently bringing us qualified buyers. Their market knowledge and professional approach in Pune is exceptional."
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">State Bank of India</h4>
                  <p className="text-sm text-gray-500">Banking Partner</p>
                </div>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "We've partnered with Nivaara on multiple bank auction properties. Their professionalism and quick turnaround on deals is commendable."
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Godrej Properties</h4>
                  <p className="text-sm text-gray-500">Real Estate Developer</p>
                </div>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "Nivaara's expertise in property marketing and client relations has made them our preferred broker partner. Their transparency and dedication is highly commendable."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
