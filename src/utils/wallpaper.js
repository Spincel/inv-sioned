// Generador de Fondos de Pantalla / Pases de Abordaje HD (1080x1920) temático de Among Us

function drawCrewmate(ctx, { x, y, scale = 1, color = '#ef4444', shadowColor = '#991b1b', hat = 'party-hat', hasCrown = false }) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  // Mochila de oxígeno
  ctx.fillStyle = shadowColor || '#dc2626'
  ctx.beginPath()
  ctx.roundRect(-215, -110, 70, 215, 35)
  ctx.fill()
  ctx.lineWidth = 16
  ctx.strokeStyle = '#0c0d14'
  ctx.stroke()

  // Cuerpo
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(-155, -185, 310, 370, [155, 155, 45, 45])
  ctx.fill()
  ctx.lineWidth = 18
  ctx.strokeStyle = '#0c0d14'
  ctx.stroke()

  // Visor
  ctx.fillStyle = '#67e8f9'
  ctx.beginPath()
  ctx.roundRect(-55, -125, 230, 125, 60)
  ctx.fill()
  ctx.lineWidth = 16
  ctx.strokeStyle = '#0c0d14'
  ctx.stroke()

  // Reflejo en Visor
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.beginPath()
  ctx.roundRect(-15, -110, 125, 45, 20)
  ctx.fill()

  // Gorrito de Fiesta
  if (hat === 'party-hat') {
    ctx.fillStyle = '#f43f5e'
    ctx.beginPath()
    ctx.moveTo(0, -315)
    ctx.lineTo(-75, -185)
    ctx.lineTo(75, -185)
    ctx.closePath()
    ctx.fill()
    ctx.lineWidth = 14
    ctx.strokeStyle = '#0c0d14'
    ctx.stroke()

    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.moveTo(-35, -230)
    ctx.lineTo(35, -230)
    ctx.lineTo(45, -205)
    ctx.lineTo(-45, -205)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#facc15'
    ctx.beginPath()
    ctx.arc(0, -320, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  // Corona para festejada
  if (hasCrown) {
    ctx.fillStyle = '#facc15'
    ctx.beginPath()
    ctx.moveTo(-30, -340)
    ctx.lineTo(-45, -385)
    ctx.lineTo(-15, -360)
    ctx.lineTo(0, -395)
    ctx.lineTo(15, -360)
    ctx.lineTo(45, -385)
    ctx.lineTo(30, -340)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#854d0e'
    ctx.lineWidth = 6
    ctx.stroke()
  }

  ctx.restore()
}

export function generateWallpaperDataUrl({
  guestName = '',
  guestColor = '#06b6d4',
  guestColorName = 'Cian',
  celebrantName = 'Sioned',
  age = 8,
  dateText = 'DOMINGO, 25 DE OCTUBRE DE 2026',
  timeText = '3:00 PM',
  locationName = 'CHAK JUMPING PARK',
  locationAddress = 'Miguel Lebrija 43, Col. Aviación, Tepic',
  dressCode = 'CALCETINES ANTIDERRAPANTES Y ROPA CÓMODA',
} = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1920
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // 1. Fondo Gradiente Espacio Profundo
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920)
  bgGrad.addColorStop(0, '#030712')
  bgGrad.addColorStop(0.3, '#0b0f2a')
  bgGrad.addColorStop(0.65, '#180e38')
  bgGrad.addColorStop(1, '#030712')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1080, 1920)

  // 2. Campo de Estrellas Brillantes
  for (let i = 0; i < 230; i++) {
    const sx = Math.random() * 1080
    const sy = Math.random() * 1920
    const sr = Math.random() * 2.5 + 0.6
    ctx.fillStyle = Math.random() > 0.35 ? '#ffffff' : '#38bdf8'
    ctx.beginPath()
    ctx.arc(sx, sy, sr, 0, Math.PI * 2)
    ctx.fill()
  }

  // 3. Nebulosa Resplandeciente Central
  const neb = ctx.createRadialGradient(540, 680, 40, 540, 680, 520)
  neb.addColorStop(0, 'rgba(6, 182, 212, 0.42)')
  neb.addColorStop(0.45, 'rgba(239, 68, 68, 0.28)')
  neb.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = neb
  ctx.fillRect(0, 0, 1080, 1920)

  // 4. Encabezado Superior
  ctx.textAlign = 'center'
  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 34px monospace'
  ctx.fillText('★ MISIÓN ESPACIAL • THE SKELD ★', 540, 150)

  // 5. TÍTULO PRINCIPAL: ¡SIONED CUMPLE 8 AÑOS!
  ctx.fillStyle = '#fde047'
  ctx.font = '900 78px system-ui, sans-serif'
  ctx.shadowColor = 'rgba(234, 179, 8, 0.8)'
  ctx.shadowBlur = 30
  ctx.fillText(`¡${(celebrantName || 'SIONED').toUpperCase()} CUMPLE ${age} AÑOS! 🎂`, 540, 260)
  ctx.shadowBlur = 0

  ctx.fillStyle = '#e2e8f0'
  ctx.font = 'bold 34px monospace'
  ctx.fillText('TRIPULANTE DE HONOR • REUNIÓN DE EMERGENCIA', 540, 330)

  // 6. Ilustración de los Tripulantes: Sioned (Honor) y el Invitado celebrando juntos
  const hasGuest = Boolean(guestName && guestName.trim() && guestName !== 'TRIPULANTE INVITADO')
  
  if (hasGuest) {
    // Sioned (Izquierda)
    drawCrewmate(ctx, {
      x: 350,
      y: 690,
      scale: 0.72,
      color: '#ef4444',
      shadowColor: '#991b1b',
      hat: 'party-hat',
      hasCrown: true,
    })

    // Invitado (Derecha)
    const colorShadowMap = {
      '#ef4444': '#991b1b',
      '#06b6d4': '#0e7490',
      '#ec4899': '#be185d',
      '#eab308': '#a16207',
      '#84cc16': '#4d7c0f',
      '#a855f7': '#7e22ce',
      '#f97316': '#c2410c',
      '#e2e8f0': '#94a3b8',
    }
    const guestShadow = colorShadowMap[guestColor] || '#0e7490'

    drawCrewmate(ctx, {
      x: 730,
      y: 690,
      scale: 0.72,
      color: guestColor || '#06b6d4',
      shadowColor: guestShadow,
      hat: 'party-hat',
      hasCrown: false,
    })

    // Badges con nombres debajo de cada uno
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 26px monospace'
    ctx.fillText('👑 SIONED (HONOR)', 350, 855)

    ctx.fillStyle = '#38bdf8'
    ctx.font = 'bold 26px monospace'
    ctx.fillText(`⭐ ${guestName.toUpperCase()}`, 730, 855)
  } else {
    // Solo Sioned centrada
    drawCrewmate(ctx, {
      x: 540,
      y: 660,
      scale: 0.95,
      color: '#ef4444',
      shadowColor: '#991b1b',
      hat: 'party-hat',
      hasCrown: true,
    })
  }

  // 7. Tarjeta VIP de Pase de Abordaje para el Invitado
  const cardY = 980
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)'
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.roundRect(100, cardY, 880, 260, 32)
  ctx.fill()
  ctx.stroke()

  // Contenido de la Tarjeta
  ctx.fillStyle = '#34d399'
  ctx.font = 'bold 30px monospace'
  ctx.fillText('🎫 PASE OFICIAL DE ABORDAJE • VIP', 540, cardY + 58)

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 52px system-ui, sans-serif'
  const displayGuest = guestName && guestName.trim() ? guestName.trim() : 'TRIPULANTE INVITADO'
  ctx.fillText(displayGuest.toUpperCase(), 540, cardY + 135)

  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 32px monospace'
  ctx.fillText(`TRAJE: ${(guestColorName || 'CIAN').toUpperCase()} • ¡MISIÓN ACEPTADA! ✅`, 540, cardY + 205)

  // 8. Tarjeta de Coordenadas, Fecha y Equipamiento
  const infoY = 1285
  ctx.fillStyle = 'rgba(2, 6, 23, 0.92)'
  ctx.strokeStyle = '#38bdf8'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(100, infoY, 880, 490, 32)
  ctx.fill()
  ctx.stroke()

  // Lugar
  ctx.fillStyle = '#6ee7b7'
  ctx.font = '900 48px system-ui, sans-serif'
  ctx.fillText(`📍 ${locationName}`, 540, infoY + 75)

  ctx.fillStyle = '#cbd5e1'
  ctx.font = '28px monospace'
  ctx.fillText(locationAddress, 540, infoY + 128)

  // Línea divisoria
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(180, infoY + 165)
  ctx.lineTo(900, infoY + 165)
  ctx.stroke()

  // Fecha y Hora
  ctx.fillStyle = '#facc15'
  ctx.font = '900 42px monospace'
  ctx.fillText(`📅 ${dateText}`, 540, infoY + 235)

  ctx.fillStyle = '#fef08a'
  ctx.font = 'bold 44px monospace'
  ctx.fillText(`⏰ HORA: ${timeText}`, 540, infoY + 300)

  // Aviso de calcetines y ropa cómoda
  ctx.fillStyle = '#f472b6'
  ctx.font = 'bold 28px monospace'
  ctx.fillText(`🧦 ${dressCode}`, 540, infoY + 380)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '24px monospace'
  ctx.fillText('¡INDISPENSABLE PARA BRINCAR EN LOS TRAMPOLINES!', 540, infoY + 430)

  // Pie de Página
  ctx.fillStyle = '#06b6d4'
  ctx.font = 'bold 26px monospace'
  ctx.fillText('★ INVITACIÓN INTERACTIVA AMONG US ★', 540, 1845)

  return canvas.toDataURL('image/png')
}

export function downloadWallpaper(dataUrl, filename = 'pase-sioned-8-anos.png') {
  if (!dataUrl) return
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
