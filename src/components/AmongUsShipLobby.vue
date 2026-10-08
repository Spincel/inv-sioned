<script setup>
import confetti from 'canvas-confetti'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import dropshipBg from '../assets/amongus-dropship.jpg'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'

const props = defineProps({
  crewmates: {
    type: Array,
    default: () => [],
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['openStation', 'triggerEmergency', 'updatePositions'])

// Container ref for calculating relative drag coordinates
const shipContainerRef = ref(null)

// Countdown timer state
const now = ref(new Date())
let timerInterval = null

onMounted(() => {
  timerInterval = setInterval(() => {
    now.value = new Date()
  }, 1000)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  window.removeEventListener('keydown', handleKeydown)
  if (walkingTimer) cancelAnimationFrame(walkingTimer)
})

const targetTime = computed(() => new Date(EVENT_CONFIG.dateTime.targetDate).getTime())
const diff = computed(() => Math.max(0, targetTime.value - now.value.getTime()))

const days = computed(() => Math.floor(diff.value / (1000 * 60 * 60 * 24)))
const hours = computed(() => Math.floor((diff.value / (1000 * 60 * 60)) % 24))
const minutes = computed(() => Math.floor((diff.value / 1000 / 60) % 60))
const seconds = computed(() => Math.floor((diff.value / 1000) % 60))

// Interactive Crewmate Positions state (Percentages 0-100)
const localCrew = ref([])

// Walkable floor limits on the Dropship image
const BOUNDS = {
  minX: 18,
  maxX: 82,
  minY: 42,
  maxY: 86,
}

// Interactive Ship Stations / Hotspots coordinates
const STATIONS = {
  location: { x: 50, y: 34, stationId: 'details', label: '🗺️ Elegir Escenario' },
  customizer: { x: 33, y: 60, stationId: 'customizer', label: '🎨 Tu Traje' },
  emergency: { x: 68, y: 60, stationId: 'rsvp', label: '🚨 Confirmar' },
  minigame: { x: 76, y: 36, stationId: 'minigame', label: '⚡ Minijuegos' },
}

const syncCrew = () => {
  const celebrant = {
    id: 'sioned',
    name: 'Sioned',
    x: 50,
    y: 54,
    color: EVENT_CONFIG.celebrant.favoriteColor,
    shadowColor: '#991b1b',
    hat: EVENT_CONFIG.celebrant.hat,
    isCelebrant: true,
    facingLeft: false,
    isMoving: false,
    dialog: '¡Bienvenidos a mi fiesta en Chak Jumping Park! 🤸‍♂️🎂',
  }

  // Pre-configured starting slots for guests (open central room floor)
  const guestSlots = [
    { x: 38, y: 70 },
    { x: 62, y: 70 },
    { x: 44, y: 80 },
    { x: 56, y: 80 },
    { x: 32, y: 78 },
    { x: 68, y: 78 },
    { x: 42, y: 62 },
    { x: 58, y: 62 },
    { x: 50, y: 84 },
    { x: 26, y: 72 },
    { x: 74, y: 72 },
  ]

  let guestSlotIdx = 0
  const mapped = props.crewmates.map((m) => {
    const existing = localCrew.value.find((c) => (m.id && c.id === m.id) || (m.isUser && c.isUser))
    let slot
    if (m.isUser) {
      slot = { x: 50, y: 72 } // Slot for user: front and center!
    } else {
      slot = guestSlots[guestSlotIdx % guestSlots.length]
      guestSlotIdx++
    }
    return {
      ...m,
      x: existing ? existing.x : m.x || slot.x,
      y: existing ? existing.y : m.y || slot.y,
      facingLeft: existing ? existing.facingLeft : false,
      isMoving: false,
    }
  })

  localCrew.value = [celebrant, ...mapped]
}

watch(() => props.crewmates, syncCrew, { immediate: true, deep: true })

// Active speech bubble
const activeSpeaker = ref(null)
let speakerTimer = null

const funnyDialogs = [
  '¡Ya quiero brincar en los trampolines de Chak! 🤸‍♂️',
  '¡No soy el impostor, vengo por el pastel! 🍰',
  '¡Listo para la fiesta de Sioned! 🥳',
  '¡Misión espacial activada en Tepic! 🚀',
  '¡Traje mi mejor traje para la misión! 🎨',
  '¡Nos vemos el 25 de Octubre a las 3:00 PM! 🕒',
]

// Drag & Drop Crewmate Movement
const draggingId = ref(null)

const handlePointerDown = (mate, e) => {
  e.preventDefault()
  sounds.playPop()
  draggingId.value = mate.id

  if (mate.isCelebrant) {
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.5 },
      colors: ['#ef4444', '#f59e0b', '#ec4899'],
    })
  }

  activeSpeaker.value = {
    id: mate.id,
    text: mate.dialog || funnyDialogs[Math.floor(Math.random() * funnyDialogs.length)],
  }

  if (speakerTimer) clearTimeout(speakerTimer)
  speakerTimer = setTimeout(() => {
    activeSpeaker.value = null
  }, 2600)

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
}

