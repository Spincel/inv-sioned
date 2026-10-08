<script setup>
import confetti from 'canvas-confetti'
import { computed, onMounted, ref, watch } from 'vue'
import emergencyImg from '../assets/emergency-meeting.png'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import { downloadWallpaper, generateWallpaperDataUrl } from '../utils/wallpaper'
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
// 2: La Misión (¡SIONED CUMPLE 8 AÑOS! - Sobre la imagen del botón presionado)
// 3: Coordenadas / Lugar (Chak Jumping Park)
// 4: Fecha, Horario y Equipamiento (Ropa cómoda y Calcetines)
// 5: Pase Especial / Wallpaper HD -> Confirmar o Descargar -> ¡Entrar a la Nave!
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

// Wallpaper / Pase Especial HD
const wallpaperUrl = ref('')
const isFullscreenWallpaper = ref(false)
const isWallpaperGenerating = ref(false)

// Generar o refrescar la imagen del wallpaper/pase
const updateWallpaperPreview = () => {
  isWallpaperGenerating.value = true
  const activeName = guestName.value.trim() || localConfirmed.value?.name || ''
  const activeColor = selectedColor.value?.hex || localConfirmed.value?.color || '#06b6d4'
  const activeColorName = selectedColor.value?.name || localConfirmed.value?.colorName || 'Cian'

  wallpaperUrl.value = generateWallpaperDataUrl({
    guestName: activeName || 'TRIPULANTE INVITADO',
    guestColor: activeColor,
    guestColorName: activeColorName,
    celebrantName: EVENT_CONFIG.celebrant.name,
    age: EVENT_CONFIG.celebrant.age,
    dateText: EVENT_CONFIG.dateTime.displayDate,
    timeText: EVENT_CONFIG.dateTime.displayTime,
    locationName: EVENT_CONFIG.location.name,
    locationAddress: EVENT_CONFIG.location.address,
    dressCode: 'CALCETINES ANTIDERRAPANTES Y ROPA CÓMODA',
  })
  isWallpaperGenerating.value = false
}

// Descargar el fondo de pantalla
const handleDownloadWallpaper = () => {
  sounds.playTaskComplete()
  if (!wallpaperUrl.value) {
    updateWallpaperPreview()
  }
  const cleanName = (guestName.value.trim() || localConfirmed.value?.name || 'tripulante')
    .toLowerCase()
    .replace(/\s+/g, '-')
  downloadWallpaper(wallpaperUrl.value, `pase-sioned-8-anos-${cleanName}.png`)

  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.6 },
    colors: ['#38bdf8', '#34d399', '#facc15'],
  })
}

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
          const matchColor = EVENT_CONFIG.crewColors.find((c) => c.hex === parsed.color)
          if (matchColor) selectedColor.value = matchColor
        }
      }
    } catch (e) {}
  }
})

// Al llegar al paso 5, generar automáticamente el wallpaper
watch(scene, (newScene) => {
  if (newScene === 5) {
    updateWallpaperPreview()
  }
})

