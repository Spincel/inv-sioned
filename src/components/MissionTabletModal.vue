<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { sounds } from '../utils/audio'
import AmongUsMinigame from './AmongUsMinigame.vue'
import CrewmateCustomizer from './CrewmateCustomizer.vue'
import MissionDetails from './MissionDetails.vue'
import RsvpForm from './RsvpForm.vue'
import StarfieldBackground from './StarfieldBackground.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  stationId: {
    type: String,
    default: 'minigame', // 'details' | 'minigame' | 'customizer' | 'rsvp'
  },
  guestCrewmate: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'changeStation', 'confirmRsvp', 'update:guestCrewmate'])

// Primary 3 interactive stations matching the dock
const stations = [
  { id: 'minigame', label: '1. Minijuegos', icon: '⚡' },
  { id: 'customizer', label: '2. Tu Traje', icon: '🎨' },
  { id: 'rsvp', label: '3. Confirmar', icon: '📝' },
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
  else if (props.stationId === 'minigame') handleClose()
  else if (props.stationId === 'details') handleClose()
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
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 overflow-hidden"
    >
      <!-- ======================================================== -->
      <!-- TABLET SHELL: TRANSLUCENT SCI-FI AMONG US TERMINAL       -->
      <!-- ======================================================== -->
      <div
        class="relative w-full max-w-4xl bg-[#060a15]/80 border-2 border-cyan-400/80 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden"
      >
        <!-- Internal Ambient Space & Drifting Astronauts Canvas inside the Tablet! -->
        <div class="absolute inset-0 pointer-events-none z-0 opacity-70 overflow-hidden rounded-3xl">
          <StarfieldBackground />
        </div>

        <!-- Top Tablet Bezel / Header -->
        <div class="relative z-10 bg-slate-950/85 border-b-2 border-slate-800 p-2 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <!-- Station Title & Status -->
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span class="font-mono text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-widest">
              TERMINAL DE MISIÓN • THE SKELD
            </span>
          </div>

          <!-- Quick Tab Switcher inside Tablet -->
          <div class="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full pb-0.5 sm:pb-0">
            <!-- Details / Venue Tab if active -->
            <button
              v-if="stationId === 'details'"
              @click="switchStation('details')"
              class="px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl font-mono text-[11px] sm:text-xs font-bold border-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 bg-slate-800 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.5)] ring-1 ring-emerald-400/50"
            >
              <span>📍</span>
              <span>Lugar (Chak)</span>
            </button>

            <!-- 3 Main Stations -->
            <button
              v-for="st in stations"
              :key="st.id"
              @click="switchStation(st.id)"
              class="px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl font-mono text-[11px] sm:text-xs font-bold border-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1"
              :class="
                stationId === st.id
                  ? 'bg-slate-800 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.5)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-950/70 border-slate-700 text-slate-300 hover:text-white'
              "
            >
              <span>{{ st.icon }}</span>
              <span>{{ st.label }}</span>
            </button>
          </div>

          <!-- Close / Return to Ship Button -->
          <button
            @click="handleClose"
            class="px-3 py-1.5 bg-red-600/30 hover:bg-red-600 border border-red-500/60 hover:border-red-400 text-red-200 hover:text-white rounded-xl font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="Volver a la nave"
          >
            <span>✕</span>
            <span>Volver a Nave</span>
          </button>
        </div>

        <!-- ======================================================== -->
        <!-- TABLET CONTENT AREA (INTERNAL SCROLL ONLY)               -->
        <!-- ======================================================== -->
        <div class="relative z-10 flex-1 overflow-y-auto px-2 sm:px-4 py-3 custom-scrollbar">
          <!-- Station 1: Lugar y Mapa (Chak Jumping Park) -->
          <div v-show="stationId === 'details'">
            <MissionDetails
              @view-ship="handleClose"
              @to-minigame="switchStation('minigame')"
              @to-rsvp="switchStation('rsvp')"
            />
          </div>

          <!-- Station 2: Minijuego de Tareas -->
          <div v-show="stationId === 'minigame'">
            <AmongUsMinigame
              @to-customizer="switchStation('customizer')"
              @to-rsvp="switchStation('rsvp')"
              @view-ship="handleClose"
            />
          </div>

          <!-- Station 3: Personalizar Traje -->
          <div v-show="stationId === 'customizer'">
            <CrewmateCustomizer
              :model-value="guestCrewmate"
              @update:model-value="onCrewmateUpdate"
              @to-rsvp="switchStation('rsvp')"
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
        <!-- TABLET BOTTOM NAVIGATION BAR (HIDDEN IN MINIGAMES)       -->
        <!-- ======================================================== -->
        <div
          v-if="stationId !== 'minigame'"
          class="relative z-10 bg-slate-950/90 border-t-2 border-slate-800 p-2 sm:p-2.5 flex items-center justify-between gap-2"
        >
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
            🚀 Volver a la nave
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
