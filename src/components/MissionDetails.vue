<script setup>
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'

const openMaps = () => {
  sounds.playBeep(600, 0.1)
  window.open(EVENT_CONFIG.location.mapsUrl, '_blank')
}

const openWaze = () => {
  sounds.playBeep(600, 0.1)
  window.open(EVENT_CONFIG.location.wazeUrl, '_blank')
}
</script>

<template>
  <div id="detalles" class="w-full max-w-3xl mx-auto py-2 px-1 sm:px-3">
    <div class="text-center mb-6">
      <span class="px-3 py-1 bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold uppercase rounded-full border border-cyan-500/30">
        DATOS DE NAVEGACIÓN
      </span>
      <h2 class="text-2xl sm:text-3xl font-black text-white mt-1.5">
        Coordenadas de la Misión
      </h2>
      <p class="text-slate-300 text-xs sm:text-sm mt-1 max-w-md mx-auto">
        Toda la información que necesitas para arribar a la base de celebración de {{ EVENT_CONFIG.celebrant.name }}.
      </p>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 1. DATE & TIME CARD -->
      <div class="bg-slate-900/95 border-2 border-cyan-500/30 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-cyan-400 transition-colors">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              📅
            </div>
            <div>
              <span class="text-[11px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                TIEMPO ESTELAR
              </span>
              <h3 class="text-lg font-black text-white">
                Fecha y Horario
              </h3>
            </div>
          </div>

          <div class="space-y-2 font-mono text-sm">
            <div class="flex items-start gap-2">
              <span class="text-cyan-400 font-bold">Día:</span>
              <span class="text-slate-200 font-semibold">{{ EVENT_CONFIG.dateTime.displayDate }}</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-cyan-400 font-bold">Hora:</span>
              <span class="text-slate-200 font-semibold">{{ EVENT_CONFIG.dateTime.displayTime }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <span>⏰</span>
          <span>¡Llega a tiempo para no perderte el despegue del pastel!</span>
        </div>
      </div>

      <!-- 2. LOCATION & MAPS CARD -->
      <div class="bg-slate-900/95 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-emerald-400 transition-colors">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              📍
            </div>
            <div>
              <span class="text-[11px] font-mono uppercase text-emerald-400 font-bold tracking-wider">
                BASE ESPACIAL
              </span>
              <h3 class="text-lg font-black text-white">
                Lugar del Evento
              </h3>
            </div>
          </div>

          <div class="space-y-1 font-mono text-sm">
            <p class="font-bold text-white text-base">
              {{ EVENT_CONFIG.location.name }}
            </p>
            <p class="text-xs text-emerald-300">
              {{ EVENT_CONFIG.location.subname }}
            </p>
            <p class="text-xs text-slate-300 pt-1">
              {{ EVENT_CONFIG.location.address }}
            </p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
          <button
            @click="openMaps"
            class="flex-1 py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/50 active:scale-95 text-emerald-300 hover:text-white border border-emerald-500/50 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>🗺️ Google Maps</span>
          </button>
          <button
            @click="openWaze"
            class="flex-1 py-2 px-3 bg-cyan-600/30 hover:bg-cyan-600/50 active:scale-95 text-cyan-300 hover:text-white border border-cyan-500/50 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>🚗 Waze</span>
          </button>
        </div>
      </div>

      <!-- 3. DRESS CODE CARD -->
      <div class="bg-slate-900/95 border-2 border-purple-500/30 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-purple-400 transition-colors">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              👕
            </div>
            <div>
              <span class="text-[11px] font-mono uppercase text-purple-400 font-bold tracking-wider">
                EQUIPAMIENTO
              </span>
              <h3 class="text-lg font-black text-white">
                {{ EVENT_CONFIG.dressCode.title }}
              </h3>
            </div>
          </div>

          <p class="text-sm text-slate-300 leading-relaxed">
            {{ EVENT_CONFIG.dressCode.description }}
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-purple-300">
          <span>🎨</span>
          <span>¡Todos los colores de tripulante son bienvenidos!</span>
        </div>
      </div>

      <!-- 4. GIFTS / CARGA ÚTIL CARD -->
      <div class="bg-slate-900/95 border-2 border-pink-500/30 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-pink-400 transition-colors">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-400/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              🎁
            </div>
            <div>
              <span class="text-[11px] font-mono uppercase text-pink-400 font-bold tracking-wider">
                CARGA ÚTIL
              </span>
              <h3 class="text-lg font-black text-white">
                {{ EVENT_CONFIG.gifts.title }}
              </h3>
            </div>
          </div>

          <p class="text-sm text-slate-300 leading-relaxed">
            {{ EVENT_CONFIG.gifts.description }}
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-pink-300">
          <span>💌</span>
          <span>Buzón de sobres y regalos en la entrada de la nave</span>
        </div>
      </div>
    </div>
  </div>
</template>
