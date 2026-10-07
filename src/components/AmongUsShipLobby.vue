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
  minX: 16,
  maxX: 84,
  minY: 42,
  maxY: 86,
}

const syncCrew = () => {
  const celebrant = {
    id: 'sioned',
    name: 'Sioned',
    x: 52,
    y: 56,
    color: EVENT_CONFIG.celebrant.favoriteColor,
    shadowColor: '#991b1b',
    hat: EVENT_CONFIG.celebrant.hat,
    isCelebrant: true,
    facingLeft: false,
    isMoving: false,
    dialog: '¡Bienvenidos a mi nave de cumpleaños! 🎂✨',
  }

  // Pre-configured starting slots for guests
  const defaultSlots = [
    { x: 30, y: 72 },
    { x: 70, y: 70 },
    { x: 60, y: 80 },
    { x: 40, y: 82 },
    { x: 22, y: 60 },
    { x: 78, y: 55 },
  ]

  const mapped = props.crewmates.map((m, idx) => {
    const existing = localCrew.value.find((c) => c.id === m.id)
    const slot = defaultSlots[idx % defaultSlots.length]
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
  '¡Ya quiero probar el pastel espacial! 🍰',
  '¡No soy el impostor, lo juro! 🤫',
  '¡Listo para festejar a Sioned! 🥳',
  '¡Misión de diversión activada! ⚡',
  '¡Traje mi mejor traje para la fiesta! 🎨',
  '¡Vi a alguien meterse a la ventilación! 👀',
  '¡La nave está lista para el despegue! 🚀',
]

// Drag & Drop Crewmate Movement
const draggingId = ref(null)
const dragOffset = ref({ x: 0, y: 0 })

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
  }, 2500)

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

// Tap-To-Walk on Ship Floor
let walkingTimer = null
const handleFloorClick = (e) => {
  // If clicked a button or already dragging, ignore
  if (draggingId.value || !shipContainerRef.value) return
  const target = e.target
  if (target.closest('.crewmate-touch') || target.closest('button')) return

  const rect = shipContainerRef.value.getBoundingClientRect()
  const clickX = ((e.clientX - rect.left) / rect.width) * 100
  const clickY = ((e.clientY - rect.top) / rect.height) * 100

  const targetX = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, clickX))
  const targetY = Math.max(BOUNDS.minY, Math.min(BOUNDS.maxY, clickY))

  // Move user's crewmate, or the first guest
  const userMate = localCrew.value.find((c) => c.isUser) || localCrew.value.find((c) => !c.isCelebrant) || localCrew.value[0]
  if (!userMate) return

  sounds.playBeep(450, 0.04)
  userMate.facingLeft = targetX < userMate.x
  userMate.isMoving = true

  const startX = userMate.x
  const startY = userMate.y
  const duration = 600 // ms
  const startTime = performance.now()

  if (walkingTimer) cancelAnimationFrame(walkingTimer)

  const step = (now) => {
    const elapsed = now - startTime
    const progress = Math.min(1, elapsed / duration)
    const ease = 1 - Math.pow(1 - progress, 2) // ease-out

    userMate.x = startX + (targetX - startX) * ease
    userMate.y = startY + (targetY - startY) * ease

    if (progress < 1) {
      walkingTimer = requestAnimationFrame(step)
    } else {
      userMate.isMoving = false
      walkingTimer = null
    }
  }

  walkingTimer = requestAnimationFrame(step)
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

// Emergency Meeting CTA
const onEmergencyClick = () => {
  emit('triggerEmergency')
}
</script>

