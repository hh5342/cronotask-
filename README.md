# Cronotask - Cronómetro y Analítica de Productividad

Aplicación web y de escritorio para cronometrar sesiones de trabajo, tomar notas, autoevaluar foco y generar reportes ejecutivos consolidados en PDF con gráficos comparativos diarios y mensuales.

---

## 🚀 Cómo abrirlo en tu Desktop con 1 solo clic

### Opción A: En Mac (Doble clic directo)
En la carpeta descargada en tu Mac, haz **doble clic** sobre:
```text
iniciar_mac.command
```
*(Verifica dependencias, arranca el servidor y abre automáticamente tu navegador en `http://localhost:3000` sin que tengas que teclear nada en la terminal)*.

> **Tip:** Puedes arrastrar el archivo `iniciar_mac.command` directamente a tu Escritorio o crearle un alias para tenerlo como un icono accesible.

### Opción B: En Windows
Haz **doble clic** sobre:
```text
iniciar_windows.bat
```

### Opción C: Instalar como App de Escritorio Nativa (PWA en el Dock / Barra de tareas)
1. Abre la aplicación en tu navegador (Chrome, Edge o Safari).
2. Haz clic en el nuevo botón **«Desktop»** en la barra superior de la web.
3. Pulsa **«Instalar Cronotask en Escritorio»** (o en Safari: *Archivo > Añadir al Dock*).
4. La aplicación se abrirá en su **propia ventana independiente de escritorio**, con icono en el Dock / Escritorio, sin barra de direcciones.

---

## Ejecución manual tradicional por terminal
1. `npm install`
2. `npm run dev`
3. Abre `http://localhost:3000`

---

## Dónde se guardan los datos
- **En tu disco duro local:** `/data/sessions.json`
- **En tu navegador:** `localStorage`
- **En reportes PDF:** Pestaña *Reporte PDF* -> Descargar PDF Consolidado o Individual.
