<script setup>
import confetti from 'canvas-confetti'
import { onMounted, ref } from 'vue'
import AmongUsIntro from './components/AmongUsIntro.vue'
import AmongUsShipLobby from './components/AmongUsShipLobby.vue'
import EmergencyMeetingOverlay from './components/EmergencyMeetingOverlay.vue'
import MissionTabletModal from './components/MissionTabletModal.vue'
import StarfieldBackground from './components/StarfieldBackground.vue'
import StationDock from './components/StationDock.vue'
import { EVENT_CONFIG } from './config/event'
import { sounds } from './utils/audio'

// Intro Cinematic state
const showIntro = ref(true)

const onIntroComplete = () => {
  showIntro.value = false
  if (!isMuted.value && !isBgmActive.value) {
    isBgmActive.value = sounds.toggleBgm()
  }
}

const replayIntro = () => {
  sounds.playBeep(700, 0.08)
  showIntro.value = true
}

// Emergency Meeting Overlay State (Artwork simulation)
const isEmergencyActive = ref(false)

const triggerEmergency = () => {
  isEmergencyActive.value = true
}

const onEmergencyComplete = () => {
  isEmergencyActive.value = false
  openStation('rsvp')
}

// Tablet Modal & Active Station state (ZERO SCROLL, IN-PLACE OVERLAY)
const isTabletOpen = ref(false)
const currentStation = ref('details') // 'details' | 'minigame' | 'customizer' | 'rsvp'

const openStation = (stationId) => {
  sounds.playBeep(650, 0.05)
  currentStation.value = stationId
  isTabletOpen.value = true
}

// Guest Customizer state
const guestCrewmate = ref({
  color: '#06b6d4',
  shadowColor: '#0e7490',
  hat: 'party-hat',
  colorName: 'Cian',
})

// Audio state
const isMuted = ref(false)
const isBgmActive = ref(false)

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

// Toast notification banner
const toastMessage = ref(null)
let toastTimer = null

const showToast = (msg) => {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = null
  }, 4000)
}

// Persistent Crew Members in Meeting Room / Dropship Lobby
const STORAGE_KEY = 'sioned_party_crew_v2'
const crewMembers = ref([])

onMounted(async () => {
  // 1. Load from localStorage for instant display
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      crewMembers.value = JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
  }

  // 2. Sync from Vercel /api/rsvp endpoint
  try {
    const res = await fetch('/api/rsvp')
    if (res.ok) {
      const data = await res.json()
      if (data && data.guests && data.guests.length > 0) {
        const existingNames = new Set(crewMembers.value.map((c) => c.name.toLowerCase()))
        data.guests.forEach((g) => {
          if (!existingNames.has(g.name.toLowerCase())) {
            crewMembers.value.push({
              id: g.id || 'guest_' + Date.now(),
              name: g.name,
              color: g.color || '#06b6d4',
              shadowColor: g.shadowColor || '#0e7490',
              hat: g.hat || 'party-hat',
              dialog: g.message || '¡Listo para la fiesta en Chak Jumping Park! 🤸‍♂️',
            })
          }
        })
      }
    }
  } catch (e) {
    // Local fallback
  }

  if (!crewMembers.value || crewMembers.value.length === 0) {
    crewMembers.value = [
      {
        id: 'mateo',
        name: 'Mateo',
        color: '#3b82f6',
        shadowColor: '#1e40af',
        hat: 'sprout',
        dialog: '¡Listo para brincar en los trampolines! ⚡',
      },
      {
        id: 'sofia',
        name: 'Sofía',
        color: '#ec4899',
        shadowColor: '#be185d',
        hat: 'flower',
        dialog: '¡Feliz cumpleaños Sioned! 🌸',
      },
      {
        id: 'lucas',
        name: 'Lucas',
        color: '#eab308',
        shadowColor: '#a16207',
        hat: 'balloon',
        dialog: '¡Vine por el pastel espacial! 🍰',
      },
    ]
  }
})

