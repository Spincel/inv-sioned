// Vercel Serverless Function: /api/rsvp
// Handles saving, retrieving, and managing RSVP confirmations for Sioned's birthday

import fs from 'fs'
import path from 'path'

const TMP_FILE = path.join('/tmp', 'sioned_rsvp_store.json')

let inMemoryGuests = []

function loadGuests() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf8')
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        inMemoryGuests = parsed
      }
    }
  } catch (e) {
    console.warn('Failed reading /tmp file:', e)
  }
  return inMemoryGuests
}

function saveGuests(list) {
  inMemoryGuests = list
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(list, null, 2), 'utf8')
  } catch (e) {
    console.warn('Failed writing /tmp file:', e)
  }
}

function calculateStats(guests) {
  let confirmed = 0
  let declined = 0
  let companions = 0
  let messages = 0

  guests.forEach((g) => {
    if (g.attendance === 'yes') {
      confirmed += 1
      const comp = parseInt(g.companions, 10) || 0
      companions += comp
    } else {
      declined += 1
    }
    if (g.message && g.message.trim()) {
      messages += 1
    }
  })

  return {
    totalGuests: guests.length,
    totalConfirmed: confirmed,
    totalDeclined: declined,
    totalCompanions: companions,
    totalHeadcount: confirmed + companions, // attendees + their companions
    totalMessages: messages,
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  let currentGuests = loadGuests()

  // DELETE a guest
  if (req.method === 'DELETE') {
    const { id, name } = req.query || {}
    if (!id && !name) {
      return res.status(400).json({ error: 'ID o Nombre es requerido para eliminar' })
    }

    currentGuests = currentGuests.filter((g) => {
      if (id && g.id === id) return false
      if (name && g.name.toLowerCase() === name.toLowerCase()) return false
      return true
    })

    saveGuests(currentGuests)
    const stats = calculateStats(currentGuests)

    return res.status(200).json({
      success: true,
      message: 'Invitado eliminado',
      guests: currentGuests,
      stats,
    })
  }

  // POST: Create, Update, Delete or Batch Sync
  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      const { action, id, name, attendance, companions = '0', message = '', color = '#06b6d4', hat = 'party-hat', colorName = 'Cian', guests } = data

      // Batch Sync Action
      if (action === 'sync' && Array.isArray(guests)) {
        const mergedMap = new Map()
        currentGuests.forEach((g) => mergedMap.set(g.name.toLowerCase(), g))
        guests.forEach((g) => {
          if (g && g.name) {
            mergedMap.set(g.name.toLowerCase(), {
              id: g.id || 'guest_' + Date.now(),
              name: g.name.trim(),
              attendance: g.attendance || 'yes',
              companions: String(g.companions || '0'),
              message: (g.message || '').trim(),
              color: g.color || '#06b6d4',
              hat: g.hat || 'party-hat',
              colorName: g.colorName || 'Cian',
              createdAt: g.createdAt || new Date().toISOString(),
            })
          }
        })
        currentGuests = Array.from(mergedMap.values())
        saveGuests(currentGuests)
        const stats = calculateStats(currentGuests)
        return res.status(200).json({ success: true, guests: currentGuests, stats })
      }

      // Delete action via POST (fallback for restrictive environments)
      if (action === 'delete') {
        const targetId = id || data.guestId
        const targetName = name || data.guestName
        currentGuests = currentGuests.filter((g) => {
          if (targetId && g.id === targetId) return false
          if (targetName && g.name.toLowerCase() === targetName.toLowerCase()) return false
          return true
        })
        saveGuests(currentGuests)
        const stats = calculateStats(currentGuests)
        return res.status(200).json({ success: true, message: 'Invitado eliminado', guests: currentGuests, stats })
      }

      // Create or Update single RSVP
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Nombre es requerido' })
      }

      const guestId = id || 'guest_' + Date.now()
      const newGuest = {
        id: guestId,
        name: name.trim(),
        attendance: attendance || 'yes',
        companions: String(companions),
        message: message.trim(),
        color,
        hat,
        colorName,
        createdAt: new Date().toISOString(),
      }

      // Replace if same name or id exists, otherwise append
      const existingIdx = currentGuests.findIndex(
        (g) => (g.id && g.id === guestId) || g.name.toLowerCase() === newGuest.name.toLowerCase()
      )

      if (existingIdx >= 0) {
        currentGuests[existingIdx] = {
          ...currentGuests[existingIdx],
          ...newGuest,
          updatedAt: new Date().toISOString(),
        }
      } else {
        currentGuests.push(newGuest)
      }

      saveGuests(currentGuests)
      const stats = calculateStats(currentGuests)

      // Forward to Google Sheets Webhook in Google Drive if configured
      const sheetWebhook =
        process.env.GOOGLE_SHEET_WEBHOOK_URL ||
        'https://script.google.com/macros/s/AKfycbxD_noQ2gvUVoIvtoujuUhNeL9oBxQgFOeJMCFTpQIfvvTNWB9sMuiYoCCSVuNScc8Atw/exec'
      if (sheetWebhook) {
        try {
          fetch(sheetWebhook, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(newGuest),
          }).catch((err) => console.warn('Background Google Sheet sync error:', err))
        } catch (err) {
          console.warn('Error calling Google Sheet webhook:', err)
        }
      }

      return res.status(200).json({
        success: true,
        message: '¡Registro guardado con éxito!',
        guest: newGuest,
        guests: currentGuests,
        stats,
      })
    } catch (err) {
      console.error('Error saving RSVP:', err)
      return res.status(500).json({ error: 'Error interno guardando registro', details: err.message })
    }
  }

  // GET: Return guests list and stats
  if (req.method === 'GET') {
    const stats = calculateStats(currentGuests)
    return res.status(200).json({
      success: true,
      guests: currentGuests,
      count: currentGuests.length,
      stats,
    })
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
