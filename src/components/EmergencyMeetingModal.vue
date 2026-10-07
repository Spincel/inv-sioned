<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const closeMeeting = () => {
  sounds.playBeep(400, 0.1)
  emit('close')
}

// Handle ESC key
const onKeydown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeMeeting()
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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
    >
      <!-- Dialog window styled like the classic Emergency Meeting vote table -->
      <div
        class="bg-slate-900 border-4 border-red-600 rounded-3xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(239,68,68,0.6)] relative overflow-hidden text-center"
      >
        <!-- Flashing Top Bar with Sirens -->
        <div class="bg-red-600/30 border border-red-500/50 -mx-6 -mt-6 p-4 mb-6 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl animate-bounce">🚨</span>
            <span class="font-mono text-sm sm:text-base font-black text-red-400 uppercase tracking-widest">
              REUNIÓN DE EMERGENCIA
            </span>
          </div>
          <button
            @click="closeMeeting"
            class="text-slate-400 hover:text-white text-xl font-mono px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Big Emergency Stamp -->
        <div class="my-2">
          <h2 class="text-3xl sm:text-4xl font-black text-white tracking-wider drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]">
            ¿QUIÉN ESTÁ CUMPLIENDO AÑOS?
          </h2>
          <p class="text-sm font-mono text-cyan-300 mt-1">
            DISCUSIÓN DE LA TRIPULACIÓN EN CURSO
          </p>
        </div>

        <!-- Simulated Among Us Chat Log -->
        <div class="my-5 bg-black/70 border border-slate-700 rounded-2xl p-4 text-left flex flex-col gap-3 font-mono text-xs sm:text-sm max-h-60 overflow-y-auto">
          <!-- Red -->
          <div class="flex items-start gap-2.5">
            <div class="w-6 h-6 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
              R
            </div>
            <div>
              <span class="text-red-400 font-bold">Rojo:</span>
              <span class="text-slate-200 ml-1">¡Vi a Sioned festejando en Navegación con pastel de cumpleaños! 🎂</span>
            </div>
          </div>

          <!-- Blue -->
          <div class="flex items-start gap-2.5">
            <div class="w-6 h-6 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
              A
            </div>
            <div>
              <span class="text-blue-400 font-bold">Azul:</span>
              <span class="text-slate-200 ml-1">¿Dónde va a ser? ¡Pasen las coordenadas de la fiesta! 📍</span>
            </div>
          </div>

          <!-- Yellow -->
          <div class="flex items-start gap-2.5">
            <div class="w-6 h-6 rounded-full bg-yellow-400 flex-shrink-0 flex items-center justify-center text-[10px] text-black font-bold">
              Y
            </div>
            <div>
              <span class="text-yellow-400 font-bold">Amarillo:</span>
              <span class="text-slate-200 ml-1">¡No voten a nadie! Voten por ir a divertirse y comer botanas 🍕</span>
            </div>
          </div>

          <!-- Sioned (Birthday Star) -->
          <div class="flex items-start gap-2.5 bg-pink-500/10 p-2 rounded-xl border border-pink-500/30">
            <div class="w-6 h-6 rounded-full bg-pink-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
              S
            </div>
            <div>
              <span class="text-pink-400 font-bold">{{ EVENT_CONFIG.celebrant.name }} (Cumpleañera):</span>
              <span class="text-white ml-1 font-semibold">¡Los espero a todos en mi fiesta! Revisa los detalles abajo y no faltes ✨</span>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            @click="closeMeeting"
            class="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase rounded-xl tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-transform active:scale-95 cursor-pointer"
          >
            ¡Entendido! Ver Misión y Detalles 🚀
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