// RSVP Confirm handler -> Adds Among Us character to the ship with their name!
const handleCrewConfirm = (data) => {
  if (data.attendance === 'yes') {
    const newGuest = {
      id: 'guest-' + Date.now(),
      name: data.name,
      color: data.color || guestCrewmate.value.color,
      shadowColor: data.shadowColor || guestCrewmate.value.shadowColor,
      hat: data.hat || guestCrewmate.value.hat,
      isUser: true,
      dialog: `¡Hola a todos, soy ${data.name}! ¡Listo para brincar en Chak Jumping Park! 🤸‍♂️🎂`,
    }

    // Replace if user previously registered or append
    crewMembers.value = crewMembers.value.filter((m) => !m.isUser)
    crewMembers.value.push(newGuest)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(crewMembers.value))

    sounds.playJoin()
    sounds.playTaskComplete()

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#06b6d4', '#ec4899', '#eab308', '#22c55e', '#a855f7'],
    })

    showToast(`🎉 ¡Bienvenido a bordo, ${data.name}! Ya apareces en la nave con Sioned.`)
  }
}
</script>

<template>
  <div class="relative w-screen h-screen h-[100dvh] overflow-hidden bg-transparent text-slate-100 flex flex-col justify-between select-none">
    <!-- Starfield Dynamic Canvas Background -->
    <StarfieldBackground />

    <!-- INTRO CINEMATIC (Step 1: ¿Estás listo? -> Step 2: Botón rojo con sirena -> Step 3: Reunión fiesta de Sioned ingresar) -->
    <AmongUsIntro
      v-if="showIntro"
      @complete="onIntroComplete"
    />

    <!-- TOAST NOTIFICATION BANNER -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="-translate-y-8 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-8 opacity-0"
    >
      <div
        v-if="toastMessage"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] bg-emerald-950/95 border-2 border-emerald-400 text-white font-mono text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] text-center flex items-center justify-center gap-2"
      >
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- FLOATING CONTROLLER (Intro Replay, Music & SFX) -->
    <div v-show="!showIntro" class="fixed top-3 right-3 z-40 flex items-center gap-1.5 sm:gap-2">
      <!-- Replay Cinematic Button -->
      <button
        @click="replayIntro"
        class="bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white border-2 border-slate-700 hover:border-cyan-500/50 rounded-full px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95 cursor-pointer"
        title="Volver a ver cinemática inicial"
      >
        <span>🎬 Intro</span>
      </button>

      <!-- Music toggle -->
      <button
        @click="toggleBgm"
        class="bg-slate-900/95 hover:bg-slate-800 text-cyan-300 border-2 border-cyan-500/40 rounded-full px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95 cursor-pointer"
        :class="isBgmActive ? 'border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]' : 'opacity-80'"
      >
        <span>{{ isBgmActive ? '🎵 ON' : '🔇 BGM' }}</span>
      </button>

      <!-- SFX Mute button -->
      <button
        @click="toggleMute"
        class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/95 hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-500 flex items-center justify-center text-xs sm:text-sm shadow-lg transition-all active:scale-95 cursor-pointer"
        :title="isMuted ? 'Activar Sonidos' : 'Silenciar Sonidos'"
      >
        {{ isMuted ? '🔇' : '🔊' }}
      </button>
    </div>

    <!-- MAIN APP SCREEN (ZERO SCROLL, APP STYLE) -->
    <div
      v-show="!showIntro"
      class="relative z-10 w-full h-full flex flex-col justify-between pb-2 sm:pb-3 overflow-hidden"
    >
      <!-- UPPER & MIDDLE: THE DROPSHIP / MEETING ROOM SCENE -->
      <div class="flex-1 w-full flex flex-col justify-between overflow-hidden min-h-0">
        <AmongUsShipLobby
          :crewmates="crewMembers"
          @open-station="openStation"
          @trigger-emergency="triggerEmergency"
        />
      </div>

      <!-- BOTTOM: THE 4-BUTTON DOCK (EXACTLY MATCHING USER'S IMAGE) -->
      <div class="w-full flex-shrink-0 pt-1">
        <StationDock
          :active-station="isTabletOpen ? currentStation : null"
          @select="openStation"
        />
      </div>
    </div>

    <!-- EMERGENCY MEETING ARTWORK OVERLAY (SLAM ANIMATION SIMULATION) -->
    <EmergencyMeetingOverlay
      :is-open="isEmergencyActive"
      @complete="onEmergencyComplete"
    />

    <!-- IN-PLACE MISSION TABLET MODAL (NO SCROLL, FLOATS OVER THE SHIP) -->
    <MissionTabletModal
      :is-open="isTabletOpen"
      :station-id="currentStation"
      v-model:guest-crewmate="guestCrewmate"
      @change-station="currentStation = $event"
      @close="isTabletOpen = false"
      @confirm-rsvp="handleCrewConfirm"
    />
  </div>
</template>
