import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, ArrowRight, Ship, Leaf, Cpu, BookOpen, AlertTriangle,
  Users, MapPin, Lightbulb, Scroll, Mic, FileText, Radio, Award,
  Play, Pause, Square, Volume2, Headphones
} from 'lucide-react'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { useMemo } from 'react'

const SECTOR_DATA = [
  {
    id: 'harbour', name: 'Harbour Sector', icon: Ship, color: '#4a9eff',
    image: '/sector-harbour.jpg', role: 'Transport, supplies, visitors, trade',
    citizens: 'Harbour Manager, Ferry Pilot, Supply Robot',
    problem: 'Supply boxes arrived with no sender.', mystery: 'Who sent the boxes and why?',
  },
  {
    id: 'garden', name: 'Garden Sector', icon: Leaf, color: '#4ade80',
    image: '/sector-garden.jpg', role: 'Food, water, plants, animals, health',
    citizens: 'Botanist, Water Keeper, Animal Helper',
    problem: 'Plants are growing too fast.', mystery: 'What is causing the strange growth?',
  },
  {
    id: 'tech', name: 'Tech Sector', icon: Cpu, color: '#a78bfa',
    image: '/sector-tech.jpg', role: 'Power, robots, communication, repairs',
    citizens: 'Engineer, Repair Robot, Signal Officer',
    problem: 'Signal Tower sends messages by itself.', mystery: 'Who or what is using the tower?',
  },
  {
    id: 'culture', name: 'Culture Sector', icon: BookOpen, color: '#fbbf24',
    image: '/sector-culture.jpg', role: 'History, citizens, news, rules',
    citizens: 'Archivist, Young Reporter, Council Guide',
    problem: 'Nobody knows who built the island.', mystery: 'Who built New Horizon Island?',
  },
]

const JOURNEY_STEPS = [
  { session: 1, title: 'Arrival at New Horizon Island', icon: MapPin,
    description: 'Meet your team, explore your sector, and investigate your first mystery. Learn how to use English to ask AI citizens questions.',
    output: 'Sector mission card and first spoken/written update' },
  { session: 2, title: 'Meet the Citizens', icon: Users,
    description: 'Interview AI citizens using English questions. Collect character profiles and discover hidden clues. Practice asking who, what, where, when, why, and how.',
    output: 'Character profile and interview notes' },
  { session: 3, title: 'First Sector Problems', icon: AlertTriangle,
    description: 'Investigate the problems in your sector. Connect clues, propose solutions, and write your first formal report in English.',
    output: 'Problem report with evidence and recommended solution' },
  { session: 4, title: 'World Council Meeting', icon: Users,
    description: 'Present your findings to the other teams. Share evidence, negotiate decisions, and work together to uncover the bigger mystery.',
    output: 'Council decision statement' },
  { session: 5, title: 'Island Development', icon: Lightbulb,
    description: 'With some mysteries solved, propose improvements for your sector. Explain your ideas with reasons and predicted consequences.',
    output: 'Improvement proposal with reasons and predicted consequences' },
  { session: 6, title: 'Newsroom Day', icon: FileText,
    description: 'Become journalists! Turn world events into news articles with headlines, lead paragraphs, and body text. Write for the island newspaper.',
    output: 'News article with headline, lead, and body' },
  { session: 7, title: 'Broadcast Preparation', icon: Mic,
    description: 'Write and rehearse a Day C-style news broadcast script. Assign roles: anchor, reporter, interviewer. Practice spoken English.',
    output: 'Broadcast script with anchor, reporter, and interview segments' },
  { session: 8, title: 'Final Broadcast & Reflection', icon: Radio,
    description: 'Perform your live news broadcast in English! Reflect on how your English helped you explore, understand, and improve the island.',
    output: 'Video news broadcast and reflection worksheet' },
]

