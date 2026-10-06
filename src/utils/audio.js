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

  // Emergency Button Siren
  playEmergency() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.linearRampToValueAtTime(880, now + 0.25)
    osc.frequency.linearRampToValueAtTime(440, now + 0.5)
    osc.frequency.linearRampToValueAtTime(880, now + 0.75)
    osc.frequency.linearRampToValueAtTime(440, now + 1.0)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 1.1)
  }

  // Wire connect / Spark sound
  playSpark() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'square'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.15)
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

  // Playful 8-bit space theme melody loop
  startBgm() {
    if (this.muted || this.isBgmPlaying) return
    this.init()
    if (!this.ctx) return

    this.isBgmPlaying = true
    const melody = [
      { f: 440, d: 0.2 }, { f: 493.88, d: 0.2 }, { f: 523.25, d: 0.25 }, { f: 587.33, d: 0.25 },
      { f: 659.25, d: 0.3 }, { f: 587.33, d: 0.2 }, { f: 523.25, d: 0.3 }, { f: 440, d: 0.4 },
      { f: 392, d: 0.2 }, { f: 440, d: 0.2 }, { f: 523.25, d: 0.35 }, { f: 659.25, d: 0.4 }
    ]

    let noteIndex = 0
    const playNext = () => {
      if (!this.isBgmPlaying || this.muted || !this.ctx) return
      const note = melody[noteIndex % melody.length]
      noteIndex++

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(note.f, now)

      gain.gain.setValueAtTime(0.04, now) // Gentle volume
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.d)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + note.d)

      this.bgmTimer = setTimeout(playNext, (note.d + 0.15) * 1000)
    }

    playNext()
  }

  stopBgm() {
    this.isBgmPlaying = false
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer)
      this.bgmTimer = null
    }
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
