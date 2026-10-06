<script setup>
import confetti from 'canvas-confetti'
import { computed, onMounted, ref } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'

const activeTab = ref('wires') // 'wires' or 'card'
const completedTasks = ref({
  wires: false,
  card: false,
})

const overallProgress = computed(() => {
  let done = 0
  if (completedTasks.value.wires) done += 50
  if (completedTasks.value.card) done += 50
  return done
})

// ==========================================
// TASK 1: FIX WIRING (CONECTAR CABLES)
// ==========================================
const wireColors = [
  { id: 'red', name: 'Rojo', color: '#ef4444', border: '#991b1b' },
  { id: 'blue', name: 'Azul', color: '#3b82f6', border: '#1e40af' },
  { id: 'yellow', name: 'Amarillo', color: '#eab308', border: '#854d0e' },
  { id: 'pink', name: 'Rosa', color: '#ec4899', border: '#9d174d' },
]

const leftWires = ref([...wireColors])
const rightWires = ref([])
const connections = ref({}) // { red: 'red', ... }
const activeWire = ref(null) // currently selected wire id from left

const initWires = () => {
  connections.value = {}
  activeWire.value = null
  // Shuffle right sockets
  const shuffled = [...wireColors].sort(() => Math.random() - 0.5)
  rightWires.value = shuffled
}

const selectLeftWire = (wireId) => {
  if (completedTasks.value.wires) return
  sounds.playBeep(450, 0.08)
  activeWire.value = wireId
}

const connectToRight = (targetId) => {
  if (!activeWire.value || completedTasks.value.wires) return

  if (activeWire.value === targetId) {
    // Correct wire!
    connections.value[activeWire.value] = targetId
    sounds.playSpark()
    activeWire.value = null

    // Check if all connected
    if (Object.keys(connections.value).length === 4) {
      completedTasks.value.wires = true
      sounds.playTaskComplete()
      triggerCelebration()
    }
  } else {
    // Wrong wire
    sounds.playCardError()
    activeWire.value = null
  }
}

// ==========================================
// TASK 2: SWIPE CARD (DESLIZAR TARJETA)
// ==========================================
const cardStatus = ref('idle') // 'idle', 'swiping', 'accepted', 'too_fast', 'too_slow', 'bad_read'
const cardMessage = ref('DESLIZA LA TARJETA VIP')
const cardPosition = ref(0) // 0 to 100 percentage
let swipeStartTime = 0
let isDraggingCard = false

const onCardPointerDown = (e) => {
  if (completedTasks.value.card) return
  isDraggingCard = true
  swipeStartTime = Date.now()
  cardStatus.value = 'swiping'
  cardMessage.value = 'LEYENDO TARJETA...'
  sounds.playBeep(500, 0.05)
}

const onCardPointerMove = (e, containerWidth) => {
  if (!isDraggingCard) return
  // Handle drag progress
  // We can measure relative mouse/touch movement
}

// Simplified swipe trigger for accessible and smooth mobile & desktop play:
const testCardSwipe = (speed) => {
  if (completedTasks.value.card) return
  cardStatus.value = 'swiping'

  if (speed === 'fast') {
    sounds.playCardError()
    cardStatus.value = 'too_fast'
    cardMessage.value = 'DEMASIADO RÁPIDO. INTENTA DE NUEVO.'
  } else if (speed === 'slow') {
    sounds.playCardError()
    cardStatus.value = 'too_slow'
    cardMessage.value = 'DEMASIADO LENTO. INTENTA DE NUEVO.'
  } else {
    // Perfect!
    sounds.playCardAccept()
    cardStatus.value = 'accepted'
    cardMessage.value = '¡ACEPTADO! PASE VIP CONCEDIDO 🎉'
    completedTasks.value.card = true
    if (completedTasks.value.wires) {
      sounds.playFanfare()
    } else {
      sounds.playTaskComplete()
    }
    triggerCelebration()
  }
}

// Confetti blast
const triggerCelebration = () => {
  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#ef4444', '#06b6d4', '#ec4899', '#eab308', '#a855f7'],
  })
}

const resetAllTasks = () => {
  completedTasks.value = { wires: false, card: false }
  cardStatus.value = 'idle'
  cardMessage.value = 'DESLIZA LA TARJETA VIP'
  initWires()
}

