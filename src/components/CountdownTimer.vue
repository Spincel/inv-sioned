<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'

const now = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const targetTime = computed(() => new Date(EVENT_CONFIG.dateTime.targetDate).getTime())

const diff = computed(() => {
  const d = targetTime.value - now.value.getTime()
  return Math.max(0, d)
})

const days = computed(() => Math.floor(diff.value / (1000 * 60 * 60 * 24)))
const hours = computed(() => Math.floor((diff.value / (1000 * 60 * 60)) % 24))
const minutes = computed(() => Math.floor((diff.value / 1000 / 60) % 60))
const seconds = computed(() => Math.floor((diff.value / 1000) % 60))

const isStarted = computed(() => diff.value <= 0)

// Helper to generate Google Calendar link
const googleCalendarUrl = computed(() => {
  const start = new Date(EVENT_CONFIG.dateTime.targetDate)
  // 4 hours duration
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000)

  const formatGCal = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '')

  const title = encodeURIComponent(`🎂 ¡Cumpleaños de ${EVENT_CONFIG.celebrant.name}! (Temática Among Us)`)
  const details = encodeURIComponent(
    `¡Estás invitado a la fiesta de cumpleaños de ${EVENT_CONFIG.celebrant.name}!\n\n` +
    `🚀 Misión: Festejo espacial\n` +
    `📍 Lugar: ${EVENT_CONFIG.location.name} - ${EVENT_CONFIG.location.address}\n\n` +
    `¡No seas sus y acompáñanos!`
  )
  const loc = encodeURIComponent(`${EVENT_CONFIG.location.name}, ${EVENT_CONFIG.location.address}`)
  const dates = `${formatGCal(start)}/${formatGCal(end)}`

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${loc}`
})

const handleCalendarClick = () => {
  sounds.playBeep(700, 0.1)
  window.open(googleCalendarUrl.value, '_blank')
}
</script>

<template>
  <div class="relative w-full max-w-xl mx-auto my-6 px-4">
    <!-- Panel Container with glowing border -->
    <div
      class="bg-slate-900/80 backdrop-blur-md border-2 border-cyan-400/50 rounded-2xl p-5 shadow-[0_0_25px_rgba(6,182,212,0.25)] relative overflow-hidden"
    >
      <!-- Top Cyber Decors -->
      <div class="flex items-center justify-between mb-4 border-b border-cyan-500/30 pb-2">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span class="text-xs uppercase tracking-widest font-mono text-cyan-300 font-bold">
            CUENTA REGRESIVA DE LA MISIÓN
          </span>
        </div>
        <span class="text-[11px] font-mono text-cyan-400/70">
          SECTOR: THE SKELD
        </span>
      </div>

      <!-- Time blocks grid -->
      <div v-if="!isStarted" class="grid grid-cols-4 gap-2 sm:gap-3 text-center">
        <!-- Days -->
        <div class="bg-black/60 rounded-xl p-2.5 sm:p-3 border border-cyan-500/20 flex flex-col items-center justify-center">
          <span class="font-mono text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
            {{ String(days).padStart(2, '0') }}
          </span>
          <span class="text-[10px] sm:text-xs uppercase font-bold text-cyan-400 tracking-wider mt-1">
            Días
          </span>
        </div>

        <!-- Hours -->
        <div class="bg-black/60 rounded-xl p-2.5 sm:p-3 border border-cyan-500/20 flex flex-col items-center justify-center">
          <span class="font-mono text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
            {{ String(hours).padStart(2, '0') }}
          </span>
          <span class="text-[10px] sm:text-xs uppercase font-bold text-cyan-400 tracking-wider mt-1">
            Horas
          </span>
        </div>

        <!-- Minutes -->
        <div class="bg-black/60 rounded-xl p-2.5 sm:p-3 border border-cyan-500/20 flex flex-col items-center justify-center">
          <span class="font-mono text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
            {{ String(minutes).padStart(2, '0') }}
          </span>
          <span class="text-[10px] sm:text-xs uppercase font-bold text-cyan-400 tracking-wider mt-1">
            Minutos
          </span>
        </div>

        <!-- Seconds -->
        <div class="bg-black/60 rounded-xl p-2.5 sm:p-3 border border-pink-500/30 flex flex-col items-center justify-center">
          <span class="font-mono text-2xl sm:text-4xl font-extrabold text-pink-400 tracking-tight drop-shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse">
            {{ String(seconds).padStart(2, '0') }}
          </span>
          <span class="text-[10px] sm:text-xs uppercase font-bold text-pink-400 tracking-wider mt-1">
            Segundos
          </span>
        </div>
      </div>

      <!-- In Progress / Today Message -->
      <div v-else class="text-center py-4">
        <p class="text-2xl font-bold text-yellow-400 animate-bounce">
          🎉 ¡LA MISIÓN HA COMENZADO! 🎉
        </p>
        <p class="text-sm text-cyan-200 mt-1">
          ¡Nos vemos en la nave para festejar a {{ EVENT_CONFIG.celebrant.name }}!
        </p>
      </div>

      <!-- Save to Calendar Button -->
      <div class="mt-4 pt-3 border-t border-cyan-500/20 flex justify-center">
        <button
          @click="handleCalendarClick"
          class="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 active:scale-95 text-cyan-300 hover:text-white border border-cyan-400/40 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Guardar en Google Calendar
        </button>
      </div>
    </div>
  </div>
</template>
