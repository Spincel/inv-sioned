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

const handleSubmit = () => {
  if (!guestName.value.trim()) {
    sounds.playCardError()
    alert('Por favor ingresa tu nombre de tripulante')
    return
  }

  sounds.playTaskComplete()
  isSubmitted.value = true

  if (attendance.value === 'yes') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  // Open WhatsApp in new tab
  window.open(formattedWhatsAppUrl.value, '_blank')
}
</script>

<template>
  <div id="confirmacion" class="w-full max-w-2xl mx-auto my-12 px-4 scroll-mt-20">
    <div
      class="bg-slate-900/95 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(16,185,129,0.2)] relative overflow-hidden"
    >
      <!-- Title -->
      <div class="text-center mb-6">
        <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold uppercase rounded-full border border-emerald-500/30">
          REGISTRO DE ASISTENCIA
        </span>
        <h3 class="text-2xl sm:text-3xl font-black text-white mt-2">
          Confirma tu Tripulación (RSVP)
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 mt-1">
          {{ EVENT_CONFIG.rsvp.deadline }}
        </p>
      </div>

      <!-- SUCCESS BOARDING PASS PREVIEW -->
      <div v-if="isSubmitted" class="text-center py-6 animate-fade-in">
        <div class="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
          🎫
        </div>
        <h4 class="text-xl font-black text-emerald-300">
          ¡REGISTRO ENVIADO CON ÉXITO!
        </h4>
        <p class="text-sm text-slate-300 max-w-md mx-auto mt-2">
          Gracias {{ guestName }}. Tu reporte de tripulante ha sido enviado a WhatsApp para la fiesta de {{ EVENT_CONFIG.celebrant.name }}.
        </p>

        <!-- Boarding Pass Card -->
        <div class="mt-6 max-w-md mx-auto bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-400/60 rounded-2xl p-4 shadow-xl text-left flex items-center gap-4">
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
              ESTADO: TRIPULANTE AUTORIZADO ✅
            </p>
          </div>
        </div>

        <button
          @click="isSubmitted = false"
          class="mt-6 text-xs font-mono text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
        >
          Editar información de registro
        </button>
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
        <div class="pt-2">
          <button
            type="submit"
            class="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>💬 Confirmar por WhatsApp</span>
            <span class="text-base">🚀</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
