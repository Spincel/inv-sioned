<script setup>
import { ref } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'

const selectedPhoto = ref(null)

// Photos with Among Us themes and captions
const moments = [
  {
    id: 1,
    title: 'Misión: Sonrisas',
    tag: 'TRIPULANTE ESTRELLA',
    img: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=600&q=80',
    caption: '¡Siempre lista para una nueva aventura espacial!',
    sticker: '🌟',
  },
  {
    id: 2,
    title: 'Energía al 100%',
    tag: 'TAREA COMPLETADA',
    img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
    caption: 'Llenando la nave de risas y alegría todos los días.',
    sticker: '🚀',
  },
  {
    id: 3,
    title: 'Momento Pastel',
    tag: 'ZONA DE PASTEL',
    img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    caption: '¡Festejando a lo grande con los mejores amigos!',
    sticker: '🎂',
  },
]

const openPreview = (photo) => {
  sounds.playBeep(700, 0.05)
  selectedPhoto.value = photo
}

const closePreview = () => {
  sounds.playBeep(400, 0.05)
  selectedPhoto.value = null
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto my-12 px-4">
    <div class="text-center mb-8">
      <span class="px-3 py-1 bg-pink-500/20 text-pink-300 font-mono text-xs font-bold uppercase rounded-full border border-pink-500/30">
        GALERÍA DE RECUERDOS
      </span>
      <h2 class="text-3xl sm:text-4xl font-black text-white mt-2">
        La Festejada: {{ EVENT_CONFIG.celebrant.name }}
      </h2>
      <p class="text-slate-300 text-xs sm:text-sm mt-1 max-w-md mx-auto">
        Momentos especiales de nuestra tripulante favorita antes de su gran día.
      </p>
    </div>

    <!-- Polaroid style grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="item in moments"
        :key="item.id"
        @click="openPreview(item)"
        class="group bg-slate-900 border-2 border-slate-700 hover:border-pink-500/60 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(236,72,153,0.3)] cursor-pointer relative overflow-hidden"
      >
        <!-- Floating Sticker badge -->
        <div class="absolute top-3 right-3 text-2xl z-10 filter drop-shadow">
          {{ item.sticker }}
        </div>

        <!-- Photo frame -->
        <div class="aspect-4/3 rounded-xl overflow-hidden bg-slate-950 mb-3 relative">
          <img
            :src="item.img"
            :alt="item.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <span class="text-xs text-pink-300 font-mono font-bold">Toca para ampliar 🔍</span>
          </div>
        </div>

        <!-- Info -->
        <div class="space-y-1">
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-pink-400">
            {{ item.tag }}
          </span>
          <h4 class="font-bold text-white text-base">
            {{ item.title }}
          </h4>
          <p class="text-xs text-slate-400 leading-snug">
            {{ item.caption }}
          </p>
        </div>
      </div>
    </div>

    <!-- Photo Modal Preview -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="selectedPhoto"
        @click="closePreview"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      >
        <div
          @click.stop
          class="bg-slate-900 border-2 border-pink-500/60 rounded-3xl p-4 sm:p-6 max-w-lg w-full relative shadow-[0_0_40px_rgba(236,72,153,0.4)] text-center"
        >
          <button
            @click="closePreview"
            class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-mono px-2 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
          <div class="rounded-2xl overflow-hidden mb-4 max-h-[60vh]">
            <img
              :src="selectedPhoto.img"
              :alt="selectedPhoto.title"
              class="w-full h-full object-contain"
            />
          </div>
          <h4 class="text-xl font-black text-white">
            {{ selectedPhoto.title }}
          </h4>
          <p class="text-xs sm:text-sm text-pink-300 font-mono mt-1">
            {{ selectedPhoto.caption }}
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>
