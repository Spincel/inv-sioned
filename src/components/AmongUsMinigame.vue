<script setup>
import confetti from 'canvas-confetti'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'

const emit = defineEmits(['toCustomizer', 'toRsvp', 'viewShip'])

// Active Tab: 'wires' | 'download' | 'trivia' | 'victory'
const activeTab = ref('wires')

const completedTasks = ref({
  wires: false,
  download: false,
  trivia: false,
})

const overallProgress = computed(() => {
  let done = 0
  if (completedTasks.value.wires) done += 33
  if (completedTasks.value.download) done += 33
  if (completedTasks.value.trivia) done += 34
  return done
})

const isAllCompleted = computed(() => {
  return completedTasks.value.wires && completedTasks.value.download && completedTasks.value.trivia
})

// ==========================================
// TAREA 1: ALINEAR EL ESCUDO (CABLES / MOTORES)
// ==========================================
const wireColors = [
  { id: 'red', name: 'Rojo', color: '#ef4444', border: '#991b1b', glow: 'rgba(239,68,68,0.8)' },
  { id: 'blue', name: 'Azul', color: '#3b82f6', border: '#1e40af', glow: 'rgba(59,130,246,0.8)' },
  { id: 'yellow', name: 'Amarillo', color: '#eab308', border: '#854d0e', glow: 'rgba(234,179,8,0.8)' },
  { id: 'pink', name: 'Rosa', color: '#ec4899', border: '#9d174d', glow: 'rgba(236,72,153,0.8)' },
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
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } })
    }
  } else {
    // Wrong wire
    sounds.playCardError()
    activeWire.value = null
  }
}

// ==========================================
// TAREA 2: DESCARGA DE DATOS (BARRA & OBSTÁCULOS)
// ==========================================
const downloadProgress = ref(0)
const isDownloading = ref(false)
const downloadSpeed = ref('0 KB/s')
let downloadInterval = null

// Obstacle state: { active: bool, type: 'asteroid' | 'impostor', x: number }
const obstacle = ref({
  active: false,
  type: 'asteroid',
  x: 20,
})

const startDownloading = () => {
  if (completedTasks.value.download) return
  isDownloading.value = true

  if (!downloadInterval) {
    downloadInterval = setInterval(() => {
      if (downloadProgress.value < 100) {
        // Increment progress
        downloadProgress.value = Math.min(100, downloadProgress.value + 2)
        sounds.playDownloadTick()
        downloadSpeed.value = `${Math.floor(180 + Math.random() * 80)} KB/s`

        // Trigger obstacles at 32% and 68%
        if (downloadProgress.value >= 32 && downloadProgress.value <= 34 && !obstacle.value.active) {
          spawnObstacle('asteroid')
        } else if (downloadProgress.value >= 68 && downloadProgress.value <= 70 && !obstacle.value.active) {
          spawnObstacle('impostor')
        }

        if (downloadProgress.value >= 100) {
          stopDownloading()
          completedTasks.value.download = true
          sounds.playTaskComplete()
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
        }
      }
    }, 120)
  }
}

const stopDownloading = () => {
  isDownloading.value = false
  if (downloadInterval) {
    clearInterval(downloadInterval)
    downloadInterval = null
  }
  downloadSpeed.value = '0 KB/s'
}

// Single tap download boost for mobile tapping
const tapDownload = () => {
  if (completedTasks.value.download) return
  downloadProgress.value = Math.min(100, downloadProgress.value + 4)
  sounds.playDownloadTick()
  downloadSpeed.value = '240 KB/s'

  if (downloadProgress.value >= 32 && downloadProgress.value <= 36 && !obstacle.value.active) {
    spawnObstacle('asteroid')
  } else if (downloadProgress.value >= 68 && downloadProgress.value <= 72 && !obstacle.value.active) {
    spawnObstacle('impostor')
  }

  if (downloadProgress.value >= 100) {
    completedTasks.value.download = true
    sounds.playTaskComplete()
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
  }
}

const spawnObstacle = (type) => {
  obstacle.value = {
    active: true,
    type,
    x: Math.floor(25 + Math.random() * 50),
  }
  sounds.playEmergency()
}

const destroyObstacle = () => {
  if (!obstacle.value.active) return
  sounds.playLaserPop()
  obstacle.value.active = false
  // Bonus progress for zapping the obstacle!
  downloadProgress.value = Math.min(100, downloadProgress.value + 15)
  confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } })
}

