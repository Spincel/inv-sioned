<script setup>
import { computed } from 'vue'
import { sounds } from '../utils/audio'

const props = defineProps({
  activeStation: {
    type: String,
    default: null,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])

const stations = computed(() => [
  { id: 'minigame', label: '1. Minijuegos', sub: 'Cables y Tarjeta', icon: '⚡', color: 'text-yellow-300' },
  { id: 'customizer', label: '2. Tu Traje', sub: 'Calcetas y Ropa Cómoda', icon: '🎨', color: 'text-purple-300' },
  {
    id: 'rsvp',
    label: props.isConfirmed ? '3. Mi Pase' : '3. Confirmar',
    sub: props.isConfirmed ? '✅ Registrado (Editar)' : 'Sube a la Nave',
    icon: props.isConfirmed ? '🎫' : '📝',
    color: 'text-emerald-300',
  },
])

const handleSelect = (stationId) => {
  sounds.playBeep(650, 0.05)
  emit('select', stationId)
}
</script>

<template>
  <div class="w-full max-w-3xl mx-auto px-2 sm:px-4 select-none">
    <!-- Dock Outer Shell Styled with Space Transparency -->
    <div
      class="bg-[#0b0f19]/90 border-2 border-slate-700/80 rounded-3xl p-2 sm:p-3 shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
    >
      <!-- Title Header -->
      <p class="text-center font-mono text-[10px] sm:text-xs text-slate-300 uppercase tracking-widest font-black mb-1.5 flex items-center justify-center gap-1.5">
        <span>SELECCIONA UNA ESTACIÓN DE LA MISIÓN</span>
        <span class="text-yellow-400">👇</span>
      </p>

      <!-- 3 Comfortable Touch Action Buttons Grid -->
      <div class="grid grid-cols-3 gap-1.5 sm:gap-3">
        <button
          v-for="st in stations"
          :key="st.id"
          @click="handleSelect(st.id)"
          class="py-2.5 sm:py-3 px-1 sm:px-3 rounded-2xl font-mono font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 sm:gap-1 border-2 transition-all duration-200 cursor-pointer active:scale-95"
          :class="
            activeStation === st.id
              ? 'bg-slate-800/90 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.6)] ring-2 ring-cyan-400/50 scale-[1.02]'
              : 'bg-slate-950/80 border-slate-700/70 text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-slate-500'
          "
        >
          <span class="text-xl sm:text-2xl">{{ st.icon }}</span>
          <span class="leading-tight text-center font-bold text-[11px] sm:text-xs md:text-sm">{{ st.label }}</span>
          <span class="hidden sm:inline text-[9px] text-slate-400 font-normal">{{ st.sub }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
