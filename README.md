# UBICATE - Landing Page

Landing page de pre-lanzamiento para UBICATE, app de taxis colectivos en la Región de Coquimbo.

## Estructura del proyecto

```
ubicate-landing/
├── index.html            ← Página principal
├── server.js             ← Backend Node.js (Express)
├── package.json          ← Dependencias del proyecto
├── .env                  ← Variables de entorno (puerto, clave admin)
├── css/
│   ├── styles.css        ← Estilos principales
│   └── animations.css    ← Animaciones de entrada
├── js/
│   └── main.js           ← JavaScript frontend (menú, formulario, FAQ)
├── img/
│   ├── logo.jpeg         ← Logo de UBICATE
│   ├── mascota.png       ← Mascota (fondo transparente)
│   └── app-preview.jpeg  ← Preview de la app
├── data/
│   └── registros.json    ← Base de datos de pre-registros
├── .vscode/              ← Configuración de VS Code
└── .gitignore
```

## Cómo ejecutar en local

1. Abre la carpeta `ubicate-landing` en VS Code
2. Abre la terminal integrada (`Ctrl + ñ` o `Ctrl + backtick`)
3. Instala dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor:
   ```bash
   npm start
   ```
5. Abre http://localhost:3000 en tu navegador

## API del backend

### POST /api/registro
Registra un nuevo usuario interesado.

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@email.com",
  "tipo": "pasajero",
  "ciudad": "La Serena"
}
```

### GET /api/stats
Estadísticas públicas (total de registros, por tipo).

### GET /api/registros?key=ubicate-admin-2026
Lista todos los registros (requiere clave admin).

## Cómo publicar en internet

### Opción 1: Railway (recomendado para backend)
1. Ve a [railway.app](https://railway.app) y crea cuenta con GitHub
2. Crea nuevo proyecto → "Deploy from GitHub"
3. Conecta tu repositorio
4. Railway detecta Node.js automáticamente
5. Agrega variable de entorno: `ADMIN_KEY=tu-clave-secreta`
6. Listo. Tendrás un dominio tipo `ubicate.up.railway.app`

### Opción 2: Render (gratis)
1. Ve a [render.com](https://render.com) y crea una cuenta
2. New → Web Service → conecta tu repo
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Agrega variable `ADMIN_KEY` en Environment

### Opción 3: Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio
3. Se despliega automáticamente

## Personalización

- **Colores**: Variables CSS en `:root` dentro de `css/styles.css`
- **Textos**: Editar directamente en `index.html`
- **Clave admin**: Cambiar en `.env` → `ADMIN_KEY`
- **Puerto**: Cambiar en `.env` → `PORT`
- **Redes sociales**: Actualizar links en el footer de `index.html`
