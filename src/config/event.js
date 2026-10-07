// Configuración general del Evento - Cumpleaños de Sioned (Temática Among Us)

export const EVENT_CONFIG = {
  celebrant: {
    name: 'Sioned',
    age: 8, // Puedes cambiar la edad aquí
    role: 'Tripulante de Honor',
    favoriteColor: '#ef4444', // Red crewmate
    hat: 'party-hat', // 'party-hat', 'crown', 'sprout', etc.
  },
  mission: {
    title: '¡MISIÓN CUMPLEAÑOS!',
    codeName: 'OPERACIÓN: FIESTA SIONED',
    emergencyMessage: '¡SE HA CONVOCADO UNA REUNIÓN DE EMERGENCIA EN LA NAVE!',
    description: 'Atención tripulación: Se ha detectado un festejo de alta prioridad en el sector espacial. ¡No te quedes flotando en el espacio y acompáñanos a celebrar a Sioned!',
  },
  dateTime: {
    // Fecha para el contador regresivo (Formato ISO: YYYY-MM-DDTHH:mm:ss)
    targetDate: '2026-10-25T15:00:00',
    displayDate: 'Domingo, 25 de Octubre de 2026',
    displayTime: '3:00 PM',
  },
  location: {
    name: 'Base Estelar "Salón de Eventos Los Olivos"',
    subname: 'Sector The Skeld - Salón Principal',
    address: 'Av. Paseo de las Flores #340, Fracc. Las Brisas, Tepic, Nayarit',
    mapsUrl: 'https://maps.google.com/?q=Salon+de+Eventos+Los+Olivos',
    wazeUrl: 'https://waze.com/ul?q=Salon+de+Eventos+Los+Olivos',
    coordinates: '21.5039° N, 104.8946° W',
  },
  dressCode: {
    title: 'Código de Tripulante',
    description: 'Viste ropa cómoda o una prenda con el color de tu tripulante favorito de Among Us (Rojo, Cian, Rosa, Amarillo, Verde, Morado o Negro).',
  },
  gifts: {
    title: 'Carga Útil / Mesa de Regalos',
    description: 'Tu asistencia es nuestro combustible principal 🚀. Si deseas tener un detalle con Sioned, una lluvia de sobres o su regalo favorito completará su barra de tareas.',
    type: 'Lluvia de Sobres / Regalo Opcional',
  },
  rsvp: {
    whatsappNumber: '523110000000', // Modifica este número con el teléfono real del organizador
    deadline: 'Por favor confirma antes del 20 de Octubre',
  },
  crewColors: [
    { name: 'Rojo', hex: '#ef4444', dark: '#991b1b', text: 'Impostor Sus' },
    { name: 'Cian', hex: '#06b6d4', dark: '#0e7490', text: 'Cian Kawaii' },
    { name: 'Rosa', hex: '#ec4899', dark: '#be185d', text: 'Rosa Pastel' },
    { name: 'Amarillo', hex: '#eab308', dark: '#a16207', text: 'Amarillo Spark' },
    { name: 'Verde Lima', hex: '#84cc16', dark: '#4d7c0f', text: 'Lima Gamer' },
    { name: 'Morado', hex: '#a855f7', dark: '#7e22ce', text: 'Morado Espacial' },
    { name: 'Naranja', hex: '#f97316', dark: '#c2410c', text: 'Naranja Turbo' },
    { name: 'Blanco', hex: '#e2e8f0', dark: '#94a3b8', text: 'Blanco Lunar' },
  ],
}
