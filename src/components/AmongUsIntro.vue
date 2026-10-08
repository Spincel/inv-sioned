<script setup>
import confetti from 'canvas-confetti'
import { computed, onMounted, ref } from 'vue'
import emergencyImg from '../assets/emergency-meeting.png'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'
import StarfieldBackground from './StarfieldBackground.vue'

const props = defineProps({
  confirmedData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['complete', 'confirm-rsvp'])

// Escenas del Reel Cinemático:
// 1: Alerta Roja (Botón de Emergencia)
// 2: La Misión (Cumpleaños de Sioned)
// 3: Coordenadas / Lugar (Chak Jumping Park)
// 4: Fecha, Horario y Equipamiento (Ropa cómoda y Calcetines)
// 5: Pase de Abordaje / Confirmación -> ¡Entrar a la Nave!
const scene = ref(1)
const totalScenes = 5

const isButtonPushed = ref(false)
const isTransitioningOut = ref(false)

// Datos para confirmación rápida en Escena 5
const guestName = ref('')
const attendance = ref('yes')
const companions = ref('0')
const selectedColor = ref(EVENT_CONFIG.crewColors[1] || { name: 'Cian', hex: '#06b6d4', dark: '#0e7490' })
const isSaving = ref(false)
const localConfirmed = ref(null)

onMounted(() => {
  // Si ya existía confirmación previa en este dispositivo
  if (props.confirmedData && props.confirmedData.name) {
    localConfirmed.value = props.confirmedData
    guestName.value = props.confirmedData.name
    companions.value = String(props.confirmedData.companions || '0')
    const matchColor = EVENT_CONFIG.crewColors.find((c) => c.hex === props.confirmedData.color)
    if (matchColor) selectedColor.value = matchColor
  } else {
    try {
      const raw = localStorage.getItem('sioned_my_confirmation')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.name) {
          localConfirmed.value = parsed
          guestName.value = parsed.name
          companions.value = String(parsed.companions || '0')
        }
      }
    } catch (e) {}
  }
})

// 1. Presionar el gran botón rojo de emergencia
const handlePressEmergencyButton = () => {
  if (isButtonPushed.value) return
  isButtonPushed.value = true

  // Iniciar audio
  sounds.startBgm()
  sounds.playEmergency()

  // Chispas de alarma
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.5 },
    colors: ['#ef4444', '#dc2626', '#f59e0b'],
  })

  // Transición a la Escena 2 (Misión)
  setTimeout(() => {
    sounds.playRoleReveal()
    scene.value = 2
  }, 1200)
}

// Navegación entre escenas
const nextScene = () => {
  if (scene.value < totalScenes) {
    sounds.playBeep(650, 0.06)
    scene.value++
  }
}

const prevScene = () => {
  if (scene.value > 1) {
    sounds.playBeep(500, 0.06)
    scene.value--
  }
}

// Enlaces GPS
const openMaps = () => {
  sounds.playBeep(600, 0.08)
  window.open(EVENT_CONFIG.location.mapsUrl, '_blank')
}

const openWaze = () => {
  sounds.playBeep(600, 0.08)
  window.open(EVENT_CONFIG.location.wazeUrl, '_blank')
}

// Envío rápido de RSVP en Escena 5
const handleQuickSubmit = async () => {
  if (!guestName.value.trim()) {
    sounds.playCardError()
    alert('¡Por favor ingresa tu nombre de tripulante!')
    return
  }

  isSaving.value = true
  sounds.playTaskComplete()

  const payload = {
    id: localConfirmed.value?.id || ('guest_' + Date.now()),
    name: guestName.value.trim(),
    color: selectedColor.value.hex,
    shadowColor: selectedColor.value.dark,
    hat: 'party-hat',
    colorName: selectedColor.value.name,
    companions: companions.value,
    attendance: attendance.value,
    message: '¡Listo para la fiesta en Chak Jumping Park! 🤸‍♂️🎂',
    updatedAt: new Date().toISOString(),
  }

  localConfirmed.value = payload

  // 1. Guardar en dispositivo
  try {
    localStorage.setItem('sioned_my_confirmation', JSON.stringify(payload))
  } catch (e) {}

  // 2. Enviar a Vercel API
  try {
    fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((e) => console.warn(e))
  } catch (e) {}

  // 3. Enviar a Google Sheets de Google Drive
  if (EVENT_CONFIG.rsvp?.googleSheetWebhookUrl) {
    try {
      fetch(EVENT_CONFIG.rsvp.googleSheetWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload),
      }).catch((e) => console.warn(e))
    } catch (e) {}
  }

  // Notificar al padre App.vue
  emit('confirm-rsvp', payload)
  isSaving.value = false

  // Lanzar hacia la nave
  launchToShip()
}

