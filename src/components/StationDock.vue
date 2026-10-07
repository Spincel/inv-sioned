<script setup>
import { sounds } from '../utils/audio'

const props = defineProps({
  activeStation: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select'])

const stations = [
  { id: 'details', label: '1. Dónde y Cuándo', icon: '📍' },
  { id: 'minigame', label: '2. Minijuego', icon: '⚡' },
  { id: 'customizer', label: '3. Tu Traje', icon: '🎨' },
  { id: 'rsvp', label: '4. Confirmar', icon: '📝' },
]

const handleSelect = (stationId) => {
  sounds.playBeep(650, 0.05)
  emit('select', stationId)
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto px-2 sm:px-4 select-none">
    <!-- Dock Outer Shell Styled Exactly Like User's Reference -->
    <div
      class="bg-[#0b0f19]/95 border-2 border-slate-700/90 rounded-3xl p-2.5 sm:p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-none"
    >
      <!-- Title Header -->
      <p class="text-center font-mono text-[10px] sm:text-xs text-slate-300 uppercase tracking-widest font-black mb-2 flex items-center justify-center gap-1.5">
        <span>SELECCIONA UNA ESTACIÓN DE LA MISIÓN</span>
        <span class="text-yellow-400">👇</span>
      </p>

      <!-- 4 Action Buttons Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <button
          v-for="st in stations"
          :key="st.id"
          @click="handleSelect(st.id)"
          class="py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl font-mono font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 border-2 transition-all duration-200 cursor-pointer active:scale-95"
          :class="
            activeStation === st.id
              ? 'bg-slate-800/90 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.6)] ring-2 ring-cyan-400/50 scale-[1.02]'
              : 'bg-slate-950/80 border-slate-700/70 text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-slate-500'
          "
        >
          <span class="text-xl sm:text-2xl">{{ st.icon }}</span>
          <span class="leading-tight text-center truncate max-w-full">{{ st.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
