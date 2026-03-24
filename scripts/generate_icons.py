from __future__ import annotations

import struct
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "src" / "assets"


def blend_channel(base: int, top: int, alpha: float) -> int:
    return max(0, min(255, round(base * (1.0 - alpha) + top * alpha)))


def set_pixel(canvas: bytearray, size: int, x: int, y: int, color: tuple[int, int, int, int]) -> None:
    if x < 0 or y < 0 or x >= size or y >= size:
        return

    offset = (y * size + x) * 4
    src_r, src_g, src_b, src_a = color

    if src_a >= 255:
        canvas[offset:offset + 4] = bytes((src_r, src_g, src_b, 255))
        return

    alpha = src_a / 255.0
    canvas[offset] = blend_channel(canvas[offset], src_r, alpha)
    canvas[offset + 1] = blend_channel(canvas[offset + 1], src_g, alpha)
    canvas[offset + 2] = blend_channel(canvas[offset + 2], src_b, alpha)
    canvas[offset + 3] = 255


def draw_circle(canvas: bytearray, size: int, cx: float, cy: float, radius: float, color: tuple[int, int, int, int]) -> None:
    left = max(0, int(cx - radius))
    right = min(size - 1, int(cx + radius))
    top = max(0, int(cy - radius))
    bottom = min(size - 1, int(cy + radius))
    radius_sq = radius * radius

    for y in range(top, bottom + 1):
        for x in range(left, right + 1):
            dx = x + 0.5 - cx
            dy = y + 0.5 - cy
            if dx * dx + dy * dy <= radius_sq:
                set_pixel(canvas, size, x, y, color)


def draw_triangle(
    canvas: bytearray,
    size: int,
    a: tuple[float, float],
    b: tuple[float, float],
    c: tuple[float, float],
    color: tuple[int, int, int, int],
) -> None:
    min_x = max(0, int(min(a[0], b[0], c[0])))
    max_x = min(size - 1, int(max(a[0], b[0], c[0])))
    min_y = max(0, int(min(a[1], b[1], c[1])))
    max_y = min(size - 1, int(max(a[1], b[1], c[1])))

    denominator = ((b[1] - c[1]) * (a[0] - c[0])) + ((c[0] - b[0]) * (a[1] - c[1]))
    if denominator == 0:
        return

    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            px = x + 0.5
            py = y + 0.5
            alpha = (((b[1] - c[1]) * (px - c[0])) + ((c[0] - b[0]) * (py - c[1]))) / denominator
            beta = (((c[1] - a[1]) * (px - c[0])) + ((a[0] - c[0]) * (py - c[1]))) / denominator
            gamma = 1.0 - alpha - beta
            if alpha >= 0 and beta >= 0 and gamma >= 0:
                set_pixel(canvas, size, x, y, color)


def draw_rounded_rect(
    canvas: bytearray,
    size: int,
    left: float,
    top: float,
    right: float,
    bottom: float,
    radius: float,
    color: tuple[int, int, int, int],
) -> None:
    min_x = max(0, int(left))
    max_x = min(size - 1, int(right))
    min_y = max(0, int(top))
    max_y = min(size - 1, int(bottom))

    inner_left = left + radius
    inner_right = right - radius
    inner_top = top + radius
    inner_bottom = bottom - radius
    radius_sq = radius * radius

    for y in range(min_y, max_y + 1):
        for x in range(min_x, max_x + 1):
            px = x + 0.5
            py = y + 0.5
            nearest_x = min(max(px, inner_left), inner_right)
            nearest_y = min(max(py, inner_top), inner_bottom)
            dx = px - nearest_x
            dy = py - nearest_y
            if dx * dx + dy * dy <= radius_sq:
                set_pixel(canvas, size, x, y, color)


def write_png(path: Path, size: int, canvas: bytearray) -> None:
    rows = []
    for y in range(size):
        start = y * size * 4
        rows.append(b"\x00" + bytes(canvas[start:start + size * 4]))

    raw_data = b"".join(rows)
    compressed = zlib.compress(raw_data, level=9)

    def chunk(tag: bytes, payload: bytes) -> bytes:
        crc = zlib.crc32(tag + payload) & 0xFFFFFFFF
        return struct.pack(">I", len(payload)) + tag + payload + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b"")
    path.write_bytes(png)


def lerp(start: int, end: int, amount: float) -> int:
    return round(start + (end - start) * amount)


def fill_background(canvas: bytearray, size: int) -> None:
    start = (21, 128, 61)
    end = (37, 99, 235)

    for y in range(size):
        for x in range(size):
            mix = ((x / max(1, size - 1)) * 0.55) + ((y / max(1, size - 1)) * 0.45)
            r = lerp(start[0], end[0], mix)
            g = lerp(start[1], end[1], mix)
            b = lerp(start[2], end[2], mix)
            set_pixel(canvas, size, x, y, (r, g, b, 255))

    draw_circle(canvas, size, size * 0.22, size * 0.2, size * 0.24, (255, 255, 255, 32))
    draw_circle(canvas, size, size * 0.82, size * 0.82, size * 0.2, (255, 255, 255, 28))
    draw_circle(canvas, size, size * 0.8, size * 0.18, size * 0.12, (220, 252, 231, 36))


def render_icon(size: int) -> bytearray:
    canvas = bytearray(size * size * 4)
    fill_background(canvas, size)

    shadow_offset = size * 0.012
    draw_rounded_rect(
        canvas,
        size,
        size * 0.2 + shadow_offset,
        size * 0.2 + shadow_offset,
        size * 0.8 + shadow_offset,
        size * 0.8 + shadow_offset,
        size * 0.14,
        (15, 23, 42, 44),
    )
    draw_rounded_rect(
        canvas,
        size,
        size * 0.2,
        size * 0.2,
        size * 0.8,
        size * 0.8,
        size * 0.14,
        (255, 255, 255, 220),
    )

    pin_color = (21, 128, 61, 255)
    accent = (37, 99, 235, 255)
    draw_triangle(
        canvas,
        size,
        (size * 0.5, size * 0.76),
        (size * 0.34, size * 0.49),
        (size * 0.66, size * 0.49),
        pin_color,
    )
    draw_circle(canvas, size, size * 0.5, size * 0.43, size * 0.17, pin_color)
    draw_circle(canvas, size, size * 0.5, size * 0.43, size * 0.078, (255, 255, 255, 255))
    draw_circle(canvas, size, size * 0.5, size * 0.43, size * 0.042, accent)
    draw_circle(canvas, size, size * 0.28, size * 0.3, size * 0.038, (220, 252, 231, 220))
    draw_circle(canvas, size, size * 0.72, size * 0.68, size * 0.03, (219, 234, 254, 220))
    return canvas


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    for size in (192, 512):
        write_png(ASSETS / f"icon-{size}.png", size, render_icon(size))


if __name__ == "__main__":
    main()
