import { useState, useCallback, useRef, useEffect } from 'react'

interface SpeechVoice {
  name: string
  lang: string
  default: boolean
}

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSection, setCurrentSection] = useState<number>(-1)
  const [voices, setVoices] = useState<SpeechVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [rate, setRate] = useState(0.9)
  const [isSupported, setIsSupported] = useState(true)

  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false)
      return
    }

    const synth = window.speechSynthesis
    synthRef.current = synth

    const loadVoices = () => {
      const available = synth.getVoices()
      const englishVoices = available
        .filter(v => v.lang.startsWith('en'))
        .map(v => ({ name: v.name, lang: v.lang, default: v.default }))
        .sort((a, b) => {
          // Prefer premium voices: Samantha (iOS), Google US English, etc.
          const premium = ['Samantha', 'Daniel', 'Karen', 'Moira', 'Tessa', 'Serena']
          const aIdx = premium.findIndex(p => a.name.includes(p))
          const bIdx = premium.findIndex(p => b.name.includes(p))
          if (aIdx !== -1 && bIdx === -1) return -1
          if (bIdx !== -1 && aIdx === -1) return 1
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
          return 0
        })

      setVoices(englishVoices)

      // Auto-select best voice
      if (englishVoices.length > 0 && !selectedVoice) {
        const best = englishVoices[0]
        setSelectedVoice(best.name)
      }
    }

    // Voices load asynchronously
    loadVoices()
    synth.onvoiceschanged = loadVoices

    return () => {
      synth.cancel()
    }
  }, [selectedVoice])

  const getVoice = useCallback(() => {
    if (!synthRef.current) return null
    const allVoices = synthRef.current.getVoices()
    return allVoices.find(v => v.name === selectedVoice) || allVoices.find(v => v.lang.startsWith('en')) || null
  }, [selectedVoice])

  const speak = useCallback((text: string, sectionIndex?: number) => {
    if (!synthRef.current) return

    // Cancel any current speech
    synthRef.current.cancel()
    setIsPaused(false)

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    const voice = getVoice()
    if (voice) utterance.voice = voice
    utterance.rate = rate
    utterance.pitch = 1.0

    utterance.onstart = () => {
      setIsPlaying(true)
      if (sectionIndex !== undefined) setCurrentSection(sectionIndex)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentSection(-1)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
      setCurrentSection(-1)
    }

    synthRef.current.speak(utterance)
  }, [getVoice, rate])

  const speakSections = useCallback((sections: string[]) => {
    if (!synthRef.current || sections.length === 0) return

    synthRef.current.cancel()
    setIsPaused(false)

    let index = 0

    const speakNext = () => {
      if (index >= sections.length) {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentSection(-1)
        return
      }

      const utterance = new SpeechSynthesisUtterance(sections[index])
      utteranceRef.current = utterance

      const voice = getVoice()
      if (voice) utterance.voice = voice
      utterance.rate = rate
      utterance.pitch = 1.0

      utterance.onstart = () => {
        setIsPlaying(true)
        setCurrentSection(index)
      }

      utterance.onend = () => {
        index++
        speakNext()
      }

      utterance.onerror = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setCurrentSection(-1)
      }

      synthRef.current!.speak(utterance)
    }

    speakNext()
  }, [getVoice, rate])

  const pause = useCallback(() => {
    if (synthRef.current && isPlaying) {
      synthRef.current.pause()
      setIsPaused(true)
      setIsPlaying(false)
    }
  }, [isPlaying])

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume()
      setIsPaused(false)
      setIsPlaying(true)
    }
  }, [isPaused])

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentSection(-1)
  }, [])

  return {
    isSupported,
    isPlaying,
    isPaused,
    currentSection,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    speak,
    speakSections,
    pause,
    resume,
    stop,
  }
}