onMounted(() => {
  initWires()
})
</script>

<template>
  <div id="minijuego" class="w-full max-w-4xl mx-auto my-12 px-4 scroll-mt-20">
    <!-- Panel Outer Shell styled like Among Us Task Station -->
    <div
      class="bg-slate-900/90 border-4 border-slate-700 rounded-3xl p-5 sm:p-7 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden"
    >
      <!-- Task Header & Global Progress Bar -->
      <div class="mb-6">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 bg-yellow-400 text-black text-xs font-black tracking-wider uppercase rounded-md font-mono">
              TAREA DE TRIPULACIÓN
            </span>
            <h3 class="text-xl sm:text-2xl font-black text-white tracking-wide">
              Módulo de Misiones
            </h3>
          </div>
          <button
            @click="resetAllTasks"
            class="text-xs font-mono text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
          >
            Reiniciar Tareas ↺
          </button>
        </div>

        <!-- Classic Among Us Green Task Bar -->
        <div class="w-full bg-slate-950 rounded-lg p-1 border-2 border-slate-600 shadow-inner">
          <div class="flex items-center justify-between px-2 text-[11px] font-mono font-bold text-slate-300 mb-0.5">
            <span>TOTAL TASKS COMPLETED</span>
            <span :class="overallProgress === 100 ? 'text-green-400' : 'text-yellow-400'">
              {{ overallProgress }}%
            </span>
          </div>
          <div class="w-full h-4 bg-slate-800 rounded overflow-hidden relative">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500 rounded relative"
              :style="{ width: `${overallProgress}%` }"
            >
              <!-- Glowing line edge -->
              <div class="absolute right-0 top-0 bottom-0 w-1 bg-white/70 shadow-[0_0_8px_#4ade80]" />
            </div>
          </div>
        </div>
      </div>

      <!-- Task Tabs Navigation -->
      <div class="flex gap-2 sm:gap-3 mb-6 border-b border-slate-700/80 pb-3">
        <button
          @click="activeTab = 'wires'"
          class="flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border"
          :class="
            activeTab === 'wires'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-slate-800/60 text-slate-400 border-transparent hover:bg-slate-800'
          "
        >
          <span>⚡ 1. Conectar Cables</span>
          <span
            v-if="completedTasks.wires"
            class="w-4 h-4 rounded-full bg-green-500 text-black text-[10px] flex items-center justify-center font-black"
          >
            ✓
          </span>
        </button>

        <button
          @click="activeTab = 'card'"
          class="flex-1 py-2.5 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border"
          :class="
            activeTab === 'card'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'bg-slate-800/60 text-slate-400 border-transparent hover:bg-slate-800'
          "
        >
          <span>💳 2. Deslizar Tarjeta VIP</span>
          <span
            v-if="completedTasks.card"
            class="w-4 h-4 rounded-full bg-green-500 text-black text-[10px] flex items-center justify-center font-black"
          >
            ✓
          </span>
        </button>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: FIX WIRING MINIGAME -->
      <!-- ========================================== -->
      <div v-if="activeTab === 'wires'" class="relative">
        <div class="text-center mb-4">
          <p class="text-xs sm:text-sm text-cyan-300/80">
            Une cada cable de la izquierda con su color correspondiente en la derecha para restablecer la energía del salón de fiestas.
          </p>
        </div>

        <!-- Wire Box Canvas / Container -->
        <div
          class="bg-zinc-900 border-4 border-zinc-700 rounded-2xl p-4 sm:p-6 shadow-inner relative max-w-lg mx-auto"
        >
          <!-- Screws on corners -->
          <div class="absolute top-2 left-2 w-3 h-3 rounded-full bg-zinc-600 border border-zinc-800 flex items-center justify-center text-[8px] text-zinc-900 font-bold">+</div>
          <div class="absolute top-2 right-2 w-3 h-3 rounded-full bg-zinc-600 border border-zinc-800 flex items-center justify-center text-[8px] text-zinc-900 font-bold">+</div>
          <div class="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-zinc-600 border border-zinc-800 flex items-center justify-center text-[8px] text-zinc-900 font-bold">+</div>
          <div class="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-zinc-600 border border-zinc-800 flex items-center justify-center text-[8px] text-zinc-900 font-bold">+</div>

          <div class="flex justify-between items-center py-2 sm:py-4">
            <!-- Left Side Wires -->
            <div class="flex flex-col gap-5 sm:gap-6">
              <div
                v-for="wire in leftWires"
                :key="wire.id"
                class="flex items-center gap-2"
              >
                <!-- Wire Plug Button -->
                <button
                  @click="selectLeftWire(wire.id)"
                  :disabled="completedTasks.wires || connections[wire.id]"
                  class="group flex items-center transition-all cursor-pointer disabled:cursor-default"
                >
                  <div
                    class="w-8 sm:w-12 h-6 sm:h-7 rounded-l-md border-2 border-black flex items-center justify-center shadow-md relative transition-transform duration-150"
                    :style="{ backgroundColor: wire.color }"
                    :class="{
                      'scale-110 ring-4 ring-white shadow-[0_0_15px_#fff]': activeWire === wire.id,
                      'opacity-70': connections[wire.id],
                    }"
                  >
                    <!-- Brass tip -->
                    <div class="absolute -right-2 w-2 h-3.5 bg-yellow-300 border border-black rounded-r-xs" />
                  </div>
                </button>
                <span class="text-[11px] sm:text-xs font-mono font-bold uppercase text-slate-300">
                  {{ wire.name }}
                </span>
              </div>
            </div>

            <!-- Visual Connection Lines / Hints in the center -->
            <div class="flex-1 flex flex-col items-center justify-center px-2">
              <div
                v-if="activeWire"
                class="text-xs font-mono font-bold text-yellow-300 animate-pulse bg-black/60 px-2 py-1 rounded border border-yellow-400/40 text-center"
              >
                Toca el contacto {{ leftWires.find(w => w.id === activeWire)?.name }} 👉
              </div>
              <div v-else-if="!completedTasks.wires" class="text-[11px] text-slate-500 font-mono text-center">
                Selecciona un cable a la izquierda
              </div>
            </div>

            <!-- Right Side Sockets -->
            <div class="flex flex-col gap-5 sm:gap-6 items-end">
              <div
                v-for="socket in rightWires"
                :key="socket.id"
                class="flex items-center gap-2 flex-row-reverse"
              >
                <!-- Socket Button -->
                <button
                  @click="connectToRight(socket.id)"
                  :disabled="completedTasks.wires || connections[socket.id]"
                  class="group flex items-center transition-all cursor-pointer disabled:cursor-default"
                >
                  <div
                    class="w-8 sm:w-12 h-6 sm:h-7 rounded-r-md border-2 border-black flex items-center justify-center shadow-md relative transition-transform duration-150"
                    :style="{ backgroundColor: socket.color }"
                    :class="{
                      'ring-2 ring-yellow-300 animate-pulse': activeWire === socket.id,
                      'opacity-100': connections[socket.id],
                      'opacity-60': !connections[socket.id],
                    }"
                  >
                    <!-- Socket slot -->
                    <div class="absolute -left-2 w-2 h-3.5 bg-slate-900 border border-black rounded-l-xs flex items-center justify-center">
                      <div
                        v-if="connections[socket.id]"
                        class="w-1.5 h-2 bg-yellow-400 rounded-xs"
                      />
                    </div>
                  </div>
                </button>
                <span class="text-[11px] sm:text-xs font-mono font-bold uppercase text-slate-300">
                  {{ socket.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Connection Status Notification -->
          <div class="mt-4 pt-3 border-t border-zinc-700/80 text-center">
            <div
              v-if="completedTasks.wires"
              class="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 px-4 py-2 rounded-xl font-bold font-mono text-sm animate-bounce"
            >
              <span>⚡ TAREA COMPLETADA: CABLES REPARADOS</span>
            </div>
            <div v-else class="text-xs font-mono text-slate-400">
              Cables conectados: {{ Object.keys(connections).length }} / 4
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: SWIPE CARD MINIGAME -->
      <!-- ========================================== -->
      <div v-else class="relative">
        <div class="text-center mb-4">
          <p class="text-xs sm:text-sm text-cyan-300/80">
            Escanea tu credencial de tripulante para conseguir el Pase VIP a la fiesta de {{ EVENT_CONFIG.celebrant.name }}.
          </p>
        </div>

        <div class="max-w-md mx-auto bg-zinc-900 border-4 border-zinc-700 rounded-2xl p-5 sm:p-6 shadow-inner text-center">
          <!-- Card Reader Top Screen -->
          <div
            class="bg-black border-2 border-zinc-600 rounded-xl p-4 mb-5 shadow-inner transition-colors duration-300"
            :class="{
              'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]': cardStatus === 'accepted',
              'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]': cardStatus === 'too_fast' || cardStatus === 'too_slow',
            }"
          >
            <!-- Indicator LED Lights -->
            <div class="flex justify-end gap-2 mb-2">
              <div
                class="w-3 h-3 rounded-full border border-black"
                :class="cardStatus === 'too_fast' || cardStatus === 'too_slow' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-red-950'"
              />
              <div
                class="w-3 h-3 rounded-full border border-black"
                :class="cardStatus === 'accepted' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-green-950'"
              />
            </div>
            <p
              class="font-mono text-sm sm:text-base font-black tracking-wider uppercase"
              :class="{
                'text-green-400': cardStatus === 'accepted',
                'text-red-400': cardStatus === 'too_fast' || cardStatus === 'too_slow',
                'text-cyan-300': cardStatus === 'idle' || cardStatus === 'swiping',
              }"
            >
              {{ cardMessage }}
            </p>
          </div>

          <!-- The VIP Card Preview -->
          <div class="mb-5 flex justify-center">
            <div
              class="w-64 h-36 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 rounded-xl p-3 text-left shadow-xl border-2 border-white/30 relative overflow-hidden transition-transform duration-300"
              :class="cardStatus === 'accepted' ? 'scale-105 shadow-[0_0_25px_rgba(236,72,153,0.6)]' : ''"
            >
              <!-- Magnetic strip -->
              <div class="absolute bottom-2 left-0 right-0 h-4 bg-black/70" />
              <!-- Hologram chip -->
              <div class="w-7 h-5 rounded bg-yellow-300/80 border border-yellow-500 mb-2 flex items-center justify-center">
                <div class="w-3 h-2 border border-black/30 rounded-xs" />
              </div>
              <p class="text-[10px] uppercase font-mono tracking-widest text-pink-200 font-bold">
                ACCESO VIP A LA FIESTA
              </p>
              <h4 class="text-base font-black text-white leading-tight">
                {{ EVENT_CONFIG.celebrant.name }}'s Birthday
              </h4>
              <p class="text-[9px] font-mono text-white/80 mt-1">
                SECTOR THE SKELD • NIVEL 100
              </p>
            </div>
          </div>

          <!-- Reader Swipe Controls -->
          <div class="flex flex-col gap-2">
            <p class="text-xs text-slate-400 font-mono mb-1">
              Prueba la velocidad de deslizamiento:
            </p>
            <div class="flex gap-2 justify-center">
              <button
                @click="testCardSwipe('fast')"
                class="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-mono font-bold text-slate-300 rounded-lg border border-slate-600 cursor-pointer"
              >
                💨 Muy Rápido
              </button>
              <button
                @click="testCardSwipe('perfect')"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-mono font-black text-white rounded-lg border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                ✨ Deslizar Perfecto
              </button>
              <button
                @click="testCardSwipe('slow')"
                class="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-mono font-bold text-slate-300 rounded-lg border border-slate-600 cursor-pointer"
              >
                🐢 Muy Lento
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- VICTORY REWARD MODAL / BANNER -->
      <!-- ========================================== -->
      <div
        v-if="overallProgress === 100"
        class="mt-6 p-4 sm:p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border-2 border-emerald-400/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-[0_0_30px_rgba(52,211,153,0.3)]"
      >
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-2xl">
            🏆
          </div>
          <div>
            <h4 class="font-black text-emerald-300 text-lg sm:text-xl">
              ¡TODAS LAS TAREAS COMPLETADAS!
            </h4>
            <p class="text-xs sm:text-sm text-slate-300">
              ¡Eres un tripulante legendario! Ya tienes tu pase de abordaje garantizado.
            </p>
          </div>
        </div>

        <a
          href="#confirmacion"
          class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-sm rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          Confirmar Asistencia Ahora 🚀
        </a>
      </div>
    </div>
  </div>
</template>
