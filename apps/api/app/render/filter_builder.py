from datetime import datetime

from app.render.timestamp import (
    build_timestamp_text,
    drawtext_font_option,
    drawtext_xy,
    escape_drawtext_text,
)
from app.schemas.render import EffectConfig, RenderRequest
from app.utils.mime import output_is_image


MONTHS = {
    "01": "Jan.",
    "02": "Feb.",
    "03": "Mar.",
    "04": "Apr.",
    "05": "May",
    "06": "Jun.",
    "07": "Jul.",
    "08": "Aug.",
    "09": "Sep.",
    "10": "Oct.",
    "11": "Nov.",
    "12": "Dec.",
}


def parse_resolution(resolution: str) -> tuple[int, int]:
    width, height = resolution.lower().split("x", maxsplit=1)
    return int(width), int(height)


def _is_video_render(request: RenderRequest, input_media_kind: str) -> bool:
    return input_media_kind in {"video", "animation"} and not output_is_image(request.output.format)


def _drawtext(
    text: str,
    x: str,
    y: str,
    size: int,
    *,
    color: str = "white",
    raw_text: bool = False,
    box: bool = False,
) -> str:
    escaped_text = text if raw_text else escape_drawtext_text(text)
    box_options = "box=1:boxcolor=black@0.28:boxborderw=8:" if box else ""

    return (
        "drawtext="
        f"{drawtext_font_option()}"
        f"text='{escaped_text}':"
        f"x={x}:"
        f"y={y}:"
        f"fontsize={size}:"
        f"fontcolor={color}:"
        f"{box_options}"
        "shadowcolor=black@0.85:"
        "shadowx=2:"
        "shadowy=2"
    )


def _drawbox(x: str, y: str, w: str, h: str, color: str, thickness: str = "fill") -> str:
    return f"drawbox=x={x}:y={y}:w={w}:h={h}:color={color}:t={thickness}"


def _elapsed_counter(video_render: bool) -> tuple[str, bool]:
    if not video_render:
        return "00\\:00\\:00", True

    return (
        "%{eif\\:t/3600\\:d\\:2}\\:%{eif\\:mod(t/60\\,60)\\:d\\:2}\\:%{eif\\:mod(t\\,60)\\:d\\:2}",
        True,
    )


def _format_osd_date(date: str) -> str:
    parts = date.strip().replace("-", "/").split("/")
    if len(parts) != 3:
        return date.strip()

    month, day, year = parts
    month_name = MONTHS.get(month.zfill(2))
    if not month_name:
        return date.strip()

    return f"{month_name} {day.zfill(2)} {year}"


def _format_osd_time(time: str) -> str:
    parts = time.strip().split(":")
    if len(parts) < 2:
        return time.strip()

    try:
        hour = int(parts[0])
        minute = int(parts[1])
    except ValueError:
        return time.strip()

    suffix = "AM" if hour < 12 else "PM"
    display_hour = hour % 12
    if display_hour == 0:
        display_hour = 12

    return f"{suffix} {display_hour:02d}:{minute:02d}"


def _format_numeric_footer_date(date: str) -> str:
    parts = date.strip().replace("-", "/").split("/")
    if len(parts) != 3:
        return date.strip()

    month, day, year = parts

    try:
        parsed = datetime(int(year), int(month), int(day))
    except ValueError:
        return date.strip()

    return f"{int(day):02d}.{int(month):02d}.{parsed.year} {parsed.strftime('%a').upper()}"


def _append_corner_brackets(filters: list[str], width: int, height: int, *, alpha: float = 0.85) -> None:
    margin = max(28, int(width * 0.035))
    length = max(64, int(min(width, height) * 0.11))
    thickness = max(2, int(min(width, height) * 0.004))
    right = f"iw-{margin}-{length}"
    bottom = f"ih-{margin}-{length}"
    color = f"white@{alpha}"

    filters.extend(
        [
            _drawbox(str(margin), str(margin), str(length), str(thickness), color),
            _drawbox(str(margin), str(margin), str(thickness), str(length), color),
            _drawbox(right, str(margin), str(length), str(thickness), color),
            _drawbox(f"iw-{margin}-{thickness}", str(margin), str(thickness), str(length), color),
            _drawbox(str(margin), bottom, str(thickness), str(length), color),
            _drawbox(str(margin), f"ih-{margin}-{thickness}", str(length), str(thickness), color),
            _drawbox(right, f"ih-{margin}-{thickness}", str(length), str(thickness), color),
            _drawbox(f"iw-{margin}-{thickness}", bottom, str(thickness), str(length), color),
        ]
    )