const handlePointerMove = (e) => {
  if (!draggingId.value || !shipContainerRef.value) return
  const rect = shipContainerRef.value.getBoundingClientRect()

  const rawX = ((e.clientX - rect.left) / rect.width) * 100
  const rawY = ((e.clientY - rect.top) / rect.height) * 100

  const clampedX = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, rawX))
  const clampedY = Math.max(BOUNDS.minY, Math.min(BOUNDS.maxY, rawY))

  const mate = localCrew.value.find((c) => c.id === draggingId.value)
  if (mate) {
    if (clampedX < mate.x - 0.5) mate.facingLeft = true
    else if (clampedX > mate.x + 0.5) mate.facingLeft = false
    mate.x = clampedX
    mate.y = clampedY
    mate.isMoving = true
  }
}

const handlePointerUp = () => {
  if (draggingId.value) {
    const mate = localCrew.value.find((c) => c.id === draggingId.value)
    if (mate) mate.isMoving = false
  }
  draggingId.value = null
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
}

// Walk character to target coordinates with walking animation
let walkingTimer = null
const walkActiveCrewmateTo = (targetX, targetY, onArrival) => {
  const activeMate = localCrew.value.find((c) => c.isUser) || localCrew.value[0]
  if (!activeMate) {
    if (onArrival) onArrival()
    return
  }

  sounds.playBeep(450, 0.05)
  activeMate.facingLeft = targetX < activeMate.x
  activeMate.isMoving = true

  const startX = activeMate.x
  const startY = activeMate.y
  const duration = 550 // ms
  const startTime = performance.now()

  if (walkingTimer) cancelAnimationFrame(walkingTimer)

  const step = (time) => {
    const elapsed = time - startTime
    const progress = Math.min(1, elapsed / duration)
    const ease = 1 - Math.pow(1 - progress, 2)

    activeMate.x = startX + (targetX - startX) * ease
    activeMate.y = startY + (targetY - startY) * ease

    if (progress < 1) {
      walkingTimer = requestAnimationFrame(step)
    } else {
      activeMate.isMoving = false
      walkingTimer = null
      if (onArrival) onArrival()
    }
  }

  walkingTimer = requestAnimationFrame(step)
}

// Tap-To-Walk on Ship Floor
const handleFloorClick = (e) => {
  if (draggingId.value || !shipContainerRef.value) return
  const target = e.target
  if (target.closest('.crewmate-touch') || target.closest('button') || target.closest('.station-hotspot')) return

  const rect = shipContainerRef.value.getBoundingClientRect()
  const clickX = ((e.clientX - rect.left) / rect.width) * 100
  const clickY = ((e.clientY - rect.top) / rect.height) * 100

  const targetX = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, clickX))
  const targetY = Math.max(BOUNDS.minY, Math.min(BOUNDS.maxY, clickY))

  walkActiveCrewmateTo(targetX, targetY)
}