// ==========================================
// TAREA 3: ¿QUIÉN ES EL IMPOSTOR? (TRIVIA)
// ==========================================
const triviaQuestions = [
  {
    question: '¿Cuántos años cumple Sioned en esta misión espacial?',
    options: ['6 años', '8 años', '10 años', '5 años'],
    correct: '8 años',
  },
  {
    question: '¿Cuál es la base secreta para brincar en los trampolines?',
    options: ['En el Polo Norte', 'Chak Jumping Park (Tepic)', 'En un submarino', 'En la Luna'],
    correct: 'Chak Jumping Park (Tepic)',
  },
  {
    question: '¿Qué equipo es OBLIGATORIO llevar para brincar?',
    options: ['Patines con ruedas', 'Ropa cómoda y calcetas', 'Zapatos de gala', 'Botas de nieve'],
    correct: 'Ropa cómoda y calcetas',
  },
]

const currentQuestionIndex = ref(0)
const triviaStatus = ref('asking') // 'asking' | 'ejected' | 'success'
const ejectedName = ref('')

const handleAnswer = (option) => {
  const currentQ = triviaQuestions[currentQuestionIndex.value]

  if (option === currentQ.correct) {
    sounds.playCardAccept()
    if (currentQuestionIndex.value < triviaQuestions.length - 1) {
      currentQuestionIndex.value += 1
    } else {
      // Completed all trivia!
      completedTasks.value.trivia = true
      sounds.playTaskComplete()
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } })
      // Auto switch to victory!
      setTimeout(() => {
        activeTab.value = 'victory'
        sounds.playFanfare()
      }, 900)
    }
  } else {
    // Ejection scene!
    ejectedName.value = option
    triviaStatus.value = 'ejected'
    sounds.playEjected()
  }
}

const retryTrivia = () => {
  sounds.playBeep(500, 0.05)
  triviaStatus.value = 'asking'
}

// Reset all tasks
const resetAllTasks = () => {
  sounds.playSabotage()
  completedTasks.value = {
    wires: false,
    download: false,
    trivia: false,
  }
  initWires()
  downloadProgress.value = 0
  obstacle.value.active = false
  currentQuestionIndex.value = 0
  triviaStatus.value = 'asking'
  activeTab.value = 'wires'
}

// Generate & Download Wallpaper
const isDownloadingWallpaper = ref(false)