// Actualizar el wallpaper cuando cambie el nombre o color
watch([guestName, selectedColor], () => {
  if (scene.value === 5) {
    updateWallpaperPreview()
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

// Envío de RSVP en Escena 5 (Con descarga automática de Wallpaper)
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

  // 4. Generar y descargar automáticamente el wallpaper con el nombre personalizado
  updateWallpaperPreview()
  try {
    const cleanName = payload.name.toLowerCase().replace(/\s+/g, '-')
    downloadWallpaper(wallpaperUrl.value, `pase-sioned-8-anos-${cleanName}.png`)
  } catch (e) {
    console.warn('Auto download error:', e)
  }

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
      <div class="mb-3.5">
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
              scene === 2 ? '🎂 PASO 2/5 • ¡SIONED CUMPLE 8 AÑOS!' :
              scene === 3 ? '📍 PASO 3/5 • LUGAR' :
              scene === 4 ? '⏱️ PASO 4/5 • FECHA & ROPA' :
              '🎫 PASO 5/5 • PASE ESPECIAL'
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

        <!-- ============================================================== -->
        <!-- ESCENA 2: ¡SIONED CUMPLE 8 AÑOS! SOBRE EL BOTÓN PRESIONADO      -->
        <!-- ============================================================== -->
        <div v-else-if="scene === 2" key="scene-2" class="py-1 animate-fade-in">
          <!-- HERO BANNER CON LA IMAGEN DEL BOTÓN PRESIONADO (EMERGENCY MEETING) Y TEXTO SUPERPUESTO -->
          <div class="relative my-2 max-w-md mx-auto rounded-3xl overflow-hidden border-2 border-red-500/80 shadow-[0_0_40px_rgba(239,68,68,0.6)] bg-slate-950 animate-slam">
            <!-- Imagen oficial de reunión de emergencia con el botón presionado -->
            <img
              :src="emergencyImg"
              alt="Emergency Meeting - Botón Presionado"
              class="w-full max-h-48 sm:max-h-56 object-cover object-center opacity-80"
            />

            <!-- Capa superpuesta con gradiente y LO PRINCIPAL: SIONED CUMPLE 8 AÑOS -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-black/30 flex flex-col justify-end p-3.5 sm:p-5 text-center">
              <!-- Alerta roja -->
              <div class="inline-flex items-center self-center gap-1.5 px-3 py-0.5 bg-red-600/95 text-white font-mono text-[10px] sm:text-xs font-black uppercase rounded-full border border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.9)] tracking-wider mb-1.5 animate-pulse">
                <span>🚨</span>
                <span>¡REUNIÓN DE EMERGENCIA ACTIVADA!</span>
              </div>

              <!-- LO PRINCIPAL: ¡SIONED CUMPLE 8 AÑOS! -->
              <h2 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-yellow-300 uppercase drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)] leading-tight">
                ¡SIONED CUMPLE 8 AÑOS! 🎂
              </h2>

              <p class="text-xs sm:text-sm text-cyan-200 font-mono font-bold tracking-wider mt-1 drop-shadow">
                TRIPULANTE DE HONOR • SECTOR THE SKELD
              </p>
            </div>
          </div>

          <!-- Festejada Flotando con Aura Dorada/Roja -->
          <div class="my-3 flex justify-center items-center">
            <div class="relative">
              <div class="absolute inset-0 rounded-full bg-red-600/20 border border-red-500/40 transform scale-125 animate-ping opacity-60 pointer-events-none" />
              <CrewmateAvatar
                :color="EVENT_CONFIG.celebrant.favoriteColor"
                shadow-color="#991b1b"
                :hat="EVENT_CONFIG.celebrant.hat"
                :size="130"
                animation="float"
              />
            </div>
          </div>

          <!-- Mensaje de la Misión -->
          <div class="bg-slate-950/85 border-2 border-red-500/60 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(239,68,68,0.3)] max-w-md mx-auto mb-4">
            <p class="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
              Atención tripulación: Se ha convocado a los mejores tripulantes para festejar en grande a Sioned. ¡No te quedes flotando en el espacio y acompáñanos a su fiesta! 🚀
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

        <!-- ============================================================== -->
        <!-- ESCENA 5: PASE ESPECIAL / CONFIRMACIÓN Y ENTRADA A LA NAVE     -->
        <!-- ============================================================== -->
        <div v-else-if="scene === 5" key="scene-5" class="py-1 animate-fade-in">
          <!-- Header Badge -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 rounded-full font-mono text-xs font-bold uppercase tracking-widest mb-2">
            <span>🎫</span>
            <span>PASE OFICIAL DE ABORDAJE</span>
          </div>

          <!-- CASO A: SI YA ESTÁ REGISTRADO EN ESTE DISPOSITIVO -->
          <div v-if="localConfirmed?.name" class="my-2 max-w-md mx-auto">
            <!-- TARJETA: TRIPULANTE REGISTRADO CON SIONED Y EL INVITADO JUNTOS -->
            <div class="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-400/90 rounded-3xl p-4 sm:p-5 shadow-[0_0_35px_rgba(16,185,129,0.35)] text-center relative overflow-hidden">
              <!-- Glow accent border top -->
              <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-yellow-400" />

              <!-- Badge Superior -->
              <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/60 rounded-full mb-2 shadow">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span class="font-mono text-xs font-black text-emerald-300 uppercase tracking-wider">
                  ✅ TRIPULANTE REGISTRADO
                </span>
              </div>

              <!-- Mensaje Personalizado de Agradecimiento -->
              <h3 class="text-xl sm:text-2xl font-black text-white leading-tight">
                ¡Gracias por acompañarme a la misión! 🚀
              </h3>
              <p class="text-xs sm:text-sm text-cyan-200 font-mono mt-1">
                ¡Hola <strong class="text-yellow-300 text-sm sm:text-base">{{ localConfirmed.name }}</strong>! Qué alegría que vengas a festejar mis 8 años en Chak Jumping Park.
              </p>

              <!-- LOS DOS AMONG US JUNTOS: Sioned (Especial de Honor) + El Invitado -->
              <div class="my-3.5 py-2.5 px-3 bg-black/50 rounded-2xl border border-slate-800 flex items-center justify-center gap-5 sm:gap-7 relative">
                <!-- 1. SIONED (TRIPULANTE ESPECIAL DE HONOR) -->
                <div class="flex flex-col items-center">
                  <div class="relative animate-bounce-subtle">
                    <div class="absolute -top-1.5 -right-1.5 text-base animate-pulse">👑</div>
                    <CrewmateAvatar
                      :color="EVENT_CONFIG.celebrant.favoriteColor"
                      shadow-color="#991b1b"
                      :hat="EVENT_CONFIG.celebrant.hat"
                      :size="85"
                      animation="none"
                    />
                  </div>
                  <span class="mt-1 px-2 py-0.5 bg-red-600/90 text-white font-mono text-[10px] font-black rounded-full border border-red-400 shadow">
                    Sioned (Honor) 🎂
                  </span>
                </div>

                <!-- Destellos y Unión en Medio -->
                <div class="flex flex-col items-center">
                  <span class="text-2xl animate-pulse">✨</span>
                  <span class="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">¡Juntos!</span>
                </div>

                <!-- 2. EL INVITADO (CON SU COLOR PERSONALIZADO) -->
                <div class="flex flex-col items-center">
                  <div class="relative animate-bounce-subtle" style="animation-delay: 0.25s">
                    <CrewmateAvatar
                      :color="localConfirmed.color || selectedColor.hex"
                      :shadow-color="localConfirmed.shadowColor || selectedColor.dark"
                      hat="party-hat"
                      :size="85"
                      animation="none"
                    />
                  </div>
                  <span class="mt-1 px-2 py-0.5 bg-cyan-600/90 text-white font-mono text-[10px] font-black rounded-full border border-cyan-400 shadow truncate max-w-[110px]">
                    {{ localConfirmed.name }} ⭐
                  </span>
                </div>
              </div>

              <!-- Datos Resumidos del Pase -->
              <div class="bg-slate-900/80 border border-slate-700/80 rounded-xl py-2 px-3 font-mono text-xs flex items-center justify-around flex-wrap gap-2 text-slate-300">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase block">Traje:</span>
                  <strong class="text-cyan-300">{{ localConfirmed.colorName || selectedColor.name }}</strong>
                </div>
                <div class="w-px h-5 bg-slate-700" />
                <div>
                  <span class="text-[10px] text-slate-400 uppercase block">Acompañantes:</span>
                  <strong class="text-yellow-300">+{{ localConfirmed.companions || 0 }}</strong>
                </div>
                <div class="w-px h-5 bg-slate-700" />
                <div>
                  <span class="text-[10px] text-slate-400 uppercase block">Estado:</span>
                  <strong class="text-emerald-400">Confirmado ✅</strong>
                </div>
              </div>
            </div>

            <!-- BOTÓN GRANDE DE INGRESAR A LA NAVE ESPACIAL -->
            <div class="mt-3.5 space-y-2.5">
              <button
                @click="launchToShip"
                class="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-lg sm:text-xl uppercase tracking-wider font-mono rounded-2xl shadow-[0_0_40px_rgba(34,197,94,0.7)] transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-3 animate-pulse"
              >
                <span>¡INGRESAR A LA NAVE ESPACIAL!</span>
                <span class="text-2xl">🚀</span>
              </button>

              <!-- ÁREA PARA DESCARGAR EL WALLPAPER (COMPACTA Y ELEGANTE) -->
              <div class="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-2 shadow-md">
                <div class="flex items-center gap-2.5 min-w-0 pl-1">
                  <!-- Miniatura con lupa para ver grande -->
                  <div
                    @click="isFullscreenWallpaper = true"
                    class="w-9 h-12 rounded-lg overflow-hidden border border-emerald-400 shadow flex-shrink-0 cursor-pointer group relative bg-black"
                    title="Toca para ver el fondo en pantalla completa"
                  >
                    <img
                      v-if="wallpaperUrl"
                      :src="wallpaperUrl"
                      alt="Wallpaper"
                      class="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div class="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <span class="text-[9px]">🔍</span>
                    </div>
                  </div>

                  <div class="text-left font-mono min-w-0">
                    <p class="text-white font-bold truncate text-[11px] sm:text-xs">
                      Fondo de Pantalla / Pase HD
                    </p>
                    <p class="text-slate-400 text-[10px] truncate">
                      1080×1920 con tu nombre y Sioned
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 flex-shrink-0 pr-1">
                  <button
                    type="button"
                    @click="handleDownloadWallpaper"
                    class="py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black font-mono text-[11px] sm:text-xs rounded-xl shadow transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    title="Descargar imagen en alta definición"
                  >
                    <span>📥</span>
                    <span>Descargar</span>
                  </button>
                  <button
                    type="button"
                    @click="isFullscreenWallpaper = true"
                    class="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] rounded-xl border border-slate-600 transition-all active:scale-95 cursor-pointer"
                    title="Ver en Grande"
                  >
                    👁️
                  </button>
                </div>
              </div>

              <!-- Editar datos si es necesario -->
              <div class="text-center pt-0.5">
                <button
                  type="button"
                  @click="localConfirmed = null"
                  class="text-[11px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                >
                  ✏️ Editar mis datos de confirmación
                </button>
              </div>
            </div>
          </div>

          <!-- CASO B: REGISTRO RÁPIDO DE ASISTENCIA (CON AUTO-DESCARGA) -->
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
                  class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black font-mono text-sm uppercase rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span v-if="isSaving">Guardando pase... 🛸</span>
                  <span v-else>🚀 ¡CONFIRMAR, DESCARGAR PASE Y SUBIR A LA NAVE!</span>
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

    <!-- ============================================================== -->
    <!-- MODAL LIGHTBOX EN PANTALLA COMPLETA PARA VER EL WALLPAPER      -->
    <!-- ============================================================== -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isFullscreenWallpaper"
        class="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 backdrop-blur-md"
        @click.self="isFullscreenWallpaper = false"
      >
        <!-- Header con botón cerrar -->
        <div class="w-full max-w-sm flex items-center justify-between text-white font-mono text-xs">
          <span class="text-emerald-400 font-bold">★ FONDO DE PANTALLA OFICIAL ★</span>
          <button
            @click="isFullscreenWallpaper = false"
            class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-base cursor-pointer border border-slate-600"
          >
            ✕
          </button>
        </div>

        <!-- Imagen del Wallpaper en Grande -->
        <div class="max-h-[75vh] max-w-xs w-full overflow-hidden rounded-2xl border-2 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.5)] my-auto bg-slate-950">
          <img
            :src="wallpaperUrl"
            alt="Wallpaper Completo"
            class="w-full h-auto object-contain max-h-[75vh] mx-auto select-none"
          />
        </div>

        <!-- Botones de Acción -->
        <div class="w-full max-w-sm flex items-center justify-center gap-3 pt-2">
          <button
            @click="handleDownloadWallpaper"
            class="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-mono text-xs sm:text-sm uppercase rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>📥</span>
            <span>Descargar en HD</span>
          </button>
          <button
            @click="isFullscreenWallpaper = false"
            class="py-3 px-4 bg-slate-800 text-slate-300 font-mono text-xs rounded-xl border border-slate-600 hover:text-white cursor-pointer"
          >
            Cerrar
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
