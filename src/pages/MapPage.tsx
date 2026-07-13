import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, HelpCircle, AlertTriangle, Radio, Leaf, BookOpen, Ship, Cpu, Droplets, PawPrint, Scroll, Users, Anchor, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOCATIONS = [
  {
    sector: 'Harbour Sector',
    colour: '#48d1cc',
    icon: Anchor,
    locations: [
      { name: 'Harbour Dock', icon: Ship, desc: 'Where the mystery boxes appeared. Ferry terminal and cargo operations.' },
      { name: 'Warehouse', icon: AlertTriangle, desc: 'Storage facility with a hidden tunnel entrance underneath.' },
      { name: 'Ferry Terminal', icon: Ship, desc: 'Main transport link to the mainland. Mei Lin operates the ferry from here.' },
    ],
  },
  {
    sector: 'Tech Sector',
    colour: '#48d1cc',
    icon: Cpu,
    locations: [
      { name: 'Signal Tower', icon: Radio, desc: 'Sends automatic midnight messages with coded coordinates. Has a hidden secondary transmitter.' },
      { name: 'Power Station', icon: Zap, desc: 'Maintains the island\'s electrical grid and systems.' },
      { name: 'Robot Garage', icon: Cpu, desc: 'Workshop and charging station for the island\'s robots. Zara Kim works here.' },
    ],
  },
  {
    sector: 'Garden Sector',
    colour: '#4ade80',
    icon: Leaf,
    locations: [
      { name: 'Greenhouse Dome', icon: Leaf, desc: 'Where plants are growing 10x faster than normal. Dr. Aria Green\'s laboratory.' },
      { name: 'Water Reservoir', icon: Droplets, desc: 'Main water tank that glows faintly blue-green at night. Contains microscopic organisms.' },
      { name: 'Animal Shelter', icon: PawPrint, desc: 'Home to the island\'s creatures. Nia Patel cares for animals here.' },
    ],
  },
  {
    sector: 'Culture Sector',
    colour: '#ffd166',
    icon: BookOpen,
    locations: [
      { name: 'Archive Hall', icon: Scroll, desc: 'Contains island records — including the missing construction files. Mira Lee\'s domain.' },
      { name: 'Council Hall', icon: Users, desc: 'Meeting place for the World Council. Where decisions are made.' },
      { name: 'Visitor Centre', icon: MapPin, desc: 'Orientation point for newcomers. Leo Walker greets visitors here.' },
    ],
  },
];

const MYSTERY_MARKERS = [
  { symbol: '?', label: 'Hidden tunnel entrance', desc: 'Leads from the dock warehouse to a storage room with 50+ boxes' },
  { symbol: '●', label: 'Glowing water', desc: 'The reservoir tank glows faintly at night — contains unknown organisms' },
  { symbol: '⚡', label: 'Midnight signals', desc: 'The Signal Tower sends coded coordinates every night at midnight' },
  { symbol: '✕', label: 'Missing records', desc: 'Construction files were deliberately removed from the Archive Hall' },
];

const PATHS = [
  { label: 'Signal Path', desc: 'Tower → Harbour → Garden → Archive (coded coordinates form this route)' },
  { label: 'Hidden Tunnel', desc: 'Underground passage from dock warehouse to garden storage' },
];

export default function MapPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d1f35] to-[#0a1628]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/90 backdrop-blur-md border-b border-[rgba(75,130,180,0.2)]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-[#a8bfd4] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <h1 className="text-white font-bold text-lg">Island Map</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-20 pb-10">
        {/* Map Image */}
        <div className="rounded-2xl overflow-hidden border-2 border-[#48d1cc]/30 shadow-2xl shadow-[#48d1cc]/10 mb-8">
          <img
            src="/island-map.jpg"
            alt="New Horizon Island Map"
            className="w-full"
          />
        </div>

        {/* Mystery Paths */}
        <div className="glass-panel p-5 mb-6 border-l-4 border-[#ff6b6b]">
          <h2 className="text-lg font-bold text-[#ff6b6b] mb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" /> Mystery Paths
          </h2>
          <div className="space-y-3">
            {PATHS.map((p) => (
              <div key={p.label} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#ff6b6b] mt-2 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">{p.label}</p>
                  <p className="text-[#a8bfd4] text-sm">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mystery Markers */}
        <div className="glass-panel p-5 mb-6 border-l-4 border-[#ffd166]">
          <h2 className="text-lg font-bold text-[#ffd166] mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Mystery Markers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MYSTERY_MARKERS.map((m) => (
              <div key={m.label} className="flex items-start gap-3">
                <span className="text-[#ffd166] font-bold text-lg w-6 text-center flex-shrink-0">{m.symbol}</span>
                <div>
                  <p className="text-white font-medium text-sm">{m.label}</p>
                  <p className="text-[#a8bfd4] text-xs">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Locations */}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-[#48d1cc]" /> Key Locations by Sector
        </h2>
        <div className="space-y-4">
          {LOCATIONS.map((sector) => {
            const SectorIcon = sector.icon;
            return (
              <div key={sector.sector} className="glass-panel p-5">
                <h3 className="text-lg font-bold text-[#48d1cc] mb-3 flex items-center gap-2">
                  <SectorIcon className="w-5 h-5" /> {sector.sector}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sector.locations.map((loc) => {
                    const LocIcon = loc.icon;
                    return (
                      <div key={loc.name} className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3 border border-[rgba(75,130,180,0.15)]">
                        <div className="flex items-center gap-2 mb-1">
                          <LocIcon className="w-4 h-4 text-[#48d1cc]" />
                          <p className="text-white font-medium text-sm">{loc.name}</p>
                        </div>
                        <p className="text-[#a8bfd4] text-xs leading-relaxed">{loc.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-4">
          <p className="text-[#a8bfd4] text-sm">World Code: <span className="text-[#48d1cc] font-mono font-bold">NHI2026</span></p>
          <Button
            onClick={() => navigate('/world/NHI2026')}
            className="mt-4 bg-[#48d1cc] hover:bg-[#3dbdb8] text-[#0a1628] font-bold"
          >
            Enter the Island
          </Button>
        </div>
      </main>
    </div>
  );
}
