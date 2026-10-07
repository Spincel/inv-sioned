<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: '#ef4444' // Red
  },
  shadowColor: {
    type: String,
    default: '#991b1b'
  },
  hat: {
    type: String,
    default: 'party-hat' // 'party-hat', 'crown', 'flower', 'sprout', 'balloon', 'none'
  },
  size: {
    type: [Number, String],
    default: 160
  },
  animation: {
    type: String,
    default: 'float' // 'float', 'bounce', 'wobble', 'none'
  },
  isDead: {
    type: Boolean,
    default: false
  }
})

const sizeStyle = computed(() => {
  const s = typeof props.size === 'number' ? `${props.size}px` : props.size
  return {
    width: s,
    height: s,
  }
})
</script>

<template>
  <div
    class="relative inline-block select-none"
    :class="{
      'animate-float': animation === 'float',
      'animate-bounce-subtle': animation === 'bounce',
      'animate-wobble': animation === 'wobble',
    }"
    :style="sizeStyle"
  >
    <svg
      viewBox="0 0 200 240"
      class="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- Visor Gradient -->
        <linearGradient id="visor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="25%" stop-color="#93c5fd" />
          <stop offset="70%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
      </defs>

      <!-- BACKPACK (OXYGEN TANK) -->
      <!-- Stroke -->
      <path
        d="M 45 80 C 25 80 20 100 20 120 L 20 165 C 20 185 25 190 45 190 L 55 190 L 55 80 Z"
        :fill="shadowColor || '#7f1d1d'"
        stroke="#0c0d14"
        stroke-width="10"
        stroke-linejoin="round"
      />
      <!-- Backpack Highlight -->
      <path
        d="M 45 86 C 30 86 28 100 28 120 L 28 140 C 35 140 45 130 50 125 L 50 86 Z"
        :fill="color"
        opacity="0.9"
      />

      <!-- MAIN BODY -->
      <!-- Shadow bottom part -->
      <path
        d="M 80 40 
           C 145 40 155 75 155 120 
           L 155 185 
           C 155 205 145 210 130 210 
           L 125 210 
           C 115 210 110 200 110 190 
           L 110 170 
           L 95 170 
           L 95 190 
           C 95 200 90 210 80 210 
           L 75 210 
           C 60 210 50 205 50 185 
           L 50 110 
           C 50 75 60 40 80 40 Z"
        :fill="shadowColor || '#991b1b'"
        stroke="#0c0d14"
        stroke-width="10"
        stroke-linejoin="round"
      />

      <!-- Main Body Color Fill (Upper light area) -->
      <path
        d="M 80 45 
           C 140 45 148 75 148 115 
           L 148 165 
           C 125 175 75 175 56 160 
           L 56 110 
           C 56 75 65 45 80 45 Z"
        :fill="color"
      />

      <!-- Legs inner divider highlight -->
      <path
        d="M 60 170 L 60 188 C 60 198 68 200 74 200 C 80 200 84 195 84 188 L 84 170 Z"
        :fill="color"
      />
      <path
        d="M 118 170 L 118 188 C 118 198 126 200 132 200 C 138 200 144 195 144 188 L 144 170 Z"
        :fill="color"
      />

      <!-- VISOR (MASK) -->
      <!-- Visor Outer Border -->
      <path
        d="M 95 72 
           C 155 72 175 80 175 106 
           C 175 132 155 140 95 140 
           C 70 140 68 132 68 106 
           C 68 80 70 72 95 72 Z"
        fill="url(#visor-grad)"
        stroke="#0c0d14"
        stroke-width="10"
        stroke-linejoin="round"
      />

      <!-- Visor White Glass Shine -->
      <path
        d="M 90 80 
           C 130 80 155 86 160 98 
           C 150 94 125 90 90 90 
           C 78 90 76 86 82 82 
           C 85 80 88 80 90 80 Z"
        fill="#ffffff"
        opacity="0.85"
      />
      <ellipse cx="148" cy="98" rx="8" ry="4" fill="#ffffff" opacity="0.6" transform="rotate(-15 148 98)" />

      <!-- ACCESSORIES / HATS -->
      <!-- 1. Party Hat -->
      <g v-if="hat === 'party-hat'">
        <!-- Party Hat Base Cone -->
        <polygon
          points="105,8 65,58 145,58"
          fill="#f43f5e"
          stroke="#0c0d14"
          stroke-width="7"
          stroke-linejoin="round"
        />
        <!-- Yellow Stripes on Hat -->
        <path
          d="M 78 44 L 132 44 L 126 34 L 84 34 Z"
          fill="#fbbf24"
        />
        <path
          d="M 94 22 L 116 22 L 111 14 L 99 14 Z"
          fill="#38bdf8"
        />
        <!-- Pompom on top -->
        <circle cx="105" cy="8" r="9" fill="#facc15" stroke="#0c0d14" stroke-width="4" />
        <!-- Confetti sparks around hat -->
        <circle cx="128" cy="12" r="3" fill="#a855f7" />
        <circle cx="80" cy="18" r="2.5" fill="#22c55e" />
        <circle cx="140" cy="30" r="3" fill="#38bdf8" />
      </g>

      <!-- 2. Royal Crown -->
      <g v-else-if="hat === 'crown'">
        <path
          d="M 68 55 
             L 60 22 
             L 85 38 
             L 105 14 
             L 125 38 
             L 150 22 
             L 142 55 Z"
          fill="#eab308"
          stroke="#0c0d14"
          stroke-width="7"
          stroke-linejoin="round"
        />
        <!-- Jewels -->
        <circle cx="105" cy="35" r="5" fill="#ef4444" stroke="#0c0d14" stroke-width="2" />
        <circle cx="78" cy="40" r="4" fill="#3b82f6" stroke="#0c0d14" stroke-width="2" />
        <circle cx="132" cy="40" r="4" fill="#10b981" stroke="#0c0d14" stroke-width="2" />
      </g>

      <!-- 3. Sprout Hat -->
      <g v-else-if="hat === 'sprout'">
        <!-- Stem -->
        <path
          d="M 105 45 Q 105 25 105 20"
          stroke="#15803d"
          stroke-width="6"
          stroke-linecap="round"
          fill="none"
        />
        <!-- Leaf Left -->
        <path
          d="M 105 22 C 85 10 75 25 105 25 Z"
          fill="#4ade80"
          stroke="#0c0d14"
          stroke-width="4"
          stroke-linejoin="round"
        />
        <!-- Leaf Right -->
        <path
          d="M 105 22 C 125 10 135 25 105 25 Z"
          fill="#22c55e"
          stroke="#0c0d14"
          stroke-width="4"
          stroke-linejoin="round"
        />
      </g>

      <!-- 4. Balloon Hat -->
      <g v-else-if="hat === 'balloon'">
        <!-- String -->
        <path
          d="M 105 45 Q 115 30 110 15"
          stroke="#94a3b8"
          stroke-width="3"
          fill="none"
        />
        <!-- Balloon Body -->
        <ellipse cx="112" cy="-10" rx="22" ry="26" fill="#a855f7" stroke="#0c0d14" stroke-width="5" />
        <!-- Balloon Knot -->
        <polygon points="112,16 108,21 116,21" fill="#7e22ce" stroke="#0c0d14" stroke-width="2" />
        <!-- Balloon Shine -->
        <ellipse cx="104" cy="-16" rx="5" ry="9" fill="#ffffff" opacity="0.6" transform="rotate(-20 104 -16)" />
      </g>

      <!-- 5. Flower Hat -->
      <g v-else-if="hat === 'flower'">
        <!-- Petals -->
        <circle cx="105" cy="30" r="10" fill="#f43f5e" stroke="#0c0d14" stroke-width="3" />
        <circle cx="95" cy="40" r="10" fill="#f43f5e" stroke="#0c0d14" stroke-width="3" />
        <circle cx="115" cy="40" r="10" fill="#f43f5e" stroke="#0c0d14" stroke-width="3" />
        <circle cx="105" cy="50" r="10" fill="#f43f5e" stroke="#0c0d14" stroke-width="3" />
        <!-- Flower Center -->
        <circle cx="105" cy="40" r="8" fill="#facc15" stroke="#0c0d14" stroke-width="3" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-12px) rotate(2deg);
  }
}

@keyframes bounceSubtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes wobble {
  0%, 100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

.animate-bounce-subtle {
  animation: bounceSubtle 1.8s ease-in-out infinite;
}

.animate-wobble {
  animation: wobble 2.5s ease-in-out infinite;
}
</style>
