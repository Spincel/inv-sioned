<script setup>
import confetti from 'canvas-confetti'
import { computed, onMounted, ref, watch } from 'vue'
import AdminGuestListModal from './components/AdminGuestListModal.vue'
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

// Admin Panel State
const isAdminOpen = ref(false)
const isSecretAdminMode = ref(false)

const openAdminModal = () => {
  sounds.playBeep(750, 0.06)
  isAdminOpen.value = true
}

const closeAdminModal = () => {
  isAdminOpen.value = false
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

// Persistent Device Confirmation Memory
const STORAGE_CONFIRM_KEY = 'sioned_my_confirmation'
const STORAGE_CREW_KEY = 'sioned_party_crew_v2'

const myConfirmation = ref(null)
const isConfirmed = computed(() => Boolean(myConfirmation.value && myConfirmation.value.name))

const crewMembers = ref([])

onMounted(async () => {
  // 1. Check if user already confirmed attendance on this device
  try {
    const rawConfirm = localStorage.getItem(STORAGE_CONFIRM_KEY)
    if (rawConfirm) {
      const parsedConfirm = JSON.parse(rawConfirm)
      if (parsedConfirm && parsedConfirm.name) {
        myConfirmation.value = parsedConfirm
        guestCrewmate.value.color = parsedConfirm.color || guestCrewmate.value.color
        guestCrewmate.value.shadowColor = parsedConfirm.shadowColor || guestCrewmate.value.shadowColor
        guestCrewmate.value.hat = parsedConfirm.hat || guestCrewmate.value.hat
        guestCrewmate.value.colorName = parsedConfirm.colorName || guestCrewmate.value.colorName
      }
    }
  } catch (e) {
    console.warn('Error reading device confirmation:', e)
  }

  // 2. Load crew from localStorage for instant display
  const savedCrew = localStorage.getItem(STORAGE_CREW_KEY)
  if (savedCrew) {
    try {
      const parsed = JSON.parse(savedCrew)
      // Filter out former default mock guests (mateo, sofia, lucas) so list begins fresh
      crewMembers.value = Array.isArray(parsed)
        ? parsed.filter((m) => !['mateo', 'sofia', 'lucas'].includes(m.id))
        : []
    } catch (e) {
      console.error(e)
    }
  }

  const resolveShadowColor = (colorHex, colorName) => {
    if (colorName) {
      const matchByName = EVENT_CONFIG.crewColors.find(
        (c) => c.name.toLowerCase() === colorName.toLowerCase()
      )
      if (matchByName?.dark) return matchByName.dark
    }
    if (colorHex) {
      const matchByHex = EVENT_CONFIG.crewColors.find(
        (c) => c.hex.toLowerCase() === colorHex.toLowerCase()
      )
      if (matchByHex?.dark) return matchByHex.dark
    }
    return '#0e7490'
  }

  const syncGuestsFromCloud = async () => {
    let cloudGuests = null

    // 1. Prioridad: Consultar directamente Google Sheets en tiempo real
    if (EVENT_CONFIG.rsvp?.googleSheetWebhookUrl) {
      try {
        const sheetRes = await fetch(EVENT_CONFIG.rsvp.googleSheetWebhookUrl)
        if (sheetRes.ok) {
          const sheetData = await sheetRes.json()
          if (sheetData && Array.isArray(sheetData.guests)) {
            cloudGuests = sheetData.guests
          }
        }
      } catch (err) {
        console.warn('Direct Google Sheet fetch notice:', err)
      }
    }

    // 2. Fallback: Consultar endpoint /api/rsvp
    if (!cloudGuests) {
      try {
        const res = await fetch('/api/rsvp')
        if (res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data.guests)) {
            cloudGuests = data.guests
          }
        }
      } catch (e) {
        console.warn('API sync fallback notice:', e)
      }
    }

    if (cloudGuests && Array.isArray(cloudGuests)) {
      const celebrantName = EVENT_CONFIG.celebrant.name.toLowerCase()
      const confirmedList = cloudGuests
        .filter((g) => g.attendance === 'yes' && (g.name || '').trim().toLowerCase() !== celebrantName)
        .map((g) => {
          const cHex = g.color || '#06b6d4'
          return {
            id: g.id || 'guest_' + (g.name || '').toLowerCase(),
            name: (g.name || '').trim(),
            color: cHex,
            shadowColor: resolveShadowColor(cHex, g.colorName),
            hat: g.hat || 'party-hat',
            dialog: g.message && g.message.trim() ? g.message.trim() : '¡Listo para la fiesta en Chak Jumping Park! 🤸‍♂️',
          }
        })

      // Marcar al usuario local si su nombre coincide
      const myName = (myConfirmation.value?.name || '').trim().toLowerCase()
      let userFound = false

      const mappedCrew = confirmedList.map((mate) => {
        const isMyUser = myName && mate.name.toLowerCase() === myName
        if (isMyUser) {
          userFound = true
          return {
            ...mate,
            isUser: true,
            color: guestCrewmate.value.color || mate.color,
            shadowColor: guestCrewmate.value.shadowColor || mate.shadowColor,
            hat: guestCrewmate.value.hat || mate.hat,
            colorName: guestCrewmate.value.colorName || mate.colorName,
            dialog: myConfirmation.value?.message || mate.dialog,
          }
        }
        return mate
      })

      // Si el usuario no estaba en la lista aún, agregar su avatar
      if (!userFound && (!myConfirmation.value || myConfirmation.value.attendance === 'yes')) {
        mappedCrew.unshift({
          id: myConfirmation.value?.id || 'my_user_mate',
          name: myConfirmation.value?.name || 'Tú',
          color: guestCrewmate.value.color,
          shadowColor: guestCrewmate.value.shadowColor,
          hat: guestCrewmate.value.hat,
          colorName: guestCrewmate.value.colorName,
          isUser: true,
          dialog: myConfirmation.value?.message || '¡Soy yo! Puedes cambiar mi traje en la laptop. 🎨',
        })
      }

      crewMembers.value = mappedCrew

      try {
        localStorage.setItem(STORAGE_CREW_KEY, JSON.stringify(crewMembers.value))
      } catch (e) {}
    } else {
      // Si no hay red, asegurar al menos al usuario en la nave
      if (!myConfirmation.value || myConfirmation.value.attendance === 'yes') {
        const hasUser = crewMembers.value.some((m) => m.isUser)
        if (!hasUser) {
          crewMembers.value.unshift({
            id: myConfirmation.value?.id || 'my_user_mate',
            name: myConfirmation.value?.name || 'Tú',
            color: guestCrewmate.value.color,
            shadowColor: guestCrewmate.value.shadowColor,
            hat: guestCrewmate.value.hat,
            colorName: guestCrewmate.value.colorName,
            isUser: true,
            dialog: myConfirmation.value?.message || '¡Soy yo! Puedes cambiar mi traje en la laptop. 🎨',
          })
        }
      }
    }
  }

  // Ejecutar sincronización inicial en segundo plano
  syncGuestsFromCloud()

  // Re-sincronizar automáticamente cuando el usuario regresa a la pestaña
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncGuestsFromCloud()
    }
  })

  // 6. Secret Admin Access: URL query (?admin=1, ?admin=sioned) or URL hash (#admin)
  const urlParams = new URLSearchParams(window.location.search)
  const hasAdminQuery =
    urlParams.get('admin') === '1' ||
    urlParams.get('admin') === 'true' ||
    urlParams.get('admin') === 'sioned' ||
    window.location.hash === '#admin'

  if (hasAdminQuery) {
    isSecretAdminMode.value = true
    showIntro.value = false
    isAdminOpen.value = true
  }

  // Also listen for hash changes (#admin)
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') {
      isSecretAdminMode.value = true
      showIntro.value = false
      isAdminOpen.value = true
    }
  })

  // Secret keyboard shortcut: Ctrl+Shift+A opens admin
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
      isSecretAdminMode.value = true
      openAdminModal()
    }
  })
})

