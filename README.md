# PetShop — Marketplace de productos para mascotas

Proyecto completo: tienda pública + panel de administración + pagos con
Mercado Pago (tarjeta de crédito, débito y transferencia).

## Estructura

```
petshop/
  backend/    API en Node.js + Express + Prisma (SQLite por defecto)
  frontend/   React + Vite + Tailwind (tienda + panel admin)
```

## 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editá `.env` y completá al menos:
- `JWT_SECRET`: cualquier texto largo y random.
- `MP_ACCESS_TOKEN`: tu Access Token de Mercado Pago (ver paso 4).

Después corré las migraciones (esto crea la base `dev.db` con las tablas) y
cargá el admin inicial + categorías de ejemplo:

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

## 5. Publicar el sitio (producción)

- **Base de datos**: para producción es mejor usar Postgres en vez de SQLite.
  En `backend/prisma/schema.prisma` cambiá `provider = "sqlite"` por
  `provider = "postgresql"`, conseguí una base gratis en
  [Railway](https://railway.app), [Neon](https://neon.tech) o
  [Supabase](https://supabase.com), y poné esa URL en `DATABASE_URL`.
- **Backend**: se puede desplegar en Railway, Render o Fly.io (soportan
  Node.js + subida de archivos). Configurá ahí las mismas variables del
  `.env`, usando el Access Token de producción de Mercado Pago.
- **Imágenes**: el proyecto guarda las imágenes en el disco del servidor
  (`backend/uploads`). Si tu hosting no tiene disco persistente, migrá esa
  parte a un bucket (Cloudflare R2, AWS S3, etc.) — es el único cambio
  estructural necesario para producción a gran escala.
- **Frontend**: se puede desplegar gratis en Vercel o Netlify. Configurá ahí
  `VITE_API_URL` apuntando a la URL pública de tu backend.
- **Dominio propio**: cualquiera de esos hostings permite conectar un
  dominio propio (ej. `tupetshop.com.ar`) desde su panel.

## 6. Próximos pasos opcionales

- Envío de emails de confirmación al cliente (ej. con Resend o Nodemailer).
- Cálculo de envío por Correo Argentino / Andreani según código postal.
- Cuentas de cliente (historial de pedidos, favoritos).
- Cupones de descuento.

Cualquiera de estos se puede sumar sobre la base ya armada sin rehacer nada.
