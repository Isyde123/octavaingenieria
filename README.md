# Octava Ingeniería — sitio web

Sitio estático (HTML/CSS/JS), sin backend, listo para desplegar en Netlify.

## Estructura

```
index.html            → página en español (generada, no editar a mano)
en/index.html          → página en inglés (generada, no editar a mano)
content/es.json         → todos los textos en español
content/en.json         → todos los textos en inglés
assets/css/style.css   → estilos
assets/js/main.js      → menú móvil, animaciones, tarjetas volteables, formulario
assets/img/            → fotos y logos
scripts/build.js        → genera index.html y en/index.html a partir de content/*.json
gracias.html / en/thank-you.html → páginas de confirmación del formulario
netlify.toml, robots.txt, sitemap.xml → configuración de despliegue y SEO
```

## Editar textos

1. Abre `content/es.json` (o `content/en.json` para inglés) y cambia el texto que necesites.
2. Corre en la terminal, desde esta carpeta:

   ```bash
   node scripts/build.js
   ```

3. Eso regenera `index.html` y `en/index.html`. No hace falta tocar CSS, JS ni el resto de archivos.

## Contacto activo

- **WhatsApp**: botón flotante + botones en Hero/Contacto → `https://wa.me/573193488565`
- **Formulario**: sección Contacto, manejado por Netlify Forms (sin backend propio)
- **Correo**: `comercial@octavaingenieria.com`

## Política de datos y cookies

- Texto de la política: `content/politica-datos.es.html` y `content/politica-datos.en.html` (se editan directamente; luego `node scripts/build.js`).
- Se publica en `/politica-de-datos.html` y `/en/privacy-policy.html` (generadas, no editar a mano).
- El formulario exige marcar la casilla de autorización; Netlify guarda el campo `autorizacion_datos` con cada envío como prueba de la autorización.
- Etiqueta de Google (gtag.js) en todas las páginas, con modo de consentimiento: Analytics no guarda cookies hasta que el visitante pulsa "Aceptar". Las páginas de gracias son fijas, pero el build les inserta la misma etiqueta. La decisión se guarda en el navegador y se puede cambiar con "Preferencias de cookies" en el pie de página.

## Google Analytics (GA4)

- El ID de medición (`G-XXXXXXXXXX`) vive en un solo lugar: la constante `GA_MEASUREMENT_ID` al inicio de `scripts/build.js`.
- Después de cambiarlo, corre `node scripts/build.js` y publica. Si queda vacío (`""`), el sitio se genera sin Analytics ni aviso de cookies.
- Eventos que se envían (solo con cookies aceptadas): `generate_lead` (formulario enviado), `click_whatsapp` y `click_email`. Están en `assets/js/main.js`.

## Google Tag Manager

- El ID del contenedor (`GTM-XXXXXXX`) va en la constante `GTM_CONTAINER_ID` de `scripts/build.js`. Vacío = sin Tag Manager.
- Con ID, el build pone el código de GTM en el `<head>` (después del consentimiento) y el `<noscript>` justo después de `<body>`, en todas las páginas.
- Los eventos `generate_lead`, `click_whatsapp` y `click_email` llegan a GTM como "Evento personalizado" (solo con cookies aceptadas).
- Cuando GA4 esté configurado dentro de GTM, deja `GA_MEASUREMENT_ID = ""` para no contar visitas dos veces.

- Los archivos de `assets/` se guardan en caché un año (ver `netlify.toml`). El build les agrega `?v=<huella>` automáticamente, así que los cambios de CSS/JS sí llegan a quienes ya visitaron el sitio.

## Fotos

- Las fotos originales están en `assets/img/` (hero.jpg, about.jpg, back-01…05.jpg).
- Si cambias una foto, corre `python3 scripts/optimizar-imagenes.py` y luego `node scripts/build.js`. Eso crea versiones livianas (WebP) para cada tamaño de pantalla y la imagen para compartir en redes (`og.jpg`).
- Si no corres el primer comando, el sitio funciona igual con la foto original, solo que carga más lento.

## SEO

- Títulos y descripciones para Google: `meta.title` y `meta.description` en `content/es.json` y `content/en.json` (título ≤ 60 caracteres, descripción ≤ 155).
- Los datos estructurados (lo que Google y los asistentes de IA leen sobre la empresa: tipo de negocio, servicios, cobertura, contacto) se generan en `jsonLd()` de `scripts/build.js` a partir de los mismos textos.
- `sitemap.xml` se genera solo en cada build.

## Desplegar en Netlify

Arrastra esta carpeta a Netlify (o conéctala por Git). No requiere build command:
publica el contenido tal cual (`publish = "."` ya está en `netlify.toml`). Netlify detecta
automáticamente el formulario (`data-netlify="true"`) y empieza a recibir los envíos.

## Dominio

`https://octavaingenieria.com` (configurado en metadatos, canonical, hreflang y sitemap.xml).
Si el dominio cambia, actualiza `SITE_URL` en `scripts/build.js` y vuelve a correr el build.
