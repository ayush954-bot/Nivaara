'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';

interface PuneZone {
  id: string;
  name: string;
  color: string;
  properties: number;
  description: string;
  growth: string;
  priceRange: string;
}

const puneZones: PuneZone[] = [
  {
    id: 'east',
    name: 'East Pune',
    color: 'bg-blue-500',
    properties: 5,
    description: 'Real Estate Market',
    growth: '+10%',
    priceRange: '₹75L - ₹1.2Cr',
  },
  {
    id: 'west',
    name: 'West Pune',
    color: 'bg-green-500',
    properties: 2,
    description: 'Real Estate Market',
    growth: '+15%',
    priceRange: '₹1Cr - ₹3Cr',
  },
  {
    id: 'north',
    name: 'North Pune',
    color: 'bg-purple-500',
    properties: 0,
    description: 'Real Estate Market',
    growth: '+8%',
    priceRange: '₹50L - ₹80L',
  },
  {
    id: 'south',
    name: 'South Pune',
    color: 'bg-amber-500',
    properties: 0,
    description: 'Real Estate Market',
    growth: '+12%',
    priceRange: '₹80L - ₹1.5Cr',
  },
];

export default function InteractivePuneMap() {
  const [selectedZone, setSelectedZone] = useState<PuneZone | null>(null);

  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Pune by Zones</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tap on any zone to discover properties and market insights
          </p>
        </div>

        {/* Desktop: Grid + Details | Mobile: Stacked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Zone Map - 2x2 Grid */}
          <div className="w-full max-w-md mx-auto md:mx-0">
            <div className="grid grid-cols-2 gap-3 aspect-square">
              {/* West Pune - Top Left */}
              <button
                onClick={() => setSelectedZone(puneZones[1])}
                className={`${puneZones[1].color} text-white rounded-lg p-4 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-center text-center`}
              >
                <div className="text-sm font-semibold mb-1">West Pune</div>
                <div className="text-xs">{puneZones[1].properties} Properties</div>
              </button>

              {/* East Pune - Top Right */}
              <button
                onClick={() => setSelectedZone(puneZones[0])}
                className={`${puneZones[0].color} text-white rounded-lg p-4 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-center text-center`}
              >
                <div className="text-sm font-semibold mb-1">East Pune</div>
                <div className="text-xs">{puneZones[0].properties} Properties</div>
              </button>

              {/* North Pune - Bottom Left */}
              <button
                onClick={() => setSelectedZone(puneZones[2])}
                className={`${puneZones[2].color} text-white rounded-lg p-4 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-center text-center`}
              >
                <div className="text-sm font-semibold mb-1">North Pune</div>
                <div className="text-xs">{puneZones[2].properties} Properties</div>
              </button>

              {/* South Pune - Bottom Right */}
              <button
                onClick={() => setSelectedZone(puneZones[3])}
                className={`${puneZones[3].color} text-white rounded-lg p-4 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-center text-center`}
              >
                <div className="text-sm font-semibold mb-1\">South Pune</div>
                <div className="text-xs\">{puneZones[3].properties} Properties</div>
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {puneZones.map((zone) => (
                <div key={zone.id} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${zone.color}`} />
                  <span className="text-sm text-gray-700">{zone.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Details Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
            {selectedZone ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${selectedZone.color} flex items-center justify-center`}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedZone.name}</h3>
                    <p className="text-gray-600">{selectedZone.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Available Properties</div>
                    <div className="text-3xl font-bold text-gray-900">{selectedZone.properties}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">YoY Growth</div>
                    <div className="text-3xl font-bold text-green-600">{selectedZone.growth}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-2">Average Price Range</div>
                  <div className="text-xl font-bold text-gray-900">{selectedZone.priceRange}</div>
                </div>

                <a 
                  href={`/properties?zone=${selectedZone.id}`}
                  className="block w-full bg-primary text-white py-3 rounded-lg font-semibold text-center hover:bg-primary/90 transition-colors"
                >
                  View Properties in {selectedZone.name}
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Zone</h3>
                <p className="text-gray-600">
                  Click on any zone on the map to view detailed information and available properties
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Full-width zone buttons below map */}
        <div className="md:hidden mt-8 space-y-3">
          <a href="/locations" className="block w-full bg-primary text-white py-3 rounded-lg font-semibold text-center hover:bg-primary/90 transition-colors">
            View All Locations & Details
          </a>
        </div>
      </div>
    </section>
  );
}