// Lanzamiento final hacia la Nave interactiva
const launchToShip = () => {
  sounds.playDoorOpen()
  sounds.playTaskComplete()
  setTimeout(() => {
    sounds.playFanfare()
  }, 180)

  // Confeti espacial festivo masivo
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.5 },
    colors: ['#ef4444', '#06b6d4', '#ec4899', '#eab308', '#22c55e', '#a855f7'],
  })

  isTransitioningOut.value = true
  setTimeout(() => {
    emit('complete')
  }, 550)
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto select-none transition-all duration-500"
    :class="{ 'opacity-0 scale-105 pointer-events-none': isTransitioningOut }"
  >
    <!-- Fondo Espacial con Estrellas y Astronautas Flotando -->
    <StarfieldBackground />

    <!-- CONTENEDOR PRINCIPAL DEL REEL CINEMÁTICO -->
    <div
      class="max-w-lg w-full my-auto bg-slate-950/90 border-2 rounded-3xl p-5 sm:p-7 text-center shadow-[0_0_60px_rgba(6,182,212,0.35)] relative overflow-hidden z-10 transition-colors duration-300"
      :class="[
        scene === 1 ? 'border-red-500/80 shadow-[0_0_60px_rgba(239,68,68,0.4)]' :
        scene === 2 ? 'border-red-400/80 shadow-[0_0_60px_rgba(239,68,68,0.4)]' :
        scene === 3 ? 'border-cyan-400/80 shadow-[0_0_60px_rgba(6,182,212,0.4)]' :
        scene === 4 ? 'border-yellow-400/80 shadow-[0_0_60px_rgba(234,179,8,0.4)]' :
        'border-emerald-400/80 shadow-[0_0_60px_rgba(16,185,129,0.4)]'
      ]"
    >
      <!-- ============================================== -->
      <!-- BARRA DE HISTORIA SUPERIOR (TIPO REEL / STORY) -->
      <!-- ============================================== -->
      <div class="mb-4">
        <!-- Segmentos de barra de progreso -->
        <div class="flex items-center gap-1.5 mb-2.5">
          <div
            v-for="idx in totalScenes"
            :key="idx"
            class="flex-1 h-1.5 sm:h-2 rounded-full overflow-hidden bg-slate-800/80 border border-slate-700/60"
          >
            <div
              class="h-full transition-all duration-300 rounded-full"
              :class="[
                idx < scene ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] w-full' :
                idx === scene ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)] w-full animate-pulse' :
                'w-0'
              ]"
            />
          </div>
        </div>

        <!-- Encabezado con etiqueta de escena y botón de saltar -->
        <div class="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider">
          <span
            class="px-2.5 py-0.5 rounded-full border"
            :class="[
              scene === 1 ? 'bg-red-500/20 text-red-300 border-red-500/40' :
              scene === 2 ? 'bg-red-500/20 text-red-300 border-red-500/40' :
              scene === 3 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' :
              scene === 4 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40' :
              'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
            ]"
          >
            {{
              scene === 1 ? '🚨 PASO 1/5 • ALERTA ROJA' :
              scene === 2 ? '🎂 PASO 2/5 • LA MISIÓN' :
              scene === 3 ? '📍 PASO 3/5 • LUGAR' :
              scene === 4 ? '⏱️ PASO 4/5 • FECHA & ROPA' :
              '🎫 PASO 5/5 • PASE DE ABORDAJE'
            }}
          </span>

          <button
            @click="launchToShip"
            class="text-slate-400 hover:text-white underline transition-colors cursor-pointer flex items-center gap-1"
            title="Ir directo a la nave interactiva"
          >
            <span>Saltar a la nave</span>
            <span>⏭️</span>
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- ESCENAS INTERACTIVAS CON TRANSICIONES SUAVES   -->
      <!-- ============================================== -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-3 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 -translate-y-2 scale-95"
        mode="out-in"
      >
        <!-- ============================================== -->
        <!-- ESCENA 1: ALERTA ROJA Y BOTÓN DE EMERGENCIA    -->
        <!-- ============================================== -->
        <div v-if="scene === 1" key="scene-1" class="py-1">
          <!-- Flashing Alert Header -->
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-red-600/25 text-red-300 border border-red-500/50 rounded-full font-mono text-xs font-black uppercase tracking-widest mb-3 animate-pulse">
            <span class="text-base animate-spin">🚨</span>
            ¡ALERTA ROJA EN LA NAVE!
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-wide leading-tight">
            ¿ESTÁS LISTO PARA UNA NUEVA AVENTURA?
          </h2>

          <p class="text-xs sm:text-sm text-slate-300 font-mono mt-2 max-w-sm mx-auto leading-relaxed">
            Se ha convocado una reunión de emergencia en el sector espacial. ¡Tu tripulación te necesita!
          </p>

          <!-- Escena interactiva del botón rojo con el tripulante -->
          <div class="my-5 relative flex flex-col items-center justify-center">
            <!-- Tripulante corriendo hacia el botón -->
            <div
              class="transition-all duration-300 transform mb-1"
              :class="isButtonPushed ? 'translate-y-4 scale-110' : 'animate-bounce-subtle'"
            >
              <CrewmateAvatar
                color="#ef4444"
                shadow-color="#991b1b"
                hat="party-hat"
                :size="120"
                animation="none"
              />
            </div>

            <!-- Podio con el Gran Botón 3D -->
            <div class="relative w-full max-w-xs flex flex-col items-center">
              <div class="w-60 h-7 bg-zinc-800 rounded-t-2xl border-4 border-zinc-950 shadow-inner" />

              <button
                @click="handlePressEmergencyButton"
                :disabled="isButtonPushed"
                class="relative -mt-5 group cursor-pointer focus:outline-none transition-transform duration-150 active:scale-95 disabled:pointer-events-none"
              >
                <!-- Anillo exterior pulsante -->
                <div
                  class="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600 p-2 border-4 border-black shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all group-hover:scale-105"
                  :class="isButtonPushed ? 'scale-90 shadow-none' : 'shadow-[0_0_35px_rgba(239,68,68,0.7)] animate-pulse'"
                >
                  <!-- Núcleo del botón -->
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

          <!-- Indicador para tocar -->
          <div class="mt-3">
            <p
              class="text-xs sm:text-sm font-mono font-bold tracking-wider"
              :class="isButtonPushed ? 'text-yellow-400 animate-pulse' : 'text-red-400 animate-bounce'"
            >
              {{ isButtonPushed ? '¡SIRENA SONANDO! ABRIENDO REUNIÓN...' : '👉 ¡TOCA EL BOTÓN ROJO CON TU DEDO! 👈' }}
            </p>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- ESCENA 2: LA MISIÓN & EL CUMPLEAÑOS            -->
        <!-- ============================================== -->
        <div v-else-if="scene === 2" key="scene-2" class="py-1 animate-fade-in">
          <!-- Artwork de Emergency Meeting Slam -->
          <div class="my-1 max-w-xs mx-auto animate-slam">
            <img
              :src="emergencyImg"
              alt="Emergency Meeting"
              class="w-full max-h-32 object-contain drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]"
            />
          </div>

          <!-- Título cinemático -->
          <div class="space-y-1 my-2">
            <p class="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
              ¡HAY UNA FIESTA ENTRE NOSOTROS!
            </p>
            <h2 class="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]">
              ¡MISIÓN CUMPLEAÑOS!
            </h2>
          </div>

          <!-- Festejada Flotando con Aura -->
          <div class="my-4 flex justify-center items-center">
            <div class="relative">
              <div class="absolute inset-0 rounded-full bg-red-600/20 border border-red-500/40 transform scale-125 animate-ping opacity-60 pointer-events-none" />
              <CrewmateAvatar
                :color="EVENT_CONFIG.celebrant.favoriteColor"
                shadow-color="#991b1b"
                :hat="EVENT_CONFIG.celebrant.hat"
                :size="150"
                animation="float"
              />
            </div>
          </div>

          <!-- Insignia de Sioned -->
          <div class="bg-slate-950/80 border-2 border-red-500/60 rounded-2xl p-3.5 shadow-[0_0_25px_rgba(239,68,68,0.3)] max-w-md mx-auto mb-5">
            <h3 class="text-xl sm:text-2xl font-black text-white">
              🎂 ¡{{ EVENT_CONFIG.celebrant.name }} cumple {{ EVENT_CONFIG.celebrant.age }} años!
            </h3>
            <p class="text-xs text-cyan-300 font-mono mt-1">
              {{ EVENT_CONFIG.celebrant.role }} • Sector The Skeld
            </p>
            <p class="text-xs text-slate-300 font-mono mt-2 leading-relaxed">
              Atención tripulante: Esta no es una reunión normal. Se convoca a toda la tripulación para festejar en grande. ¿Estás listo para conocer las coordenadas?
            </p>
          </div>

          <!-- Botones de Navegación -->
          <div class="flex items-center gap-2 max-w-md mx-auto">
            <button
              @click="prevScene"
              class="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              ⬅️ Atrás
            </button>
            <button
              @click="nextScene"
              class="flex-1 py-3.5 px-5 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-black text-sm uppercase tracking-wider font-mono rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>¡VER COORDENADAS DEL LUGAR!</span>
              <span>📍</span>
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- ESCENA 3: COORDENADAS / LUGAR (CHAK JUMPING)   -->
        <!-- ============================================== -->
        <div v-else-if="scene === 3" key="scene-3" class="py-1 animate-fade-in">
          <!-- Header Badge -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 rounded-full font-mono text-xs font-bold uppercase tracking-widest mb-2">
            <span>📍</span>
            <span>COORDENADAS DE LA MISIÓN</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-white">
            ¿DÓNDE SERÁ LA FIESTA?
          </h2>

          <!-- Tarjeta del Destino -->
          <div class="my-3 bg-slate-950/80 border-2 border-cyan-400/70 rounded-2xl p-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] max-w-md mx-auto text-left relative overflow-hidden">
            <div class="flex items-start justify-between gap-3">
              <div>
                <span class="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                  BASE DE DIVERSIÓN:
                </span>
                <h3 class="text-xl sm:text-2xl font-black text-white text-emerald-300 flex items-center gap-1.5 mt-0.5">
                  <span>🤸‍♂️</span>
                  <span>{{ EVENT_CONFIG.location.name }}</span>
                </h3>
                <p class="text-xs text-cyan-200 font-mono mt-0.5 font-semibold">
                  {{ EVENT_CONFIG.location.subname }}
                </p>
              </div>

              <!-- Tripulante rebotando en el trampolín -->
              <div class="flex-shrink-0 animate-trampoline">
                <CrewmateAvatar
                  color="#06b6d4"
                  shadow-color="#0e7490"
                  hat="sprout"
                  :size="68"
                  animation="none"
                />
              </div>
            </div>

            <!-- Domicilio -->
            <div class="mt-3 pt-3 border-t border-slate-800 bg-black/40 rounded-xl p-2.5 font-mono text-xs space-y-0.5">
              <p class="text-slate-200 font-bold">
                📌 {{ EVENT_CONFIG.location.address }}
              </p>
              <p class="text-slate-400 text-[11px]">
                Tepic, Nayarit • C.P. 63190
              </p>
            </div>

            <!-- Botones de GPS -->
            <div class="mt-3 grid grid-cols-2 gap-2">
              <button
                @click="openMaps"
                class="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold rounded-xl shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🗺️</span>
                <span>Google Maps</span>
              </button>
              <button
                @click="openWaze"
                class="py-2.5 px-3 bg-cyan-600/40 hover:bg-cyan-600/60 text-cyan-200 border border-cyan-500/50 font-mono text-xs font-bold rounded-xl shadow transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🚗</span>
                <span>Waze</span>
              </button>
            </div>
          </div>

          <p class="text-xs text-slate-300 font-mono max-w-sm mx-auto mb-4">
            ¡Un parque de trampolines increíble para brincar por los aires y pasar una tarde espacial inolvidable! 🚀
          </p>

          <!-- Botones de Navegación -->
          <div class="flex items-center gap-2 max-w-md mx-auto">
            <button
              @click="prevScene"
              class="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              ⬅️ Atrás
            </button>
            <button
              @click="nextScene"
              class="flex-1 py-3.5 px-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider font-mono rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>¡LISTO, VAMOS! VER HORARIO</span>
              <span>➡️</span>
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- ESCENA 4: FECHA, HORARIO Y EQUIPAMIENTO        -->
        <!-- ============================================== -->
        <div v-else-if="scene === 4" key="scene-4" class="py-1 animate-fade-in">
          <!-- Header Badge -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-400/50 rounded-full font-mono text-xs font-bold uppercase tracking-widest mb-2">
            <span>⏱️</span>
            <span>CRONOGRAMA & EQUIPAMIENTO</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-white">
            ¿CUÁNDO Y CÓMO DEBES IR?
          </h2>

          <!-- Tarjetas de Información -->
          <div class="my-3 space-y-3 max-w-md mx-auto text-left">
            <!-- Bloque 1: Fecha y Hora -->
            <div class="bg-slate-950/80 border-2 border-yellow-400/70 rounded-2xl p-3.5 shadow-[0_0_25px_rgba(234,179,8,0.25)] flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/60 flex items-center justify-center text-2xl flex-shrink-0">
                📅
              </div>
              <div class="font-mono text-xs flex-1">
                <span class="text-yellow-400 font-bold uppercase text-[10px] block">DÍA Y HORA DE ABORDAJE:</span>
                <span class="text-white font-black text-sm sm:text-base block">
                  {{ EVENT_CONFIG.dateTime.displayDate }}
                </span>
                <span class="text-yellow-300 font-black text-sm block">
                  ⏰ Hora: {{ EVENT_CONFIG.dateTime.displayTime }} en punto
                </span>
              </div>
            </div>

            <!-- Bloque 2: Ropa y Calcetines (Aviso Clave) -->
            <div class="bg-purple-950/50 border-2 border-purple-400/70 rounded-2xl p-3.5 shadow-[0_0_25px_rgba(168,85,247,0.25)] relative overflow-hidden">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-base">🧦</span>
                <span class="text-purple-300 font-mono font-black text-xs uppercase tracking-wider">
                  EQUIPAMIENTO OBLIGATORIO DE TRIPULANTE:
                </span>
              </div>

              <div class="space-y-2 text-xs font-mono text-slate-200">
                <div class="bg-black/40 rounded-xl p-2.5 border border-purple-500/30 flex items-start gap-2">
                  <span class="text-yellow-400 text-sm">⚠️</span>
                  <div>
                    <strong class="text-yellow-300 block">Calcetines antiderrapantes indispensables:</strong>
                    <span class="text-slate-300 text-[11px] leading-tight block mt-0.5">
                      Para brincar en los trampolines es indispensable llevar calcetines antiderrapantes.
                    </span>
                  </div>
                </div>

                <div class="bg-black/40 rounded-xl p-2.5 border border-purple-500/30 flex items-start gap-2">
                  <span class="text-cyan-400 text-sm">👕</span>
                  <div>
                    <strong class="text-cyan-300 block">Ropa cómoda o deportiva:</strong>
                    <span class="text-slate-300 text-[11px] leading-tight block mt-0.5">
                      ¡Viste ropa ligera para brincar al máximo o del color de tu tripulante de Among Us preferido!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de Navegación -->
          <div class="flex items-center gap-2 max-w-md mx-auto mt-4">
            <button
              @click="prevScene"
              class="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-700 font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              ⬅️ Atrás
            </button>
            <button
              @click="nextScene"
              class="flex-1 py-3.5 px-5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider font-mono rounded-xl shadow-[0_0_25px_rgba(234,179,8,0.5)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>¡ENTENDIDO! OBTENER MI PASE</span>
              <span>🎟️</span>
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- ESCENA 5: PASE DE ABORDAJE / ENTRAR A LA NAVE  -->
        <!-- ============================================== -->
        <div v-else-if="scene === 5" key="scene-5" class="py-1 animate-fade-in">
          <!-- Header Badge -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 rounded-full font-mono text-xs font-bold uppercase tracking-widest mb-2">
            <span>🎫</span>
            <span>PASE OFICIAL DE ABORDAJE</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-black text-white">
            {{ localConfirmed?.name ? '¡TU PASE ESTÁ LISTO!' : 'CONFIRMA TU TRIPULANTE' }}
          </h2>

          <!-- CASO A: SI YA ESTÁ REGISTRADO EN ESTE DISPOSITIVO -->
          <div v-if="localConfirmed?.name" class="my-3 max-w-md mx-auto">
            <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-400/80 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] text-left flex items-center gap-4 relative overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-2 bg-emerald-400" />

              <div class="flex-shrink-0 pl-1">
                <CrewmateAvatar
                  :color="localConfirmed.color || selectedColor.hex"
                  :shadow-color="localConfirmed.shadowColor || selectedColor.dark"
                  hat="party-hat"
                  :size="85"
                  animation="bounce"
                />
              </div>

              <div class="font-mono text-xs space-y-1 flex-1 min-w-0">
                <span class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  PASE VIP • THE SKELD
                </span>
                <p class="text-white text-lg font-black truncate">
                  {{ localConfirmed.name }}
                </p>
                <p class="text-slate-300 text-[11px]">
                  Traje: <span class="text-cyan-300 font-bold">{{ localConfirmed.colorName || selectedColor.name }}</span> • Acompañantes: <span class="text-yellow-300 font-bold">+{{ localConfirmed.companions || 0 }}</span>
                </p>
                <div class="pt-0.5">
                  <span class="inline-block text-[10px] text-emerald-300 font-black bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    ✅ ASISTENCIA CONFIRMADA
                  </span>
                </div>
              </div>
            </div>

            <!-- Botón Grande de Lanzamiento a la Nave -->
            <div class="mt-5 space-y-2">
              <button
                @click="launchToShip"
                class="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider font-mono rounded-2xl shadow-[0_0_35px_rgba(34,197,94,0.7)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 animate-pulse"
              >
                <span>¡INGRESAR A LA NAVE ESPACIAL!</span>
                <span class="text-2xl">🚀</span>
              </button>
            </div>
          </div>

          <!-- CASO B: REGISTRO RÁPIDO DE ASISTENCIA -->
          <div v-else class="my-3 max-w-md mx-auto text-left">
            <form @submit.prevent="handleQuickSubmit" class="space-y-3 bg-slate-950/70 border border-slate-700 rounded-2xl p-4">
              <!-- Nombre -->
              <div>
                <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Nombre del Tripulante / Invitado *
                </label>
                <input
                  v-model="guestName"
                  type="text"
                  required
                  placeholder="Ej. Mateo, Sofía, Lucas..."
                  class="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2.5 text-white text-sm outline-none font-mono"
                />
              </div>

              <!-- Selector de Color Rápido -->
              <div>
                <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  Elige tu Color de Among Us: <span class="text-cyan-300 font-black">{{ selectedColor.name }}</span>
                </label>
                <div class="flex items-center justify-between gap-1.5 flex-wrap">
                  <button
                    v-for="color in EVENT_CONFIG.crewColors"
                    :key="color.name"
                    type="button"
                    @click="selectedColor = color"
                    class="w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative"
                    :style="{ backgroundColor: color.hex }"
                    :class="selectedColor.name === color.name ? 'border-white scale-125 shadow-[0_0_12px_rgba(255,255,255,0.9)] z-10' : 'border-black hover:scale-110'"
                    :title="color.name"
                  />
                </div>
              </div>

              <!-- Acompañantes -->
              <div>
                <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  ¿Cuántos tripulantes van contigo?
                </label>
                <select
                  v-model="companions"
                  class="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-white text-xs font-mono outline-none"
                >
                  <option value="0">Solo yo (1 persona)</option>
                  <option value="1">+1 Acompañante (2 en total)</option>
                  <option value="2">+2 Acompañantes (3 en total)</option>
                  <option value="3">+3 Acompañantes (4 en total)</option>
                  <option value="4">+4 o más personas</option>
                </select>
              </div>

              <!-- Botón Submit -->
              <div class="pt-2">
                <button
                  type="submit"
                  :disabled="isSaving"
                  class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-mono text-sm uppercase rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span v-if="isSaving">Guardando pase... 🛸</span>
                  <span v-else>🚀 ¡CONFIRMAR Y SUBIR A LA NAVE!</span>
                </button>
              </div>
            </form>

            <!-- Acceso directo alternativo sin registrarse aún -->
            <div class="text-center mt-3">
              <button
                @click="launchToShip"
                class="text-xs font-mono text-cyan-300/80 hover:text-cyan-200 underline cursor-pointer"
              >
                O explorar la nave primero y confirmar después 🛸
              </button>
            </div>
          </div>

          <!-- Botón Volver -->
          <div class="text-center mt-3">
            <button
              @click="prevScene"
              class="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
            >
              ⬅️ Volver a ver fecha y lugar
            </button>
          </div>
        </div>
      </Transition>
    </div>
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
  animation: bounceSubtle 1.8s ease-in-out infinite;
}

@keyframes trampoline {
  0%, 100% {
    transform: translateY(0) scale(1, 1);
  }
  30% {
    transform: translateY(-24px) scale(0.96, 1.05);
  }
  65% {
    transform: translateY(4px) scale(1.08, 0.92);
  }
}

.animate-trampoline {
  animation: trampoline 1.1s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
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
  animation: fadeIn 0.35s ease-out forwards;
}
</style>
