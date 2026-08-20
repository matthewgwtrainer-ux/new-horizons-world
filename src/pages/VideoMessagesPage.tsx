import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Radio, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const TRANSMISSIONS = [
  {
    id: 'carlos',
    name: 'Carlos Marin',
    role: 'Harbour Manager',
    sector: 'Harbour Sector',
    color: '#4a9eff',
    video: '/videos/carlos-transmission.mp4',
    audio: '/videos/transmission-static.mp3',
    subtitle: 'Something arrived on the island that wasn\'t on any manifest. I\'ve checked the logs. It\'s not supposed to be here.',
  },
  {
    id: 'aria',
    name: 'Dr. Aria Green',
    role: 'Botanist',
    sector: 'Garden Sector',
    color: '#4ade80',
    video: '/videos/aria-transmission.mp4',
    audio: '/videos/transmission-static.mp3',
    subtitle: 'The plants are behaving strangely. Growth patterns I\'ve never seen. I need help understanding this.',
  },
  {
    id: 'ren',
    name: 'Ren Sakai',
    role: 'Signal Officer',
    sector: 'Tech Sector',
    color: '#a78bfa',
    video: '/videos/ren-transmission.mp4',
    audio: '/videos/transmission-static.mp3',
    subtitle: 'Our sensors are picking up signals from the eastern cliffs. Something is out there. It\'s not on our maps.',
  },
  {
    id: 'mira',
    name: 'Mira Lee',
    role: 'Archivist',
    sector: 'Culture Sector',
    color: '#f472b6',
    video: '/videos/mira-transmission.mp4',
    audio: '/videos/transmission-static.mp3',
    subtitle: 'The island\'s official history doesn\'t match the archives. Someone has been hiding the truth.',
  },
];

function TransmissionCard({ tx }: { tx: typeof TRANSMISSIONS[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      audio?.pause();
      setIsPlaying(false);
    } else {
      video.play();
      audio?.play();
      setIsPlaying(true);
      setHasPlayed(true);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnd = () => {
      setIsPlaying(false);
      const audio = audioRef.current;
      if (audio) audio.pause();
    };
    video.addEventListener('ended', onEnd);
    return () => video.removeEventListener('ended', onEnd);
  }, []);

  return (
    <div className="bg-[rgba(16,40,72,0.6)] rounded-2xl border border-[rgba(75,130,180,0.3)] overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-[9/16] max-h-[420px] bg-black overflow-hidden group">
        <video
          ref={videoRef}
          src={tx.video}
          className="w-full h-full object-cover"
          playsInline
          muted
          loop={false}
        />

        {/* Scan line overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)',
          }}
        />

        {/* Hologram glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 60px ${tx.color}20, inset 0 0 120px ${tx.color}10`,
          }}
        />

        {/* Play overlay */}
        {!hasPlayed && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-[#48d1cc]/20 border-2 border-[#48d1cc] flex items-center justify-center backdrop-blur-sm">
              <Play className="w-7 h-7 text-[#48d1cc] ml-1" />
            </div>
          </button>
        )}

        {/* Controls */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
          </button>
          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Character label */}
        <div className="absolute top-3 left-3">
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-sm border"
            style={{ backgroundColor: `${tx.color}30`, borderColor: `${tx.color}60` }}
          >
            {tx.sector}
          </div>
        </div>

        {/* Audio element */}
        <audio ref={audioRef} src={tx.audio} loop={false} />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.color }} />
          <h3 className="text-white font-bold">{tx.name}</h3>
          <span className="text-xs text-[#a8bfd4]">— {tx.role}</span>
        </div>

        {/* Subtitle — flickering text effect */}
        <div className="relative">
          <p className="text-sm text-[#a8bfd4] italic leading-relaxed">
            &ldquo;{tx.subtitle}&rdquo;
          </p>
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none animate-pulse opacity-10 bg-[#48d1cc]" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoMessagesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <div className="bg-[#102848] border-b border-[rgba(75,130,180,0.2)] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-[#48d1cc] hover:text-white hover:bg-[#48d1cc]/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Radio className="w-6 h-6 text-[#ff6b6b] animate-pulse" />
            <div>
              <h1 className="text-xl font-bold">Video Messages</h1>
              <p className="text-xs text-[#a8bfd4]">Incoming transmissions from New Horizon Island</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Warning banner */}
        <div className="mb-8 p-4 bg-[rgba(255,107,107,0.08)] rounded-xl border border-[rgba(255,107,107,0.3)]">
          <p className="text-sm text-[#ff9494]">
            <span className="font-bold">⚠ SIGNAL INTERFERENCE DETECTED</span> — These transmissions are heavily corrupted.
            Audio is garbled. Visuals may flicker. We are working to improve reception from the island.
          </p>
        </div>

        {/* Transmission grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRANSMISSIONS.map(tx => (
            <TransmissionCard key={tx.id} tx={tx} />
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#a8bfd4]">
            More transmissions may be recovered as the investigation continues.
            Check back after each World Council session.
          </p>
        </div>
      </div>
    </div>
  );
}
