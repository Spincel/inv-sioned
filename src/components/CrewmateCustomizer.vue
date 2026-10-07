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

const emit = defineEmits(['update:modelValue'])

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
  <div class="w-full max-w-2xl mx-auto py-2 px-1 sm:px-3">
    <div class="bg-slate-900/95 border-2 border-purple-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
      <!-- Section Title -->
      <div class="text-center mb-6">
        <span class="px-3 py-1 bg-purple-500/20 text-purple-300 font-mono text-xs font-bold uppercase rounded-full border border-purple-500/30">
          PERSONALIZA TU TRIPULANTE
        </span>
        <h3 class="text-2xl sm:text-3xl font-black text-white mt-2">
          ¿Cuál será tu color en la fiesta?
        </h3>
        <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg mx-auto">
          Elige tu color y sombrero favorito. ¡Tu tripulante aparecerá en tu pase VIP y confirmación!
        </p>
      </div>

      <div class="flex flex-col md:flex-row items-center justify-center gap-8">
        <!-- Live Avatar Preview Box -->
        <div class="flex flex-col items-center">
          <div class="w-48 h-56 bg-slate-950/70 rounded-2xl border-2 border-slate-700 flex items-center justify-center p-4 relative shadow-inner">
            <CrewmateAvatar
              :color="selectedColor"
              :shadow-color="currentCrew?.dark"
              :hat="selectedHat"
              :size="150"
              animation="bounce"
            />
          </div>
          <p class="mt-2 text-xs font-mono font-bold text-cyan-300">
            Tripulante {{ currentCrew?.name }}
          </p>
        </div>

        <!-- Customization Controls -->
        <div class="flex-1 w-full max-w-sm flex flex-col gap-5">
          <!-- Colors -->
          <div>
            <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
              Selecciona tu Traje:
            </label>
            <div class="grid grid-cols-4 gap-2.5">
              <button
                v-for="color in EVENT_CONFIG.crewColors"
                :key="color.hex"
                @click="selectColor(color)"
                class="h-10 rounded-xl border-2 transition-all flex items-center justify-center relative cursor-pointer"
                :style="{ backgroundColor: color.hex }"
                :class="
                  selectedColor === color.hex
                    ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.8)] z-10'
                    : 'border-black/50 opacity-80 hover:opacity-100 hover:scale-105'
                "
                :title="color.name"
              >
                <span v-if="selectedColor === color.hex" class="text-black font-black text-xs">
                  ✓
                </span>
              </button>
            </div>
          </div>

          <!-- Hats -->
          <div>
            <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
              Sombrero / Accesorio:
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="hat in hats"
                :key="hat.id"
                @click="selectHat(hat.id)"
                class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer"
                :class="
                  selectedHat === hat.id
                    ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                "
              >
                {{ hat.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