// Walk to Station & Open
const goToStation = (key) => {
  const st = STATIONS[key]
  if (!st) return

  walkActiveCrewmateTo(st.x, st.y, () => {
    if (key === 'emergency') {
      if (props.isConfirmed) {
        emit('openStation', 'rsvp')
      } else {
        emit('triggerEmergency')
      }
    } else {
      emit('openStation', st.stationId)
    }
  })
}

// Keyboard arrow / WASD movement
const handleKeydown = (e) => {
  const userMate = localCrew.value.find((c) => c.isUser) || localCrew.value[0]
  if (!userMate) return

  const speed = 2.5
  let moved = false

  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    userMate.x = Math.max(BOUNDS.minX, userMate.x - speed)
    userMate.facingLeft = true
    moved = true
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    userMate.x = Math.min(BOUNDS.maxX, userMate.x + speed)
    userMate.facingLeft = false
    moved = true
  } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    userMate.y = Math.max(BOUNDS.minY, userMate.y - speed)
    moved = true
  } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    userMate.y = Math.min(BOUNDS.maxY, userMate.y + speed)
    moved = true
  }

  if (moved) {
    userMate.isMoving = true
    sounds.playBeep(400, 0.02)
    setTimeout(() => {
      userMate.isMoving = false
    }, 150)
  }
}
</script>

