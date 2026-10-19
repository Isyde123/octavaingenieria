#!/usr/bin/env python3
"""
Genera versiones livianas (WebP) de las fotos del sitio, en varios tamaños,
y la imagen para compartir en redes (og.jpg, 1200x630).

Uso (desde la carpeta del sitio):
    python3 scripts/optimizar-imagenes.py
    node scripts/build.js

Si se cambia una foto en assets/img/ (por ejemplo hero.jpg), basta con volver
a correr estos dos comandos. Si no se corre, el sitio sigue funcionando con la
foto original; solo carga más lento.
"""
from pathlib import Path
from PIL import Image, ImageOps

IMG = Path(__file__).resolve().parent.parent / "assets" / "img"
FOTOS = ["hero.jpg", "about.jpg", "back-01.jpg", "back-02.jpg", "back-03.jpg", "back-04.jpg", "back-05.jpg"]
ANCHOS = [480, 800, 1200]


def main():
    for nombre in FOTOS:
        src = IMG / nombre
        if not src.exists():
            continue
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        for w in ANCHOS:
            if w > im.width:
                continue
            h = round(im.height * w / im.width)
            out = IMG / f"{src.stem}-{w}.webp"
            im.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=78, method=6)
            print(f"{out.name}: {out.stat().st_size // 1024} KB")

    # Imagen para vista previa en redes sociales / WhatsApp (1200x630)
    hero = ImageOps.exif_transpose(Image.open(IMG / "hero.jpg")).convert("RGB")
    og = ImageOps.fit(hero, (1200, 630), Image.LANCZOS, centering=(0.5, 0.55))
    og.save(IMG / "og.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    print(f"og.jpg: {(IMG / 'og.jpg').stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
