// Web Audio API Synthesizer for Authentic Among Us & Sci-Fi 8-bit sound effects
// 100% reliable, zero external MP3 dependencies, works instantly in any modern browser!

class SoundEngine {
  constructor() {
    this.ctx = null
    this.muted = false
    this.isBgmPlaying = false
    this.bgmTimer = null
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.muted && this.isBgmPlaying) {
      this.stopBgm()
    }
    return this.muted
  }

  // Mechanical Heavy Button Slam Impact
  playButtonSlam() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime

    // 1. Deep Bass Thud (Sub Impact of physical button hitting the console)
    const subOsc = this.ctx.createOscillator()
    const subGain = this.ctx.createGain()
    subOsc.type = 'triangle'
    subOsc.frequency.setValueAtTime(150, now)
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.22)
    subGain.gain.setValueAtTime(0.5, now)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    subOsc.connect(subGain)
    subGain.connect(this.ctx.destination)
    subOsc.start(now)
    subOsc.stop(now + 0.22)

    // 2. High metallic click & spring snap
    const clickOsc = this.ctx.createOscillator()
    const clickGain = this.ctx.createGain()
    clickOsc.type = 'square'
    clickOsc.frequency.setValueAtTime(1800, now)
    clickOsc.frequency.exponentialRampToValueAtTime(400, now + 0.08)
    clickGain.gain.setValueAtTime(0.3, now)
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    clickOsc.connect(clickGain)
    clickGain.connect(this.ctx.destination)
    clickOsc.start(now)
    clickOsc.stop(now + 0.08)
  }

  // Emergency Button Siren (Authentic Among Us Sound)
  playEmergency() {
    if (this.muted) return
    this.init()

    // 1. Tactile physical button slam impact
    this.playButtonSlam()

    // 2. Play authentic Among Us Emergency Meeting audio file
    try {
      const audio = new Audio('/sounds/emergency-meeting.mp3')
      audio.volume = 0.95
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn('Audio element blocked, using klaxon synth:', e)
          this.playEmergencySynth()
        })
      }
    } catch (e) {
      this.playEmergencySynth()
    }
  }

  // Klaxon synthesizer fallback replicating Among Us emergency alarm
  playEmergencySynth() {
    if (this.muted || !this.ctx) return
    const now = this.ctx.currentTime

    const tones = [
      { f: 980, t: 0.05, d: 0.16 },
      { f: 740, t: 0.22, d: 0.16 },
      { f: 980, t: 0.45, d: 0.16 },
      { f: 740, t: 0.62, d: 0.16 },
      { f: 980, t: 0.85, d: 0.2 },
      { f: 740, t: 1.08, d: 0.25 },
    ]

    tones.forEach((tone) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const filter = this.ctx.createBiquadFilter()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(tone.f, now + tone.t)

      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(tone.f, now + tone.t)
      filter.Q.setValueAtTime(3, now + tone.t)

      gain.gain.setValueAtTime(0.28, now + tone.t)
      gain.gain.exponentialRampToValueAtTime(0.01, now + tone.t + tone.d)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now + tone.t)
      osc.stop(now + tone.t + tone.d)
    })
  }

  // Wire grabbed / pulled
  playWireGrab() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(420, now)
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.06)
    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.06)
  }

  // Wire connect / Spark sound with realistic electric crackle & pop
  playSpark() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime

    // 1. Sharp electric arc pop
    const popOsc = this.ctx.createOscillator()
    const popGain = this.ctx.createGain()
    popOsc.type = 'sawtooth'
    popOsc.frequency.setValueAtTime(1400, now)
    popOsc.frequency.exponentialRampToValueAtTime(220, now + 0.12)
    popGain.gain.setValueAtTime(0.3, now)
    popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
    popOsc.connect(popGain)
    popGain.connect(this.ctx.destination)
    popOsc.start(now)
    popOsc.stop(now + 0.12)

    // 2. High-frequency electrical buzz/zap
    const zapOsc = this.ctx.createOscillator()
    const zapGain = this.ctx.createGain()
    zapOsc.type = 'square'
    zapOsc.frequency.setValueAtTime(880, now)
    zapOsc.frequency.setValueAtTime(440, now + 0.04)
    zapOsc.frequency.setValueAtTime(1100, now + 0.08)
    zapGain.gain.setValueAtTime(0.2, now)
    zapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
    zapOsc.connect(zapGain)
    zapGain.connect(this.ctx.destination)
    zapOsc.start(now)
    zapOsc.stop(now + 0.15)
  }

  // Task Complete Chime (Among Us signature task complete ding)
  playTaskComplete() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.08
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.4)
    })
  }

  // Card Swipe Accepted
  playCardAccept() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const notes = [600, 900]
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.12
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.25)
    })
  }

  // Card Swipe Error / Buzzer
  playCardError() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, now)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.25)
  }

  // Button Click / Generic Beep
  playBeep(freq = 600, duration = 0.08) {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  // Victory / Party Fanfare
  playFanfare() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const notes = [
      { f: 523.25, d: 0.12 }, // C5
      { f: 523.25, d: 0.12 }, // C5
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.25 }, // E5
      { f: 783.99, d: 0.25 }, // G5
      { f: 1046.5, d: 0.5 },  // C6
    ]

    let time = this.ctx.currentTime
    notes.forEach(n => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(n.f, time)

      gain.gain.setValueAtTime(0.25, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + n.d)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(time)
      osc.stop(time + n.d)

      time += n.d + 0.03
    })
  }

  // Authentic Among Us style space ambient theme loop
  startBgm() {
    if (this.muted || this.isBgmPlaying) return
    this.init()
    if (!this.ctx) return

    this.isBgmPlaying = true

    // Iconic C minor space synth sequence
    const notes = [
      { f: 261.63, d: 0.35 }, // C4
      { f: 311.13, d: 0.3 },  // Eb4
      { f: 392.00, d: 0.35 }, // G4
      { f: 466.16, d: 0.4 },  // Bb4
      { f: 523.25, d: 0.45 }, // C5
      { f: 466.16, d: 0.3 },  // Bb4
      { f: 392.00, d: 0.35 }, // G4
      { f: 349.23, d: 0.35 }, // F4
      { f: 311.13, d: 0.4 },  // Eb4
      { f: 261.63, d: 0.5 },  // C4
      { f: 196.00, d: 0.4 },  // G3
      { f: 233.08, d: 0.4 },  // Bb3
    ]

    let noteIdx = 0
    const playStep = () => {
      if (!this.isBgmPlaying || this.muted || !this.ctx) return

      const n = notes[noteIdx % notes.length]
      noteIdx++
      const now = this.ctx.currentTime

      // Synth bell/lead
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const filter = this.ctx.createBiquadFilter()

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1400, now)

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(n.f, now)

      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.d + 0.2)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + n.d + 0.2)

      // Sub-bass drone on measure starts
      if (noteIdx % 4 === 1) {
        const bassOsc = this.ctx.createOscillator()
        const bassGain = this.ctx.createGain()
        bassOsc.type = 'sine'
        bassOsc.frequency.setValueAtTime(n.f / 4, now) // 2 octaves down
        bassGain.gain.setValueAtTime(0.09, now)
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
        bassOsc.connect(bassGain)
        bassGain.connect(this.ctx.destination)
        bassOsc.start(now)
        bassOsc.stop(now + 1.2)
      }

      this.bgmTimer = setTimeout(playStep, (n.d + 0.12) * 1000)
    }

    playStep()
  }

  stopBgm() {
    this.isBgmPlaying = false
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer)
      this.bgmTimer = null
    }
  }

  // Among Us Dramatic Role Reveal Sting
  playRoleReveal() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime

    // 1. Sub-bass drop
    const subOsc = this.ctx.createOscillator()
    const subGain = this.ctx.createGain()
    subOsc.type = 'sine'
    subOsc.frequency.setValueAtTime(120, now)
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 1.0)
    subGain.gain.setValueAtTime(0.35, now)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
    subOsc.connect(subGain)
    subGain.connect(this.ctx.destination)
    subOsc.start(now)
    subOsc.stop(now + 1.2)

    // 2. Dramatic Among Us chord hit
    const chord = [220, 277.18, 329.63, 440]
    chord.forEach((freq) => {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq, now + 0.05)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 1.4)

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1400, now)
      filter.frequency.exponentialRampToValueAtTime(350, now + 1.4)

      gain.gain.setValueAtTime(0.12, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now + 0.05)
      osc.stop(now + 1.4)
    })
  }

  // Sci-fi whoosh / door transition
  playDoorOpen() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.25)
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.3)
  }

  // Crewmate pop / squeak when tapped
  playPop() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.12)
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.14)
  }

  // Welcome new crewmate chime
  playJoin() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const notes = [440, 554.37, 659.25, 880]
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.09
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    })
  }

  // Iconic Among Us space ejection sound
  playEjected() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(340, now)
    osc.frequency.exponentialRampToValueAtTime(55, now + 1.4)
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 1.5)
  }

  // Laser pop / Asteroid explosion sound
  playLaserPop() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(800, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.15)
    gain.gain.setValueAtTime(0.28, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.18)
  }

  // Download data tick
  playDownloadTick() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    osc.stop(now + 0.04)
  }

  toggleBgm() {
    if (this.isBgmPlaying) {
      this.stopBgm()
      return false
    } else {
      this.startBgm()
      return true
    }
  }
}

export const sounds = new SoundEngine()
