<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { sounds } from '../utils/audio'
import AmongUsMinigame from './AmongUsMinigame.vue'
import CrewmateCustomizer from './CrewmateCustomizer.vue'
import MissionDetails from './MissionDetails.vue'
import RsvpForm from './RsvpForm.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  stationId: {
    type: String,
    default: 'details', // 'details' | 'minigame' | 'customizer' | 'rsvp'
  },
  guestCrewmate: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'changeStation', 'confirmRsvp', 'update:guestCrewmate'])

const stations = [
  { id: 'details', label: '1. Dónde y Cuándo', icon: '📍', color: 'border-cyan-400 text-cyan-300' },
  { id: 'minigame', label: '2. Minijuego', icon: '⚡', color: 'border-yellow-400 text-yellow-300' },
  { id: 'customizer', label: '3. Tu Traje', icon: '🎨', color: 'border-purple-400 text-purple-300' },
  { id: 'rsvp', label: '4. Confirmar', icon: '📝', color: 'border-emerald-400 text-emerald-300' },
]

const switchStation = (id) => {
  sounds.playBeep(650, 0.05)
  emit('changeStation', id)
}

const handleClose = () => {
  sounds.playDoorOpen()
  emit('close')
}

const nextStation = () => {
  sounds.playTaskComplete()
  if (props.stationId === 'details') emit('changeStation', 'minigame')
  else if (props.stationId === 'minigame') emit('changeStation', 'customizer')
  else if (props.stationId === 'customizer') emit('changeStation', 'rsvp')
  else if (props.stationId === 'rsvp') handleClose()
}

const prevStation = () => {
  sounds.playBeep(450, 0.05)
  if (props.stationId === 'rsvp') emit('changeStation', 'customizer')
  else if (props.stationId === 'customizer') emit('changeStation', 'minigame')
  else if (props.stationId === 'minigame') emit('changeStation', 'details')
}

const onCrewmateUpdate = (newVal) => {
  emit('update:guestCrewmate', newVal)
}

const onConfirm = (data) => {
  emit('confirmRsvp', data)
}

// ESC closes modal
const onKeydown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    handleClose()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 overflow-hidden"
    >
      <!-- ======================================================== -->
      <!-- TABLET SHELL: STYLED LIKE AMONG US PERSONAL DATA PAD     -->
      <!-- ======================================================== -->
      <div
        class="relative w-full max-w-4xl bg-slate-900 border-4 border-slate-700 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden"
      >
        <!-- Top Tablet Bezel / Header -->
        <div class="bg-slate-950 border-b-2 border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <!-- Station Title & Status -->
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <span class="font-mono text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-widest">
              TERMINAL DE MISIÓN • THE SKELD
            </span>
          </div>

          <!-- Quick Tab Switcher inside Tablet -->
          <div class="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <button
              v-for="st in stations"
              :key="st.id"
              @click="switchStation(st.id)"
              class="px-2.5 py-1.5 sm:px-3 sm:py-1 rounded-xl font-mono text-[11px] sm:text-xs font-bold border-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1"
              :class="
                stationId === st.id
                  ? 'bg-slate-800 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-950/80 border-slate-700 text-slate-400 hover:text-slate-200'
              "
            >
              <span>{{ st.icon }}</span>
              <span class="hidden md:inline">{{ st.label }}</span>
            </button>
          </div>

          <!-- Close / Return to Ship Button -->
          <button
            @click="handleClose"
            class="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/50 hover:border-red-400 text-red-300 hover:text-white rounded-xl font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="Volver a la nave"
          >
            <span>✕</span>
            <span class="hidden sm:inline">Volver a Nave</span>
          </button>
        </div>

        <!-- ======================================================== -->
        <!-- TABLET CONTENT AREA (INTERNAL SCROLL ONLY)               -->
        <!-- ======================================================== -->
        <div class="flex-1 overflow-y-auto px-2 sm:px-4 py-3 custom-scrollbar">
          <!-- Station 1: Dónde y Cuándo -->
          <div v-show="stationId === 'details'">
            <MissionDetails />
          </div>

          <!-- Station 2: Minijuego de Tareas -->
          <div v-show="stationId === 'minigame'">
            <AmongUsMinigame />
          </div>

          <!-- Station 3: Personalizar Traje -->
          <div v-show="stationId === 'customizer'">
            <CrewmateCustomizer
              :model-value="guestCrewmate"
              @update:model-value="onCrewmateUpdate"
            />
          </div>

          <!-- Station 4: Confirmar Asistencia (RSVP) -->
          <div v-show="stationId === 'rsvp'">
            <RsvpForm
              :crewmate="guestCrewmate"
              @confirm="onConfirm"
              @view-ship="handleClose"
            />
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- TABLET BOTTOM NAVIGATION BAR                             -->
        <!-- ======================================================== -->
        <div class="bg-slate-950 border-t-2 border-slate-800 p-2.5 sm:p-3 flex items-center justify-between gap-2">
          <!-- Back Step Button -->
          <button
            v-if="stationId !== 'details'"
            @click="prevStation"
            class="px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-mono text-xs font-bold rounded-xl border border-slate-600 cursor-pointer flex items-center gap-1.5"
          >
            <span>⬅️</span>
            <span>Anterior</span>
          </button>
          <div v-else />

          <!-- Center Close shortcut -->
          <button
            @click="handleClose"
            class="text-[11px] font-mono text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
          >
            🚀 Cerrar y ver nave
          </button>

          <!-- Next Step Button -->
          <button
            @click="nextStation"
            class="px-3 sm:px-5 py-2 font-mono text-xs font-black uppercase rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-md"
            :class="
              stationId === 'rsvp'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            "
          >
            <span>{{ stationId === 'rsvp' ? 'Listo en Nave ✅' : 'Siguiente' }}</span>
            <span v-if="stationId !== 'rsvp'">➡️</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.5);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.8);
}
</style>
