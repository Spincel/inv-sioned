// Vercel Serverless Function: /api/rsvp
// Handles saving and retrieving RSVP confirmations directly without WhatsApp dependency

let inMemoryGuests = []

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

  if (req.method === 'POST') {
    try {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      const { name, attendance, companions = '0', message = '', color = '#06b6d4', hat = 'party-hat', colorName = 'Cian' } = data

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Nombre es requerido' })
      }

      const newGuest = {
        id: 'guest_' + Date.now(),
        name: name.trim(),
        attendance: attendance || 'yes',
        companions: String(companions),
        message: message.trim(),
        color,
        hat,
        colorName,
        createdAt: new Date().toISOString(),
      }

      // Add to in-memory list (unique by name)
      inMemoryGuests = inMemoryGuests.filter((g) => g.name.toLowerCase() !== newGuest.name.toLowerCase())
      inMemoryGuests.push(newGuest)

      return res.status(200).json({
        success: true,
        message: '¡Registro guardado con éxito!',
        guest: newGuest,
        totalGuests: inMemoryGuests.length,
      })
    } catch (err) {
      console.error('Error saving RSVP:', err)
      return res.status(500).json({ error: 'Error interno guardando registro', details: err.message })
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      guests: inMemoryGuests,
      count: inMemoryGuests.length,
    })
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
