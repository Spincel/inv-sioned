<script setup>
import confetti from 'canvas-confetti'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'

const props = defineProps({
  crewmates: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['openStation', 'openEmergency'])

// Active speaking crewmate bubble state
const activeSpeaker = ref(null)
let speakerTimer = null

// Countdown calculations
const now = ref(new Date())
let timerInterval = null

onMounted(() => {
  timerInterval = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (speakerTimer) clearTimeout(speakerTimer)
})

const targetTime = computed(() => new Date(EVENT_CONFIG.dateTime.targetDate).getTime())
const diff = computed(() => Math.max(0, targetTime.value - now.value.getTime()))

const days = computed(() => Math.floor(diff.value / (1000 * 60 * 60 * 24)))
const hours = computed(() => Math.floor((diff.value / (1000 * 60 * 60)) % 24))
const minutes = computed(() => Math.floor((diff.value / 1000 / 60) % 60))
const seconds = computed(() => Math.floor((diff.value / 1000) % 60))
const isStarted = computed(() => diff.value <= 0)

// Calendar Link
const googleCalendarUrl = computed(() => {
  const start = new Date(EVENT_CONFIG.dateTime.targetDate)
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000)
  const formatGCal = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '')
  const title = encodeURIComponent(`🎂 ¡Cumpleaños de ${EVENT_CONFIG.celebrant.name}! (Temática Among Us)`)
  const details = encodeURIComponent(
    `¡Estás invitado a la fiesta de cumpleaños de ${EVENT_CONFIG.celebrant.name}!\n\n` +
    `🚀 Misión: Festejo espacial Among Us\n` +
    `📍 Lugar: ${EVENT_CONFIG.location.name}\n` +
    `🕒 Hora: ${EVENT_CONFIG.dateTime.displayTime}\n`
  )
  const loc = encodeURIComponent(`${EVENT_CONFIG.location.name}, ${EVENT_CONFIG.location.address}`)
  const dates = `${formatGCal(start)}/${formatGCal(end)}`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${loc}`
})

const openCalendar = () => {
  sounds.playBeep(650, 0.08)
  window.open(googleCalendarUrl.value, '_blank')
}

// Dialog options for crewmates
const funnyDialogs = [
  '¡Ya quiero probar el pastel espacial! 🍰',
  '¡No soy el impostor, lo juro! 🤫',
  '¡Listo para festejar a Sioned! 🥳',
  '¡Misión de diversión activada! ⚡',
  '¡Traje mi mejor traje para la fiesta! 🎨',
  '¡Vi a alguien meterse a la ventilación! 👀',
  '¡La nave está lista para el despegue! 🚀',
]

// Tap Sioned Celebrant
const handleTapSioned = () => {
  sounds.playPop()
  sounds.playTaskComplete()
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.5 },
    colors: ['#ef4444', '#f59e0b', '#ec4899', '#06b6d4'],
  })

  activeSpeaker.value = {
    id: 'sioned',
    text: `¡Bienvenidos a mi fiesta de cumpleaños! 🎂✨`,
  }

  if (speakerTimer) clearTimeout(speakerTimer)
  speakerTimer = setTimeout(() => {
    activeSpeaker.value = null
  }, 3200)
}

// Tap Crewmate
const handleTapCrewmate = (mate) => {
  sounds.playPop()
  const randomMsg = mate.dialog || funnyDialogs[Math.floor(Math.random() * funnyDialogs.length)]
  
  activeSpeaker.value = {
    id: mate.id,
    text: randomMsg,
  }

  if (speakerTimer) clearTimeout(speakerTimer)
  speakerTimer = setTimeout(() => {
    activeSpeaker.value = null
  }, 3000)
}

// Emergency Button trigger
const handleEmergencyPress = () => {
  sounds.playEmergency()
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#ef4444', '#dc2626'],
  })
  emit('openStation', 'rsvp')
}
</script>

<template>
  <div class="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
    <!-- ========================================================= -->
    <!-- DROPSHIP HULL / ARCH & CENTRAL HUD COUNTDOWN BOARD       -->
    <!-- ========================================================= -->
    <div class="relative z-10 w-full max-w-5xl mx-auto pt-2 sm:pt-4 px-2 sm:px-4 flex flex-col items-center">
      <!-- Curved Bulkhead Top Trim with Hazard Warning Stripes -->
      <div class="w-full flex items-center justify-between px-3 py-1 bg-slate-900/90 border-2 border-slate-700 rounded-t-2xl shadow-lg">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span class="font-mono text-[10px] sm:text-xs font-black tracking-widest text-emerald-400 uppercase">
            SISTEMA OPERATIVO: THE SKELD • MISIÓN FIESTA
          </span>
        </div>
        <div class="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-cyan-300">
          <span>SALÓN LOS OLIVOS</span>
          <span class="text-slate-600">•</span>
          <span>SECTOR NAYARIT</span>
        </div>
      </div>

      <!-- Hazard Stripes Line -->
      <div class="w-full h-2 sm:h-2.5 bg-[repeating-linear-gradient(45deg,#eab308,#eab308_10px,#0f172a_10px,#0f172a_20px)] border-x-2 border-slate-700 opacity-90 shadow-sm" />

      <!-- ========================================================= -->
      <!-- CENTRAL COCKPIT HUD SCREEN: EVENT COUNTDOWN               -->
      <!-- ========================================================= -->
      <div class="w-full bg-slate-950/95 border-x-2 border-b-2 border-cyan-500/50 rounded-b-2xl p-2.5 sm:p-4 shadow-[0_0_30px_rgba(6,182,212,0.25)] relative overflow-hidden">
        <!-- Sci-Fi Cockpit Window Look -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <!-- Event Header & Date Info -->
          <div class="text-center sm:text-left flex-1 min-w-0">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/25 border border-red-500/50 text-red-400 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
              <span class="animate-pulse">🎂</span>
              <span>¡CUMPLEAÑOS DE {{ EVENT_CONFIG.celebrant.name.toUpperCase() }}!</span>
            </div>
            <h1 class="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2 truncate">
              <span>📅 {{ EVENT_CONFIG.dateTime.displayDate }}</span>
            </h1>
            <p class="text-[11px] sm:text-xs font-mono text-cyan-300 font-bold">
              HORA: {{ EVENT_CONFIG.dateTime.displayTime }} • Salón de Eventos Los Olivos
            </p>
          </div>

          <!-- Digital Countdown Blocks -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            <!-- Días -->
            <div class="bg-slate-900 border border-cyan-500/40 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center min-w-[50px] sm:min-w-[62px] shadow-inner">
              <div class="text-base sm:text-2xl font-black font-mono text-white leading-none">
                {{ String(days).padStart(2, '0') }}
              </div>
              <div class="text-[9px] sm:text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mt-0.5">
                DÍAS
              </div>
            </div>

            <!-- Horas -->
            <div class="bg-slate-900 border border-cyan-500/40 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center min-w-[50px] sm:min-w-[62px] shadow-inner">
              <div class="text-base sm:text-2xl font-black font-mono text-white leading-none">
                {{ String(hours).padStart(2, '0') }}
              </div>
              <div class="text-[9px] sm:text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mt-0.5">
                HORAS
              </div>
            </div>

            <!-- Minutos -->
            <div class="bg-slate-900 border border-cyan-500/40 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center min-w-[50px] sm:min-w-[62px] shadow-inner">
              <div class="text-base sm:text-2xl font-black font-mono text-white leading-none">
                {{ String(minutes).padStart(2, '0') }}
              </div>
              <div class="text-[9px] sm:text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mt-0.5">
                MIN
              </div>
            </div>

            <!-- Segundos -->
            <div class="bg-slate-900 border border-pink-500/50 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center min-w-[50px] sm:min-w-[62px] shadow-inner">
              <div class="text-base sm:text-2xl font-black font-mono text-pink-400 leading-none animate-pulse">
                {{ String(seconds).padStart(2, '0') }}
              </div>
              <div class="text-[9px] sm:text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider mt-0.5">
                SEG
              </div>
            </div>

            <!-- Calendar Quick Button -->
            <button
              @click="openCalendar"
              class="hidden md:flex flex-col items-center justify-center bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 rounded-xl px-2.5 py-2 text-cyan-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-md text-center"
              title="Guardar en Google Calendar"
            >
              <span class="text-base">📅</span>
              <span class="text-[9px] font-mono font-bold">Agendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================= -->
    <!-- DROPSHIP MEETING ROOM / CAFETERIA DECK (MAIN SCENE)       -->
    <!-- ========================================================= -->
    <div class="relative flex-1 w-full max-w-5xl mx-auto flex flex-col justify-end items-center px-3 pb-2 sm:pb-4 min-h-0">
      
      <!-- Ship Interior Wall Decor & Ambient Lighting -->
      <div class="absolute inset-x-4 top-2 bottom-8 pointer-events-none rounded-3xl border-2 border-slate-700/40 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-950/80 -z-10 shadow-2xl">
        <!-- Floor Perspective Grid Lines -->
        <div class="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.12)_0%,_transparent_70%)] opacity-80" />
        <div class="absolute inset-x-0 bottom-0 h-28 border-t border-slate-700/40 bg-slate-900/50" />
      </div>

      <!-- SPEECH BUBBLE OVER ACTIVE SPEAKER -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2 scale-90"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
      >
        <div
          v-if="activeSpeaker"
          class="absolute top-2 sm:top-6 z-30 max-w-xs sm:max-w-sm px-4 py-2.5 bg-slate-950/95 border-2 border-cyan-400 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.5)] text-center animate-bounce-subtle pointer-events-none"
        >
          <p class="font-mono text-xs sm:text-sm font-black text-white">
            {{ activeSpeaker.text }}
          </p>
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 border-r-2 border-b-2 border-cyan-400 rotate-45" />
        </div>
      </Transition>

      <!-- ======================================================= -->
      <!-- CREW GATHERING AROUND THE MEETING ROOM                  -->
      <!-- ======================================================= -->
      <div class="relative w-full flex flex-col items-center justify-end z-20 pb-2">
        
        <!-- Central Round Table with Big Red Emergency Button -->
        <div class="relative flex items-center justify-center my-1 sm:my-2">
          <!-- Metallic Emergency Table Surface -->
          <div class="relative w-44 sm:w-60 md:w-72 h-14 sm:h-20 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-4 border-slate-600 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.8)] flex items-center justify-center">
            
            <!-- Metallic Rim Inner Ring -->
            <div class="w-36 sm:w-48 md:w-56 h-10 sm:h-14 bg-slate-950/90 rounded-full border-2 border-slate-600 flex items-center justify-center">
              
              <!-- BIG RED EMERGENCY BUTTON -->
              <button
                @click="handleEmergencyPress"
                class="group relative -mt-3 sm:-mt-4 w-14 sm:w-20 md:w-24 h-14 sm:h-20 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 active:translate-y-1 rounded-full border-4 border-red-950 shadow-[0_8px_0_#7f1d1d,0_15px_20px_rgba(239,68,68,0.5)] transition-all duration-150 cursor-pointer flex items-center justify-center"
                title="¡Presiona para convocar reunión de tripulación y confirmar!"
              >
                <!-- Glowing Core -->
                <span class="w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-red-400/30 border border-white/40 flex items-center justify-center text-xl sm:text-2xl shadow-inner group-hover:scale-105 transition-transform">
                  🚨
                </span>
              </button>
            </div>

            <!-- Pulsing Label on Table -->
            <div
              @click="handleEmergencyPress"
              class="absolute -bottom-3 sm:-bottom-4 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-[9px] sm:text-xs uppercase px-3 py-1 rounded-full border-2 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)] cursor-pointer active:scale-95 transition-all"
            >
              ¡CONFIRMAR ASISTENCIA! 📝
            </div>
          </div>
        </div>

        <!-- ===================================================== -->
        <!-- CREWMATE CHARACTERS ON THE FLOOR                      -->
        <!-- ===================================================== -->
        <div class="w-full flex flex-wrap items-end justify-center gap-3 sm:gap-6 pt-3 sm:pt-4 px-2">
          
          <!-- SIONED (CUMPLEAÑERA DE HONOR - CENTER/MAIN) -->
          <div
            @click="handleTapSioned"
            class="relative flex flex-col items-center cursor-pointer group transition-transform active:scale-95 z-20"
            title="¡Toca a Sioned para escucharla!"
          >
            <!-- Crown / Star Badge Floating Above Head -->
            <div class="mb-1 bg-gradient-to-r from-red-600 via-pink-600 to-red-600 text-white text-[10px] sm:text-xs font-mono font-black px-2.5 py-0.5 rounded-full border-2 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.6)] flex items-center gap-1 group-hover:scale-105 transition-transform">
              <span>👑</span>
              <span>Sioned (Cumpleañera)</span>
            </div>

            <!-- Avatar -->
            <div class="relative">
              <CrewmateAvatar
                :color="EVENT_CONFIG.celebrant.favoriteColor"
                shadow-color="#991b1b"
                :hat="EVENT_CONFIG.celebrant.hat"
                :size="90"
                class="sm:hidden"
                animation="float"
              />
              <CrewmateAvatar
                :color="EVENT_CONFIG.celebrant.favoriteColor"
                shadow-color="#991b1b"
                :hat="EVENT_CONFIG.celebrant.hat"
                :size="120"
                class="hidden sm:block"
                animation="float"
              />
              <!-- Floor Shadow -->
              <div class="w-16 sm:w-20 h-3 bg-black/50 rounded-full blur-[2px] mx-auto -mt-2 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <!-- CONFIRMED GUEST CREWMATES (LIST) -->
          <div
            v-for="mate in crewmates"
            :key="mate.id"
            @click="handleTapCrewmate(mate)"
            class="relative flex flex-col items-center cursor-pointer group transition-transform active:scale-95"
            :title="`¡Toca a ${mate.name}!`"
          >
            <!-- Official Among Us Floating Name Pill -->
            <div
              class="mb-1 font-mono font-black text-[9px] sm:text-xs px-2 py-0.5 rounded-full border shadow-md flex items-center gap-1 transition-transform group-hover:scale-105"
              :class="
                mate.isUser
                  ? 'bg-emerald-950/95 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40'
                  : 'bg-black/90 border-slate-600 text-white'
              "
            >
              <span v-if="mate.isUser">⭐</span>
              <span class="truncate max-w-[90px] sm:max-w-[120px]">{{ mate.name }}</span>
              <span v-if="mate.isUser" class="text-[9px] text-emerald-400 font-bold">(Tú)</span>
            </div>

            <!-- Avatar -->
            <div class="relative">
              <CrewmateAvatar
                :color="mate.color || '#06b6d4'"
                :shadow-color="mate.shadowColor || '#0e7490'"
                :hat="mate.hat || 'party-hat'"
                :size="72"
                class="sm:hidden"
                animation="bounce"
              />
              <CrewmateAvatar
                :color="mate.color || '#06b6d4'"
                :shadow-color="mate.shadowColor || '#0e7490'"
                :hat="mate.hat || 'party-hat'"
                :size="95"
                class="hidden sm:block"
                animation="bounce"
              />
              <!-- Floor Shadow -->
              <div class="w-14 sm:w-16 h-2.5 bg-black/40 rounded-full blur-[2px] mx-auto -mt-2 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>

        <!-- Crew Status & Quick Add Button -->
        <div class="mt-2 flex items-center justify-center gap-2 font-mono text-[10px] sm:text-xs text-slate-400">
          <span class="px-2.5 py-1 bg-slate-900/90 border border-slate-700 rounded-full text-slate-300 flex items-center gap-1.5 shadow">
            <span>👥</span>
            <span>Tripulantes a bordo: <strong class="text-white">{{ crewmates.length + 1 }}</strong></span>
          </span>
          <button
            @click="emit('openStation', 'rsvp')"
            class="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 active:scale-95 text-emerald-300 hover:text-white border border-emerald-500/50 rounded-full font-bold transition-all cursor-pointer shadow flex items-center gap-1"
          >
            <span>➕ Sumarme</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
