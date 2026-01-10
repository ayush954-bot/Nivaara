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
  { name: "Vilas Javdekar Developers" },
  { name: "Kumar Properties" },
  { name: "Panchshil Realty" },
  { name: "Nyati Group" },
  { name: "Gera Developments" },
  { name: "Paranjape Schemes (PSPL)" },
  { name: "BramhaCorp" },
  { name: "Marvel Realtors" },
  { name: "Mittal Brothers" },
  { name: "Mantra Properties" },
  { name: "Sobha Limited" },
];

const banks = [
  { name: "State Bank of India", logo: "/images/partners/sbi.png" },
  { name: "HDFC Bank", logo: "/images/partners/hdfc.png" },
  { name: "ICICI Bank", logo: "/images/partners/icici.png" },
  { name: "Axis Bank" },
  { name: "Punjab National Bank" },
  { name: "Bank of Baroda" },
  { name: "Union Bank of India" },
  { name: "Canara Bank" },
  { name: "Kotak Mahindra Bank" },
  { name: "IDFC FIRST Bank" },
  { name: "Bajaj Housing Finance" },
  { name: "LIC Housing Finance" },
  { name: "PNB Housing Finance" },
  { name: "Tata Capital Housing Finance" },
  { name: "Home First Finance" },
  { name: "Piramal Finance" },
  { name: "L&T Finance" },
  { name: "Mahindra Finance" },
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
                      className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
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
                      className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
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
      </div>
    </section>
  );
}
