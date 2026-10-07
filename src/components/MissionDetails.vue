<script setup>
import { computed } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'

const emit = defineEmits(['viewShip', 'toMinigame', 'toRsvp'])

const openMaps = () => {
  sounds.playBeep(600, 0.1)
  window.open(EVENT_CONFIG.location.mapsUrl, '_blank')
}

const openWaze = () => {
  sounds.playBeep(600, 0.1)
  window.open(EVENT_CONFIG.location.wazeUrl, '_blank')
}

// Google Calendar link
const googleCalendarUrl = computed(() => {
  const start = new Date(EVENT_CONFIG.dateTime.targetDate)
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000)
  const formatGCal = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '')
  const title = encodeURIComponent(`🎂 ¡Cumpleaños de ${EVENT_CONFIG.celebrant.name}! en Chak Jumping Park`)
  const details = encodeURIComponent(
    `¡Estás invitado al cumpleaños de ${EVENT_CONFIG.celebrant.name}!\n\n` +
    `🚀 Lugar: ${EVENT_CONFIG.location.name}\n` +
    `📍 Dirección: ${EVENT_CONFIG.location.address}\n` +
    `🕒 Hora: ${EVENT_CONFIG.dateTime.displayTime}\n` +
    `🧦 ¡No olvides llevar ropa cómoda y calcetas para brincar en los trampolines!`
  )
  const loc = encodeURIComponent(`${EVENT_CONFIG.location.name}, ${EVENT_CONFIG.location.address}`)
  const dates = `${formatGCal(start)}/${formatGCal(end)}`
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${loc}`
})

const openCalendar = () => {
  sounds.playBeep(650, 0.08)
  window.open(googleCalendarUrl.value, '_blank')
}
</script>

<template>
  <div id="detalles" class="w-full max-w-3xl mx-auto py-2 px-1 sm:px-3 select-none">
    <!-- Header -->
    <div class="text-center mb-5">
      <span class="px-3.5 py-1 bg-cyan-500/20 text-cyan-300 font-mono text-xs font-black uppercase rounded-full border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
        📍 DESTINO DE LA MISIÓN
      </span>
      <h2 class="text-2xl sm:text-4xl font-black text-white mt-2 flex items-center justify-center gap-2">
        <span>🤸‍♂️</span>
        <span>Chak Jumping Park</span>
        <span>🚀</span>
      </h2>
      <p class="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg mx-auto font-mono">
        ¡Parque de trampolines y diversión espacial para el cumpleaños de {{ EVENT_CONFIG.celebrant.name }}!
      </p>
    </div>

    <!-- Main Grid: 2 Big Comfortable Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <!-- 1. LOCATION & NAVIGATION CARD -->
      <div class="bg-slate-950/70 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(16,185,129,0.2)] flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              📍
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                DOMICILIO DEL EVENTO
              </span>
              <h3 class="text-lg sm:text-xl font-black text-white">
                ¿Dónde es la fiesta?
              </h3>
            </div>
          </div>

          <!-- Address highlighted -->
          <div class="bg-slate-950/80 border border-slate-700 rounded-xl p-3 font-mono text-sm space-y-1">
            <p class="font-black text-white text-base text-emerald-300 flex items-center gap-1.5">
              <span>🏢</span>
              <span>Chak Jumping Park</span>
            </p>
            <p class="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
              Miguel Lebrija 43, Col. Aviación
            </p>
            <p class="text-xs text-slate-400">
              Tepic, Nayarit, México • C.P. 63190
            </p>
          </div>
        </div>

        <!-- Big touch buttons for Google Maps & Waze -->
        <div class="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
          <button
            @click="openMaps"
            class="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-mono font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span class="text-base">🗺️</span>
            <span>Ver en Google Maps</span>
          </button>
          <button
            @click="openWaze"
            class="py-3 px-4 bg-cyan-600/40 hover:bg-cyan-600/60 active:scale-95 text-cyan-200 hover:text-white border border-cyan-500/50 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>🚗</span>
            <span>Abrir en Waze</span>
          </button>
        </div>
      </div>

      <!-- 2. DATE & SCHEDULE CARD -->
      <div class="bg-slate-950/70 border-2 border-cyan-500/50 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(6,182,212,0.2)] flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              📅
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                TIEMPO ESTELAR
              </span>
              <h3 class="text-lg sm:text-xl font-black text-white">
                Fecha y Horario
              </h3>
            </div>
          </div>

          <div class="bg-slate-950/80 border border-slate-700 rounded-xl p-3 font-mono text-sm space-y-2">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="text-cyan-400 font-bold text-xs uppercase">Día del evento:</span>
              <span class="text-white font-black text-xs sm:text-sm">Domingo, 25 de Octubre 2026</span>
            </div>
            <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span class="text-cyan-400 font-bold text-xs uppercase">Hora de inicio:</span>
              <span class="text-yellow-400 font-black text-sm">3:00 PM</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-cyan-400 font-bold text-xs uppercase">Festejada:</span>
              <span class="text-pink-400 font-black text-xs sm:text-sm">Sioned (8 Años) 🎂</span>
            </div>
          </div>
        </div>

        <!-- Add to calendar button -->
        <div class="mt-4 pt-3 border-t border-slate-800">
          <button
            @click="openCalendar"
            class="w-full py-3 px-4 bg-cyan-600/30 hover:bg-cyan-600/50 active:scale-95 text-cyan-200 hover:text-white border border-cyan-400/50 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>⏰</span>
            <span>Guardar en Google Calendar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 3. CHILD & FAMILY TIPS FOR THE TRAMPOLINE PARK -->
    <div class="mt-4 bg-gradient-to-r from-purple-950/50 via-slate-950/70 to-purple-950/50 border border-purple-500/40 rounded-2xl p-3.5 sm:p-4 text-xs font-mono space-y-1.5">
      <div class="flex items-center gap-2 text-purple-300 font-black uppercase text-[11px] sm:text-xs tracking-wider">
        <span>💡</span>
        <span>Recomendaciones para los Tripulantes:</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 text-[11px] pt-1">
        <div class="bg-black/50 rounded-xl p-2 border border-slate-800">
          <strong class="text-yellow-400">🧦 Calcetas para saltar:</strong> Lleva ropa cómoda y calcetas para brincar en los trampolines.
        </div>
        <div class="bg-black/50 rounded-xl p-2 border border-slate-800">
          <strong class="text-cyan-400">🍕 Comida y Pastel:</strong> Habrá pastel, piñata y deliciosos bocadillos para todos.
        </div>
        <div class="bg-black/50 rounded-xl p-2 border border-slate-800">
          <strong class="text-pink-400">🎁 Regalos:</strong> Lluvia de sobres o tu detalle especial para Sioned.
        </div>
      </div>
    </div>

    <!-- 4. QUICK ACTION SHORTCUTS -->
    <div class="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
      <button
        @click="emit('toMinigame')"
        class="w-full sm:w-auto py-2.5 px-5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-400/50 rounded-xl font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow"
      >
        <span>⚡ Probar Minijuegos</span>
      </button>
      <button
        @click="emit('toRsvp')"
        class="w-full sm:w-auto py-2.5 px-5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 rounded-xl font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow"
      >
        <span>📝 Confirmar Asistencia</span>
      </button>
      <button
        @click="emit('viewShip')"
        class="w-full sm:w-auto py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-xl font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
      >
        <span>🚀 Volver a la Nave</span>
      </button>
    </div>
  </div>
</template>