def _append_tape_artifacts(filters: list[str], height: int, *, video_render: bool, intensity: float) -> None:
    static_alpha = round(0.08 + intensity * 0.16, 2)
    filters.append(f"noise=alls={max(6, int(18 + intensity * 28))}:allf=t+u")
    filters.append(f"drawgrid=width=iw:height=3:thickness=1:color=black@{round(0.14 + intensity * 0.18, 2)}")

    band_height = max(2, int(height * 0.012))
    filters.extend(
        [
            _drawbox("0", "ih*0.14", "iw", str(band_height), f"white@{static_alpha}"),
            _drawbox("0", "ih*0.78", "iw", str(band_height * 2), f"white@{round(static_alpha * 0.75, 2)}"),
            _drawbox("iw*0.05", "ih*0.18", "iw*0.18", str(band_height), "white@0.18"),
            _drawbox("iw*0.58", "ih*0.63", "iw*0.28", str(band_height), "white@0.16"),
        ]
    )

    if video_render:
        filters.extend(
            [
                f"drawbox=x=0:y=ih*0.16+mod(t*83\\,ih*0.55):w=iw:h={band_height}:color=white@{round(0.18 + intensity * 0.16, 2)}:t=fill:enable='lt(mod(t\\,1.7)\\,0.18)'",
                f"drawbox=x=iw*0.08:y=ih*0.32+mod(t*57\\,ih*0.28):w=iw*0.84:h={band_height * 2}:color=black@0.22:t=fill:enable='between(mod(t\\,2.3)\\,0.08\\,0.2)'",
                "drawbox=x=iw*0.18+mod(t*211\\,iw*0.58):y=ih*0.42:w=iw*0.16:h=5:color=white@0.35:t=fill:enable='lt(mod(t\\,0.72)\\,0.08)'",
            ]
        )


def _append_classic_timestamp(filters: list[str], request: RenderRequest, height: int) -> None:
    if not request.timestamp.enabled:
        return

    text = build_timestamp_text(request.timestamp)
    x, y = drawtext_xy(request.timestamp.position)
    filters.append(_drawtext(text, x, y, max(18, int(height * 0.035)), box=True))


def _append_rec_camcorder(
    filters: list[str],
    request: RenderRequest,
    width: int,
    height: int,
    *,
    video_render: bool,
    dirty: bool = False,
) -> None:
    overlay = request.overlay

    if overlay.corner_brackets:
        _append_corner_brackets(filters, width, height, alpha=0.72 if dirty else 0.88)

    margin_x = max(34, int(width * 0.04))
    margin_y = max(30, int(height * 0.045))
    font_large = max(22, int(height * 0.043))
    font_small = max(17, int(height * 0.028))
    dot = max(12, int(height * 0.018))
    counter, raw_counter = _elapsed_counter(video_render)

    if overlay.rec_indicator:
        filters.extend(
            [
                _drawtext("REC", str(margin_x), str(margin_y), font_large),
                _drawbox(str(margin_x + int(font_large * 2.8)), str(margin_y + int(font_large * 0.28)), str(dot), str(dot), "red@0.95"),
            ]
        )

    if overlay.counter:
        filters.append(_drawtext(counter, f"w-tw-{margin_x}", str(margin_y), font_large, raw_text=raw_counter))

    if overlay.tape_speed:
        filters.append(_drawtext("SP", str(margin_x), f"h-th-{margin_y}", font_small))

    if request.timestamp.enabled and overlay.date_block:
        filters.extend(
            [
                _drawtext(_format_osd_time(request.timestamp.time), f"w-tw-{margin_x}", f"h-{margin_y + font_small * 4}", font_small),
                _drawtext(_format_osd_date(request.timestamp.date), f"w-tw-{margin_x}", f"h-{margin_y + font_small * 2}", font_small),
            ]
        )

    if dirty and overlay.glitch > 0:
        _append_tape_artifacts(filters, height, video_render=video_render, intensity=0.9 * overlay.glitch)