// All text sections for text-to-speech
const SPEECH_SECTIONS = [
  "Welcome to New Horizon Island. A mysterious artificial island has appeared near Hong Kong. It already has buildings, robots, citizens, problems, and secrets. You are part of the World Council.",
  "New Horizon Island is a near-future artificial island that has appeared in the waters near Hong Kong. It is partly built, partly broken, and partly mysterious. The island is divided into four sectors, each with its own buildings, AI citizens, and problems. The World Council has invited teams of student investigators to inspect the island, solve its problems, and help it thrive. But here is the challenge: the island will only respond to you if you use clear, thoughtful English. Your words are the key to unlocking its secrets.",
  "The Four Sectors. Harbour Sector: responsible for transport, supplies, visitors, and trade. Citizens include the Harbour Manager, Ferry Pilot, and Supply Robot. Problem: supply boxes arrived with no sender. Mystery: who sent the boxes and why? Garden Sector: responsible for food, water, plants, animals, and health. Citizens include the Botanist, Water Keeper, and Animal Helper. Problem: plants are growing too fast. Mystery: what is causing the strange growth? Tech Sector: responsible for power, robots, communication, and repairs. Citizens include the Engineer, Repair Robot, and Signal Officer. Problem: the Signal Tower sends messages by itself. Mystery: who or what is using the tower? Culture Sector: responsible for history, citizens, news, and rules. Citizens include the Archivist, Young Reporter, and Council Guide. Problem: nobody knows who built the island. Mystery: who built New Horizon Island?",
  "Something is wrong. The island should be ready for visitors. But it is not. Strange things are happening in every sector. Supply boxes arrive with no sender. Plants grow impossibly fast. The Signal Tower sends messages in the middle of the night. And nobody, not even the AI citizens, knows who built the island or why it was left unfinished.",
  "The World Council needs investigators who can use English to ask clear questions to AI citizens, collect evidence and write reports, discuss problems and propose solutions, work together across sector teams, and communicate findings to the Council.",
  "Warning: not everything is what it seems. The World Council has found Investigation Cards scattered across the island — clues, characters, and mission briefings left behind by someone. Some cards contain real evidence. But the Council has discovered that other cards are fake — planted deliberately to confuse investigators. Who would plant fake clues? And why? This means you cannot believe everything you read. You must compare what the cards say with what the AI citizens tell you. If a citizen does not recognise a clue, it might be a red herring — a trick designed to lead you astray. Use your detective skills. Trust the citizens. Question everything.",
  "The World Council has chosen your team to investigate one sector of New Horizon Island. You will become the experts in your sector. You will interview AI citizens, examine evidence, solve problems, and report back to the Council. Each week, the Council will give your team a new mission. You will use the AI Command Centre to build English prompts, question AI citizens, and discover what is really happening on the island. Your English is not just a school subject here. It is the tool you use to explore, understand, and improve the world.",
  "Your Journey. Session 1: Arrival at New Horizon Island. Meet your team, explore your sector, and investigate your first mystery. Session 2: Meet the Citizens. Interview AI citizens using English questions. Session 3: First Sector Problems. Investigate the problems in your sector and write your first report. Session 4: World Council Meeting. Present your findings to the other teams. Session 5: Island Development. Propose improvements for your sector. Session 6: Newsroom Day. Become journalists and write news articles. Session 7: Broadcast Preparation. Write and rehearse a news broadcast script. Session 8: Final Broadcast and Reflection. Perform your live news broadcast in English.",
  "How the App Works. The Dashboard shows your sector, the mission, the world event log, and English help with sentence starters. The AI Command tab lets you build a prompt in English, speak or type your question, copy it, and paste it into ChatGPT or Kimi to talk to AI citizens. The Newsroom lets you write and submit reports, and read reports from other teams.",
  "The Golden Rule: every action in the world must produce an English output. Whether you are asking a question, writing a report, or making a decision, your English is what makes the world respond. The better your English, the more the world reveals.",
]

