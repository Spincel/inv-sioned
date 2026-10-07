<script setup>
import confetti from 'canvas-confetti'
import { computed, onMounted, ref } from 'vue'
import { EVENT_CONFIG } from '../config/event'
import { sounds } from '../utils/audio'
import CrewmateAvatar from './CrewmateAvatar.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'guestUpdated'])

// Security & Unlock
const isUnlocked = ref(false)
const inputPin = ref('')
const pinError = ref(false)
const ADMIN_PIN = '2026'

// Guests Data
const guests = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const currentFilter = ref('all') // 'all' | 'yes' | 'no'
const showManualModal = ref(false)
const toastMsg = ref(null)

// Manual Guest Form
const manualGuest = ref({
  name: '',
  attendance: 'yes',
  companions: '0',
  message: '',
  color: '#3b82f6',
  hat: 'party-hat',
  colorName: 'Azul',
})

const colorOptions = [
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Amarillo', hex: '#eab308' },
  { name: 'Negro', hex: '#334155' },
  { name: 'Blanco', hex: '#d1d5db' },
  { name: 'Morado', hex: '#a855f7' },
  { name: 'Cian', hex: '#06b6d4' },
]

const notify = (msg) => {
  toastMsg.value = msg
  setTimeout(() => {
    toastMsg.value = null
  }, 3500)
}

const checkAutoUnlock = () => {
  if (sessionStorage.getItem('sioned_admin_auth') === '1') {
    isUnlocked.value = true
    return
  }
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('admin') === '1' || urlParams.get('admin') === 'true' || window.location.hash === '#admin') {
    isUnlocked.value = true
    sessionStorage.setItem('sioned_admin_auth', '1')
  }
}

const unlockDirect = () => {
  isUnlocked.value = true
  sessionStorage.setItem('sioned_admin_auth', '1')
  sounds.playTaskComplete()
  fetchGuests()
}

const handlePinSubmit = () => {
  if (inputPin.value.trim() === ADMIN_PIN || inputPin.value.trim().toLowerCase() === 'sioned') {
    isUnlocked.value = true
    sessionStorage.setItem('sioned_admin_auth', '1')
    pinError.value = false
    sounds.playTaskComplete()
    fetchGuests()
  } else {
    pinError.value = true
    sounds.playCardError()
    setTimeout(() => {
      pinError.value = false
    }, 2000)
  }
}

// Fetch guests from /api/rsvp with localStorage fallback
const fetchGuests = async () => {
  isLoading.value = true
  try {
    const res = await fetch('/api/rsvp')
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.guests)) {
        guests.value = data.guests
      }
    }
  } catch (err) {
    console.warn('Error fetching /api/rsvp:', err)
  }

  // Backup sync: check local device confirmation and crew
  const myRecordRaw = localStorage.getItem('sioned_my_confirmation')
  if (myRecordRaw) {
    try {
      const myRecord = JSON.parse(myRecordRaw)
      if (myRecord && myRecord.name) {
        const found = guests.value.find((g) => g.name.toLowerCase() === myRecord.name.toLowerCase())
        if (!found) {
          guests.value.push(myRecord)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  isLoading.value = false
}

// Delete Guest
const handleDeleteGuest = async (guest) => {
  if (!confirm(`¿Eliminar a "${guest.name}" de la lista de confirmados?`)) {
    return
  }

  sounds.playSabotage()

  // Optimistic UI removal
  guests.value = guests.value.filter((g) => g.id !== guest.id && g.name !== guest.name)

  try {
    await fetch(`/api/rsvp?id=${encodeURIComponent(guest.id || '')}&name=${encodeURIComponent(guest.name)}`, {
      method: 'DELETE',
    })
  } catch (err) {
    // Also try POST delete
    try {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: guest.id, name: guest.name }),
      })
    } catch (e) {
      console.warn(e)
    }
  }

  emit('guestUpdated', guests.value)
  notify(`🗑️ "${guest.name}" eliminado de la lista`)
}

