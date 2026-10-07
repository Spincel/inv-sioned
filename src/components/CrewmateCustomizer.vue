<script setup>
import { computed, ref } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      color: '#06b6d4',
      hat: 'party-hat',
    }),
  },
})

const emit = defineEmits(['update:modelValue', 'toRsvp'])

const selectedColor = ref(props.modelValue.color || '#06b6d4')
const selectedHat = ref(props.modelValue.hat || 'party-hat')

const hats = [
  { id: 'party-hat', label: 'Gorrito Fiesta 🥳' },
  { id: 'crown', label: 'Corona Real 👑' },
  { id: 'sprout', label: 'Planta 🌱' },
  { id: 'balloon', label: 'Globo 🎈' },
  { id: 'flower', label: 'Flor 🌸' },
]

const currentCrew = computed(() => {
  return EVENT_CONFIG.crewColors.find((c) => c.hex === selectedColor.value) || EVENT_CONFIG.crewColors[1]
})

const selectColor = (color) => {
  sounds.playBeep(650, 0.05)
  selectedColor.value = color.hex
  emitChange()
}

const selectHat = (hatId) => {
  sounds.playBeep(750, 0.05)
  selectedHat.value = hatId
  emitChange()
}

// Kids love randomize!
const randomizeOutfit = () => {
  sounds.playPop()
  const randomColor = EVENT_CONFIG.crewColors[Math.floor(Math.random() * EVENT_CONFIG.crewColors.length)]
  const randomHat = hats[Math.floor(Math.random() * hats.length)]
  selectedColor.value = randomColor.hex
  selectedHat.value = randomHat.id
  emitChange()
}

const emitChange = () => {
  emit('update:modelValue', {
    color: selectedColor.value,
    shadowColor: currentCrew.value?.dark,
    hat: selectedHat.value,
    colorName: currentCrew.value?.name,
  })
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto py-2 px-1 sm:px-3 select-none">
    <div class="bg-slate-950/65 border-2 border-purple-500/50 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
      <!-- Section Title -->
      <div class="text-center mb-4">
        <span class="px-3.5 py-1 bg-purple-500/20 text-purple-300 font-mono text-xs font-black uppercase rounded-full border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
          ARMARIO DE TRIPULACIÓN
        </span>
        <h3 class="text-2xl sm:text-3xl font-black text-white mt-1.5">
          Elige tu Traje para la Misión
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg mx-auto font-mono">
          Tu tripulante aparecerá en la nave con Sioned y en tu credencial VIP.
        </p>
      </div>

      <!-- Trampoline Outfit Recommendation Banner -->
      <div class="mb-5 bg-gradient-to-r from-yellow-500/20 via-amber-500/25 to-yellow-500/20 border-2 border-yellow-400/70 rounded-2xl p-3 text-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
        <p class="font-mono text-xs sm:text-sm font-black text-yellow-300 flex items-center justify-center gap-1.5">
          <span>🧦</span>
          <span>¡RECOMENDACIÓN DE TRAJE PARA LA FIESTA!</span>
          <span>🤸‍♂️</span>
        </p>
        <p class="text-[11px] sm:text-xs text-slate-100 font-mono mt-1 leading-relaxed">
          Por el tipo de salón (trampolines), te recomendamos venir con <strong>ropa cómoda</strong> y <strong>calcetas para brincar</strong> en <strong>Chak Jumping Park</strong>.
        </p>
      </div>

      <div class="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8">
        <!-- Live Avatar Preview Box -->
        <div class="flex flex-col items-center">
          <div class="w-48 h-56 bg-slate-950/80 rounded-2xl border-2 border-purple-500/40 flex items-center justify-center p-4 relative shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <CrewmateAvatar
              :color="selectedColor"
              :shadow-color="currentCrew?.dark"
              :hat="selectedHat"
              :size="150"
              animation="bounce"
            />
          </div>
          <p class="mt-2 text-xs font-mono font-black text-cyan-300">
            Tripulante {{ currentCrew?.name }}
          </p>

          <!-- Randomize button -->
          <button
            @click="randomizeOutfit"
            class="mt-2 px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 active:scale-95 border border-purple-400/50 rounded-xl font-mono text-[11px] font-bold text-purple-200 transition-all cursor-pointer flex items-center gap-1.5 shadow"
          >
            <span>🎲 Sorpresa Aleatoria</span>
          </button>
        </div>

        <!-- Customization Controls -->
        <div class="flex-1 w-full max-w-sm flex flex-col gap-4">
          <!-- Colors -->
          <div>
            <label class="block text-xs font-mono font-black text-slate-200 uppercase mb-2">
              1. Color del Traje Espacial:
            </label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="color in EVENT_CONFIG.crewColors"
                :key="color.hex"
                @click="selectColor(color)"
                class="h-10 rounded-xl border-2 transition-all flex items-center justify-center relative cursor-pointer active:scale-90"
                :style="{ backgroundColor: color.hex }"
                :class="
                  selectedColor === color.hex
                    ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.9)] ring-2 ring-white/50 z-10'
                    : 'border-black/60 opacity-80 hover:opacity-100 hover:scale-105'
                "
                :title="color.name"
              >
                <span v-if="selectedColor === color.hex" class="text-black font-black text-xs drop-shadow">
                  ✓
                </span>
              </button>
            </div>
          </div>

          <!-- Hats -->
          <div>
            <label class="block text-xs font-mono font-black text-slate-200 uppercase mb-2">
              2. Sombrero o Accesorio:
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="hat in hats"
                :key="hat.id"
                @click="selectHat(hat.id)"
                class="px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer active:scale-95"
                :class="
                  selectedHat === hat.id
                    ? 'bg-purple-600 text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.6)] ring-1 ring-purple-300'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                "
              >
                {{ hat.label }}
              </button>
            </div>
          </div>

          <!-- Direct Next to Confirm button -->
          <div class="pt-2">
            <button
              @click="emit('toRsvp')"
              class="w-full py-3 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500 hover:from-purple-400 hover:to-emerald-400 text-slate-950 font-black font-mono text-xs sm:text-sm uppercase rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>¡Me gusta mi traje! Ir a Confirmar 📝 ➡️</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
