<script setup>
import confetti from 'canvas-confetti'
import { computed, ref } from 'vue'
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

const guestName = ref('')
const attendance = ref('yes') // 'yes' or 'no'
const companions = ref('0')
const message = ref('')
const isSubmitted = ref(false)

const formattedWhatsAppUrl = computed(() => {
  const phone = EVENT_CONFIG.rsvp.whatsappNumber
  const emoji = attendance.value === 'yes' ? '🚀' : '💔'
  const statusText = attendance.value === 'yes' ? 'CONFIRMADO (Misión Aceptada)' : 'NO PODRÉ ASISTIR (Sabotaje)'
  
  const text =
    `*REPORTE DE TRIPULACIÓN - CUMPLEAÑOS DE ${EVENT_CONFIG.celebrant.name.toUpperCase()}* ${emoji}\n\n` +
    `👤 *Tripulante:* ${guestName.value || 'Invitado Especial'}\n` +
    `🎨 *Color de Traje:* ${props.crewmate.colorName || 'Cian'}\n` +
    `📌 *Estado:* ${statusText}\n` +
    (attendance.value === 'yes' ? `👥 *Acompañantes:* ${companions.value}\n` : '') +
    (message.value ? `💬 *Mensaje para ${EVENT_CONFIG.celebrant.name}:* "${message.value}"\n\n` : '\n') +
    `¡Nos vemos en la nave! 🛸🎂`

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
})

const emit = defineEmits(['confirm', 'viewShip'])
const isSaving = ref(false)

const handleSubmit = async () => {
  if (!guestName.value.trim()) {
    sounds.playCardError()
    alert('Por favor ingresa tu nombre de tripulante')
    return
  }

  isSaving.value = true
  sounds.playTaskComplete()

  const payload = {
    name: guestName.value.trim(),
    color: props.crewmate.color,
    shadowColor: props.crewmate.shadowColor,
    hat: props.crewmate.hat,
    colorName: props.crewmate.colorName,
    companions: companions.value,
    attendance: attendance.value,
    message: message.value.trim(),
  }

  // Save to /api/rsvp in background (Vercel serverless endpoint)
  try {
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.warn('Sync /api/rsvp error (fallback a localStorage):', err)
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
</script>

<template>
  <div id="confirmacion" class="w-full max-w-2xl mx-auto py-2 px-1 sm:px-3">
    <div
      class="bg-slate-900/95 border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative overflow-hidden"
    >
      <!-- Title -->
      <div class="text-center mb-5">
        <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold uppercase rounded-full border border-emerald-500/30">
          REGISTRO DE ASISTENCIA
        </span>
        <h3 class="text-2xl sm:text-3xl font-black text-white mt-1.5">
          Confirma tu Tripulación (RSVP)
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 mt-1">
          {{ EVENT_CONFIG.rsvp.deadline }}
        </p>
      </div>

      <!-- SUCCESS BOARDING PASS PREVIEW -->
      <div v-if="isSubmitted" class="text-center py-4 animate-fade-in">
        <div class="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
          🎫
        </div>
        <h4 class="text-xl font-black text-emerald-300">
          ¡REGISTRO ENVIADO CON ÉXITO!
        </h4>
        <p class="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-1.5">
          ¡Gracias {{ guestName }}! Tu reporte de tripulante ha sido enviado a WhatsApp para la fiesta de {{ EVENT_CONFIG.celebrant.name }}.
        </p>

        <!-- Boarding Pass Card -->
        <div class="mt-5 max-w-md mx-auto bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-400/60 rounded-2xl p-4 shadow-xl text-left flex items-center gap-4">
          <div class="flex-shrink-0">
            <CrewmateAvatar
              :color="crewmate.color"
              :shadow-color="crewmate.shadowColor"
              :hat="crewmate.hat"
              :size="80"
              animation="none"
            />
          </div>
          <div class="font-mono text-xs space-y-1">
            <p class="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
              PASE DE ABORDAJE OFICIAL
            </p>
            <p class="text-white text-base font-black">
              {{ guestName }}
            </p>
            <p class="text-slate-300">
              Color: {{ crewmate.colorName || 'Cian' }} • Acompañantes: +{{ companions }}
            </p>
            <p class="text-[11px] text-yellow-400 font-bold">
              ESTADO: TRIPULANTE EN LA NAVE ✅
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            @click="emit('viewShip')"
            class="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-mono text-xs sm:text-sm uppercase rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>🚀 ¡Ver a mi tripulante en la reunión!</span>
          </button>
          <button
            @click="isSubmitted = false"
            class="text-xs font-mono text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
          >
            Editar datos
          </button>
        </div>
      </div>

      <!-- RSVP FORM -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-5">
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
            <option value="1">+1 Acompañante (2 personas)</option>
            <option value="2">+2 Acompañantes (3 personas)</option>
            <option value="3">+3 Acompañantes (4 personas)</option>
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
            <span v-else>🚀 ¡CONFIRMAR ASISTENCIA Y SUBIR A LA NAVE!</span>
          </button>

          <!-- Optional WhatsApp Share -->
          <div class="text-center pt-1">
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