export default function IntroductionPage() {
  const navigate = useNavigate()
  const {
    isSupported, isPlaying, isPaused, currentSection, voices, selectedVoice,
    setSelectedVoice, rate, setRate, speakSections, pause, resume, stop
  } = useTextToSpeech()

  const handlePlayAll = () => {
    speakSections(SPEECH_SECTIONS)
  }

  // Only show premium voices in selector
  const premiumVoices = useMemo(() => {
    return voices.filter(v => {
      const name = v.name.toLowerCase()
      return name.includes('samantha') || name.includes('daniel') || name.includes('karen')
        || name.includes('moira') || name.includes('tessa') || name.includes('serena')
        || name.includes('google') || name.includes('apple')
    })
  }, [voices])

  const displayVoices = premiumVoices.length > 0 ? premiumVoices : voices.slice(0, 5)

  // Helper to check if a section is currently being read
  const isActiveSection = (sectionIndex: number) => {
    return isPlaying && currentSection === sectionIndex
  }

  return (
    <div className="min-h-screen ocean-gradient">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 glass-panel-strong border-b border-[#48d1cc]/20 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => { stop(); navigate('/') }} className="text-[#a8bfd4] hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-lg font-bold text-[#48d1cc]">Introduction</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Read Aloud Banner */}
      {isSupported && (
        <div className="sticky top-[57px] z-40 bg-[rgba(12,30,52,0.98)] border-b border-[#48d1cc]/20 px-4 py-2">
          <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Headphones className="w-4 h-4 text-[#48d1cc]" />
              <span className="text-xs text-[#a8bfd4] hidden sm:inline">Listen while you read</span>

              {!isPlaying && !isPaused ? (
                <Button
                  size="sm"
                  onClick={handlePlayAll}
                  className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold text-xs h-7 px-3"
                >
                  <Play className="w-3 h-3 mr-1" /> Read Aloud
                </Button>
              ) : isPaused ? (
                <Button
                  size="sm"
                  onClick={resume}
                  className="bg-[#ffd166] hover:bg-[#e5bc5c] text-[#0a1628] font-bold text-xs h-7 px-3"
                >
                  <Play className="w-3 h-3 mr-1" /> Resume
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={pause}
                  className="bg-[#ffd166] hover:bg-[#e5bc5c] text-[#0a1628] font-bold text-xs h-7 px-3"
                >
                  <Pause className="w-3 h-3 mr-1" /> Pause
                </Button>
              )}

              {(isPlaying || isPaused) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stop}
                  className="border-[#ff6b6b]/50 text-[#ff6b6b] hover:bg-[#ff6b6b]/10 text-xs h-7 px-3"
                >
                  <Square className="w-3 h-3 mr-1" /> Stop
                </Button>
              )}

              {isPlaying && (
                <span className="text-xs text-[#48d1cc] animate-pulse">
                  <Volume2 className="w-3 h-3 inline mr-1" /> Speaking...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {displayVoices.length > 1 && (
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="bg-[rgba(8,22,36,0.9)] border border-[#48d1cc]/20 text-white text-xs rounded px-2 py-1 h-7"
                >
                  {displayVoices.map(v => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </select>
              )}
              <select
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="bg-[rgba(8,22,36,0.9)] border border-[#48d1cc]/20 text-white text-xs rounded px-2 py-1 h-7 w-20"
                title="Speaking speed"
              >
                <option value={0.7}>Slow</option>
                <option value={0.85}>Medium</option>
                <option value={1.0}>Normal</option>
                <option value={1.2}>Fast</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {!isSupported && (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="bg-[rgba(255,107,107,0.1)] border border-[#ff6b6b]/30 rounded-lg p-3 text-center">
            <p className="text-sm text-[#ff6b6b]">
              Text-to-speech is not supported in this browser. Try Safari on iPad for the best experience.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-16">

        {/* ===== HERO SECTION ===== */}
        <section className={`text-center animate-fade-in transition-all duration-500 ${isActiveSection(0) ? 'bg-[rgba(72,209,204,0.08)] -mx-4 px-4 py-4 rounded-xl border border-[#48d1cc]/20' : ''}`}>
          <div className="rounded-2xl overflow-hidden border border-[#48d1cc]/30 shadow-2xl shadow-[#48d1cc]/10 mb-8">
            <img src="/island-hero.jpg" alt="New Horizon Island" className="w-full h-56 md:h-80 object-cover" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 text-glow">
            Welcome to <span className="text-[#48d1cc]">New Horizon Island</span>
          </h1>
          <p className="text-lg text-[#a8bfd4] max-w-2xl mx-auto leading-relaxed">
            A mysterious artificial island has appeared near Hong Kong. It already has buildings, robots, citizens, problems, and secrets.
            <span className="text-white font-medium"> You are part of the World Council.</span>
          </p>
        </section>

        {/* ===== THE ISLAND ===== */}
        <section className={`animate-slide-up transition-all duration-500 ${isActiveSection(1) ? 'bg-[rgba(72,209,204,0.08)] -mx-4 px-4 py-4 rounded-xl border border-[#48d1cc]/20' : ''}`}>
          <div className="glass-panel p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#ffd166] mb-4 flex items-center gap-3">
              <MapPin className="w-6 h-6" /> The Island
            </h2>
            <div className="space-y-4 text-[#a8bfd4] leading-relaxed">
              <p>New Horizon Island is a near-future artificial island that has appeared in the waters near Hong Kong.
                It is <span className="text-white font-medium">partly built, partly broken, and partly mysterious</span>.
                The island is divided into four sectors, each with its own buildings, AI citizens, and problems.</p>
              <p>The World Council has invited <span className="text-white font-medium">teams of student investigators</span> to inspect the island,
                solve its problems, and help it thrive.</p>
              <p className="text-white">But here is the challenge: the island will only respond to you if you use clear, thoughtful English.
                Your words are the key to unlocking its secrets.</p>
            </div>
          </div>
        </section>

        {/* ===== THE FOUR SECTORS ===== */}
        <section className={`animate-slide-up transition-all duration-500 ${isActiveSection(2) ? 'bg-[rgba(72,209,204,0.08)] -mx-4 px-4 py-4 rounded-xl border border-[#48d1cc]/20' : ''}`}>
          <h2 className="text-2xl font-bold text-[#48d1cc] mb-6 flex items-center gap-3">
            <Scroll className="w-6 h-6" /> The Four Sectors
          </h2>
          <p className="text-[#a8bfd4] mb-6">Each team will manage one sector. Every sector has its own responsibilities, citizens, and mystery to solve.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SECTOR_DATA.map(sector => {
              const Icon = sector.icon
              return (
                <div key={sector.id} className="glass-panel overflow-hidden hover:border-[#48d1cc]/50 transition-all">
                  <div className="relative h-40 overflow-hidden">
                    <img src={sector.image} alt={sector.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <Icon className="w-5 h-5" style={{ color: sector.color }} />
                      <span className="text-white font-bold text-lg">{sector.name}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div><span className="text-xs text-[#a8bfd4] uppercase tracking-wide">Responsibility</span>
                      <p className="text-sm text-white mt-0.5">{sector.role}</p></div>
                    <div><span className="text-xs text-[#a8bfd4] uppercase tracking-wide">Citizens</span>
                      <p className="text-sm text-white mt-0.5">{sector.citizens}</p></div>
                    <div className="border-l-2 border-[#ffd166] pl-3">
                      <span className="text-xs text-[#ffd166] uppercase tracking-wide font-bold">Problem</span>
                      <p className="text-sm text-[#ffd166] mt-0.5">{sector.problem}</p>
                    </div>
                    <div className="border-l-2 border-[#a78bfa] pl-3">
                      <span className="text-xs text-[#a78bfa] uppercase tracking-wide font-bold">Mystery</span>
                      <p className="text-sm text-[#a78bfa] mt-0.5">{sector.mystery}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ===== THE PROBLEMS ===== */}
        <section className={`animate-slide-up transition-all duration-500 ${isActiveSection(3) ? 'bg-[rgba(72,209,204,0.08)] -mx-4 px-4 py-4 rounded-xl border border-[#48d1cc]/20' : ''}`}>
          <div className="glass-panel p-6 md:p-8 border-l-4 border-[#ffd166]">
            <h2 className="text-2xl font-bold text-[#ffd166] mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" /> Something is Wrong
            </h2>
            <div className="space-y-4 text-[#a8bfd4] leading-relaxed">
              <p className="text-white text-lg">The island should be ready for visitors. But it is not.</p>
              <p>Strange things are happening in every sector. Supply boxes arrive with no sender.
                Plants grow impossibly fast. The Signal Tower sends messages in the middle of the night.
                And nobody — not even the AI citizens — knows who built the island or why it was left unfinished.</p>
              <p>The World Council needs <span className="text-white font-medium">investigators who can use English</span> to:</p>
              <ul className="space-y-2 ml-4">
                {['Ask clear questions to AI citizens', 'Collect evidence and write reports',
                  'Discuss problems and propose solutions', 'Work together across sector teams',
                  'Communicate findings to the Council'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#48d1cc] mt-1">&#9654;</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ===== RED HERRINGS / FAKE CLUES ===== */}
        <section className={`animate-slide-up transition-all duration-500 ${isActiveSection(4) ? 'bg-[rgba(255,107,107,0.06)] -mx-4 px-4 py-4 rounded-xl border border-[#ff6b6b]/20' : ''}`}>
          <div className="glass-panel p-6 md:p-8 border-l-4 border-[#ff6b6b]">
            <h2 className="text-2xl font-bold text-[#ff6b6b] mb-4 flex items-center gap-3">
              <HelpCircle className="w-6 h-6" /> Not Everything Is What It Seems
            </h2>
            <div className="space-y-4 text-[#a8bfd4] leading-relaxed">
              <p className="text-white text-lg">The World Council has found something troubling.</p>
              <p>Scattered across the island are <span className="text-[#ffd166] font-medium">Investigation Cards</span> — clues,
                characters, and mission briefings left behind by... <em>someone</em>. Some of these cards contain
                <span className="text-[#4ade80] font-medium"> real evidence</span>. But the Council has discovered that
                <span className="text-[#ff6b6b] font-medium"> other cards are fake</span> — planted deliberately to confuse investigators.</p>
              <p className="text-white italic">Who would plant fake clues? And why?</p>
              <p>This means <span className="text-white font-medium">you cannot believe everything you read</span>. You must use your detective skills to
                <strong> compare what the cards say with what the AI citizens tell you</strong>. If a citizen does not recognise a clue,
                it might be a <span className="text-[#ff6b6b] font-medium">red herring</span> — a trick designed to lead you astray.</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button
                  onClick={() => { stop(); navigate('/cards') }}
                  className="bg-[rgba(255,107,107,0.15)] hover:bg-[rgba(255,107,107,0.25)] border border-[#ff6b6b]/40 text-[#ff6b6b] font-bold px-6"
                >
                  <Search className="w-4 h-4 mr-2" /> View Investigation Cards
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== THE WORLD COUNCIL ===== */}
        <section className={`animate-slide-up transition-all duration-500 ${isActiveSection(5) ? 'bg-[rgba(72,209,204,0.08)] -mx-4 px-4 py-4 rounded-xl border border-[#48d1cc]/20' : ''}`}>
          <div className="glass-panel p-6 md:p-8 border-l-4 border-[#48d1cc]">
            <h2 className="text-2xl font-bold text-[#48d1cc] mb-4 flex items-center gap-3">
              <Users className="w-6 h-6" /> The World Council Needs You
            </h2>
            <div className="space-y-4 text-[#a8bfd4] leading-relaxed">
              <p>The World Council has chosen <span className="text-white font-medium">your team</span> to investigate
                one sector of New Horizon Island. You will become the experts in your sector. You will interview
                AI citizens, examine evidence, solve problems, and report back to the Council.</p>
              <p>Each week, the Council will give your team a new mission. You will use the AI Command Centre
                to build English prompts, question AI citizens, and discover what is really happening on the island.</p>
              <p className="text-white font-medium">Your English is not just a school subject here. It is the tool you use to explore,
                understand, and improve the world.</p>
            </div>
          </div>
        </section>

        {/* ===== YOUR JOURNEY ===== */}
        <section className={`animate-slide-up transition-all duration-500 ${isActiveSection(6) ? 'bg-[rgba(72,209,204,0.08)] -mx-4 px-4 py-4 rounded-xl border border-[#48d1cc]/20' : ''}`}>
          <h2 className="text-2xl font-bold text-[#48d1cc] mb-2 flex items-center gap-3">
            <Scroll className="w-6 h-6" /> Your Journey: The 8-Session Project
          </h2>
          <p className="text-[#a8bfd4] mb-6">Here is what you will do, week by week, as a World Council investigator.</p>
          <div className="space-y-4">
            {JOURNEY_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.session} className="glass-panel p-4 md:p-5 flex gap-4 hover:border-[#48d1cc]/40 transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(72,209,204,0.15)] border border-[#48d1cc]/30 flex flex-col items-center justify-center">
                      <span className="text-xs text-[#48d1cc] uppercase">Session</span>
                      <span className="text-xl font-bold text-[#48d1cc]">{step.session}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-[#ffd166]" />
                      <h3 className="text-white font-bold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-[#a8bfd4] leading-relaxed mb-2">{step.description}</p>
                    <div className="flex items-start gap-2">
                      <Award className="w-3.5 h-3.5 text-[#4ade80] mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-[#4ade80]">Output: {step.output}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className={`animate-slide-up transition-all duration-500 ${isActiveSection(7) || isActiveSection(8) ? 'bg-[rgba(72,209,204,0.08)] -mx-4 px-4 py-4 rounded-xl border border-[#48d1cc]/20' : ''}`}>
          <div className="glass-panel p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#48d1cc] mb-4">How the App Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Dashboard', desc: 'See your sector, read the mission, check the world event log, and get English help with sentence starters.', color: '#48d1cc' },
                { title: 'AI Command', desc: 'Build a prompt in English, speak or type your question, copy it, and paste it into ChatGPT or Kimi to talk to AI citizens.', color: '#ffd166' },
                { title: 'Newsroom', desc: 'Write and submit reports. Read reports from other teams. The teacher can add comments to your work.', color: '#4ade80' },
              ].map(card => (
                <div key={card.title} className="bg-[rgba(255,255,255,0.03)] rounded-xl p-4 border border-[rgba(75,130,180,0.2)]">
                  <h3 className="font-bold mb-2" style={{ color: card.color }}>{card.title}</h3>
                  <p className="text-sm text-[#a8bfd4]">{card.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-[rgba(255,255,255,0.03)] rounded-xl border border-[rgba(75,130,180,0.2)]">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#ffd166]" /> The Golden Rule
              </h3>
              <p className="text-[#a8bfd4] text-sm">Every action in the world must produce an English output. Whether you are asking a question,
                writing a report, or making a decision — <span className="text-white font-medium">your English is what makes the world respond</span>.
                The better your English, the more the world reveals.</p>
            </div>
          </div>
        </section>

        {/* ===== READY TO BEGIN ===== */}
        <section className="text-center pb-8 animate-slide-up">
          <div className="glass-panel p-8 md:p-10 inline-block w-full max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Begin?</h2>
            <p className="text-[#a8bfd4] mb-6">Your team is waiting. The island needs you. Can your English make New Horizon Island come alive?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => { stop(); navigate('/world/NHI2026') }}
                className="bg-[#48d1cc] hover:bg-[#3bc4bf] text-[#0a1628] font-bold px-8 py-6 text-lg rounded-xl">
                Enter New Horizon Island <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="mt-4 text-sm text-[#a8bfd4]/60">World code: <span className="text-[#48d1cc] font-mono">NHI2026</span></p>
          </div>
        </section>

      </main>
    </div>
  )
}
