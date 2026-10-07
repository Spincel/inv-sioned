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

// Step-by-step Mission Stations navigation for children
const currentStep = ref('details') // 'details' | 'minigame' | 'customizer' | 'rsvp'

const stations = [
  { id: 'details', label: '1. Dónde y Cuándo', icon: '📍', color: 'border-cyan-400 text-cyan-300' },
  { id: 'minigame', label: '2. Minijuego', icon: '⚡', color: 'border-yellow-400 text-yellow-300' },
  { id: 'customizer', label: '3. Tu Traje', icon: '🎨', color: 'border-purple-400 text-purple-300' },
  { id: 'rsvp', label: '4. Confirmar', icon: '📝', color: 'border-emerald-400 text-emerald-300' },
]

const setStep = (stepId) => {
  sounds.playBeep(650, 0.05)
  currentStep.value = stepId
}

const nextStep = () => {
  sounds.playTaskComplete()
  if (currentStep.value === 'details') currentStep.value = 'minigame'
  else if (currentStep.value === 'minigame') currentStep.value = 'customizer'
  else if (currentStep.value === 'customizer') currentStep.value = 'rsvp'
}

const prevStep = () => {
  sounds.playBeep(450, 0.05)
  if (currentStep.value === 'rsvp') currentStep.value = 'customizer'
  else if (currentStep.value === 'customizer') currentStep.value = 'minigame'
  else if (currentStep.value === 'minigame') currentStep.value = 'details'
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

    <!-- AMONG US INTRO CINEMATIC (Step 1: ¿Estás listo? -> Step 2: Presiona botón rojo -> Step 3: Reunión fiesta Sioned) -->
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

    <!-- MAIN INTERACTIVE SHIP CONSOLE -->
    <div
      v-show="!showIntro"
      class="relative z-10 flex flex-col items-center justify-start min-h-screen pb-16 transition-opacity duration-500"
    >
      <!-- HERO HEADER -->
      <header class="w-full max-w-4xl mx-auto pt-8 pb-4 px-4 text-center">
        <!-- Impostor Alert Ribbon -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border-2 border-red-500/50 text-red-400 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase mb-4 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          HAY UNA FIESTA ENTRE NOSOTROS
        </div>

        <!-- Main Celebrant Avatar + Button -->
        <div class="my-3 flex justify-center">
          <div class="relative group cursor-pointer" @click="triggerEmergencyMeeting">
            <div class="absolute inset-0 rounded-full bg-red-500/10 border border-red-500/30 transform scale-110 pointer-events-none" />
            
            <CrewmateAvatar
              :color="EVENT_CONFIG.celebrant.favoriteColor"
              shadow-color="#991b1b"
              :hat="EVENT_CONFIG.celebrant.hat"
              :size="160"
              animation="float"
            />
            
            <div class="mt-2 text-[11px] font-mono text-cyan-300 font-bold bg-slate-900/95 px-3 py-1 rounded-full border border-cyan-500/30 inline-block shadow">
              ¡Toca a {{ EVENT_CONFIG.celebrant.name }} para reunión! 🚨
            </div>
          </div>
        </div>

        <!-- Celebrant Title -->
        <div class="space-y-1 mt-2">
          <h1 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]">
            ¡{{ EVENT_CONFIG.celebrant.name }}'s Birthday!
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-medium px-2">
            {{ EVENT_CONFIG.mission.description }}
          </p>
        </div>
      </header>

      <!-- COUNTDOWN TIMER (Compact Space Radar) -->
      <CountdownTimer />

      <!-- ======================================================= -->
      <!-- CHILD-FRIENDLY MISSION TABS (PASO A PASO POR BOTONES)  -->
      <!-- ======================================================= -->
      <section class="w-full max-w-4xl mx-auto px-4 mt-6">
        <!-- Station Buttons Grid (Fácil de un solo toque) -->
        <div class="bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-3 sm:p-4 shadow-xl mb-6">
          <p class="text-center font-mono text-[11px] sm:text-xs text-slate-400 uppercase tracking-widest font-bold mb-3">
            SELECCIONA UNA ESTACIÓN DE LA MISIÓN 👇
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <button
              v-for="st in stations"
              :key="st.id"
              @click="setStep(st.id)"
              class="py-3 px-3 sm:px-4 rounded-2xl font-mono font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 border-2 transition-all duration-200 cursor-pointer active:scale-95"
              :class="
                currentStep === st.id
                  ? 'bg-slate-800 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-102 ring-2 ring-cyan-400/50'
                  : 'bg-slate-950/70 border-slate-700/80 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 hover:border-slate-600'
              "
            >
              <span class="text-2xl sm:text-3xl">{{ st.icon }}</span>
              <span class="leading-tight text-center">{{ st.label }}</span>
            </button>
          </div>
        </div>

        <!-- ======================================================= -->
        <!-- ACTIVE STATION DISPLAY                                  -->
        <!-- ======================================================= -->
        <div class="transition-all duration-300">
          <!-- 1. DÓNDE Y CUÁNDO -->
          <div v-show="currentStep === 'details'" class="animate-fade-in">
            <MissionDetails />
            <div class="mt-6 flex justify-center">
              <button
                @click="nextStep"
                class="py-4 px-8 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black font-mono text-sm sm:text-base uppercase rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Siguiente: ⚡ Jugar Minijuego de Tareas</span>
                <span class="text-xl">➡️</span>
              </button>
            </div>
          </div>

          <!-- 2. MINIJUEGO DE TAREAS -->
          <div v-show="currentStep === 'minigame'" class="animate-fade-in">
            <AmongUsMinigame />
            <div class="mt-6 flex flex-wrap justify-center gap-4">
              <button
                @click="prevStep"
                class="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs sm:text-sm rounded-xl border border-slate-600 cursor-pointer active:scale-95"
              >
                ⬅️ Ver Dónde y Cuándo
              </button>
              <button
                @click="nextStep"
                class="py-3.5 px-6 bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 text-white font-black font-mono text-sm sm:text-base uppercase rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Siguiente: 🎨 Diseña tu Traje</span>
                <span class="text-xl">➡️</span>
              </button>
            </div>
          </div>

          <!-- 3. PERSONALIZAR TRIPULANTE -->
          <div v-show="currentStep === 'customizer'" class="animate-fade-in">
            <CrewmateCustomizer v-model="guestCrewmate" />
            <div class="mt-6 flex flex-wrap justify-center gap-4">
              <button
                @click="prevStep"
                class="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs sm:text-sm rounded-xl border border-slate-600 cursor-pointer active:scale-95"
              >
                ⬅️ Volver a Minijuegos
              </button>
              <button
                @click="nextStep"
                class="py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black font-mono text-sm sm:text-base uppercase rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>Siguiente: 📝 Confirmar mi Asistencia</span>
                <span class="text-xl">➡️</span>
              </button>
            </div>
          </div>

          <!-- 4. CONFIRMAR ASISTENCIA (RSVP) -->
          <div v-show="currentStep === 'rsvp'" class="animate-fade-in">
            <RsvpForm :crewmate="guestCrewmate" />
            <div class="mt-6 flex justify-center">
              <button
                @click="prevStep"
                class="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs sm:text-sm rounded-xl border border-slate-600 cursor-pointer active:scale-95"
              >
                ⬅️ Cambiar mi Traje
              </button>
            </div>
          </div>
        </div>
      </section>

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

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
