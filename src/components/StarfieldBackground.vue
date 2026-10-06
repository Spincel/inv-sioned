<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref(null)
let animId = null

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  const handleResize = () => {
    if (!canvas) return
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', handleResize)

  // Star objects
  const starCount = Math.floor(Math.min(window.innerWidth, 1200) / 7)
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.8 + 0.2,
    speed: Math.random() * 0.3 + 0.05,
    twinkleSpeed: (Math.random() - 0.5) * 0.02,
  }))

  // Tiny floating astronauts in deep space
  const miniAstronauts = [
    {
      x: -50,
      y: height * 0.25,
      vx: 0.4,
      vy: 0.15,
      rot: 0,
      rotSpeed: 0.005,
      scale: 0.18,
      color: '#06b6d4', // Cyan
    },
    {
      x: width + 50,
      y: height * 0.65,
      vx: -0.3,
      vy: -0.1,
      rot: 1.2,
      rotSpeed: -0.004,
      scale: 0.14,
      color: '#ec4899', // Pink
    },
    {
      x: width * 0.2,
      y: -60,
      vx: 0.2,
      vy: 0.35,
      rot: 2.1,
      rotSpeed: 0.006,
      scale: 0.15,
      color: '#eab308', // Yellow
    },
  ]

  // Shooting star
  let shootingStar = null
  const spawnShootingStar = () => {
    shootingStar = {
      x: Math.random() * width * 0.8,
      y: Math.random() * height * 0.3,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 8 + 6,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      life: 1,
    }
  }

  let nextShootingStarTime = Date.now() + 4000

  // Draw tiny simplified Among Us crewmate
  const drawMiniCrewmate = (ctx, ast) => {
    ctx.save()
    ctx.translate(ast.x, ast.y)
    ctx.rotate(ast.rot)
    ctx.scale(ast.scale, ast.scale)

    // Body
    ctx.fillStyle = ast.color
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 10
    ctx.lineJoin = 'round'

    // Backpack
    ctx.beginPath()
    ctx.roundRect(-80, -30, 30, 80, 10)
    ctx.fill()
    ctx.stroke()

    // Main body
    ctx.beginPath()
    ctx.roundRect(-50, -60, 90, 130, 40)
    ctx.fill()
    ctx.stroke()

    // Visor
    ctx.fillStyle = '#93c5fd'
    ctx.beginPath()
    ctx.roundRect(-20, -35, 65, 40, 18)
    ctx.fill()
    ctx.stroke()

    // Visor shine
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.ellipse(0, -25, 12, 5, -0.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  const render = () => {
    ctx.clearRect(0, 0, width, height)

    // Ambient space gradient
    const bgGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.4,
      100,
      width * 0.5,
      height * 0.5,
      Math.max(width, height)
    )
    bgGrad.addColorStop(0, '#0f172a')
    bgGrad.addColorStop(0.5, '#070a13')
    bgGrad.addColorStop(1, '#030509')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, width, height)

    // Draw & update stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i]
      s.alpha += s.twinkleSpeed
      if (s.alpha > 0.95 || s.alpha < 0.15) {
        s.twinkleSpeed = -s.twinkleSpeed
      }

      s.y -= s.speed
      if (s.y < 0) {
        s.y = height
        s.x = Math.random() * width
      }

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, s.alpha))})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Shooting star
    if (Date.now() > nextShootingStarTime && !shootingStar) {
      spawnShootingStar()
      nextShootingStarTime = Date.now() + Math.random() * 7000 + 5000
    }

    if (shootingStar) {
      const { x, y, length, speed, angle, life } = shootingStar
      ctx.save()
      ctx.strokeStyle = `rgba(255, 255, 255, ${life})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - Math.cos(angle) * length, y - Math.sin(angle) * length)
      ctx.stroke()
      ctx.restore()

      shootingStar.x += Math.cos(angle) * speed
      shootingStar.y += Math.sin(angle) * speed
      shootingStar.life -= 0.02
      if (shootingStar.life <= 0) {
        shootingStar = null
      }
    }

    // Floating mini astronauts
    for (const ast of miniAstronauts) {
      ast.x += ast.vx
      ast.y += ast.vy
      ast.rot += ast.rotSpeed

      // Loop around screen edges
      if (ast.x > width + 100) ast.x = -100
      if (ast.x < -100) ast.x = width + 100
      if (ast.y > height + 100) ast.y = -100
      if (ast.y < -100) ast.y = height + 100

      drawMiniCrewmate(ctx, ast)
    }

    animId = requestAnimationFrame(render)
  }

  animId = requestAnimationFrame(render)

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    if (animId) cancelAnimationFrame(animId)
  })
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 pointer-events-none z-0 w-full h-full"
  />
</template>
