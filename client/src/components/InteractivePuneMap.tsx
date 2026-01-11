'use client';

import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface PuneZone {
  id: string;
  name: string;
  color: string;
  properties: number;
  description: string;
  growth: string;
  priceRange: string;
}

const baseZoneData: Omit<PuneZone, 'properties'>[] = [
  {
    id: 'east-pune',
    name: 'East Pune',
    color: 'bg-blue-500',
    description: 'Real Estate Market',
    growth: '+10%',
    priceRange: '₹75L - ₹1.2Cr',
  },
  {
    id: 'west-pune',
    name: 'West Pune',
    color: 'bg-green-500',
    description: 'Real Estate Market',
    growth: '+15%',
    priceRange: '₹1Cr - ₹3Cr',
  },
  {
    id: 'north-pune',
    name: 'North Pune',
    color: 'bg-purple-500',
    description: 'Real Estate Market',
    growth: '+8%',
    priceRange: '₹50L - ₹80L',
  },
  {
    id: 'south-pune',
    name: 'South Pune',
    color: 'bg-amber-500',
    description: 'Real Estate Market',
    growth: '+12%',
    priceRange: '₹80L - ₹1.5Cr',
  },
];

export default function InteractivePuneMap() {
  const [selectedZone, setSelectedZone] = useState<PuneZone | null>(null);
  const [puneZones, setPuneZones] = useState<PuneZone[]>([]);

  // Fetch all properties to count by zone
  const { data: allProperties = [] } = trpc.properties.search.useQuery({});

  // Calculate property counts by zone
  useEffect(() => {
    const zoneCounts: Record<string, number> = {
      'east-pune': 0,
      'west-pune': 0,
      'north-pune': 0,
      'south-pune': 0,
    };

    // Count properties by zone
    allProperties.forEach((property) => {
      const location = property.location?.toLowerCase() || '';
      if (location.includes('east zone')) {
        zoneCounts['east-pune']++;
      } else if (location.includes('west zone')) {
        zoneCounts['west-pune']++;
      } else if (location.includes('north zone')) {
        zoneCounts['north-pune']++;
      } else if (location.includes('south zone')) {
        zoneCounts['south-pune']++;
      }
    });

    // Merge counts with base data
    const zonesWithCounts = baseZoneData.map((zone) => ({
      ...zone,
      properties: zoneCounts[zone.id] || 0,
    }));

    setPuneZones(zonesWithCounts);
  }, [allProperties]);

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
                className={`${puneZones[1]?.color || 'bg-green-500'} text-white rounded-lg p-4 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-center text-center`}
                disabled={!puneZones[1]}
              >
                <div className="text-sm font-semibold mb-1">West Pune</div>
                <div className="text-xs">{puneZones[1]?.properties || 0} Properties</div>
              </button>

              {/* East Pune - Top Right */}
              <button
                onClick={() => setSelectedZone(puneZones[0])}
                className={`${puneZones[0]?.color || 'bg-blue-500'} text-white rounded-lg p-4 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-center text-center`}
                disabled={!puneZones[0]}
              >
                <div className="text-sm font-semibold mb-1">East Pune</div>
                <div className="text-xs">{puneZones[0]?.properties || 0} Properties</div>
              </button>

              {/* North Pune - Bottom Left */}
              <button
                onClick={() => setSelectedZone(puneZones[2])}
                className={`${puneZones[2]?.color || 'bg-purple-500'} text-white rounded-lg p-4 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-center text-center`}
                disabled={!puneZones[2]}
              >
                <div className="text-sm font-semibold mb-1">North Pune</div>
                <div className="text-xs">{puneZones[2]?.properties || 0} Properties</div>
              </button>

              {/* South Pune - Bottom Right */}
              <button
                onClick={() => setSelectedZone(puneZones[3])}
                className={`${puneZones[3]?.color || 'bg-amber-500'} text-white rounded-lg p-4 shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-center text-center`}
                disabled={!puneZones[3]}
              >
                <div className="text-sm font-semibold mb-1">South Pune</div>
                <div className="text-xs">{puneZones[3]?.properties || 0} Properties</div>
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
