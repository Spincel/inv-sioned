<script setup>
import confetti from 'canvas-confetti'
import { ref } from 'vue'
import AmongUsIntro from './components/AmongUsIntro.vue'
import AmongUsMinigame from './components/AmongUsMinigame.vue'
import CountdownTimer from './components/CountdownTimer.vue'
import CrewmateAvatar from './components/CrewmateAvatar.vue'
import CrewmateCustomizer from './components/CrewmateCustomizer.vue'
import EmergencyMeetingModal from './components/EmergencyMeetingModal.vue'
import MissionDetails from './components/MissionDetails.vue'
import MomentsGallery from './components/MomentsGallery.vue'
import RsvpForm from './components/RsvpForm.vue'
import StarfieldBackground from './components/StarfieldBackground.vue'
import { EVENT_CONFIG } from './config/event'
import { sounds } from './utils/audio'

// Intro Cinematic state
const showIntro = ref(true)

const onIntroComplete = () => {
  showIntro.value = false
}

const replayIntro = () => {
  sounds.playBeep(700, 0.08)
  showIntro.value = true
}

// Audio state
const isMuted = ref(false)
const isBgmActive = ref(false)

// Modals & User state
const isEmergencyModalOpen = ref(false)
const guestCrewmate = ref({
  color: '#06b6d4',
  shadowColor: '#0e7490',
  hat: 'party-hat',
  colorName: 'Cian',
})

const toggleMute = () => {
  isMuted.value = sounds.toggleMute()
  if (isMuted.value) {
    isBgmActive.value = false
  }
}

const toggleBgm = () => {
  sounds.playBeep(600, 0.05)
  isBgmActive.value = sounds.toggleBgm()
}

const triggerEmergencyMeeting = () => {
  sounds.playEmergency()
  isEmergencyModalOpen.value = true
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.4 },
    colors: ['#ef4444', '#dc2626'],
  })
}

</script>

