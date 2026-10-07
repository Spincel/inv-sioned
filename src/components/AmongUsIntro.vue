<script setup>
import confetti from 'canvas-confetti'
import { ref } from 'vue'
import emergencyImg from '../assets/emergency-meeting.png'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'

const emit = defineEmits(['complete'])

// Sequence: 'prompt' -> 'button_push' -> 'meeting_reveal'
const step = ref('prompt')
const isButtonPushed = ref(false)
const isTransitioningOut = ref(false)

// 1. Click "¡SÍ, ESTOY LISTO!" -> Lleva a la estación del botón rojo y arranca la música
const handleReadyClick = () => {
  sounds.playBeep(650, 0.08)
  sounds.startBgm()
  step.value = 'button_push'
}

// 2. Niño presiona el botón rojo de emergencia
const handlePressEmergencyButton = () => {
  if (isButtonPushed.value) return
  isButtonPushed.value = true

  // Sonido icónico de sirena
  sounds.playEmergency()

  // Confeti de alarma
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.5 },
    colors: ['#ef4444', '#dc2626', '#f59e0b'],
  })

  // Transición a la pantalla de reunión de fiesta
  setTimeout(() => {
    sounds.playRoleReveal()
    step.value = 'meeting_reveal'
  }, 1100)
}

// 3. Clic en "¡INGRESAR A LA FIESTA!"
const handleEnterParty = () => {
  sounds.playDoorOpen()
  sounds.playTaskComplete()
  setTimeout(() => {
    sounds.playFanfare()
  }, 200)

  // Gran ráfaga de confeti festivo
  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#ef4444', '#06b6d4', '#ec4899', '#eab308', '#22c55e', '#a855f7'],
  })

  isTransitioningOut.value = true
  setTimeout(() => {
    emit('complete')
  }, 600)
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030509]/95 overflow-hidden transition-all duration-500 select-none"
    :class="{ 'opacity-0 scale-105 pointer-events-none': isTransitioningOut }"
  >
    <!-- Background Space Ambient -->
    <div class="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_center,_#0f172a_0%,_#070a13_60%,_#030509_100%)]" />

    <!-- ============================================== -->
    <!-- PASO 1: ¿ESTÁS LISTO PARA UNA NUEVA AVENTURA?  -->
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
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-full font-mono text-xs font-bold uppercase tracking-widest mb-4 animate-pulse">
          <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          TRANSMISIÓN ENTRANTE • SECTOR THE SKELD
        </div>

        <!-- Glowing Helmet Visor -->
        <div class="my-5 flex justify-center">
          <div class="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-950 border-4 border-cyan-400/80 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-bounce-subtle">
            <div class="w-20 h-14 bg-gradient-to-br from-white via-cyan-300 to-sky-600 rounded-2xl border-2 border-black flex items-start justify-end p-1.5 shadow-inner">
              <div class="w-5 h-2.5 bg-white/80 rounded-full rotate-[-15deg]" />
            </div>
          </div>
        </div>

        <!-- Main Question -->
        <h2 class="text-2xl sm:text-4xl font-black text-white tracking-wide leading-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          ¿ESTÁS LISTO PARA UNA NUEVA AVENTURA?
        </h2>

        <p class="text-xs sm:text-sm text-slate-300 font-mono mt-3 max-w-sm mx-auto leading-relaxed">
          Se ha detectado una señal de fiesta de máxima prioridad en la nave... Tu tripulación te necesita.
        </p>

        <!-- Big Touch Button -->
        <div class="mt-7">
          <button
            @click="handleReadyClick"
            class="group w-full py-4 px-6 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-lg sm:text-xl uppercase tracking-wider font-mono rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer flex items-center justify-center gap-3"
          >
            <span>¡SÍ, ESTOY LISTO!</span>
            <span class="text-2xl group-hover:translate-x-1 transition-transform">🚀</span>
          </button>
        </div>

        <p class="text-[11px] text-cyan-400/70 font-mono mt-4">
          🔊 Sube el volumen para vivir la experiencia espacial
        </p>
      </div>

      <!-- ======================================================= -->
      <!-- PASO 2: TRIPULANTE APRETANDO EL BOTÓN ROJO DE EMERGENCIA -->
      <!-- ======================================================= -->
      <div
        v-else-if="step === 'button_push'"
        class="max-w-lg w-full bg-slate-900/95 border-4 border-red-600/60 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_60px_rgba(239,68,68,0.4)] relative overflow-hidden"
        :class="{ 'animate-shake border-red-500 bg-red-950/90': isButtonPushed }"
      >
        <!-- Flashing Alert Header -->
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-red-600/30 text-red-300 border border-red-500/50 rounded-full font-mono text-xs font-black uppercase tracking-widest mb-3 animate-pulse">
          <span class="text-base animate-spin">🚨</span>
          ¡ALERTA ROJA EN LA NAVE!
        </div>

        <h3 class="text-xl sm:text-2xl font-black text-white tracking-wide">
          ¡CONVOCA LA REUNIÓN DE EMERGENCIA!
        </h3>

        <!-- Interactive Scene: Among Us + Big Red Button Station -->
        <div class="my-6 relative flex flex-col items-center justify-center">
          <!-- The Crewmate running to button -->
          <div
            class="transition-all duration-300 transform mb-2"
            :class="isButtonPushed ? 'translate-y-4 scale-110' : 'animate-bounce-subtle'"
          >
            <CrewmateAvatar
              color="#ef4444"
              shadow-color="#991b1b"
              hat="party-hat"
              :size="130"
              animation="none"
            />
          </div>

          <!-- The Table / Podium with Big 3D Red Button -->
          <div class="relative w-full max-w-xs flex flex-col items-center">
            <!-- Table top surface -->
            <div class="w-64 h-8 bg-zinc-800 rounded-t-2xl border-4 border-zinc-950 shadow-inner" />

            <!-- The Big Interactive Red Emergency Button -->
            <button
              @click="handlePressEmergencyButton"
              :disabled="isButtonPushed"
              class="relative -mt-6 group cursor-pointer focus:outline-none transition-transform duration-150 active:scale-95 disabled:pointer-events-none"
            >
              <!-- Outer glowing rim -->
              <div
                class="w-36 h-36 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600 p-2 border-4 border-black shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all group-hover:scale-105"
                :class="isButtonPushed ? 'scale-90 shadow-none' : 'shadow-[0_0_35px_rgba(239,68,68,0.7)] animate-pulse'"
              >
                <!-- Inner button core -->
                <div
                  class="w-full h-full rounded-full border-4 border-black flex flex-col items-center justify-center transition-all"
                  :class="
                    isButtonPushed
                      ? 'bg-red-800 shadow-inner translate-y-1'
                      : 'bg-gradient-to-b from-red-500 via-rose-600 to-red-800 shadow-[inset_0_4px_8px_rgba(255,255,255,0.6)] group-hover:from-red-400'
                  "
                >
                  <span class="text-3xl" :class="{ 'animate-spin': isButtonPushed }">🚨</span>
                  <span class="text-[11px] font-mono font-black text-white tracking-widest mt-0.5">
                    {{ isButtonPushed ? '¡ACTIVADO!' : 'PRESIONA' }}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Help Prompt for the Child -->
        <div class="mt-4">
          <p
            class="text-sm font-mono font-bold tracking-wider"
            :class="isButtonPushed ? 'text-yellow-400 animate-pulse text-base' : 'text-red-400 animate-bounce'"
          >
            {{ isButtonPushed ? '¡SIRENA SONANDO! ABRIENDO REUNIÓN...' : '👉 ¡TOCA EL BOTÓN ROJO CON TU DEDO! 👈' }}
          </p>
        </div>
      </div>

      <!-- ======================================================= -->
      <!-- PASO 3: EMERGENCY MEETING REVEAL (FIESTA DE SIONED)     -->
      <!-- ======================================================= -->
      <div
        v-else-if="step === 'meeting_reveal'"
        class="max-w-xl w-full text-center py-6 px-4 animate-fade-in relative z-10"
      >
        <!-- Flashing Emergency Banner with Artwork -->
        <div class="my-2 max-w-sm mx-auto animate-emergency-slam">
          <img
            :src="emergencyImg"
            alt="Emergency Meeting"
            class="w-full max-h-40 object-contain drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]"
          />
        </div>

        <!-- Title Slam -->
        <div class="space-y-1 my-2">
          <p class="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
            ¡HAY UNA FIESTA ENTRE NOSOTROS!
          </p>
          <h1 class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-slam">
            TRIPULANTE DE HONOR
          </h1>
        </div>

        <!-- Red Celebrant Avatar Floating with Glow -->
        <div class="my-5 flex justify-center items-center">
          <div class="relative">
            <div class="absolute inset-0 rounded-full bg-red-600/20 border border-red-500/40 transform scale-125 animate-ping opacity-60 pointer-events-none" />
            <CrewmateAvatar
              :color="EVENT_CONFIG.celebrant.favoriteColor"
              shadow-color="#991b1b"
              :hat="EVENT_CONFIG.celebrant.hat"
              :size="190"
              animation="float"
            />
          </div>
        </div>

        <!-- Sioned Party Badge -->
        <div class="bg-slate-900/95 border-2 border-red-500/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(239,68,68,0.4)] max-w-md mx-auto mb-5">
          <h2 class="text-2xl sm:text-3xl font-black text-white">
            ¡{{ EVENT_CONFIG.celebrant.name }}'s Birthday Party! 🎂
          </h2>
          <p class="text-xs sm:text-sm text-cyan-300 font-mono mt-1">
            Sector The Skeld • ¡Estás cordialmente invitado!
          </p>
        </div>

        <!-- Big Enter Button -->
        <div class="space-y-3">
          <button
            @click="handleEnterParty"
            class="group w-full max-w-md mx-auto py-4 px-6 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-lg sm:text-xl uppercase tracking-wider font-mono rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.7)] transition-all duration-200 hover:scale-[1.04] active:scale-95 cursor-pointer flex items-center justify-center gap-3 animate-pulse"
          >
            <span>¡INGRESAR A LA NAVE!</span>
            <span class="text-2xl group-hover:rotate-12 transition-transform">🚀</span>
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

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-6px);
  }
  40%, 80% {
    transform: translateX(6px);
  }
}

.animate-shake {
  animation: shake 0.3s ease-in-out 3;
}
</style>
