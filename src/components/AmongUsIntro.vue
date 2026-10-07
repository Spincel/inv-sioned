<script setup>
import confetti from 'canvas-confetti'
import { ref } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'

const emit = defineEmits(['complete'])

// Intro sequence state: 'prompt' -> 'reveal'
const step = ref('prompt')
const isTransitioningOut = ref(false)

const handleReadyClick = () => {
  sounds.playRoleReveal()
  step.value = 'reveal'
}

const handleJoinCrew = () => {
  sounds.playDoorOpen()
  sounds.playTaskComplete()
  setTimeout(() => {
    sounds.playFanfare()
  }, 200)

  // Celebratory confetti blast
  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#ef4444', '#06b6d4', '#ec4899', '#eab308', '#22c55e'],
  })

  isTransitioningOut.value = true
  setTimeout(() => {
    emit('complete')
  }, 600)
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030509]/95 overflow-hidden transition-all duration-500"
    :class="{ 'opacity-0 scale-105 pointer-events-none': isTransitioningOut }"
  >
    <!-- Background Star Sprinkles -->
    <div class="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_center,_#0f172a_0%,_#070a13_60%,_#030509_100%)]" />

    <!-- ============================================== -->
    <!-- STEP 1: INITIAL PROMPT ("¿ESTÁS LISTO?")      -->
    <!-- ============================================== -->
    <Transition
      enter-active-class="transition duration-400 ease-out"
      enter-from-class="opacity-0 scale-90"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
      mode="out-in"
    >
      <div
        v-if="step === 'prompt'"
        class="max-w-lg w-full bg-slate-900/95 border-4 border-cyan-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.3)] relative overflow-hidden"
      >
        <!-- Top Radar Alert -->
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-full font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          SEÑAL ENTRANTE • SECTOR THE SKELD
        </div>

        <!-- Glowing Central Helmet Visor Graphic -->
        <div class="my-6 flex justify-center">
          <div class="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-950 border-4 border-cyan-400/80 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-bounce-subtle">
            <!-- Visor glass -->
            <div class="w-20 h-14 bg-gradient-to-br from-white via-cyan-300 to-sky-600 rounded-2xl border-2 border-black flex items-start justify-end p-1.5 shadow-inner">
              <div class="w-5 h-2.5 bg-white/80 rounded-full rotate-[-15deg]" />
            </div>
          </div>
        </div>

        <!-- Main Question -->
        <h2 class="text-2xl sm:text-4xl font-black text-white tracking-wide leading-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          ¿ESTÁS LISTO PARA UNA NUEVA AVENTURA?
        </h2>

        <!-- Narrative Subtext -->
        <p class="text-xs sm:text-sm text-slate-300 font-mono mt-3 max-w-sm mx-auto leading-relaxed">
          Se ha detectado una señal de fiesta de máxima prioridad en la nave... Tu tripulación te necesita.
        </p>

        <!-- Ready Button -->
        <div class="mt-8">
          <button
            @click="handleReadyClick"
            class="group w-full py-4 px-6 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider font-mono rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-center gap-3"
          >
            <span>¡SÍ, ESTOY LISTO!</span>
            <span class="text-2xl group-hover:translate-x-1 transition-transform">🚀</span>
          </button>
        </div>

        <!-- Audio notice -->
        <p class="text-[11px] text-cyan-400/70 font-mono mt-4">
          🔊 Activa tu volumen para una mejor experiencia espacial
        </p>
      </div>

      <!-- ============================================== -->
      <!-- STEP 2: AMONG US ROLE REVEAL CINEMATIC         -->
      <!-- ============================================== -->
      <div
        v-else-if="step === 'reveal'"
        class="max-w-xl w-full text-center py-6 px-4 animate-fade-in relative z-10"
      >
        <!-- Dramatic Role Announcement Header -->
        <div class="space-y-1 mb-4">
          <p class="font-mono text-xs sm:text-sm uppercase tracking-widest text-cyan-400 font-bold animate-pulse">
            MISIÓN ASIGNADA:
          </p>
          <h1 class="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-red-500 uppercase drop-shadow-[0_0_35px_rgba(239,68,68,0.8)] animate-slam">
            TRIPULANTE DE HONOR
          </h1>
        </div>

        <!-- The Red Crewmate (Celebrant) Centerpiece -->
        <div class="my-6 flex justify-center items-center">
          <div class="relative">
            <!-- Pulsing ambient glow -->
            <div class="absolute inset-0 rounded-full bg-red-600/20 border border-red-500/40 transform scale-125 animate-ping opacity-60 pointer-events-none" />
            
            <CrewmateAvatar
              :color="EVENT_CONFIG.celebrant.favoriteColor"
              shadow-color="#991b1b"
              :hat="EVENT_CONFIG.celebrant.hat"
              :size="210"
              animation="float"
            />
          </div>
        </div>

        <!-- Sioned Party Callout Banner -->
        <div class="bg-slate-900/95 border-2 border-red-500/50 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(239,68,68,0.4)] max-w-md mx-auto mb-6">
          <p class="text-xs font-mono font-bold text-red-400 uppercase tracking-widest mb-1">
            ⭐ FIESTA OFICIAL ⭐
          </p>
          <h2 class="text-2xl sm:text-3xl font-black text-white">
            ¡{{ EVENT_CONFIG.celebrant.name }}'s Party!
          </h2>
          <p class="text-xs sm:text-sm text-slate-300 font-mono mt-1">
            Sector The Skeld • ¡Celebramos en grande!
          </p>
        </div>

        <!-- The Interactive Question -->
        <div class="space-y-3">
          <p class="text-lg sm:text-2xl font-black text-white tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
            ¿Te quieres unir a la tripulación?
          </p>

          <!-- Join Button -->
          <button
            @click="handleJoinCrew"
            class="group w-full max-w-md mx-auto py-4 px-6 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider font-mono rounded-2xl shadow-[0_0_35px_rgba(34,197,94,0.6)] transition-all duration-200 hover:scale-[1.04] active:scale-95 cursor-pointer flex items-center justify-center gap-3 animate-pulse"
          >
            <span>¡UNIRSE A LA TRIPULACIÓN!</span>
            <span class="text-2xl group-hover:rotate-12 transition-transform">🎉</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@keyframes slam {
  0% {
    transform: scale(2.2);
    opacity: 0;
  }
  70% {
    transform: scale(0.95);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-slam {
  animation: slam 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes bounceSubtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce-subtle {
  animation: bounceSubtle 2s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
</style>