def _append_play_vhs(
    filters: list[str],
    request: RenderRequest,
    width: int,
    height: int,
    *,
    video_render: bool,
    heavy_glitch: bool = False,
) -> None:
    overlay = request.overlay

    if overlay.corner_brackets:
        _append_corner_brackets(filters, width, height, alpha=0.78)

    if overlay.glitch > 0:
        _append_tape_artifacts(
            filters,
            height,
            video_render=video_render,
            intensity=(0.85 if heavy_glitch else 0.45) * overlay.glitch,
        )

    margin_x = max(34, int(width * 0.04))
    margin_y = max(30, int(height * 0.045))
    font_large = max(23, int(height * 0.044))
    font_small = max(18, int(height * 0.03))
    counter, raw_counter = _elapsed_counter(video_render)

    if overlay.play_label:
        filters.append(_drawtext("PLAY >", str(margin_x), str(margin_y), font_large))

    if overlay.vhs_label:
        filters.append(_drawtext("VHS", str(margin_x), f"h-th-{margin_y}", font_small))

    if overlay.counter:
        filters.append(_drawtext(counter, f"w-tw-{margin_x}", f"h-th-{margin_y}", font_small, raw_text=raw_counter))

    if request.timestamp.enabled and overlay.date_block:
        filters.extend(
            [
                _drawtext(_format_osd_time(request.timestamp.time), f"w-tw-{margin_x}", f"h-{margin_y + font_small * 5}", font_small),
                _drawtext(_format_osd_date(request.timestamp.date), f"w-tw-{margin_x}", f"h-{margin_y + font_small * 3}", font_small),
            ]
        )

    if heavy_glitch and overlay.glitch > 0:
        alpha = round(0.22 * overlay.glitch, 2)
        filters.extend(
            [
                f"drawbox=x=iw*0.03:y=ih*0.05:w=iw*0.92:h=4:color=white@{round(alpha + 0.08, 2)}:t=fill",
                f"drawbox=x=iw*0.12:y=ih*0.11:w=iw*0.25:h=3:color=white@{round(alpha + 0.03, 2)}:t=fill",
                f"drawbox=x=iw*0.42:y=ih*0.84:w=iw*0.42:h=6:color=white@{alpha}:t=fill",
            ]
        )


def _append_camera_source_iphone(
    filters: list[str],
    request: RenderRequest,
    width: int,
    height: int,
    *,
    video_render: bool,
) -> None:
    overlay = request.overlay

    if overlay.glitch > 0:
        _append_tape_artifacts(filters, height, video_render=video_render, intensity=0.55 * overlay.glitch)

    margin_x = max(34, int(width * 0.052))
    top_y = max(40, int(height * 0.16))
    bottom_y = f"h-{max(74, int(height * 0.14))}"
    font_large = max(28, int(height * 0.047))
    font_small = max(24, int(height * 0.04))
    counter, raw_counter = _elapsed_counter(video_render)

    # Soft CRT viewing area, similar to a phone recording an old playback screen.
    filters.extend(
        [
            _drawbox("0", "0", "iw", "ih*0.125", "black@0.72"),
            _drawbox("0", "ih*0.905", "iw", "ih*0.095", "black@0.58"),
            _drawbox("iw*0.028", "ih*0.13", "iw*0.944", "ih*0.77", "white@0.12", "2"),
            _drawbox("iw*0.03", "ih*0.132", "iw*0.94", "ih*0.766", "black@0.08", "fill"),
            _drawbox("iw*0.032", "ih*0.134", "iw*0.936", "2", "cyan@0.18", "fill"),
            _drawbox("iw*0.032", "ih*0.895", "iw*0.936", "2", "magenta@0.14", "fill"),
        ]
    )

    if overlay.play_label:
        filters.extend(
            [
                _drawtext("CAMERA1", str(margin_x), str(top_y), font_large),
                _drawtext("PLAY  >", str(margin_x), str(top_y + int(font_large * 0.92)), font_large),
            ]
        )

    if overlay.counter:
        filters.append(
            _drawtext(
                counter,
                str(margin_x),
                str(top_y + int(font_large * 1.84)),
                font_large,
                raw_text=raw_counter,
            )
        )

    if overlay.vhs_label:
        filters.extend(
            [
                _drawtext("SOURCE", f"w-tw-{margin_x}", str(top_y + int(font_large * 0.25)), font_large),
                _drawtext("IPHONE", f"w-tw-{margin_x}", str(top_y + int(font_large * 1.18)), font_large),
            ]
        )

    if request.timestamp.enabled and overlay.date_block:
        filters.extend(
            [
                _drawtext(request.timestamp.time.strip(), str(margin_x), bottom_y, font_large),
                _drawtext(
                    _format_numeric_footer_date(request.timestamp.date),
                    str(margin_x),
                    f"h-{max(36, int(height * 0.062))}",
                    font_small,
                ),
            ]
        )


