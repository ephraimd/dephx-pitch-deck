#!/usr/bin/env python3
"""Make export-safe logo variants from one logo file.

Native slide exports drop CSS filters and some drop WebP, so a logo recoloured with CSS
turns into a blank square. This writes real transparent PNGs instead:

    mark-color.png   the logo on transparency (background removed if it was solid)
    mark-light.png   a white silhouette, for dark slides
    mark-dark.png    a near-black silhouette, for light slides

Usage: python3 logo-variants.py <logo.png|jpg|webp> <out-dir> [--size 512] [--dark "#111111"]
Needs Pillow (pip install pillow). Best on a logo over a plain, solid background.
"""
import argparse
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install pillow")


def hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def background_of(img):
    """The colour of the four corners when they agree, else None."""
    w, h = img.size
    corners = [img.getpixel(p) for p in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1))]
    if any(c[3] < 250 for c in corners):
        return None
    base = corners[0][:3]
    if all(sum(abs(a - b) for a, b in zip(c[:3], base)) < 30 for c in corners):
        return base
    return None


def remove_background(img, bg, floor=24, ramp=120):
    """Alpha from distance to the background colour, un-blending the edge pixels."""
    out = Image.new("RGBA", img.size)
    src, dst = img.load(), out.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = src[x, y]
            d = max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2]))
            a = 0 if d < floor else min(255, int((d - floor) * 255 / ramp))
            if a == 0:
                dst[x, y] = (0, 0, 0, 0)
                continue
            k = a / 255
            un = [int(max(0, min(255, (c - bc * (1 - k)) / k))) for c, bc in zip((r, g, b), bg)]
            dst[x, y] = (un[0], un[1], un[2], a)
    return out


def square_crop(img, pad_ratio=0.04):
    box = img.getbbox()
    if not box:
        sys.exit("the logo is empty after removing the background")
    side = max(box[2] - box[0], box[3] - box[1])
    pad = int(side * pad_ratio)
    side += 2 * pad
    cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img.crop((cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side)), (0, 0))
    return canvas


def silhouette(img, rgb):
    alpha = img.getchannel("A")
    solid = Image.new("RGBA", img.size, rgb + (255,))
    solid.putalpha(alpha)
    return solid


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("logo")
    p.add_argument("out_dir")
    p.add_argument("--size", type=int, default=512)
    p.add_argument("--dark", default="#111111", help="colour of mark-dark.png")
    a = p.parse_args()

    img = Image.open(a.logo).convert("RGBA")
    bg = background_of(img)
    if bg is not None:
        img = remove_background(img, bg)
    img = square_crop(img).resize((a.size, a.size), Image.LANCZOS)

    os.makedirs(a.out_dir, exist_ok=True)
    outputs = {
        "mark-color.png": img,
        "mark-light.png": silhouette(img, (255, 255, 255)),
        "mark-dark.png": silhouette(img, hex_rgb(a.dark)),
    }
    for name, im in outputs.items():
        path = os.path.join(a.out_dir, name)
        im.save(path, optimize=True)
        print(path)
    if bg is None:
        print("note: no solid background found; kept the existing transparency")


if __name__ == "__main__":
    main()
