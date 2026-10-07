<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)
let animId = null
let handleResize = null
let handleVisibilityChange = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  let resizeTimeout = null
  handleResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }, 150)
  }
  window.addEventListener('resize', handleResize, { passive: true })

  // 50 lightweight stars
  const starCount = 50
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.2 + 0.6,
    speed: Math.random() * 0.25 + 0.05,
  }))

  // Helper to create pre-rendered cached mini-astronaut sprites
  const createMiniAstronautSprite = (color) => {
    const offCanvas = document.createElement('canvas')
    offCanvas.width = 40
    offCanvas.height = 50
    const offCtx = offCanvas.getContext('2d')
    if (!offCtx) return offCanvas

    offCtx.translate(20, 25)
    offCtx.scale(0.18, 0.18)

    // Body
    offCtx.fillStyle = color
    offCtx.strokeStyle = '#000000'
    offCtx.lineWidth = 10
    offCtx.lineJoin = 'round'

    // Backpack
    offCtx.beginPath()
    offCtx.roundRect(-80, -30, 30, 80, 10)
    offCtx.fill()
    offCtx.stroke()

    // Main body
    offCtx.beginPath()
    offCtx.roundRect(-50, -60, 90, 130, 40)
    offCtx.fill()
    offCtx.stroke()

    // Visor
    offCtx.fillStyle = '#93c5fd'
    offCtx.beginPath()
    offCtx.roundRect(-20, -35, 65, 40, 18)
    offCtx.fill()
    offCtx.stroke()

    // Visor shine
    offCtx.fillStyle = '#ffffff'
    offCtx.beginPath()
    offCtx.ellipse(0, -25, 12, 5, -0.2, 0, Math.PI * 2)
    offCtx.fill()

    return offCanvas
  }

  // Pre-cached sprites
  const miniAstronauts = [
    {
      x: -50,
      y: height * 0.25,
      vx: 0.35,
      vy: 0.12,
      rot: 0,
      rotSpeed: 0.004,
      sprite: createMiniAstronautSprite('#06b6d4'),
    },
    {
      x: width + 50,
      y: height * 0.65,
      vx: -0.25,
      vy: -0.08,
      rot: 1.2,
      rotSpeed: -0.003,
      sprite: createMiniAstronautSprite('#ec4899'),
    },
    {
      x: width * 0.2,
      y: -60,
      vx: 0.18,
      vy: 0.3,
      rot: 2.1,
      rotSpeed: 0.005,
      sprite: createMiniAstronautSprite('#eab308'),
    },
  ]

  // Shooting star
  let shootingStar = null
  let nextShootingStarTime = Date.now() + 5000

  const spawnShootingStar = () => {
    shootingStar = {
      x: Math.random() * width * 0.8,
      y: Math.random() * height * 0.3,
      length: Math.random() * 60 + 30,
      speed: Math.random() * 7 + 5,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      life: 1,
    }
  }

  // Capped at 30 FPS to save CPU/GPU and prevent system freezes
  const FPS = 30
  const fpsInterval = 1000 / FPS
  let lastTime = 0

  const render = (currentTime) => {
    animId = requestAnimationFrame(render)

    if (document.hidden) return

    const elapsed = currentTime - lastTime
    if (elapsed < fpsInterval) return
    lastTime = currentTime - (elapsed % fpsInterval)

    ctx.clearRect(0, 0, width, height)

    // Batch draw stars with single beginPath/fill call
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.beginPath()
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i]
      s.y -= s.speed
      if (s.y < 0) {
        s.y = height
        s.x = Math.random() * width
      }
      ctx.moveTo(s.x + s.radius, s.y)
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
    }
    ctx.fill()

    // Shooting star
    const now = Date.now()
    if (now > nextShootingStarTime && !shootingStar) {
      spawnShootingStar()
      nextShootingStarTime = now + Math.random() * 8000 + 6000
    }

    if (shootingStar) {
      const { x, y, length, speed, angle, life } = shootingStar
      ctx.save()
      ctx.strokeStyle = `rgba(255, 255, 255, ${life})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - Math.cos(angle) * length, y - Math.sin(angle) * length)
      ctx.stroke()
      ctx.restore()

      shootingStar.x += Math.cos(angle) * speed
      shootingStar.y += Math.sin(angle) * speed
      shootingStar.life -= 0.03
      if (shootingStar.life <= 0) {
        shootingStar = null
      }
    }

    // Mini astronauts via pre-rendered sprite drawImage
    for (let i = 0; i < miniAstronauts.length; i++) {
      const ast = miniAstronauts[i]
      ast.x += ast.vx
      ast.y += ast.vy
      ast.rot += ast.rotSpeed

      if (ast.x > width + 60) ast.x = -60
      if (ast.x < -60) ast.x = width + 60
      if (ast.y > height + 60) ast.y = -60
      if (ast.y < -60) ast.y = height + 60

      ctx.save()
      ctx.translate(ast.x, ast.y)
      ctx.rotate(ast.rot)
      ctx.drawImage(ast.sprite, -20, -25)
      ctx.restore()
    }
  }

  animId = requestAnimationFrame(render)

  handleVisibilityChange = () => {
    if (!document.hidden) {
      lastTime = performance.now()
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    if (animId) cancelAnimationFrame(animId)
  })
})
</script>

<template>
  <!-- Ambient static background gradient handled natively by CSS (zero GPU penalty) -->
  <div
    class="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_50%_40%,_#0f172a_0%,_#070a13_55%,_#030509_100%)]"
  />
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none -z-10 w-full h-full"
  />
</template>