// Synchronize user crewmate on the ship lobby with guestCrewmate in real time
watch(
  guestCrewmate,
  (newVal) => {
    if (!newVal) return

    // If user explicitly declined, don't show on ship
    if (myConfirmation.value && myConfirmation.value.attendance === 'no') return

    const userIndex = crewMembers.value.findIndex(
      (m) => m.isUser || (myConfirmation.value && m.name.toLowerCase() === myConfirmation.value.name.toLowerCase())
    )

    const updatedUser = {
      id: myConfirmation.value?.id || 'my_user_mate',
      name: myConfirmation.value?.name || 'Tú',
      color: newVal.color,
      shadowColor: newVal.shadowColor,
      hat: newVal.hat,
      colorName: newVal.colorName,
      isUser: true,
      dialog: myConfirmation.value?.message || '¡Soy yo! Puedes cambiar mi traje en la laptop. 🎨',
    }

    if (userIndex >= 0) {
      crewMembers.value[userIndex] = {
        ...crewMembers.value[userIndex],
        ...updatedUser,
      }
    } else {
      crewMembers.value.unshift(updatedUser)
    }

    // If device was previously confirmed, keep saved confirmation colors up to date
    if (myConfirmation.value) {
      myConfirmation.value.color = newVal.color
      myConfirmation.value.shadowColor = newVal.shadowColor
      myConfirmation.value.hat = newVal.hat
      myConfirmation.value.colorName = newVal.colorName
      try {
        localStorage.setItem(STORAGE_CONFIRM_KEY, JSON.stringify(myConfirmation.value))
      } catch (e) {
        console.warn(e)
      }
    }

    try {
      localStorage.setItem(STORAGE_CREW_KEY, JSON.stringify(crewMembers.value))
    } catch (e) {
      console.warn(e)
    }
  },
  { deep: true }
)

