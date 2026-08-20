import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, HelpCircle, AlertTriangle, Radio, Leaf, BookOpen, Ship, Cpu, Droplets, PawPrint, Scroll, Users, Anchor, Zap, Plus, Minus, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAP_LABELS = [
  // Sectors (large labels)
  { id: 'garden', text: 'Garden Sector', sub: 'Dr. Aria Green \u00b7 Kai Ocean \u00b7 Nia Patel', x: 72, y: 28, colour: '#4ade80', icon: Leaf, size: 'large' },
  { id: 'tech', text: 'Tech Sector', sub: 'Malik Okafor \u00b7 Zara Kim \u00b7 Ren Sakai', x: 72, y: 72, colour: '#c084fc', icon: Cpu, size: 'large' },
  { id: 'harbour', text: 'Harbour Sector', sub: 'Carlos Marin \u00b7 Mei Lin \u00b7 SR4', x: 20, y: 28, colour: '#60a5fa', icon: Anchor, size: 'large' },
  { id: 'culture', text: 'Culture Sector', sub: 'Mira Lee \u00b7 Sofia Cruz \u00b7 Leo Walker', x: 20, y: 72, colour: '#fbbf24', icon: BookOpen, size: 'large' },
  // Central plaza
  { id: 'plaza', text: 'Central Plaza', sub: 'All roads meet here', x: 50, y: 50, colour: '#ffffff', icon: MapPin, size: 'medium' },
  // Key landmarks
  { id: 'signal', text: 'Signal Tower', sub: 'Midnight transmissions', x: 78, y: 55, colour: '#c084fc', icon: Radio, size: 'small' },
  { id: 'tree', text: 'Great Tree', sub: 'Bioluminescent canopy', x: 65, y: 18, colour: '#4ade80', icon: Leaf, size: 'small' },
  { id: 'dock', text: 'Harbour Dock', sub: 'Mystery boxes appeared here', x: 12, y: 38, colour: '#60a5fa', icon: Ship, size: 'small' },
  { id: 'temple', text: 'Archive Hall', sub: 'Missing construction records', x: 15, y: 62, colour: '#fbbf24', icon: Scroll, size: 'small' },
];

const LOCATIONS = [
  {
    sector: 'Harbour Sector',
    colour: '#60a5fa',
    icon: Anchor,
    locations: [
      { name: 'Harbour Dock', icon: Ship, desc: 'Where the mystery boxes appeared. Ferry terminal and cargo operations.' },
      { name: 'Warehouse', icon: AlertTriangle, desc: 'Storage facility with a hidden tunnel entrance underneath.' },
      { name: 'Ferry Terminal', icon: Ship, desc: 'Main transport link to the mainland. Mei Lin operates the ferry from here.' },
    ],
  },
  {
    sector: 'Tech Sector',
    colour: '#c084fc',
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
    colour: '#fbbf24',
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

const SECTOR_PANELS: Record<string, { image: string; label: string }> = {
  'Harbour Sector': { image: '/map/harbour-panels.jpg', label: 'Harbour Dock · Warehouse · Ferry Terminal' },
  'Garden Sector': { image: '/map/garden-panels.jpg', label: 'Greenhouse Dome · Water Reservoir · Animal Shelter' },
  'Tech Sector': { image: '/map/tech-panels.jpg', label: 'Signal Tower · Power Station · Robot Garage' },
  'Culture Sector': { image: '/map/culture-panels.jpg', label: 'Archive Hall · Council Hall · Visitor Centre' },
};
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export default function MapPage() {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
            className="text-[#a8bfd4] hover:text-white"
          >
            <Eye className="w-4 h-4 mr-1" />
            {showLabels ? 'Hide' : 'Show'}
          </Button>
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
            className="relative w-full transition-transform duration-200 ease-out will-change-transform"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              cursor: zoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default',
            }}
          >
            <img
              src="/island-hero.jpg"
              alt="New Horizon Island Map"
              className="w-full h-auto pointer-events-none"
              draggable={false}
            />

            {/* Overlay Labels */}
            {showLabels && MAP_LABELS.map((label) => {
              const Icon = label.icon;
              const isActive = activeLabel === label.id;
              return (
                <div
                  key={label.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: `${label.x}%`, top: `${label.y}%`, zIndex: isActive ? 30 : 20 }}
                  onClick={(e) => { e.stopPropagation(); setActiveLabel(isActive ? null : label.id); }}
                >
                  {/* Pin dot */}
                  <div
                    className="absolute left-1/2 top-full w-0.5 bg-white/60"
                    style={{ height: label.size === 'large' ? '24px' : '16px', transform: 'translateX(-50%)' }}
                  />
                  <div
                    className="absolute left-1/2 top-full rounded-full"
                    style={{
                      width: 8, height: 8,
                      backgroundColor: label.colour,
                      transform: 'translate(-50%, -4px)',
                      boxShadow: `0 0 8px ${label.colour}`,
                    }}
                  />

                  {/* Label card */}
                  <div
                    className={`relative px-3 py-2 rounded-xl border backdrop-blur-md transition-all duration-200 ${
                      isActive ? 'scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: `${label.colour}18`,
                      borderColor: `${label.colour}50`,
                      boxShadow: isActive ? `0 0 20px ${label.colour}40` : `0 4px 12px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: label.colour }} />
                      <div>
                        <p className="text-white font-bold text-xs leading-tight whitespace-nowrap">{label.text}</p>
                        {(isActive || label.size === 'large') && (
                          <p className="text-[#a8bfd4] text-[10px] leading-tight whitespace-nowrap">{label.sub}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Zoom Level */}
          <div className="absolute top-3 left-3 bg-[rgba(10,22,40,0.85)] backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#48d1cc]/20 z-40">
            <span className="text-[#48d1cc] text-xs font-mono font-bold">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-40">
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
            <div className="absolute bottom-3 left-3 bg-[rgba(10,22,40,0.85)] backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#48d1cc]/20 animate-pulse z-40">
              <span className="text-[#a8bfd4] text-xs">Drag to pan &bull; Double-tap to zoom</span>
            </div>
          )}
        </div>

        {/* Map Legend */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {LOCATIONS.map((s) => {
            const SIcon = s.icon;
            return (
              <button
                key={s.sector}
                onClick={() => {
                  const id = s.sector.toLowerCase().split(' ')[0];
                  setActiveLabel(activeLabel === id ? null : id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
                  activeLabel === s.sector.toLowerCase().split(' ')[0]
                    ? 'bg-[rgba(255,255,255,0.1)] border-[#48d1cc]/50'
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(75,130,180,0.15)] hover:bg-[rgba(255,255,255,0.08)]'
                }`}
              >
                <SIcon className="w-3.5 h-3.5" style={{ color: s.colour }} />
                <span className="text-white text-xs font-medium">{s.sector.replace(' Sector', '')}</span>
              </button>
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

                {/* Comic strip panels */}
                {SECTOR_PANELS[sector.sector] && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-[rgba(75,130,180,0.2)] relative group">
                    <img
                      src={SECTOR_PANELS[sector.sector].image}
                      alt={`${sector.sector} locations`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                      <p className="text-[10px] text-[#a8bfd4] tracking-wider uppercase font-bold">
                        {SECTOR_PANELS[sector.sector].label}
                      </p>
                    </div>
                  </div>
                )}

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
