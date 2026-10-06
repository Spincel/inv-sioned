# 🚀 Invitación de Cumpleaños Among Us: ¡Misión Sioned!

Una página web de invitación interactiva, moderna y dinámica para la fiesta de **Sioned**, con temática de **Among Us**, efectos de sonido retro espaciales, minijuegos jugables, animaciones y lista para desplegar en **Vercel**.

Inspirada en el estilo de invitación digital moderna (como FiestaSnap) pero adaptada al universo espacial de Among Us.

---

## ✨ Características Principales

1. **🚨 Botón y Modal "Emergency Meeting"**:
   - Alerta con sirena clásica de Among Us y pantalla de discusión con chat de tripulantes.
2. **🎮 Estación de Minijuegos Interactivas ("Tareas de la Nave")**:
   - **⚡ Conectar Cables (Fix Wiring)**: Une los cables de colores (Rojo, Azul, Amarillo, Rosa) con chispas de sonido y efecto eléctrico.
   - **💳 Deslizar Tarjeta (Swipe Card)**: Deslizador con detección de velocidad (*Too fast, Too slow, Accepted!*) para obtener el Pase VIP.
   - **Barra de Progreso de Tareas**: Se llena al 100% con lluvia de confeti (`canvas-confetti`) y fanfarria.
3. **🌌 Fondo Espacial Dinámico**:
   - Canvas con estrellas titilantes, estrellas fugaces y mini astronautas flotando en gravedad cero.
4. **🔊 Motor de Audio Sintetizado (Web Audio API)**:
   - Sin problemas de archivos de audio faltantes ni errores 404: sirena de emergencia, chispas eléctricas, chime de "Task Complete" y melodía espacial 8-bit con botón para activar/silenciar.
5. **⏳ Cuenta Regresiva de la Misión**:
   - Panel de control espacial con días, horas, minutos y segundos, además del botón **"Guardar en Google Calendar"**.
6. **🎨 Personalizador de Tripulante**:
   - Los invitados pueden elegir el color de su traje (Rojo, Cian, Rosa, Amarillo, Verde, Morado, etc.) y su accesorio (gorrito de fiesta, corona, planta, globo).
7. **📍 Coordenadas de la Misión**:
   - Fecha, hora, ubicación, botones directos para **Google Maps** y **Waze**, código de vestimenta y sugerencia de regalos/lluvia de sobres.
8. **📝 Registro de Asistencia (RSVP) & Pase de Abordaje**:
   - Formulario de confirmación que envía automáticamente los datos formateados a **WhatsApp** del organizador y genera una credencial de tripulante autorizada.
9. **📸 Galería de Recuerdos**:
   - Polaroids con stickers de Among Us para ver fotos de Sioned.

---

## 🛠️ Cómo Personalizar los Datos de la Fiesta

Todos los datos están centralizados en el archivo:
📁 **`src/config/event.js`**

Puedes cambiar fácilmente:
- `celebrant.name`: Nombre de la festejada (actualmente `Sioned`).
- `celebrant.age`: Años que cumple.
- `dateTime.targetDate`: Fecha y hora en formato ISO (`2026-10-24T16:00:00`).
- `dateTime.displayDate`: Texto legible de la fecha.
- `location.name` y `location.address`: Nombre y dirección del salón.
- `location.mapsUrl` y `location.wazeUrl`: Enlaces directos a los mapas.
- `rsvp.whatsappNumber`: Número telefónico (con código de país) que recibirá las confirmaciones en WhatsApp.

---

## 🚀 Cómo Ejecutar en Local

```bash
# 1. Instalar dependencias (si aún no lo has hecho)
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:5173`.

---

## ☁️ Cómo Desplegar en Vercel

El proyecto ya incluye `vercel.json` configurado para Vite y Vue 3.

### Opción 1: Con la CLI de Vercel (Recomendada rápida)
```bash
npx vercel
```
Sigue los pasos interactivos en la terminal y listo.

### Opción 2: Desde GitHub
1. Sube este repositorio a tu cuenta de GitHub.
2. Entra en [vercel.com](https://vercel.com) y haz clic en **"Add New Project"**.
3. Selecciona tu repositorio. Vercel detectará automáticamente que es un proyecto **Vite**.
4. Haz clic en **Deploy**.