<template>
  <div class="relative min-h-screen text-slate-100 overflow-x-hidden selection:bg-pink-500 selection:text-white">
    <!-- Starfield Dynamic Canvas Background -->
    <StarfieldBackground />

    <!-- AMONG US INTRO CINEMATIC (Step 1: ¿Estás listo? -> Step 2: Tripulante de Honor) -->
    <AmongUsIntro
      v-if="showIntro"
      @complete="onIntroComplete"
    />

    <!-- FLOATING CONTROLLER (Intro Replay, Music & SFX) -->
    <div v-show="!showIntro" class="fixed top-4 right-4 z-40 flex items-center gap-2">
      <!-- Replay Cinematic Button -->
      <button
        @click="replayIntro"
        class="bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white border-2 border-slate-700 hover:border-cyan-500/50 rounded-full px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer"
        title="Volver a ver cinemática inicial"
      >
        <span>🎬 Intro</span>
      </button>
      <!-- Music toggle -->
      <button
        @click="toggleBgm"
        class="bg-slate-900/95 hover:bg-slate-800 text-cyan-300 border-2 border-cyan-500/40 rounded-full px-3 py-2 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer"
        :class="isBgmActive ? 'border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]' : 'opacity-80'"
      >
        <span>{{ isBgmActive ? '🎵 Música: ON' : '🔇 Música' }}</span>
      </button>

      <!-- SFX Mute button -->
      <button
        @click="toggleMute"
        class="w-10 h-10 rounded-full bg-slate-900/95 hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-500 flex items-center justify-center text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
        :title="isMuted ? 'Activar Sonidos' : 'Silenciar Sonidos'"
      >
        {{ isMuted ? '🔇' : '🔊' }}
      </button>
    </div>

    <!-- MAIN CONTENT WRAPPER -->
    <div
      v-show="!showIntro"
      class="relative z-10 flex flex-col items-center justify-start min-h-screen pb-16 transition-opacity duration-500"
    >
      
      <!-- HERO / INTRO HEADER -->
      <header class="w-full max-w-4xl mx-auto pt-12 pb-6 px-4 text-center">
        <!-- Impostor Alert Ribbon -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border-2 border-red-500/50 text-red-400 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase mb-6 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          HAY UNA FIESTA ENTRE NOSOTROS
        </div>

        <!-- Main Celebrant Avatar -->
        <div class="my-4 flex justify-center">
          <div class="relative group cursor-pointer" @click="triggerEmergencyMeeting">
            <!-- Glow circle behind -->
            <div class="absolute inset-0 rounded-full bg-red-500/10 border border-red-500/30 transform scale-110 pointer-events-none" />
            
            <CrewmateAvatar
              :color="EVENT_CONFIG.celebrant.favoriteColor"
              shadow-color="#991b1b"
              :hat="EVENT_CONFIG.celebrant.hat"
              :size="200"
              animation="float"
            />
            
            <div class="mt-2 text-[11px] font-mono text-cyan-300 font-bold bg-slate-900/95 px-3 py-1 rounded-full border border-cyan-500/30 inline-block shadow">
              ¡Toca a {{ EVENT_CONFIG.celebrant.name }} para reunión! 🚨
            </div>
          </div>
        </div>

        <!-- Celebrant Title -->
        <div class="space-y-2 mt-4">
          <p class="font-mono text-xs sm:text-sm uppercase tracking-widest text-cyan-400 font-bold">
            TRIPULANTE DE HONOR
          </p>
          <h1 class="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]">
            ¡{{ EVENT_CONFIG.celebrant.name }}'s Birthday!
          </h1>
          <p class="text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-medium mt-3 px-2">
            {{ EVENT_CONFIG.mission.description }}
          </p>
        </div>

        <!-- BIG RED EMERGENCY BUTTON -->
        <div class="mt-8 flex justify-center">
          <button
            @click="triggerEmergencyMeeting"
            class="group relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden rounded-2xl font-black transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_30px_rgba(239,68,68,0.5)]"
          >
            <span class="w-full h-full bg-gradient-to-br from-red-500 via-rose-600 to-red-700 group-hover:from-red-400 group-hover:to-rose-600 px-6 py-4 rounded-2xl text-white font-mono text-sm sm:text-base uppercase tracking-wider flex items-center gap-3">
              <span class="text-2xl animate-spin">🚨</span>
              <span>EMERGENCY MEETING (REUNIÓN)</span>
            </span>
          </button>
        </div>

        <!-- Quick Jump Navigation Pill Links -->
        <div class="flex flex-wrap items-center justify-center gap-2.5 mt-6">
          <a
            href="#minijuego"
            class="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm font-bold text-cyan-300 hover:text-white transition-all cursor-pointer"
          >
            ⚡ Jugar Minijuego
          </a>
          <a
            href="#detalles"
            class="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm font-bold text-cyan-300 hover:text-white transition-all cursor-pointer"
          >
            📍 Dónde y Cuándo
          </a>
          <a
            href="#confirmacion"
            class="px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/50 text-xs sm:text-sm font-bold text-emerald-300 hover:text-white transition-all cursor-pointer"
          >
            📝 Confirmar Asistencia
          </a>
        </div>
      </header>

      <!-- COUNTDOWN TIMER SECTION -->
      <CountdownTimer />

      <!-- MINIGAME: TASK STATION -->
      <AmongUsMinigame />

      <!-- MISSION DETAILS (Coordinates, Dates, Dress code, Gifts) -->
      <MissionDetails />

      <!-- CREWMATE CUSTOMIZER (Choose your color) -->
      <CrewmateCustomizer v-model="guestCrewmate" />

      <!-- PHOTO MOMENTS GALLERY -->
      <MomentsGallery />

      <!-- RSVP REGISTRATION FORM -->
      <RsvpForm :crewmate="guestCrewmate" />

      <!-- FOOTER -->
      <footer class="w-full max-w-4xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 font-mono px-4 space-y-2">
        <p class="text-slate-400">
          🚀 Misión Cumpleaños de {{ EVENT_CONFIG.celebrant.name }} • The Skeld Sector
        </p>
        <p class="text-[11px] text-slate-600">
          Inspirado en la temática Among Us • Desarrollado con Vue 3 para Vercel
        </p>
        <div class="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
          <button
            @click="replayIntro"
            class="text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
          >
            ↺ Ver cinemática de inicio otra vez
          </button>
          <span class="text-slate-600">•</span>
          <a
            href="#"
            class="text-slate-400 hover:text-white transition-colors"
          >
            ↑ Volver al inicio de la nave
          </a>
        </div>
      </footer>
    </div>

    <!-- EMERGENCY MEETING INTERACTIVE MODAL -->
    <EmergencyMeetingModal
      :is-open="isEmergencyModalOpen"
      @close="isEmergencyModalOpen = false"
    />
  </div>
</template>
