# PetShop — Marketplace de productos para mascotas

Proyecto completo: tienda pública + panel de administración + pagos con
Mercado Pago (tarjeta de crédito, débito y transferencia).

## Estructura

```
petshop/
  backend/    API en Node.js + Express + Prisma (PostgreSQL)
  frontend/   React + Vite + Tailwind (tienda + panel admin)
```

## 1. Backend

Necesitás una base de datos Postgres antes de empezar. La forma más simple
(sin instalar nada en tu PC) es crear una gratis en
[neon.tech](https://neon.tech) — creás un proyecto y copiás el
**Connection string** que te da. Vas a usar esa misma base tanto en local
como en producción.

```bash
cd backend
npm install
cp .env.example .env
```

Editá `.env` y completá al menos:
- `DATABASE_URL`: el connection string de Neon (o de otro Postgres).
- `JWT_SECRET`: cualquier texto largo y random.
- `MP_ACCESS_TOKEN`: tu Access Token de Mercado Pago (ver paso 4).

Después corré las migraciones (esto crea las tablas en la base) y cargá el
admin inicial + categorías de ejemplo:

```bash
npx prisma migrate dev --name init
npm run seed
```

El seed crea un administrador con:
- **Email:** `admin@petshop.com`
- **Contraseña:** `admin1234`

(podés cambiarlos definiendo `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en
el `.env` antes de correr el seed).

Levantar el servidor:

```bash
npm run dev
```

Queda corriendo en `http://localhost:4000`.

## 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Queda corriendo en `http://localhost:5173`.

- Tienda pública: `http://localhost:5173`
- Panel admin: `http://localhost:5173/admin/login`

## 3. Uso del panel de administración

Desde `/admin` podés:
- Crear/editar/eliminar **categorías** (con imagen).
- Crear/editar/eliminar **productos**: nombre, descripción, precio, stock,
  tipo de mascota (perro/gato/otro), categoría, hasta 6 imágenes por producto,
  y si está visible o no en la tienda.
- Ver todos los **pedidos**, con el estado de pago que informa Mercado Pago
  y cambiar el estado manualmente (por ejemplo a "Enviado" o "Entregado").
- En **Apariencia** (`/admin/apariencia`): cambiar el nombre del negocio, el
  logo, el color principal (se aplica a botones y acentos en toda la
  tienda), el título/subtítulo del banner de inicio, su imagen de fondo, y
  reordenar con las flechas ↑↓ en qué orden aparecen las secciones de la
  home (banner principal, banners promocionales, categorías + productos).
- En **Banners** (`/admin/banners`): cargar banners promocionales (imagen +
  título + subtítulo + link opcional) que se muestran en la home, activarlos
  u ocultarlos, y reordenarlos.

### Si ya tenías el proyecto instalado (actualización)

Reemplazá los archivos por los de este zip actualizado y corré, dentro de
`backend`:

```bash
npx prisma migrate dev --name apariencia_y_banners
npm run seed
```

Esto agrega las tablas nuevas sin borrar tus productos, categorías ni
pedidos existentes. Después reiniciá `npm run dev` en backend y frontend.

## 4. Configurar Mercado Pago (tarjetas y transferencias)

1. Creá una cuenta en [mercadopago.com.ar](https://www.mercadopago.com.ar) si
   no tenés.
2. Entrá a **[mercadopago.com.ar/developers/panel](https://www.mercadopago.com.ar/developers/panel)**
   y creá una aplicación.
3. Copiá el **Access Token** (usá el de prueba "TEST-..." mientras desarrollás,
   y el de producción cuando publiques) y pegalo en `backend/.env` como
   `MP_ACCESS_TOKEN`.
4. El checkout usado es **Checkout Pro**: al finalizar la compra, el cliente
   es redirigido a una página de Mercado Pago donde puede elegir pagar con
   tarjeta de crédito, débito, o transferencia/dinero en cuenta — no hace
   falta programar cada medio de pago por separado, Mercado Pago ya los
   ofrece todos ahí.
5. **Webhook de confirmación**: Mercado Pago le avisa al backend cuando un
   pago se aprueba llamando a `POST /api/payments/webhook`. En local, para
   que Mercado Pago pueda llegar a tu máquina, necesitás exponerla con algo
   como [ngrok](https://ngrok.com/) (`ngrok http 4000`) y poner esa URL en
   `BACKEND_PUBLIC_URL` del `.env`. En producción, usá la URL real de tu API.
6. Podés probar pagos completos con las
   [tarjetas de prueba de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards)
   mientras usás el Access Token de `TEST-`.

## 5. Publicar el sitio online (GitHub + Neon + Railway + Vercel)

Con esta combinación, todo queda gratis para empezar (o muy barato cuando
crezca) y no depende de que tu PC esté prendida.

### Paso 1 — Subir el código a GitHub

1. Creá una cuenta en [github.com](https://github.com) si no tenés.
2. Creá un repositorio nuevo (puede ser privado), por ejemplo `petshop`.
3. Desde la carpeta `petshop` en tu PC:
   ```bash
   git init
   git add .
   git commit -m "Proyecto inicial"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/petshop.git
   git push -u origin main
   ```
   (los `.gitignore` ya están configurados para no subir `node_modules`,
   `.env` ni la base de datos local).

### Paso 2 — Base de datos en Neon

1. Creá una cuenta gratis en [neon.tech](https://neon.tech).
2. Creá un proyecto nuevo (elegí una región cercana, ej. AWS South America
   si está disponible, o la más cercana).
3. Copiá el **Connection string** que te muestra Neon (empieza con
   `postgresql://...`). Es tu `DATABASE_URL` de producción.
4. En tu PC, con ese `DATABASE_URL` puesto en `backend/.env`, corré una vez:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```
   Esto crea las tablas en Neon y además genera la carpeta
   `prisma/migrations` que **tenés que subir a GitHub** (hacé
   `git add . && git commit -m "migraciones" && git push` después de esto),
   porque Railway la necesita para aplicar las migraciones en producción.

### Paso 3 — Backend en Railway

1. Creá una cuenta en [railway.app](https://railway.app) (podés entrar con
   GitHub directamente).
2. "New Project" → "Deploy from GitHub repo" → elegí tu repo `petshop`.
3. Como el repo tiene backend y frontend juntos, andá a **Settings** del
   servicio y en **Root Directory** poné `backend`.
4. En **Variables**, cargá las mismas que tenés en `backend/.env.example`:
   `DATABASE_URL` (el de Neon), `JWT_SECRET`, `MP_ACCESS_TOKEN`,
   `FRONTEND_URL` (lo vas a completar en el paso 4, con la URL de Vercel),
   y `BACKEND_PUBLIC_URL` (dejalo vacío por ahora, Railway te da la URL
   después del primer deploy — la agregás y volvés a desplegar).
5. Railway va a instalar dependencias y correr `npm start`, que ya incluye
   aplicar las migraciones automáticamente antes de levantar el servidor.
6. Una vez desplegado, Railway te da una URL pública (ej.
   `https://petshop-production.up.railway.app`). Esa es tu
   `BACKEND_PUBLIC_URL` — cargala en las variables y volvé a desplegar.
7. Corré el seed una sola vez para crear tu admin en la base de Neon. La
   forma más simple: desde tu PC, con `backend/.env` apuntando al
   `DATABASE_URL` de Neon, corré `npm run seed`.
8. **Imágenes subidas (uploads)**: Railway borra los archivos sueltos en
   cada redeploy salvo que uses un *Volume*. Andá a la pestaña **Volumes**
   del servicio, creá uno, y montalo en `/app/uploads`. Así tus fotos de
   productos no se pierden cuando actualices el código.

### Paso 4 — Frontend en Vercel

1. Creá una cuenta en [vercel.com](https://vercel.com) (con GitHub).
2. "Add New Project" → elegí tu repo `petshop`.
3. En **Root Directory**, elegí `frontend`.
4. En **Environment Variables**, agregá `VITE_API_URL` con la URL de tu
   backend en Railway (ej. `https://petshop-production.up.railway.app`).
5. Deploy. Vercel te da una URL pública (ej. `https://petshop.vercel.app`).
6. Volvé a Railway y actualizá la variable `FRONTEND_URL` del backend con
   esa URL de Vercel, para que el CORS y los links de pago de Mercado Pago
   apunten bien. Volvé a desplegar el backend.

### Paso 5 — Mercado Pago en producción

Cuando quieras cobrar de verdad (no solo probar), en
`mercadopago.com.ar/developers/panel` cambiá tu `MP_ACCESS_TOKEN` en
Railway por el de **producción** (no el que empieza con `TEST-`).

### Dominio propio

Tanto Vercel como Railway permiten conectar un dominio propio (ej.
`tupetshop.com.ar`) desde su panel, en la sección de "Domains" de cada uno.

## 6. Próximos pasos opcionales

- Envío de emails de confirmación al cliente (ej. con Resend o Nodemailer).
- Cálculo de envío por Correo Argentino / Andreani según código postal.
- Cuentas de cliente (historial de pedidos, favoritos).
- Cupones de descuento.

Cualquiera de estos se puede sumar sobre la base ya armada sin rehacer nada.
