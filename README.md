# Cine & Play — frontend React

Interfaz para el backend FastAPI del proyecto universitario.
React + Vite + JavaScript + React Router + Recharts + CSS.

## Iniciar en Windows

Necesitas Node.js 22.12 o superior (o Node.js 20.19+). Recomendado Node.js 24 LTS.
Descomprime el proyecto y abre PowerShell dentro de la carpeta frontend.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

En macOS/Linux la copia es `cp .env.example .env`.
Abre http://127.0.0.1:5173.

`.env` del frontend:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Reinicia Vite si cambias .env. No pongas claves de OpenAI en el frontend:
las variables VITE_* son públicas y quedan incluidas en la aplicación.

## Backend y CORS

Mantén el backend iniciado desde otra terminal:

```powershell
python -m uvicorn app.main:app --reload
```

En el `.env` del BACKEND, permite ambos orígenes locales:

```dotenv
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

Reinicia el backend después del cambio. La clave OpenAI y PostgreSQL siguen en su .env.
No se necesita cambiar tablas ni ejecutar SQL para instalar este frontend.
Accede con una cuenta creada por el administrador o por app.create_admin.

## Funcionalidades

- Inicio de sesión con errores visibles y opción de mostrar contraseña.
- Token en sessionStorage: se conserva al recargar en la pestaña y se elimina al cerrar sesión.
- Cierre de sesión mediante POST /auth/logout para revocación real en backend.
- Identidad/rol mediante GET /auth/me; rutas administrativas protegidas.
- Chat: POST /chat con únicamente `{pregunta}`; estado de carga, bloqueo de envíos duplicados,
  pregunta conservada para reintentar ante error, copia de respuestas y mensajes de sesión.
- Enter envía la pregunta; Shift+Enter agrega una línea.
- Limpiar pantalla borra mensajes visibles, pero no el historial almacenado.
- Historial: tabla con fecha, pregunta y respuesta completas, paginación de 10 registros.
- Consumo: dos barras para películas/videojuegos y total; acumulados de GET /consumo.
- CRUD administrativo de usuarios, películas y videojuegos; formularios modales y confirmación de eliminación.
- Búsqueda por título para películas/videojuegos; lista paginada.
- Diseño adaptable: barra lateral en escritorio y menú desplegable en móvil.
- Modal nativo dialog: foco atrapado por el navegador, cierre con Escape salvo mientras guarda.
- Fechas mostradas según zona horaria del navegador.

Las preguntas visibles persisten al navegar dentro de la misma sesión React, pero no al recargar.
El backend no utiliza esos mensajes como contexto: cada pregunta es independiente.
Si sales del chat mientras procesa una consulta, se cancela la espera del navegador;
el backend podría completar y guardar la consulta. Puedes comprobarlo en Historial.

## Notas del CRUD existente

PUT /usuarios exige nombre, correo, contraseña y rol. Al editar, hay que introducir la
contraseña que se establecerá para esa cuenta (mínimo 8 caracteres).
No puedes eliminar tu cuenta propia ni quitarte tu rol administrador.
Eliminar otro usuario borra sus sesiones, historial y consumo, según el backend.

Los formularios de catálogo incluyen todos los campos editables. El ID y fecha de registro
los administra PostgreSQL/backend. Campos opcionales vacíos se envían como null.
La edición reemplaza el registro con el formulario completo, conservando su fecha.
La calificación no se limita a 0-10 porque el esquema recibido no establece ese rango.
Jugadores se trata como texto. Las longitudes/restricciones definitivas las verifica el backend.

## Estructura

- src/api.js: cliente HTTP, token y errores.
- src/AuthContext.jsx: restauración de sesión, login, logout y expiración.
- src/App.jsx: rutas protegidas y administración por rol.
- src/components/: estructura, alertas, modales y paginación.
- src/pages/: Login, Chat, History, Consumption y Admin.
- src/catalogConfig.js: campos y conversión de formularios al contrato del backend.

## Verificaciones

```powershell
npm test
npm run build
```

9 pruebas del cliente HTTP y contratos de formularios pasaron; producción compila.
Las pruebas usan respuestas simuladas: no prueban tu backend local ni OpenAI real.
No fue posible ejecutar Chromium en el entorno de creación; la revisión visual y
las pruebas de navegador quedan pendientes. Se incluyen 6 escenarios Playwright:

```powershell
npx playwright install chromium
# Mantén npm run dev en otra terminal
npm run test:e2e
```

Playwright simula el backend para probar interacción, permisos, errores y CRUD.
El escenario de escritorio/móvil genera imágenes en preview/.

## Recorrido de comprobación con tu backend

1. Inicia sesión como usuario normal; no deben aparecer opciones administrativas.
2. Envía una pregunta de películas y otra de videojuegos.
3. Comprueba Historial y Mi consumo.
4. Recarga para confirmar restauración de sesión.
5. Cierra sesión e inicia como administrador.
6. Crea, edita y elimina un registro de prueba en cada catálogo y un usuario de prueba.
7. Comprueba que los registros restantes del catálogo mantienen sus datos.
8. Prueba desde una ventana estrecha y revisa el menú móvil.

## Problemas comunes

- No conecta: revisa backend iniciado, VITE_API_URL y CORS_ORIGINS.
- Puerto ocupado: el proyecto fija 5173 para que no cambie el origen de CORS; libera ese puerto.
- Login rechazado: usa el correo y contraseña guardados en PostgreSQL.
- Error de OpenAI: se muestra el detalle enviado por el backend; revisa su configuración.
- No crea catálogo: comprueba que los IDs tienen identity/default en PostgreSQL.
- Al publicar: configura el servidor estático para devolver index.html en rutas React.
  sessionStorage reduce persistencia, pero las claves de sesión siguen accesibles a JavaScript.