// RSVP Confirm handler -> Updates device memory and adds Among Us character to the ship
const handleCrewConfirm = (data) => {
  myConfirmation.value = data
  try {
    localStorage.setItem(STORAGE_CONFIRM_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn(e)
  }

  if (data.attendance === 'yes') {
    if (data.color) guestCrewmate.value.color = data.color
    if (data.shadowColor) guestCrewmate.value.shadowColor = data.shadowColor
    if (data.hat) guestCrewmate.value.hat = data.hat
    if (data.colorName) guestCrewmate.value.colorName = data.colorName

    const newGuest = {
      id: data.id || ('guest-' + Date.now()),
      name: data.name,
      color: data.color || guestCrewmate.value.color,
      shadowColor: data.shadowColor || guestCrewmate.value.shadowColor,
      hat: data.hat || guestCrewmate.value.hat,
      colorName: data.colorName || guestCrewmate.value.colorName,
      isUser: true,
      dialog: data.message || `¡Hola a todos, soy ${data.name}! ¡Listo para brincar en Chak Jumping Park! 🤸‍♂️🎂`,
    }

    // Replace if user previously registered or prepend to keep front & center
    crewMembers.value = crewMembers.value.filter((m) => !m.isUser && m.name.toLowerCase() !== data.name.toLowerCase())
    crewMembers.value.unshift(newGuest)
    localStorage.setItem(STORAGE_CREW_KEY, JSON.stringify(crewMembers.value))

    sounds.playJoin()
    sounds.playTaskComplete()

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#06b6d4', '#ec4899', '#eab308', '#22c55e', '#a855f7'],
    })

    showToast(`🎉 ¡Bienvenido a bordo, ${data.name}! Tu dispositivo está registrado.`)
  } else {
    // If declined, remove character from ship
    crewMembers.value = crewMembers.value.filter((m) => !m.isUser && m.name.toLowerCase() !== data.name.toLowerCase())
    localStorage.setItem(STORAGE_CREW_KEY, JSON.stringify(crewMembers.value))
    showToast(`💔 Registro actualizado. Sentimos que no puedas asistir, ${data.name}.`)
  }
}

// When guests are updated/deleted in admin panel, reflect on ship
const onAdminGuestsUpdated = (updatedList) => {
  if (Array.isArray(updatedList)) {
    const validAttending = updatedList.filter((g) => g.attendance === 'yes')
    const userMate = crewMembers.value.find((m) => m.isUser)
    
    const freshCrew = validAttending.map((g) => ({
      id: g.id || 'guest_' + Date.now(),
      name: g.name,
      color: g.color || '#06b6d4',
      shadowColor: g.shadowColor || '#0e7490',
      hat: g.hat || 'party-hat',
      dialog: g.message || '¡Listo para la fiesta en Chak Jumping Park! 🤸‍♂️',
    }))

    if (userMate && !freshCrew.some((m) => m.name.toLowerCase() === userMate.name.toLowerCase())) {
      freshCrew.push(userMate)
    }

    crewMembers.value = freshCrew
    localStorage.setItem(STORAGE_CREW_KEY, JSON.stringify(freshCrew))
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

    <!-- FLOATING CONTROLLER (Intro Replay, Music, SFX & Admin Panel) -->
    <div v-show="!showIntro" class="fixed top-3 right-3 z-40 flex items-center gap-1.5 sm:gap-2">
      <!-- Admin Guest List Dashboard Button (SOLO VISIBLE SI SE INGRESA POR RUTA SECRETA ?admin=1 O #admin) -->
      <button
        v-if="isSecretAdminMode"
        @click="openAdminModal"
        class="bg-indigo-950/95 hover:bg-indigo-900 text-indigo-300 hover:text-white border-2 border-indigo-500/70 rounded-full px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-mono font-bold flex items-center gap-1 shadow-lg transition-all active:scale-95 cursor-pointer animate-pulse"
        title="Panel de Administración (Modo Organizador)"
      >
        <span>👑 Admin</span>
      </button>

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
          :is-confirmed="isConfirmed"
          @open-station="openStation"
          @trigger-emergency="triggerEmergency"
        />
      </div>

      <!-- BOTTOM: THE 3-BUTTON DOCK -->
      <div class="w-full flex-shrink-0 pt-1">
        <StationDock
          :active-station="isTabletOpen ? currentStation : null"
          :is-confirmed="isConfirmed"
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

    <!-- ADMIN GUEST LIST & DASHBOARD MODAL -->
    <AdminGuestListModal
      :is-open="isAdminOpen"
      @close="closeAdminModal"
      @guest-updated="onAdminGuestsUpdated"
    />
  </div>
</template>
