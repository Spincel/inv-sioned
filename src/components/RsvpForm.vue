<script setup>
import confetti from 'canvas-confetti'
import { computed, onMounted, ref, watch } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'

const props = defineProps({
  crewmate: {
    type: Object,
    default: () => ({
      color: '#06b6d4',
      shadowColor: '#0e7490',
      hat: 'party-hat',
      colorName: 'Cian',
    }),
  },
})

const STORAGE_CONFIRM_KEY = 'sioned_my_confirmation'

const guestName = ref('')
const attendance = ref('yes') // 'yes' or 'no'
const companions = ref('0')
const message = ref('')
const isSubmitted = ref(false)
const hasSavedRecord = ref(false)
const savedConfirmation = ref(null)
const isSaving = ref(false)

const emit = defineEmits(['confirm', 'viewShip'])

// Check device memory on load
onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIRM_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data && data.name) {
        savedConfirmation.value = data
        guestName.value = data.name
        attendance.value = data.attendance || 'yes'
        companions.value = String(data.companions || '0')
        message.value = data.message || ''
        hasSavedRecord.value = true
        isSubmitted.value = true
      }
    }
  } catch (e) {
    console.warn('Error reading device confirmation:', e)
  }
})

// Always prioritize the currently selected crewmate suit
const activeCrewmate = computed(() => {
  return {
    color: props.crewmate?.color || savedConfirmation.value?.color || '#06b6d4',
    shadowColor: props.crewmate?.shadowColor || savedConfirmation.value?.shadowColor || '#0e7490',
    hat: props.crewmate?.hat || savedConfirmation.value?.hat || 'party-hat',
    colorName: props.crewmate?.colorName || savedConfirmation.value?.colorName || 'Cian',
  }
})

// Sync changes in customizer with saved confirmation
watch(
  () => props.crewmate,
  (newVal) => {
    if (newVal && savedConfirmation.value) {
      savedConfirmation.value = {
        ...savedConfirmation.value,
        color: newVal.color,
        shadowColor: newVal.shadowColor,
        hat: newVal.hat,
        colorName: newVal.colorName,
      }
    }
  },
  { deep: true }
)

const formattedWhatsAppUrl = computed(() => {
  const phone = EVENT_CONFIG.rsvp.whatsappNumber
  const emoji = attendance.value === 'yes' ? '🚀' : '💔'
  const statusText = attendance.value === 'yes' ? 'CONFIRMADO (Misión Aceptada)' : 'NO PODRÉ ASISTIR (Sabotaje)'
  
  const text =
    `*REPORTE DE TRIPULACIÓN - CUMPLEAÑOS DE ${EVENT_CONFIG.celebrant.name.toUpperCase()}* ${emoji}\n\n` +
    `👤 *Tripulante:* ${guestName.value || 'Invitado Especial'}\n` +
    `🎨 *Color de Traje:* ${activeCrewmate.value.colorName || 'Cian'}\n` +
    `📌 *Estado:* ${statusText}\n` +
    (attendance.value === 'yes' ? `👥 *Acompañantes:* ${companions.value}\n` : '') +
    (message.value ? `💬 *Mensaje para ${EVENT_CONFIG.celebrant.name}:* "${message.value}"\n\n` : '\n') +
    `¡Nos vemos en la nave! 🛸🎂`

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
})

const handleSubmit = async () => {
  if (!guestName.value.trim()) {
    sounds.playCardError()
    alert('Por favor ingresa tu nombre de tripulante')
    return
  }

  isSaving.value = true
  sounds.playTaskComplete()

  const payload = {
    id: savedConfirmation.value?.id || ('guest_' + Date.now()),
    name: guestName.value.trim(),
    color: activeCrewmate.value.color,
    shadowColor: activeCrewmate.value.shadowColor,
    hat: activeCrewmate.value.hat,
    colorName: activeCrewmate.value.colorName,
    companions: companions.value,
    attendance: attendance.value,
    message: message.value.trim(),
    updatedAt: new Date().toISOString(),
  }

  // 1. Save to Device Memory (localStorage)
  try {
    localStorage.setItem(STORAGE_CONFIRM_KEY, JSON.stringify(payload))
    savedConfirmation.value = payload
    hasSavedRecord.value = true
  } catch (err) {
    console.warn('LocalStorage save error:', err)
  }

  // 2. Save to /api/rsvp in background (Vercel Serverless Endpoint)
  try {
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.warn('Sync /api/rsvp fallback error:', err)
  }

  isSaving.value = false
  isSubmitted.value = true

  if (attendance.value === 'yes') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    emit('confirm', payload)
  }
}

const cancelEditing = () => {
  if (hasSavedRecord.value) {
    isSubmitted.value = true
  }
}
</script>