// Save Manual Guest
const handleSaveManualGuest = async () => {
  if (!manualGuest.value.name.trim()) {
    sounds.playCardError()
    alert('Ingresa el nombre del invitado')
    return
  }

  const payload = {
    id: 'guest_manual_' + Date.now(),
    name: manualGuest.value.name.trim(),
    attendance: manualGuest.value.attendance,
    companions: manualGuest.value.companions,
    message: manualGuest.value.message.trim(),
    color: manualGuest.value.color,
    hat: manualGuest.value.hat,
    colorName: manualGuest.value.colorName,
    createdAt: new Date().toISOString(),
  }

  guests.value = guests.value.filter((g) => g.name.toLowerCase() !== payload.name.toLowerCase())
  guests.value.unshift(payload)

  try {
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.warn(err)
  }

  showManualModal.value = false
  manualGuest.value = {
    name: '',
    attendance: 'yes',
    companions: '0',
    message: '',
    color: '#3b82f6',
    hat: 'party-hat',
    colorName: 'Azul',
  }

  sounds.playTaskComplete()
  emit('guestUpdated', guests.value)
  notify(`✅ Invitado "${payload.name}" agregado`)
}

// KPI Statistics
const stats = computed(() => {
  let confirmed = 0
  let declined = 0
  let totalCompanions = 0
  let messagesCount = 0

  guests.value.forEach((g) => {
    if (g.attendance === 'yes') {
      confirmed += 1
      const comp = parseInt(g.companions, 10) || 0
      totalCompanions += comp
    } else {
      declined += 1
    }
    if (g.message && g.message.trim()) {
      messagesCount += 1
    }
  })

  return {
    totalRecords: guests.value.length,
    confirmedCrew: confirmed,
    declinedCrew: declined,
    totalCompanions,
    totalHeadcount: confirmed + totalCompanions, // Total people attending Chak
    messagesCount,
  }
})

// Filtered list
const filteredGuests = computed(() => {
  let list = [...guests.value]

  if (currentFilter.value === 'yes') {
    list = list.filter((g) => g.attendance === 'yes')
  } else if (currentFilter.value === 'no') {
    list = list.filter((g) => g.attendance === 'no')
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(
      (g) =>
        (g.name && g.name.toLowerCase().includes(q)) ||
        (g.message && g.message.toLowerCase().includes(q)) ||
        (g.colorName && g.colorName.toLowerCase().includes(q))
    )
  }

  return list
})