def _append_overlay(
    filters: list[str],
    request: RenderRequest,
    overlay_mode: str,
    width: int,
    height: int,
    *,
    video_render: bool,
) -> None:
    if overlay_mode == "rec_camcorder":
        _append_rec_camcorder(filters, request, width, height, video_render=video_render)
        return

    if overlay_mode == "play_vhs_1985":
        _append_play_vhs(filters, request, width, height, video_render=video_render)
        return

    if overlay_mode == "camera_source_iphone":
        _append_camera_source_iphone(filters, request, width, height, video_render=video_render)
        return

    if overlay_mode == "dirty_camcorder":
        _append_rec_camcorder(filters, request, width, height, video_render=video_render, dirty=True)
        return

    if overlay_mode == "retro_tape_glitch":
        _append_play_vhs(filters, request, width, height, video_render=video_render, heavy_glitch=True)
        return

    _append_classic_timestamp(filters, request, height)


def build_vhs_filter(
    request: RenderRequest,
    effects: EffectConfig,
    overlay_mode: str = "classic_timestamp",
    input_media_kind: str = "video",
) -> str:
    width, height = parse_resolution(request.output.resolution)
    video_render = _is_video_render(request, input_media_kind)

    filters: list[str] = [
        f"scale={width}:{height}:force_original_aspect_ratio=decrease",
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:black",
        "setsar=1",
        (
            "eq="
            f"contrast={effects.contrast}:"
            f"saturation={effects.saturation}:"
            f"brightness={effects.brightness}"
        ),
    ]

    if video_render and overlay_mode in {"play_vhs_1985", "camera_source_iphone", "dirty_camcorder", "retro_tape_glitch"}:
        filters.append("rgbashift=rh=2:gh=-1:bh=1")

    if effects.blur > 0:
        sigma = round(0.25 + effects.blur * 1.25, 2)
        filters.append(f"gblur=sigma={sigma}")

    if effects.sharpen > 0:
        amount = round(effects.sharpen * 0.8, 2)
        filters.append(f"unsharp=5:5:{amount}:3:3:0.0")

    if effects.noise > 0:
        strength = max(1, int(effects.noise * 28))
        filters.append(f"noise=alls={strength}:allf=t+u")

    if effects.scanlines > 0:
        alpha = round(0.08 + effects.scanlines * 0.28, 2)
        spacing = 4 if height >= 720 else 3
        filters.append(
            f"drawgrid=width=iw:height={spacing}:thickness=1:color=black@{alpha}"
        )

    _append_overlay(filters, request, overlay_mode, width, height, video_render=video_render)

    # Video encoders like H.264 need yuv420p for broad browser/phone compatibility.
    # Image outputs can keep richer pixel formats and let FFmpeg pick the right encoder format.
    if not output_is_image(request.output.format):
        filters.append("format=yuv420p")

    return ",".join(filters)