const generateWallpaper = () => {
  sounds.playTaskComplete()
  isDownloadingWallpaper.value = true

  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')

  // 1. Deep Space Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 1920)
  grad.addColorStop(0, '#020617')
  grad.addColorStop(0.4, '#090d24')
  grad.addColorStop(0.7, '#1e1145')
  grad.addColorStop(1, '#020617')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1080, 1920)

  // 2. Stars
  for (let i = 0; i < 250; i++) {
    const sx = Math.random() * 1080
    const sy = Math.random() * 1920
    const sr = Math.random() * 2.8 + 0.5
    ctx.fillStyle = Math.random() > 0.3 ? '#ffffff' : '#38bdf8'
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fill()
  }

  // 3. Glowing Nebula circles
  const neb = ctx.createRadialGradient(540, 750, 40, 540, 750, 450)
  neb.addColorStop(0, 'rgba(6,182,212,0.35)')
  neb.addColorStop(0.5, 'rgba(168,85,247,0.25)')
  neb.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = neb
  ctx.fillRect(0, 0, 1080, 1920)

  // 4. Large Crewmate Silhouette / Drawing
  ctx.save()
  ctx.translate(540, 780)
  // Body (Red)
  ctx.fillStyle = '#ef4444'
  ctx.beginPath()
  ctx.roundRect(-140, -170, 280, 340, [140, 140, 40, 40])
  ctx.fill()
  ctx.lineWidth = 16
  ctx.strokeStyle = '#7f1d1d'
  ctx.stroke()

  // Backpack
  ctx.fillStyle = '#dc2626'
  ctx.beginPath()
  ctx.roundRect(-190, -100, 60, 200, 30)
  ctx.fill()
  ctx.stroke()

  // Visor
  ctx.fillStyle = '#67e8f9'
  ctx.beginPath()
  ctx.roundRect(-50, -120, 220, 120, 60)
  ctx.fill()
  ctx.strokeStyle = '#0e7490'
  ctx.lineWidth = 14
  ctx.stroke()

  // Visor Reflection
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.beginPath()
  ctx.roundRect(-15, -105, 120, 45, 20)
  ctx.fill()

  // Party Crown / Hat
  ctx.fillStyle = '#eab308'
  ctx.beginPath()
  ctx.moveTo(-70, -170)
  ctx.lineTo(-40, -250)
  ctx.lineTo(0, -185)
  ctx.lineTo(40, -250)
  ctx.lineTo(70, -170)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#854d0e'
  ctx.lineWidth = 10
  ctx.stroke()
  ctx.restore()

  // 5. Typography
  ctx.textAlign = 'center'

  // Header Subtitle
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 36px monospace'
  ctx.fillText('MISIÓN ESPACIAL • THE SKELD', 540, 1180)

  // Main Birthday Title
  ctx.fillStyle = '#ffffff'
  ctx.font = '900 76px system-ui, sans-serif'
  ctx.fillText('CUMPLEAÑOS DE SIONED', 540, 1280)

  // Big 8 Años Badge
  ctx.fillStyle = '#facc15'
  ctx.font = '900 110px system-ui, sans-serif'
  ctx.fillText('¡8 AÑOS!', 540, 1400)

  // Venue & Date
  ctx.fillStyle = '#a7f3d0'
  ctx.font = 'bold 44px monospace'
  ctx.fillText('CHAK JUMPING PARK 🤸‍♂️ TEPIC', 540, 1500)

  ctx.fillStyle = '#e2e8f0'
  ctx.font = 'bold 36px monospace'
  ctx.fillText('SÁBADO 25 DE OCTUBRE • 3:00 PM', 540, 1560)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '30px monospace'
  ctx.fillText('CALCETAS Y ROPA CÓMODA PARA BRINCAR', 540, 1620)

  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 32px monospace'
  ctx.fillText('★ TRIPULANTE OFICIAL AUTORIZADO ★', 540, 1750)

  // 6. Trigger Download
  const dataUrl = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `fondo-pantalla-sioned-8-anos.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  setTimeout(() => {
    isDownloadingWallpaper.value = false
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } })
  }, 1000)
}

onMounted(() => {
  initWires()
})

onUnmounted(() => {
  stopDownloading()
})
</script>

<template>
  <div class="w-full max-w-2xl mx-auto py-1 px-1 sm:px-2 select-none">
    <div class="bg-slate-950/80 border-2 border-cyan-500/60 rounded-3xl p-3 sm:p-5 shadow-[0_0_35px_rgba(6,182,212,0.25)] relative overflow-hidden">
      <!-- Top Title & Reset Bar -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 bg-yellow-400 text-black font-mono text-[10px] sm:text-xs font-black uppercase rounded-full shadow">
            TAREAS DE TRIPULACIÓN
          </span>
          <h3 class="text-sm sm:text-base font-black text-white font-mono">
            Misiones de Sioned
          </h3>
        </div>

        <button
          @click="resetAllTasks"
          class="text-[10px] sm:text-xs font-mono text-cyan-400 hover:text-white underline cursor-pointer"
        >
          Reiniciar Tareas 🔄
        </button>
      </div>

      <!-- OVERALL PROGRESS BAR (ICONIC AMONG US GREEN BAR) -->
      <div class="bg-slate-900/90 border-2 border-slate-700 rounded-xl p-2 mb-3 shadow-inner">
        <div class="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300 uppercase mb-1">
          <span>TOTAL TASKS COMPLETED</span>
          <span class="text-emerald-400 font-black text-xs">{{ overallProgress }}%</span>
        </div>
        <div class="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            class="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
            :style="{ width: `${overallProgress}%` }"
          />
        </div>
      </div>

      <!-- 3 TABS SWITCHER (OR VICTORY TAB) -->
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-1.5 mb-4">
        <!-- Tab 1: Wires -->
        <button
          @click="activeTab = 'wires'"
          class="py-1.5 px-2 rounded-xl font-mono text-[10px] sm:text-xs font-bold border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
          :class="
            activeTab === 'wires'
              ? 'bg-slate-800 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
          "
        >
          <span>⚡ 1. Cables</span>
          <span class="text-[9px]" :class="completedTasks.wires ? 'text-emerald-400 font-bold' : 'text-slate-500'">
            {{ completedTasks.wires ? '✅ Lista' : 'Pendiente' }}
          </span>
        </button>

        <!-- Tab 2: Download -->
        <button
          @click="activeTab = 'download'"
          class="py-1.5 px-2 rounded-xl font-mono text-[10px] sm:text-xs font-bold border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
          :class="
            activeTab === 'download'
              ? 'bg-slate-800 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
          "
        >
          <span>📥 2. Descarga</span>
          <span class="text-[9px]" :class="completedTasks.download ? 'text-emerald-400 font-bold' : 'text-slate-500'">
            {{ completedTasks.download ? '✅ Lista' : 'Pendiente' }}
          </span>
        </button>

        <!-- Tab 3: Trivia -->
        <button
          @click="activeTab = 'trivia'"
          class="py-1.5 px-2 rounded-xl font-mono text-[10px] sm:text-xs font-bold border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5"
          :class="
            activeTab === 'trivia'
              ? 'bg-slate-800 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
          "
        >
          <span>🔍 3. Impostor</span>
          <span class="text-[9px]" :class="completedTasks.trivia ? 'text-emerald-400 font-bold' : 'text-slate-500'">
            {{ completedTasks.trivia ? '✅ Lista' : 'Pendiente' }}
          </span>
        </button>

        <!-- Tab 4: Victory (only when unlocked or completed) -->
        <button
          @click="activeTab = 'victory'"
          class="py-1.5 px-2 rounded-xl font-mono text-[10px] sm:text-xs font-black border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 col-span-3 sm:col-span-1"
          :class="
            activeTab === 'victory'
              ? 'bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-300 text-black shadow-[0_0_15px_rgba(234,179,8,0.8)]'
              : isAllCompleted
                ? 'bg-yellow-950/40 border-yellow-500/70 text-yellow-300 animate-pulse'
                : 'bg-slate-950/40 border-slate-800 text-slate-600'
          "
        >
          <span>🏆 Victoria</span>
          <span class="text-[9px]">{{ isAllCompleted ? '¡Desbloqueado!' : 'Bloqueado' }}</span>
        </button>
      </div>

      <!-- ======================================================== -->
      <!-- TAREA 1: ALINEAR EL ESCUDO (CABLES / MOTORES DEL PASTEL) -->
      <!-- ======================================================== -->
      <div v-show="activeTab === 'wires'" class="space-y-3">
        <div class="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 text-center">
          <p class="text-xs sm:text-sm font-bold text-cyan-200 font-mono">
            🔌 Conecta los cables para activar el escudo y encender los motores del pastel 🎂🚀
          </p>
          <p class="text-[10px] text-slate-300 mt-0.5">
            1. Toca un cable a la izquierda • 2. Toca su color correspondiente a la derecha.
          </p>
        </div>

        <!-- Wiring Terminal Box -->
        <div class="relative bg-slate-900 border-4 border-slate-700 rounded-3xl p-3 sm:p-5 shadow-2xl overflow-hidden">
          <!-- Corner bolts -->
          <span class="absolute top-2 left-2 text-slate-600 text-xs">⚙️</span>
          <span class="absolute top-2 right-2 text-slate-600 text-xs">⚙️</span>
          <span class="absolute bottom-2 left-2 text-slate-600 text-xs">⚙️</span>
          <span class="absolute bottom-2 right-2 text-slate-600 text-xs">⚙️</span>

          <!-- Left & Right Wire Sockets -->
          <div class="grid grid-cols-2 gap-4 sm:gap-10 my-2">
            <!-- Left Sockets -->
            <div class="space-y-3">
              <div
                v-for="wire in leftWires"
                :key="wire.id"
                @click="selectLeftWire(wire.id)"
                class="flex items-center gap-2 cursor-pointer transition-all active:scale-95 group"
              >
                <!-- Wire Head Button with Neon glow -->
                <button
                  type="button"
                  class="w-14 sm:w-20 h-9 sm:h-11 rounded-r-2xl border-3 flex items-center justify-center font-mono font-black text-[10px] sm:text-xs text-white uppercase shadow-md transition-all"
                  :style="{
                    backgroundColor: wire.color,
                    borderColor: wire.border,
                    boxShadow: activeWire === wire.id ? `0 0 20px ${wire.glow}` : 'none',
                    transform: activeWire === wire.id ? 'translateX(6px)' : 'none',
                  }"
                >
                  {{ wire.name }}
                </button>
                <!-- Terminal socket plug -->
                <div
                  class="w-3.5 h-3.5 rounded-full border-2 transition-colors"
                  :class="connections[wire.id] ? 'bg-emerald-400 border-white shadow-[0_0_8px_#34d399]' : 'bg-slate-800 border-slate-600'"
                />
              </div>
            </div>

            <!-- Right Destination Sockets -->
            <div class="space-y-3 flex flex-col items-end">
              <div
                v-for="wire in rightWires"
                :key="wire.id"
                @click="connectToRight(wire.id)"
                class="flex items-center gap-2 cursor-pointer transition-all active:scale-95 group flex-row-reverse"
              >
                <!-- Right socket button -->
                <button
                  type="button"
                  class="w-14 sm:w-20 h-9 sm:h-11 rounded-l-2xl border-3 flex items-center justify-center font-mono font-black text-[10px] sm:text-xs text-white uppercase shadow-md transition-all"
                  :style="{
                    backgroundColor: wire.color,
                    borderColor: wire.border,
                    boxShadow: Object.values(connections).includes(wire.id) ? `0 0 15px ${wire.glow}` : 'none',
                  }"
                >
                  {{ wire.name }}
                </button>
                <!-- Terminal socket plug -->
                <div
                  class="w-3.5 h-3.5 rounded-full border-2 transition-colors"
                  :class="Object.values(connections).includes(wire.id) ? 'bg-emerald-400 border-white shadow-[0_0_8px_#34d399]' : 'bg-slate-800 border-slate-600'"
                />
              </div>
            </div>
          </div>

          <!-- Task Completed Banner -->
          <div v-if="completedTasks.wires" class="mt-4 pt-3 border-t-2 border-emerald-500/40 text-center animate-fade-in space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-black rounded-full border border-emerald-400">
              <span>🎂 MOTORES DEL PASTEL ENCENDIDOS (+33%)</span>
            </div>
            <div>
              <button
                @click="activeTab = 'download'"
                class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-mono text-xs font-black uppercase rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>¡Siguiente Tarea: Descarga de Datos! 📥 ➡</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAREA 2: DESCARGA DE DATOS (BARRA & ESQUIVAR OBSTÁCULOS) -->
      <!-- ======================================================== -->
      <div v-show="activeTab === 'download'" class="space-y-3">
        <div class="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 text-center">
          <p class="text-xs sm:text-sm font-bold text-cyan-200 font-mono">
            💾 Descarga los datos de la fiesta en Chak Jumping Park
          </p>
          <p class="text-[10px] text-slate-300 mt-0.5">
            Mantén presionado o da toques rápidos en el botón. ¡Cuidado con los sabotajes!
          </p>
        </div>

        <!-- Download Terminal -->
        <div class="relative bg-slate-900 border-4 border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden min-h-[260px] flex flex-col justify-between">
          <!-- Top file info -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">📁</span>
              <span class="font-mono text-[11px] sm:text-xs text-slate-200 font-bold">
                PLANOS_FIESTA_CHAK_2026.DAT
              </span>
            </div>
            <span class="font-mono text-[11px] text-cyan-400 font-bold">
              {{ downloadSpeed }}
            </span>
          </div>

          <!-- OBSTACLE ALERT FLYING OVER (ASTEROID OR IMPOSTOR) -->
          <div
            v-if="obstacle.active"
            @click="destroyObstacle"
            class="absolute inset-x-4 top-14 bg-red-950/90 border-2 border-red-500 rounded-2xl p-3 z-30 cursor-pointer shadow-[0_0_30px_rgba(239,68,68,0.8)] animate-bounce-subtle flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <span class="text-3xl animate-spin-slow">
                {{ obstacle.type === 'asteroid' ? '🪨' : '👾' }}
              </span>
              <div>
                <p class="font-mono text-xs font-black text-red-200 uppercase">
                  {{ obstacle.type === 'asteroid' ? '⚠️ ¡ASTEROIDE EN TRAYECTORIA!' : '⚠️ ¡IMPOSTOR SABOTEANDO LA DESCARGA!' }}
                </p>
                <p class="font-mono text-[10px] text-yellow-300 font-bold">
                  👉 ¡TÓCALO RÁPIDO PARA DESTRUIRLO CON EL LÁSER! (+20% BONUS)
                </p>
              </div>
            </div>
            <button
              type="button"
              class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black rounded-lg border border-red-300 shadow"
            >
              💥 LÁSER
            </button>
          </div>

          <!-- Center: Graphic Transfer & Big Progress Bar -->
          <div class="my-4 space-y-3">
            <div class="flex items-center justify-between text-xs font-mono text-slate-300">
              <span>ESTADO DE TRANSFERENCIA</span>
              <span class="text-lg font-black text-emerald-400">{{ downloadProgress }}%</span>
            </div>

            <!-- Big Glowing Progress Bar -->
            <div class="w-full h-7 bg-slate-950 rounded-2xl overflow-hidden p-1 border-2 border-slate-700 shadow-inner">
              <div
                class="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-green-400 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(34,197,94,0.9)] flex items-center justify-end pr-2"
                :style="{ width: `${downloadProgress}%` }"
              >
                <span v-if="downloadProgress > 15" class="text-[10px] font-mono font-black text-slate-950">
                  {{ downloadProgress }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Action Button: Hold or Tap -->
          <div class="text-center pt-2">
            <button
              v-if="!completedTasks.download"
              type="button"
              @pointerdown="startDownloading"
              @pointerup="stopDownloading"
              @pointerleave="stopDownloading"
              @click="tapDownload"
              class="w-full py-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 active:scale-95 text-slate-950 font-mono text-sm font-black uppercase rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.6)] cursor-pointer transition-transform flex items-center justify-center gap-2"
            >
              <span>📥</span>
              <span>{{ isDownloading ? 'DESCARGANDO DATOS...' : 'MANTÉN O TOCA PARA DESCARGAR' }}</span>
            </button>

            <!-- Complete State -->
            <div v-else class="space-y-2 animate-fade-in">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-black rounded-full border border-emerald-400">
                <span>💾 ¡DATOS DESCARGADOS CON ÉXITO! (+33%)</span>
              </div>
              <div>
                <button
                  @click="activeTab = 'trivia'"
                  class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-mono text-xs font-black uppercase rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>¡Siguiente Tarea: ¿Quién es el Impostor? 🔍 ➡</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAREA 3: ¿QUIÉN ES EL IMPOSTOR? (TRIVIA DE CUMPLEAÑOS)   -->
      <!-- ========================================== -->
      <div v-show="activeTab === 'trivia'" class="space-y-3">
        <div class="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 text-center">
          <p class="text-xs sm:text-sm font-bold text-cyan-200 font-mono">
            🔍 Trivia de la Misión: ¿Quién conoce mejor a Sioned?
          </p>
          <p class="text-[10px] text-slate-300 mt-0.5">
            Pregunta {{ currentQuestionIndex + 1 }} de {{ triviaQuestions.length }}. ¡Si fallas serás expulsado al espacio!
          </p>
        </div>

        <!-- Trivia Box -->
        <div class="relative bg-slate-900 border-4 border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden min-h-[260px] flex flex-col justify-between">
          <!-- EJECTION SCREEN (WHEN WRONG ANSWER) -->
          <div
            v-if="triviaStatus === 'ejected'"
            class="absolute inset-0 bg-black/95 z-40 flex flex-col items-center justify-center p-4 text-center space-y-4 animate-fade-in"
          >
            <!-- Floating ejected crewmate -->
            <div class="w-20 h-20 animate-spin-slow">
              <CrewmateAvatar color="#ef4444" shadow-color="#7f1d1d" hat="none" :size="70" animation="none" />
            </div>

            <div class="space-y-1 font-mono">
              <p class="text-lg sm:text-xl font-black text-white">
                "{{ ejectedName }}" no era el Impostor.
              </p>
              <p class="text-xs text-red-400 font-bold">
                Queda 1 Impostor restante...
              </p>
            </div>

            <button
              @click="retryTrivia"
              class="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-black uppercase rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>🔄 Reintentar pregunta</span>
            </button>
          </div>

          <!-- NORMAL QUESTION INTERFACE -->
          <div v-else class="space-y-4">
            <!-- Question prompt -->
            <div class="bg-slate-950/80 border-2 border-indigo-500/40 rounded-2xl p-3 text-center">
              <span class="text-[10px] font-mono font-bold text-yellow-400 uppercase tracking-widest block mb-1">
                PREGUNTA #{{ currentQuestionIndex + 1 }}
              </span>
              <h4 class="text-sm sm:text-base font-black text-white font-mono">
                {{ triviaQuestions[currentQuestionIndex].question }}
              </h4>
            </div>

            <!-- Options Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                v-for="opt in triviaQuestions[currentQuestionIndex].options"
                :key="opt"
                @click="handleAnswer(opt)"
                class="p-3 bg-slate-950/90 hover:bg-slate-800 border-2 border-slate-700 hover:border-cyan-400 rounded-2xl font-mono text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-all cursor-pointer text-left flex items-center gap-2 active:scale-95 shadow"
              >
                <span class="w-2 h-2 rounded-full bg-cyan-400" />
                <span>{{ opt }}</span>
              </button>
            </div>

            <!-- Completed state if finished -->
            <div v-if="completedTasks.trivia" class="text-center pt-2">
              <button
                @click="activeTab = 'victory'"
                class="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-mono text-xs font-black uppercase rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                🏆 ¡Ver Pantalla de Victoria y Mensaje Secreto! ➡
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- PANTALLA DE VICTORIA Y MENSAJE SECRETO DE SIONED         -->
      <!-- ======================================================== -->
      <div v-show="activeTab === 'victory'" class="space-y-4 animate-fade-in">
        <!-- Giant Among Us Victory Banner -->
        <div class="text-center py-2">
          <h2 class="text-3xl sm:text-5xl font-black font-mono tracking-widest text-cyan-300 drop-shadow-[0_0_25px_rgba(6,182,212,0.9)] uppercase">
            VICTORIA
          </h2>
          <p class="text-xs sm:text-sm font-mono font-bold text-emerald-400 tracking-wider uppercase mt-1">
            ⭐ LA TRIPULACIÓN GANA • MISIÓN 100% COMPLETADA ⭐
          </p>
        </div>

        <!-- Secret Card from Sioned -->
        <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-yellow-400/80 rounded-3xl p-4 sm:p-5 shadow-[0_0_35px_rgba(250,204,21,0.3)] relative overflow-hidden">
          <div class="flex items-start gap-3 sm:gap-4">
            <div class="flex-shrink-0">
              <CrewmateAvatar color="#ef4444" shadow-color="#7f1d1d" hat="party-hat" :size="70" animation="none" />
              <p class="text-[9px] font-mono text-center text-yellow-300 font-bold mt-1">Sioned (8)</p>
            </div>

            <div class="space-y-1.5 flex-1 min-w-0">
              <span class="px-2.5 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 rounded-full font-mono text-[9px] sm:text-[10px] font-black uppercase">
                🌟 MENSAJE SECRETO DESBLOQUEADO
              </span>
              <h4 class="text-sm sm:text-base font-black text-white font-mono">
                ¡Gracias por reparar la nave espacial!
              </h4>
              <p class="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
                "¡Misión cumplida! Eres un verdadero tripulante de mi fiesta. Te espero este <strong>Sábado 25 de Octubre a las 3:00 PM</strong> en <strong>Chak Jumping Park</strong> para brincar juntos en los trampolines y partir el pastel espacial. ¡No olvides tu ropa cómoda y calcetas!"
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <!-- 1. Confirm RSVP Button -->
          <button
            @click="emit('toRsvp')"
            class="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-mono font-black text-xs uppercase rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>📝</span>
            <span>¡Confirmar mi Asistencia a la Misión!</span>
          </button>

          <!-- 2. Download Commemorative Wallpaper -->
          <button
            @click="generateWallpaper"
            :disabled="isDownloadingWallpaper"
            class="py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-mono font-black text-xs uppercase rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🖼️</span>
            <span>{{ isDownloadingWallpaper ? 'Generando Wallpaper...' : 'Descargar Fondo de Pantalla (HD)' }}</span>
          </button>
        </div>

        <!-- Return & Replay shortcuts -->
        <div class="flex items-center justify-between pt-1 px-1">
          <button
            @click="resetAllTasks"
            class="text-xs font-mono text-cyan-400 hover:text-white underline cursor-pointer"
          >
            🔄 Jugar las misiones de nuevo
          </button>

          <button
            @click="emit('viewShip')"
            class="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>🚀</span>
            <span>Volver a la nave</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
