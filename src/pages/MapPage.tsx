import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, HelpCircle, AlertTriangle, Radio, Leaf, BookOpen, Ship, Cpu, Droplets, PawPrint, Scroll, Users, Anchor, Zap, Plus, Minus, RotateCcw } from 'lucide-react';
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
      { name: 'Power Station', icon: Zap, desc: "Maintains the island's electrical grid and systems." },
      { name: 'Robot Garage', icon: Cpu, desc: "Workshop and charging station for the island's robots. Zara Kim works here." },
    ],
  },
  {
    sector: 'Garden Sector',
    colour: '#4ade80',
    icon: Leaf,
    locations: [
      { name: 'Greenhouse Dome', icon: Leaf, desc: "Where plants are growing 10x faster than normal. Dr. Aria Green's laboratory." },
      { name: 'Water Reservoir', icon: Droplets, desc: 'Main water tank that glows faintly blue-green at night. Contains microscopic organisms.' },
      { name: 'Animal Shelter', icon: PawPrint, desc: "Home to the island's creatures. Nia Patel cares for animals here." },
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
  { symbol: '\u25cf', label: 'Glowing water', desc: 'The reservoir tank glows faintly at night — contains unknown organisms' },
  { symbol: '\u26a1', label: 'Midnight signals', desc: 'The Signal Tower sends coded coordinates every night at midnight' },
  { symbol: '\u2715', label: 'Missing records', desc: 'Construction files were deliberately removed from the Archive Hall' },
];

const PATHS = [
  { label: 'Signal Path', desc: 'Tower \u2192 Harbour \u2192 Garden \u2192 Archive (coded coordinates form this route)' },
  { label: 'Hidden Tunnel', desc: 'Underground passage from dock warehouse to garden storage' },
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export default function MapPage() {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const newZoom = Math.max(z - ZOOM_STEP, MIN_ZOOM);
      if (newZoom === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Touch/drag panning
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (zoom <= 1) return;
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [zoom]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Double-tap to zoom
  const lastTap = useRef(0);
  const handleDoubleTap = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        if (zoom < MAX_ZOOM) {
          setZoom((z) => Math.min(z + ZOOM_STEP * 2, MAX_ZOOM));
          setPan({ x: -x, y: -y });
        } else {
          handleReset();
        }
      }
    }
    lastTap.current = now;
  }, [zoom, handleReset]);

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
        {/* Zoomable Map Container */}
        <div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden border-2 border-[#48d1cc]/30 shadow-2xl shadow-[#48d1cc]/10 mb-4 bg-[#0d1f35] select-none"
          style={{ touchAction: zoom > 1 ? 'none' : 'pan-y' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleDoubleTap}
        >
          {/* Map Image with Transform */}
          <div
            className="w-full transition-transform duration-200 ease-out will-change-transform"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              cursor: zoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default',
            }}
          >
            <img
              src="/island-terrain.jpg"
              alt="New Horizon Island 3D Terrain Map"
              className="w-full h-auto pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Zoom Level Indicator */}
          <div className="absolute top-3 left-3 bg-[rgba(10,22,40,0.85)] backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#48d1cc]/20">
            <span className="text-[#48d1cc] text-xs font-mono font-bold">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2">
            <Button
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              disabled={zoom >= MAX_ZOOM}
              className="w-10 h-10 rounded-full bg-[rgba(10,22,40,0.9)] border border-[#48d1cc]/30 text-[#48d1cc] hover:bg-[#48d1cc]/20 hover:text-white disabled:opacity-30"
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="w-10 h-10 rounded-full bg-[rgba(10,22,40,0.9)] border border-[#48d1cc]/30 text-[#a8bfd4] hover:bg-[#48d1cc]/20 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              disabled={zoom <= MIN_ZOOM}
              className="w-10 h-10 rounded-full bg-[rgba(10,22,40,0.9)] border border-[#48d1cc]/30 text-[#48d1cc] hover:bg-[#48d1cc]/20 hover:text-white disabled:opacity-30"
            >
              <Minus className="w-5 h-5" />
            </Button>
          </div>

          {/* Pan hint */}
          {zoom > 1 && (
            <div className="absolute bottom-3 left-3 bg-[rgba(10,22,40,0.85)] backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#48d1cc]/20 animate-pulse">
              <span className="text-[#a8bfd4] text-xs">Drag to pan &bull; Double-tap to zoom</span>
            </div>
          )}
        </div>

        {/* Map Legend / Quick Guide */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {LOCATIONS.map((s) => {
            const SIcon = s.icon;
            return (
              <div key={s.sector} className="flex items-center gap-1.5 bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-full border border-[rgba(75,130,180,0.15)]">
                <SIcon className="w-3.5 h-3.5" style={{ color: s.colour }} />
                <span className="text-white text-xs font-medium">{s.sector.replace(' Sector', '')}</span>
              </div>
            );
          })}
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
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: sector.colour }}>
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