// Export to CSV / Excel
const exportCsv = () => {
  sounds.playTaskComplete()

  const headers = ['ID', 'Nombre', 'Asistencia', 'Acompañantes', 'Total Personas', 'Color Traje', 'Mensaje', 'Fecha Registro']
  
  const rows = guests.value.map((g, idx) => {
    const isYes = g.attendance === 'yes'
    const comp = isYes ? (parseInt(g.companions, 10) || 0) : 0
    const totalP = isYes ? 1 + comp : 0
    const cleanMsg = (g.message || '').replace(/"/g, '""').replace(/\n/g, ' ')
    const cleanName = (g.name || '').replace(/"/g, '""')
    const dateStr = g.createdAt ? new Date(g.createdAt).toLocaleString('es-MX') : 'Reciente'

    return [
      `"${idx + 1}"`,
      `"${cleanName}"`,
      `"${isYes ? 'CONFIRMADO (SÍ)' : 'NO ASISTIRÁ'}"`,
      `"${comp}"`,
      `"${totalP}"`,
      `"${g.colorName || 'Cian'}"`,
      `"${cleanMsg}"`,
      `"${dateStr}"`,
    ].join(',')
  })

  // UTF-8 BOM so Excel opens accents and special characters without encoding glitches
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `invitados-cumple-sioned-${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } })
  notify('📥 ¡Archivo Excel/CSV descargado con éxito!')
}

// Copy WhatsApp Summary
const copyWhatsAppSummary = () => {
  sounds.playTaskComplete()

  const confirmedList = guests.value.filter((g) => g.attendance === 'yes')
  const declinedList = guests.value.filter((g) => g.attendance === 'no')

  let text = `🚀 *LISTA DE ASISTENCIA - CUMPLEAÑOS DE ${EVENT_CONFIG.celebrant.name.toUpperCase()}* 🛸🎂\n`
  text += `📅 *Fecha:* ${EVENT_CONFIG.date} • ${EVENT_CONFIG.time}\n`
  text += `📍 *Lugar:* ${EVENT_CONFIG.location.name} (${EVENT_CONFIG.location.address})\n\n`
  text += `📊 *RESUMEN DE AFORO:*\n`
  text += `• *Tripulantes confirmados:* ${stats.value.confirmedCrew}\n`
  text += `• *Total Personas (Aforo Chak):* ${stats.value.totalHeadcount} personas (niños + acompañantes)\n`
  text += `• *No podrán asistir:* ${stats.value.declinedCrew}\n\n`
  text += `👥 *DETALLE DE ASISTENCIA:*\n`

  if (confirmedList.length === 0) {
    text += `(Aún no hay confirmaciones registradas)\n`
  } else {
    confirmedList.forEach((g, i) => {
      const comp = parseInt(g.companions, 10) || 0
      const compText = comp > 0 ? ` (+${comp} acompañante${comp > 1 ? 's' : ''})` : ' (Solo 1)'
      const colorText = g.colorName ? ` [${g.colorName}]` : ''
      const msgText = g.message ? ` - "${g.message}"` : ''
      text += `${i + 1}. *${g.name}*${compText}${colorText}${msgText}\n`
    })
  }

  if (declinedList.length > 0) {
    text += `\n❌ *NO PODRÁN ASISTIR (${declinedList.length}):*\n`
    declinedList.forEach((g, i) => {
      text += `${i + 1}. ${g.name}\n`
    })
  }

  text += `\n¡Todo listo para la misión espacial en los trampolines! 🤸‍♂️🚀`

  navigator.clipboard.writeText(text).then(() => {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } })
    notify('📋 ¡Resumen copiado! Puedes pegarlo directamente en WhatsApp.')
  }).catch(() => {
    alert('No se pudo copiar automáticamente. Por favor descarga el archivo Excel.')
  })
}

const handleClose = () => {
  sounds.playDoorOpen()
  emit('close')
}

onMounted(() => {
  checkAutoUnlock()
  if (isUnlocked.value) {
    fetchGuests()
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 overflow-hidden select-none"
    >
      <!-- TOAST MESSAGE -->
      <div
        v-if="toastMsg"
        class="fixed top-5 left-1/2 -translate-x-1/2 z-60 bg-emerald-950/95 border-2 border-emerald-400 text-white font-mono text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.5)] animate-fade-in"
      >
        {{ toastMsg }}
      </div>

      <!-- MAIN MODAL CONTAINER -->
      <div
        class="relative w-full max-w-4xl bg-[#070b19]/95 border-2 border-indigo-500/80 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.4)] flex flex-col max-h-[95vh] sm:max-h-[92vh] overflow-hidden"
      >
        <!-- Top Bar Header -->
        <div class="relative z-10 bg-slate-950/90 border-b-2 border-indigo-900/60 p-3 sm:p-4 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-2xl sm:text-3xl">👑</span>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base sm:text-lg font-black text-white uppercase tracking-wider font-mono">
                  Panel de Administración
                </h3>
                <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-full text-[10px] font-mono font-bold">
                  Organizador
                </span>
              </div>
              <p class="text-[11px] text-slate-300 font-mono">
                Lista de Invitados • Cumpleaños de {{ EVENT_CONFIG.celebrant.name }} (Chak Jumping Park)
              </p>
            </div>
          </div>

          <!-- Close Button -->
          <button
            @click="handleClose"
            class="px-3 py-1.5 bg-red-600/30 hover:bg-red-600 border border-red-500/60 hover:border-red-400 text-red-200 hover:text-white rounded-xl font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <span>✕</span>
            <span>Cerrar</span>
          </button>
        </div>

        <!-- ======================================================== -->
        <!-- LOCK SCREEN: PIN PROMPT                                  -->
        <!-- ======================================================== -->
        <div
          v-if="!isUnlocked"
          class="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4"
        >
          <div class="w-16 h-16 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(99,102,241,0.4)]">
            🔐
          </div>
          <div class="max-w-md">
            <h4 class="text-xl font-black text-white font-mono">
              Acceso Exclusivo para Organizadores
            </h4>
            <p class="text-xs text-slate-300 mt-1 font-mono">
              Ingresa el PIN para consultar la lista de asistentes y descargar el reporte de invitados.
            </p>
          </div>

          <form @submit.prevent="handlePinSubmit" class="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs">
            <input
              v-model="inputPin"
              type="password"
              placeholder="PIN (2026)"
              class="w-full bg-slate-900 border-2 rounded-xl px-4 py-2.5 text-center text-white font-mono text-base font-bold outline-none transition-colors"
              :class="pinError ? 'border-red-500 bg-red-950/40' : 'border-indigo-500 focus:border-cyan-400'"
            />
            <button
              type="submit"
              class="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs uppercase rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-md"
            >
              Ingresar
            </button>
          </form>

          <!-- Direct Quick Unlock for Parents -->
          <div class="pt-2">
            <button
              type="button"
              @click="unlockDirect"
              class="text-xs font-mono text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
            >
              👉 Entrar directamente (Soy el papá / mamá de Sioned)
            </button>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- UNLOCKED DASHBOARD CONTENT                               -->
        <!-- ======================================================== -->
        <div v-else class="flex-1 flex flex-col overflow-hidden p-3 sm:p-5 gap-3 sm:gap-4">
          <!-- 1. KPI STATS CARDS -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 flex-shrink-0">
            <!-- Total Headcount (People for Trampoline Park) -->
            <div class="bg-gradient-to-br from-emerald-950/70 to-slate-950 border-2 border-emerald-500/60 rounded-2xl p-2.5 sm:p-3 shadow">
              <span class="text-[10px] font-mono text-emerald-300 uppercase font-black block">
                🤸‍♂️ Aforo Total
              </span>
              <p class="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                {{ stats.totalHeadcount }}
              </p>
              <span class="text-[9px] text-slate-300 font-mono">
                Personas (en Chak)
              </span>
            </div>

            <!-- Confirmed primary guests -->
            <div class="bg-gradient-to-br from-cyan-950/70 to-slate-950 border-2 border-cyan-500/60 rounded-2xl p-2.5 sm:p-3 shadow">
              <span class="text-[10px] font-mono text-cyan-300 uppercase font-black block">
                🚀 Tripulantes Sí
              </span>
              <p class="text-2xl sm:text-3xl font-black text-cyan-400 mt-0.5">
                {{ stats.confirmedCrew }}
              </p>
              <span class="text-[9px] text-slate-300 font-mono">
                +{{ stats.totalCompanions }} acompañantes
              </span>
            </div>

            <!-- Declined count -->
            <div class="bg-gradient-to-br from-red-950/70 to-slate-950 border-2 border-red-500/60 rounded-2xl p-2.5 sm:p-3 shadow">
              <span class="text-[10px] font-mono text-red-300 uppercase font-black block">
                ❌ Sabotaje / No
              </span>
              <p class="text-2xl sm:text-3xl font-black text-red-400 mt-0.5">
                {{ stats.declinedCrew }}
              </p>
              <span class="text-[9px] text-slate-300 font-mono">
                No asistirán
              </span>
            </div>

            <!-- Messages count -->
            <div class="bg-gradient-to-br from-purple-950/70 to-slate-950 border-2 border-purple-500/60 rounded-2xl p-2.5 sm:p-3 shadow">
              <span class="text-[10px] font-mono text-purple-300 uppercase font-black block">
                💌 Mensajes
              </span>
              <p class="text-2xl sm:text-3xl font-black text-purple-400 mt-0.5">
                {{ stats.messagesCount }}
              </p>
              <span class="text-[9px] text-slate-300 font-mono">
                Felicitaciones
              </span>
            </div>
          </div>

          <!-- 2. ACTION TOOLS TOOLBAR -->
          <div class="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
            <!-- Left Tools: Export CSV & WhatsApp Summary -->
            <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                @click="exportCsv"
                class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-black rounded-xl border border-emerald-400 shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="Descargar lista completa en formato Excel (.csv)"
              >
                <span>📥</span>
                <span>Descargar Excel</span>
              </button>

              <button
                @click="copyWhatsAppSummary"
                class="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white font-mono text-xs font-black rounded-xl border border-teal-400 shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="Copiar texto con formato listo para enviar por WhatsApp"
              >
                <span>📋</span>
                <span>Copiar para WhatsApp</span>
              </button>

              <button
                @click="showManualModal = true"
                class="px-2.5 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white font-mono text-xs font-bold rounded-xl border border-indigo-400/80 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Agregar un invitado que confirmó por teléfono o WhatsApp"
              >
                <span>➕</span>
                <span>Agregar Manual</span>
              </button>
            </div>

            <!-- Right Tools: Refresh -->
            <button
              @click="fetchGuests"
              :disabled="isLoading"
              class="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 font-mono text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>{{ isLoading ? '⌛' : '🔄' }}</span>
              <span>Actualizar</span>
            </button>
          </div>

          <!-- 3. SEARCH & STATUS FILTER CHIPS -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0">
            <!-- Search bar -->
            <div class="relative w-full sm:w-72">
              <span class="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre o mensaje..."
                class="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 rounded-xl pl-8 pr-3 py-2 text-white text-xs font-mono outline-none"
              />
            </div>

            <!-- Filter chips -->
            <div class="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                @click="currentFilter = 'all'"
                class="px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                :class="currentFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'"
              >
                Todos ({{ stats.totalRecords }})
              </button>
              <button
                @click="currentFilter = 'yes'"
                class="px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                :class="currentFilter === 'yes' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'"
              >
                Confirmados ({{ stats.confirmedCrew }})
              </button>
              <button
                @click="currentFilter = 'no'"
                class="px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                :class="currentFilter === 'no' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'"
              >
                No Asisten ({{ stats.declinedCrew }})
              </button>
            </div>
          </div>

          <!-- 4. GUEST LIST CARDS / TABLE (SCROLLABLE AREA) -->
          <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
            <!-- Empty state -->
            <div
              v-if="filteredGuests.length === 0"
              class="text-center py-12 text-slate-400 font-mono text-xs"
            >
              <p class="text-3xl mb-2">🚀</p>
              <p>No se encontraron invitados con los filtros actuales.</p>
            </div>

            <!-- Guests cards -->
            <div
              v-for="guest in filteredGuests"
              :key="guest.id || guest.name"
              class="bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
            >
              <!-- Avatar & Info -->
              <div class="flex items-center gap-3 min-w-0">
                <div class="flex-shrink-0">
                  <CrewmateAvatar
                    :color="guest.color || '#3b82f6'"
                    :shadow-color="guest.shadowColor || '#1e40af'"
                    :hat="guest.hat || 'party-hat'"
                    :size="44"
                    animation="none"
                  />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-white font-bold font-mono text-sm truncate">
                      {{ guest.name }}
                    </p>
                    <!-- Attendance Pill -->
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-mono font-black"
                      :class="
                        guest.attendance === 'yes'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      "
                    >
                      {{ guest.attendance === 'yes' ? '✅ SÍ ASISTE' : '❌ SABOTAJE' }}
                    </span>
                  </div>

                  <!-- Details row -->
                  <p class="text-[11px] text-slate-300 font-mono mt-0.5">
                    Traje: <span class="text-cyan-300">{{ guest.colorName || 'Color' }}</span> • 
                    <span v-if="guest.attendance === 'yes'">
                      Acompañantes: <strong class="text-yellow-400">+{{ guest.companions || 0 }}</strong> 
                      ({{ 1 + (parseInt(guest.companions, 10) || 0) }} pers.)
                    </span>
                    <span v-else class="text-slate-500">
                      Sin asistencia
                    </span>
                  </p>

                  <!-- Message -->
                  <p
                    v-if="guest.message"
                    class="text-[11px] text-slate-300 italic font-mono mt-1 bg-slate-900/60 px-2 py-1 rounded border border-slate-800"
                  >
                    💬 "{{ guest.message }}"
                  </p>
                </div>
              </div>

              <!-- Right: Timestamp & Delete Action -->
              <div class="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <span class="text-[10px] font-mono text-slate-300">
                  {{ guest.createdAt ? new Date(guest.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Reciente' }}
                </span>
                <button
                  @click="handleDeleteGuest(guest)"
                  class="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white rounded-lg border border-red-700/60 text-[11px] font-mono transition-all cursor-pointer"
                  title="Eliminar de la lista"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- MODAL HIJO: REGISTRO MANUAL                              -->
        <!-- ======================================================== -->
        <div
          v-if="showManualModal"
          class="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3"
        >
          <div class="bg-slate-950 border-2 border-indigo-400 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 class="text-sm font-black font-mono text-white uppercase">
                ➕ Registrar Invitado Manualmente
              </h4>
              <button
                @click="showManualModal = false"
                class="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form @submit.prevent="handleSaveManualGuest" class="space-y-3">
              <div>
                <label class="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  v-model="manualGuest.name"
                  type="text"
                  required
                  placeholder="Ej. Tía Carmen"
                  class="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-xl px-3 py-2 text-white text-xs outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                    ¿Asiste?
                  </label>
                  <select
                    v-model="manualGuest.attendance"
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                  >
                    <option value="yes">🚀 Sí Asiste</option>
                    <option value="no">❌ No Asiste</option>
                  </select>
                </div>

                <div>
                  <label class="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                    Acompañantes
                  </label>
                  <select
                    v-model="manualGuest.companions"
                    class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none"
                  >
                    <option value="0">Solo 1 (0 comp.)</option>
                    <option value="1">+1 acompañante</option>
                    <option value="2">+2 acompañantes</option>
                    <option value="3">+3 acompañantes</option>
                    <option value="4">+4 o más</option>
                  </select>
                </div>
              </div>

              <!-- Color -->
              <div>
                <label class="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                  Color del Tripulante
                </label>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button
                    v-for="col in colorOptions"
                    :key="col.name"
                    type="button"
                    @click="manualGuest.color = col.hex; manualGuest.colorName = col.name"
                    class="w-6 h-6 rounded-full border-2 transition-transform cursor-pointer"
                    :style="{ backgroundColor: col.hex }"
                    :class="manualGuest.color === col.hex ? 'border-white scale-110 shadow-md' : 'border-slate-800'"
                    :title="col.name"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                  Mensaje o Nota (Opcional)
                </label>
                <input
                  v-model="manualGuest.message"
                  type="text"
                  placeholder="Confirmó por llamada telefónica"
                  class="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-xl px-3 py-2 text-white text-xs outline-none"
                />
              </div>

              <div class="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  @click="showManualModal = false"
                  class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold cursor-pointer"
                >
                  Guardar Invitado
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
