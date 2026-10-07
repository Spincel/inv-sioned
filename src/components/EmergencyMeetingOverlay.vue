<script setup>
import confetti from 'canvas-confetti'
import { onMounted, ref, watch } from 'vue'
import emergencyImg from '../assets/emergency-meeting.png'
import { sounds } from '../utils/audio'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['complete', 'close'])

const isVisible = ref(false)
let timer = null

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      triggerAnimation()
    } else {
      isVisible.value = false
      if (timer) clearTimeout(timer)
    }
  }
)

const triggerAnimation = () => {
  isVisible.value = true
  sounds.playEmergency()

  // Confetti emergency siren burst
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#ef4444', '#dc2626', '#f59e0b', '#ffffff'],
  })

  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    finish()
  }, 2200)
}

const finish = () => {
  isVisible.value = false
  emit('complete')
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-300 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-110"
  >
    <div
      v-if="isOpen && isVisible"
      @click="finish"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center p-3 sm:p-6 bg-red-950/90 select-none overflow-hidden cursor-pointer"
    >
      <!-- Flashing Red Siren Bars Top & Bottom -->
      <div class="absolute inset-x-0 top-0 h-8 sm:h-12 bg-red-600 border-b-4 border-red-400 flex items-center justify-around font-mono font-black text-white text-xs sm:text-sm uppercase tracking-widest animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.8)]">
        <span>🚨 ¡EMERGENCY MEETING! 🚨</span>
        <span class="hidden sm:inline">⚠️ MISIÓN CUMPLEAÑOS SIONED ⚠️</span>
        <span>🚨 ¡EMERGENCY MEETING! 🚨</span>
      </div>

      <div class="absolute inset-x-0 bottom-0 h-8 sm:h-12 bg-red-600 border-t-4 border-red-400 flex items-center justify-around font-mono font-black text-white text-xs sm:text-sm uppercase tracking-widest animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.8)]">
        <span>🚨 ¡TODOS A LA MESA! 🚨</span>
        <span class="hidden sm:inline">⚠️ CONFIRMA TU ASISTENCIA ⚠️</span>
        <span>🚨 ¡TODOS A LA MESA! 🚨</span>
      </div>

      <!-- Main Emergency Meeting Artwork Slam -->
      <div class="relative max-w-2xl w-full flex items-center justify-center animate-emergency-slam">
        <img
          :src="emergencyImg"
          alt="Emergency Meeting"
          class="w-full max-h-[65vh] object-contain drop-shadow-[0_0_40px_rgba(239,68,68,0.9)]"
        />
      </div>

      <!-- Tap to continue hint -->
      <div class="mt-4 px-4 py-1.5 bg-black/80 rounded-full border border-red-400 text-red-200 font-mono text-xs font-bold animate-pulse">
        Toca en cualquier parte para continuar ➡️
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes emergencySlam {
  0% {
    opacity: 0;
    transform: scale(0.2) rotate(-5deg);
  }
  60% {
    opacity: 1;
    transform: scale(1.12) rotate(2deg);
  }
  80% {
    transform: scale(0.97) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

.animate-emergency-slam {
  animation: emergencySlam 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
</style>
