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

## Desplegar en Netlify

Arrastra esta carpeta a Netlify (o conéctala por Git). No requiere build command:
publica el contenido tal cual (`publish = "."` ya está en `netlify.toml`). Netlify detecta
automáticamente el formulario (`data-netlify="true"`) y empieza a recibir los envíos.

## Dominio

`https://octavaingenieria.com` (configurado en metadatos, canonical, hreflang y sitemap.xml).
Si el dominio cambia, actualiza `SITE_URL` en `scripts/build.js` y vuelve a correr el build.