<template>
  <div id="confirmacion" class="w-full max-w-2xl mx-auto py-2 px-1 sm:px-3 select-none">
    <div
      class="bg-slate-950/70 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative overflow-hidden"
    >
      <!-- Title -->
      <div class="text-center mb-5">
        <span class="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-black uppercase rounded-full border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
          REGISTRO DE ASISTENCIA
        </span>
        <h3 class="text-2xl sm:text-3xl font-black text-white mt-1.5">
          {{ isSubmitted ? 'Tu Pase de Abordaje Oficial' : 'Confirma tu Tripulación (RSVP)' }}
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 mt-1 font-mono">
          {{ EVENT_CONFIG.rsvp.deadline }}
        </p>
      </div>

      <!-- SUCCESS BOARDING PASS PREVIEW (DEVICE REMEMBERED) -->
      <div v-if="isSubmitted" class="text-center py-2 animate-fade-in">
        <!-- Status Pill -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-400 rounded-full mb-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span class="font-mono text-xs font-black text-emerald-300 uppercase tracking-wider">
            ✅ Dispositivo Registrado a Bordo
          </span>
        </div>

        <h4 class="text-xl sm:text-2xl font-black text-white">
          ¡Hola {{ guestName }}!
        </h4>
        <p class="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1 font-mono">
          Tu asistencia ya está registrada en este dispositivo para el cumpleaños de {{ EVENT_CONFIG.celebrant.name }}.
        </p>

        <!-- Boarding Pass Card -->
        <div class="mt-4 max-w-md mx-auto bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-400/70 rounded-2xl p-4 shadow-[0_0_25px_rgba(16,185,129,0.2)] text-left flex items-center gap-4 relative overflow-hidden">
          <!-- Subtle Glow Bar on left -->
          <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-400" />

          <div class="flex-shrink-0 pl-1">
            <CrewmateAvatar
              :color="activeCrewmate.color"
              :shadow-color="activeCrewmate.shadowColor"
              :hat="activeCrewmate.hat"
              :size="80"
              animation="none"
            />
          </div>
          <div class="font-mono text-xs space-y-1 flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                PASE OFICIAL DE ABORDAJE
              </p>
              <span class="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50">
                #{{ savedConfirmation?.id ? savedConfirmation.id.slice(-4) : 'VIP' }}
              </span>
            </div>
            
            <p class="text-white text-base font-black truncate">
              {{ guestName }}
            </p>
            
            <p class="text-slate-300 text-[11px]">
              Traje: <span class="text-cyan-300 font-bold">{{ activeCrewmate.colorName || 'Cian' }}</span> • Acompañantes: <span class="text-yellow-300 font-bold">+{{ companions }}</span>
            </p>

            <div class="pt-0.5">
              <span
                v-if="attendance === 'yes'"
                class="inline-block text-[10px] text-emerald-300 font-black bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/40"
              >
                🚀 MISIÓN ACEPTADA (CONFIRMADO)
              </span>
              <span
                v-else
                class="inline-block text-[10px] text-red-300 font-black bg-red-900/60 px-2 py-0.5 rounded-full border border-red-500/40"
              >
                ❌ NO PODRÁ ASISTIR (SABOTAJE)
              </span>
            </div>

            <p v-if="message" class="text-[10px] text-slate-400 italic pt-1 truncate">
              "{{ message }}"
            </p>
          </div>
        </div>

        <!-- Helpful Device Memory Notice -->
        <div class="mt-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl px-3 py-2 max-w-md mx-auto text-left flex items-start gap-2">
          <span class="text-sm">💡</span>
          <p class="text-[11px] font-mono text-cyan-200/90 leading-tight">
            <strong>Dispositivo memorizado:</strong> Puedes cerrar esta ventana e interactuar en la nave libremente. Si deseas cambiar tus acompañantes o tu nombre, toca <strong>"Editar mi confirmación"</strong>.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            @click="emit('viewShip')"
            class="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-mono text-xs sm:text-sm uppercase rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🚀 ¡Ir a la Nave con Sioned!</span>
          </button>
          
          <button
            @click="isSubmitted = false"
            class="w-full sm:w-auto py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 rounded-xl text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>✏️ Editar mi confirmación</span>
          </button>
        </div>

        <!-- Optional WhatsApp share -->
        <div class="text-center pt-4">
          <a
            :href="formattedWhatsAppUrl"
            target="_blank"
            class="text-[11px] font-mono text-emerald-400 hover:text-emerald-200 underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>💬 Enviar también copia por WhatsApp (Opcional)</span>
          </a>
        </div>
      </div>

      <!-- RSVP EDIT/CREATION FORM -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Edit Mode Banner if already confirmed previously -->
        <div
          v-if="hasSavedRecord"
          class="bg-yellow-950/50 border border-yellow-500/50 rounded-xl p-3 flex items-center justify-between gap-2"
        >
          <div class="flex items-center gap-2">
            <span class="text-base">✏️</span>
            <span class="text-xs font-mono text-yellow-200">
              Editando confirmación de <strong>{{ guestName }}</strong>
            </span>
          </div>
          <button
            type="button"
            @click="cancelEditing"
            class="text-[10px] font-mono text-yellow-300 hover:text-white underline cursor-pointer"
          >
            Cancelar y ver pase
          </button>
        </div>

        <!-- Active Suit Badge Preview in Form -->
        <div class="bg-slate-950/70 border border-slate-700/80 rounded-2xl p-2.5 flex items-center gap-3">
          <div class="flex-shrink-0">
            <CrewmateAvatar
              :color="activeCrewmate.color"
              :shadow-color="activeCrewmate.shadowColor"
              :hat="activeCrewmate.hat"
              :size="52"
              animation="bounce"
            />
          </div>
          <div class="font-mono text-xs flex-1 min-w-0">
            <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Tu Traje Espacial Seleccionado:</span>
            <span class="text-white font-black text-sm">Tripulante {{ activeCrewmate.colorName || 'Cian' }}</span>
            <span class="text-[10px] text-cyan-300 block">Personalizado en la estación "2. Tu Traje" 🎨</span>
          </div>
        </div>

        <!-- Guest Name -->
        <div>
          <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
            Nombre y Apellido del Tripulante *
          </label>
          <input
            v-model="guestName"
            type="text"
            required
            placeholder="Ej. Sofía Hernández"
            class="w-full bg-slate-950/80 border-2 border-slate-700 focus:border-emerald-400 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
          />
        </div>

        <!-- Attendance Status -->
        <div>
          <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
            ¿Podrás asistir a la nave? *
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label
              class="flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-xs sm:text-sm font-bold"
              :class="
                attendance === 'yes'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-950/60 border-slate-700 text-slate-400 hover:bg-slate-900'
              "
            >
              <input
                v-model="attendance"
                type="radio"
                value="yes"
                class="hidden"
              />
              <span>🚀 ¡Misión Aceptada!</span>
            </label>

            <label
              class="flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-xs sm:text-sm font-bold"
              :class="
                attendance === 'no'
                  ? 'bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-slate-950/60 border-slate-700 text-slate-400 hover:bg-slate-900'
              "
            >
              <input
                v-model="attendance"
                type="radio"
                value="no"
                class="hidden"
              />
              <span>❌ Sabotaje, no podré</span>
            </label>
          </div>
        </div>

        <!-- Companions Count (only if attending) -->
        <div v-if="attendance === 'yes'">
          <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
            ¿Cuántos tripulantes van contigo?
          </label>
          <select
            v-model="companions"
            class="w-full bg-slate-950/80 border-2 border-slate-700 focus:border-emerald-400 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
          >
            <option value="0">Solo yo (1 persona)</option>
            <option value="1">+1 Acompañante (2 personas en total)</option>
            <option value="2">+2 Acompañantes (3 personas en total)</option>
            <option value="3">+3 Acompañantes (4 personas en total)</option>
            <option value="4">+4 o más tripulantes</option>
          </select>
        </div>

        <!-- Message for Sioned -->
        <div>
          <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
            Mensaje o felicitación para {{ EVENT_CONFIG.celebrant.name }} (Opcional)
          </label>
          <textarea
            v-model="message"
            rows="3"
            placeholder="¡Feliz cumpleaños Sioned! Te queremos mucho..."
            class="w-full bg-slate-950/80 border-2 border-slate-700 focus:border-emerald-400 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors"
          />
        </div>

        <!-- Submit Button -->
        <div class="pt-2 space-y-2">
          <button
            type="submit"
            :disabled="isSaving"
            class="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            <span v-if="isSaving">Guardando en la nave... 🛸</span>
            <span v-else-if="hasSavedRecord">💾 ¡GUARDAR CAMBIOS EN LA NAVE!</span>
            <span v-else>🚀 ¡CONFIRMAR ASISTENCIA Y SUBIR A LA NAVE!</span>
          </button>

          <!-- Back to pass button if editing -->
          <div v-if="hasSavedRecord" class="text-center pt-1">
            <button
              type="button"
              @click="cancelEditing"
              class="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
            >
              ↩ Cancelar cambios y volver a mi pase
            </button>
          </div>

          <!-- Optional WhatsApp Share -->
          <div v-else class="text-center pt-1">
            <a
              :href="formattedWhatsAppUrl"
              target="_blank"
              class="text-[11px] font-mono text-emerald-400 hover:text-emerald-200 underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>💬 Enviar también copia por WhatsApp (Opcional)</span>
            </a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