<template>
  <div class="relative w-full h-full flex flex-col justify-between items-center select-none overflow-hidden">
    <!-- ========================================================= -->
    <!-- TOP CENTERED: BIG COUNTDOWN HUD (MÁS GRANDE Y EN EL CENTRO)-->
    <!-- ========================================================= -->
    <header class="relative z-20 w-full max-w-xl px-2 sm:px-4 pt-1 sm:pt-2 flex flex-col items-center">
      <div class="w-full bg-slate-950/95 border-2 border-cyan-400/80 rounded-2xl p-2.5 sm:p-3 shadow-[0_0_35px_rgba(6,182,212,0.5)] flex flex-col items-center text-center">
        <!-- Title & Location Badge -->
        <div class="flex items-center gap-2 mb-1">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <h2 class="font-mono text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-white">
            🎂 CUMPLEAÑOS DE {{ EVENT_CONFIG.celebrant.name.toUpperCase() }} (8 AÑOS)
          </h2>
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        </div>

        <button
          @click="goToStation('location')"
          class="text-[10px] sm:text-xs font-mono font-black text-cyan-300 hover:text-cyan-100 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/40 px-3 py-1 rounded-full mb-2 transition-all cursor-pointer flex items-center gap-1.5 shadow active:scale-95"
          title="Toca para ver el mapa y detalles de Chak Jumping Park"
        >
          <span>📍 CHAK JUMPING PARK • DOMINGO 25 DE OCTUBRE • 3:00 PM</span>
          <span class="text-xs">👉</span>
        </button>

        <!-- Big Centered Countdown Blocks -->
        <div class="grid grid-cols-4 gap-1.5 sm:gap-2.5 w-full max-w-md">
          <!-- Días -->
          <div class="bg-slate-900/90 border border-cyan-400/50 rounded-xl py-1 sm:py-1.5 px-2 shadow-inner">
            <div class="text-lg sm:text-2xl md:text-3xl font-black font-mono text-white leading-tight">
              {{ String(days).padStart(2, '0') }}
            </div>
            <div class="text-[8px] sm:text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
              DÍAS
            </div>
          </div>

          <!-- Horas -->
          <div class="bg-slate-900/90 border border-cyan-400/50 rounded-xl py-1 sm:py-1.5 px-2 shadow-inner">
            <div class="text-lg sm:text-2xl md:text-3xl font-black font-mono text-white leading-tight">
              {{ String(hours).padStart(2, '0') }}
            </div>
            <div class="text-[8px] sm:text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
              HORAS
            </div>
          </div>

          <!-- Minutos -->
          <div class="bg-slate-900/90 border border-cyan-400/50 rounded-xl py-1 sm:py-1.5 px-2 shadow-inner">
            <div class="text-lg sm:text-2xl md:text-3xl font-black font-mono text-white leading-tight">
              {{ String(minutes).padStart(2, '0') }}
            </div>
            <div class="text-[8px] sm:text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">
              MIN
            </div>
          </div>

          <!-- Segundos -->
          <div class="bg-slate-900/90 border border-pink-500/60 rounded-xl py-1 sm:py-1.5 px-2 shadow-inner">
            <div class="text-lg sm:text-2xl md:text-3xl font-black font-mono text-pink-400 leading-tight animate-pulse">
              {{ String(seconds).padStart(2, '0') }}
            </div>
            <div class="text-[8px] sm:text-[10px] font-mono font-black text-pink-400 uppercase tracking-widest">
              SEG
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- ========================================================= -->
    <!-- DROPSHIP INTERIOR LOBBY (EL MAPA INTERACTIVO COMO MINIJUEGO)-->
    <!-- ========================================================= -->
    <main class="relative flex-1 w-full flex items-center justify-center p-2 min-h-0">
      <!-- The Dropship Pod Container (Floating in Deep Space with Visible Stars Around) -->
      <div
        ref="shipContainerRef"
        @click="handleFloorClick"
        class="relative w-full max-w-[620px] aspect-[768/712] max-h-[60vh] sm:max-h-[65vh] rounded-3xl border-4 border-slate-700/80 shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden cursor-crosshair group select-none"
      >
        <!-- The Authentic Dropship Lobby Image -->
        <img
          :src="dropshipBg"
          alt="Among Us Dropship Lobby"
          class="absolute inset-0 w-full h-full object-fill pointer-events-none"
        />

        <!-- ======================================================= -->
        <!-- INTERACTIVE SHIP STATIONS (TAREAS / MINIJUEGO)          -->
        <!-- ======================================================= -->

        <!-- 1. PUERTA PRINCIPAL DE DESPEGUE -> ELEGIR ESCENARIO (CHAK JUMPING PARK) -->
        <div
          @click.stop="goToStation('location')"
          class="station-hotspot absolute left-[35%] top-[18%] w-36 h-20 flex flex-col items-center justify-center cursor-pointer group/door z-20"
          title="Toca para elegir escenario y ver los datos de la fiesta en Chak Jumping Park"
        >
          <!-- Holographic Scenario Selector Console -->
          <div class="px-2.5 py-1 bg-cyan-950/90 border-2 border-cyan-400 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.85)] flex items-center gap-1.5 group-hover/door:scale-105 transition-transform animate-pulse">
            <span class="text-sm">🗺️</span>
            <span class="font-mono font-black text-[9px] uppercase tracking-wider text-cyan-200">
              Elegir Escenario
            </span>
          </div>
          <span class="mt-1 bg-black/95 text-[8px] font-mono font-black text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] pointer-events-none whitespace-nowrap">
            📍 Chak Jumping Park 🤸‍♂️
          </span>
        </div>

        <!-- 2. LAPTOP SOBRE LA CAJA IZQUIERDA -> TU TRAJE + RECOMENDACIÓN CALCETAS Y ROPA CÓMODA -->
        <div
          @click.stop="goToStation('customizer')"
          class="station-hotspot absolute left-[26%] top-[52%] w-26 h-24 flex flex-col items-center justify-center cursor-pointer group/laptop z-20"
          title="Toca la laptop para personalizar tu traje. ¡Recomendación: Ropa cómoda y calcetas para brincar!"
        >
          <!-- 3D Sci-Fi Laptop sitting directly on top of the left crate -->
          <div class="w-10 h-10 rounded-xl bg-purple-600/40 border-2 border-purple-400 animate-pulse flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.9)] group-hover/laptop:scale-110 transition-transform">
            <span class="text-base">💻</span>
          </div>
          <span class="mt-0.5 bg-black/95 text-[8px] font-mono font-black text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/90 shadow pointer-events-none whitespace-nowrap">
            🎨 Tu Traje
          </span>
          <span class="mt-0.5 bg-yellow-400 text-black text-[7px] font-mono font-black px-1.5 py-0.5 rounded-full border border-black shadow-[0_0_10px_rgba(250,204,21,0.6)] pointer-events-none whitespace-nowrap animate-bounce-subtle">
            🧦 Ropa Cómoda y Calcetas
          </span>
        </div>

        <!-- 3. BOTÓN SOBRE LA CAJA DERECHA -> CONFIRMAR / VER PASE -->
        <div
          @click.stop="goToStation('emergency')"
          class="station-hotspot absolute left-[67%] top-[57%] w-20 h-20 flex flex-col items-center justify-center cursor-pointer group/emerg z-20"
          :title="isConfirmed ? '¡Ya estás registrado! Toca para ver o modificar tu pase' : '¡Botón de Emergencia sobre la caja! Toca para confirmar tu asistencia'"
        >
          <!-- 3D Button sitting directly on the right crate -->
          <div class="relative -mt-2 group-hover/emerg:scale-110 transition-transform">
            <!-- Pulsing alert ring -->
            <div
              class="absolute -inset-1.5 rounded-full animate-ping"
              :class="isConfirmed ? 'bg-emerald-500/40' : 'bg-red-600/40'"
            />
            <button
              class="relative w-11 h-11 bg-gradient-to-b active:translate-y-0.5 rounded-full border-2 flex items-center justify-center text-xl cursor-pointer"
              :class="
                isConfirmed
                  ? 'from-emerald-500 to-teal-700 border-emerald-950 shadow-[0_4px_0_#064e3b,0_0_20px_rgba(16,185,129,0.9)]'
                  : 'from-red-500 to-red-700 border-red-950 shadow-[0_4px_0_#7f1d1d,0_0_20px_rgba(239,68,68,0.9)]'
              "
            >
              {{ isConfirmed ? '🎫' : '🚨' }}
            </button>
          </div>
          <span
            class="mt-1 font-mono font-black text-[8px] uppercase px-2 py-0.5 rounded-full border shadow pointer-events-none whitespace-nowrap animate-bounce-subtle"
            :class="
              isConfirmed
                ? 'bg-emerald-600 text-white border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                : 'bg-red-600 text-white border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
            "
          >
            {{ isConfirmed ? '✅ Mi Pase (Editar)' : '¡Confirmar!' }}
          </span>
        </div>

        <!-- 4. REUBICADO: PANEL DE MINIJUEGOS EN CONSOLA DERECHA SUPERIOR -->
        <div
          @click.stop="goToStation('minigame')"
          class="station-hotspot absolute left-[74%] top-[30%] w-22 h-20 flex flex-col items-center justify-center cursor-pointer group/task z-20"
          title="Toca para jugar los minijuegos de cables y tarjeta VIP"
        >
          <div class="w-9 h-9 rounded-xl bg-yellow-500/30 border-2 border-yellow-400 animate-pulse flex items-center justify-center shadow-[0_0_18px_rgba(234,179,8,0.85)] group-hover/task:scale-110 transition-transform">
            <span class="text-sm">⚡</span>
          </div>
          <span class="mt-0.5 bg-black/95 text-[8px] font-mono font-black text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-400/90 shadow pointer-events-none whitespace-nowrap">
            ⚡ Minijuegos
          </span>
          <span class="text-[7px] text-cyan-300 font-mono font-bold pointer-events-none whitespace-nowrap">
            Cables y Tarjeta
          </span>
        </div>

        <!-- FLOATING SPEECH BUBBLE OVER ACTIVE SPEAKER -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-75"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-75"
        >
          <div
            v-if="activeSpeaker"
            class="absolute z-40 max-w-[210px] px-2.5 py-1.5 bg-slate-950/95 border-2 border-cyan-400 rounded-xl text-center shadow-[0_0_20px_rgba(6,182,212,0.6)] pointer-events-none"
            :style="{
              left: `${localCrew.find((c) => c.id === activeSpeaker.id)?.x || 50}%`,
              top: `${(localCrew.find((c) => c.id === activeSpeaker.id)?.y || 60) - 16}%`,
              transform: 'translateX(-50%)',
            }"
          >
            <p class="font-mono text-[10px] font-black text-white leading-tight">
              {{ activeSpeaker.text }}
            </p>
            <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-950 border-r-2 border-b-2 border-cyan-400 rotate-45" />
          </div>
        </Transition>

        <!-- ======================================================= -->
        <!-- CREWMATE CHARACTERS INSIDE THE SHIP (MOVABLE!)          -->
        <!-- ======================================================= -->
        <div
          v-for="mate in localCrew"
          :key="mate.id"
          @pointerdown="handlePointerDown(mate, $event)"
          class="crewmate-touch absolute z-30 flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform"
          :class="{
            'animate-waddle': mate.isMoving,
          }"
          :style="{
            left: `${mate.x}%`,
            top: `${mate.y}%`,
            transform: `translate(-50%, -75%) scaleX(${mate.facingLeft ? -1 : 1})`,
          }"
        >
          <!-- Official Among Us Floating Name Pill (Unflipped so text is always readable) -->
          <div
            class="mb-0.5 font-mono font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full border shadow-md flex items-center gap-1 select-none pointer-events-none"
            :style="{ transform: `scaleX(${mate.facingLeft ? -1 : 1})` }"
            :class="
              mate.isCelebrant
                ? 'bg-red-600 text-white border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.7)]'
                : mate.isUser
                  ? 'bg-emerald-950/95 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                  : 'bg-black/85 border-slate-600 text-white'
            "
          >
            <span v-if="mate.isCelebrant">👑</span>
            <span v-else-if="mate.isUser">⭐</span>
            <span class="truncate max-w-[80px] sm:max-w-[100px]">{{ mate.name }}</span>
            <span v-if="mate.isUser" class="text-[8px] text-emerald-400">(Tú)</span>
          </div>

          <!-- The Among Us Sprite -->
          <div class="relative">
            <CrewmateAvatar
              :color="mate.color || '#06b6d4'"
              :shadow-color="mate.shadowColor || '#0e7490'"
              :hat="mate.hat || 'party-hat'"
              :size="mate.isCelebrant ? 68 : 56"
              animation="none"
            />
            <!-- Floor Shadow -->
            <div class="w-10 sm:w-12 h-2.5 bg-black/60 rounded-full blur-[1px] mx-auto -mt-1.5 pointer-events-none" />
          </div>
        </div>

        <!-- Help Hint for Children -->
        <div class="absolute bottom-2 left-2 z-20 pointer-events-none">
          <span class="bg-black/80 text-[8px] sm:text-[9px] font-mono font-bold text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1 shadow">
            <span>🎮</span>
            <span>¡Arrastra tu muñeco o toca las estaciones!</span>
          </span>
        </div>
      </div>
    </main>

    <!-- Crew count & prompt -->
    <div class="relative z-20 mb-1 flex items-center justify-center gap-2 font-mono text-[10px] text-slate-400">
      <span class="px-2.5 py-0.5 bg-slate-900/90 border border-slate-700 rounded-full text-slate-300 shadow">
        👥 Tripulantes a bordo: <strong class="text-white">{{ localCrew.length }}</strong>
      </span>
      <button
        @click="goToStation('emergency')"
        class="px-2.5 py-0.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-white border border-emerald-500/50 rounded-full font-bold transition-all cursor-pointer shadow flex items-center gap-1"
      >
        <span>➕ Unirme</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes waddle {
  0% {
    transform: translate(-50%, -75%) rotate(-4deg);
  }
  50% {
    transform: translate(-50%, -75%) rotate(4deg);
  }
  100% {
    transform: translate(-50%, -75%) rotate(-4deg);
  }
}

.animate-waddle {
  animation: waddle 0.25s infinite ease-in-out;
}
</style>