<template>
  <div class="relative w-full h-full flex flex-col justify-between items-center select-none overflow-hidden">
    <!-- ========================================================= -->
    <!-- TOP BULKHEAD: MISSION HUD & EVENT COUNTDOWN               -->
    <!-- ========================================================= -->
    <header class="relative z-20 w-full max-w-2xl px-2 sm:px-4 pt-1 sm:pt-2 flex flex-col items-center">
      <div class="w-full bg-slate-950/90 border-2 border-cyan-500/60 rounded-2xl p-2 sm:p-2.5 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-between gap-2">
        <!-- Event Mission Title -->
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span class="font-mono text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-cyan-300 truncate">
              🎂 CUMPLEAÑOS DE {{ EVENT_CONFIG.celebrant.name.toUpperCase() }}
            </span>
          </div>
          <p class="text-[10px] sm:text-xs font-black text-white font-mono truncate">
            25 OCTUBRE • 3:00 PM • THE SKELD
          </p>
        </div>

        <!-- Live Countdown Mini HUD -->
        <div class="flex items-center gap-1 font-mono text-center">
          <div class="bg-slate-900 border border-cyan-500/40 rounded-lg px-1.5 py-1 min-w-[36px] sm:min-w-[42px]">
            <div class="text-xs sm:text-sm font-black text-white leading-none">{{ String(days).padStart(2, '0') }}</div>
            <div class="text-[7px] sm:text-[8px] font-bold text-cyan-400">DÍAS</div>
          </div>
          <div class="bg-slate-900 border border-cyan-500/40 rounded-lg px-1.5 py-1 min-w-[36px] sm:min-w-[42px]">
            <div class="text-xs sm:text-sm font-black text-white leading-none">{{ String(hours).padStart(2, '0') }}</div>
            <div class="text-[7px] sm:text-[8px] font-bold text-cyan-400">HOR</div>
          </div>
          <div class="bg-slate-900 border border-cyan-500/40 rounded-lg px-1.5 py-1 min-w-[36px] sm:min-w-[42px]">
            <div class="text-xs sm:text-sm font-black text-white leading-none">{{ String(minutes).padStart(2, '0') }}</div>
            <div class="text-[7px] sm:text-[8px] font-bold text-cyan-400">MIN</div>
          </div>
          <div class="bg-slate-900 border border-pink-500/50 rounded-lg px-1.5 py-1 min-w-[36px] sm:min-w-[42px]">
            <div class="text-xs sm:text-sm font-black text-pink-400 leading-none animate-pulse">{{ String(seconds).padStart(2, '0') }}</div>
            <div class="text-[7px] sm:text-[8px] font-bold text-pink-400">SEG</div>
          </div>
        </div>
      </div>
    </header>

    <!-- ========================================================= -->
    <!-- DROPSHIP INTERIOR LOBBY (THE OFFICIAL AMONG US SHIP)      -->
    <!-- ========================================================= -->
    <main class="relative flex-1 w-full flex items-center justify-center p-2 min-h-0">
      <!-- The Dropship Pod Container (Floating in Deep Space) -->
      <div
        ref="shipContainerRef"
        @click="handleFloorClick"
        class="relative w-full max-w-[620px] aspect-[768/712] max-h-[66vh] sm:max-h-[70vh] rounded-3xl border-4 border-slate-700/80 shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden cursor-crosshair group select-none"
      >
        <!-- The Authentic Dropship Lobby Image -->
        <img
          :src="dropshipBg"
          alt="Among Us Dropship Lobby"
          class="absolute inset-0 w-full h-full object-fill pointer-events-none"
        />

        <!-- INTERACTIVE LAPTOP ON CRATE (Customizer Shortcut) -->
        <!-- Located at x: ~34%, y: ~48% on the crate -->
        <div
          @click.stop="emit('openStation', 'customizer')"
          class="absolute left-[30%] top-[45%] w-16 h-16 flex flex-col items-center justify-center cursor-pointer group/laptop z-20"
          title="Toca la laptop para personalizar tu traje"
        >
          <!-- Pulsing Highlight Ring around Laptop -->
          <div class="w-10 h-10 rounded-xl bg-cyan-400/20 border-2 border-cyan-400/80 animate-pulse flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.8)] group-hover/laptop:scale-110 transition-transform">
            <span class="text-xs">💻</span>
          </div>
          <span class="mt-0.5 bg-black/90 text-[8px] font-mono font-black text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-400/60 shadow pointer-events-none whitespace-nowrap">
            Personalizar
          </span>
        </div>

        <!-- EMERGENCY BUTTON SHORTCUT ON THE FLOOR -->
        <div
          @click.stop="onEmergencyClick"
          class="absolute left-[70%] top-[72%] w-16 h-16 flex flex-col items-center justify-center cursor-pointer group/emerg z-20"
          title="¡Toca para convocar reunión de emergencia!"
        >
          <button
            class="w-11 h-11 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 rounded-full border-2 border-red-950 shadow-[0_4px_0_#7f1d1d,0_0_15px_rgba(239,68,68,0.7)] flex items-center justify-center text-lg active:translate-y-0.5 transition-all cursor-pointer"
          >
            🚨
          </button>
          <span class="mt-0.5 bg-red-600 text-white font-mono font-black text-[8px] uppercase px-1.5 py-0.2 rounded border border-red-400 shadow pointer-events-none whitespace-nowrap">
            Reunión
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
            class="absolute z-40 max-w-[200px] px-2.5 py-1.5 bg-slate-950/95 border-2 border-cyan-400 rounded-xl text-center shadow-[0_0_20px_rgba(6,182,212,0.6)] pointer-events-none"
            :style="{
              left: `${localCrew.find((c) => c.id === activeSpeaker.id)?.x || 50}%`,
              top: `${(localCrew.find((c) => c.id === activeSpeaker.id)?.y || 60) - 15}%`,
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
            <span>¡Arrastra o toca el piso para moverte!</span>
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
        @click="emit('openStation', 'rsvp')"
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
