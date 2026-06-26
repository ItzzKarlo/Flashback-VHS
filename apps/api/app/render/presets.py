PRESETS: list[dict] = [
    {
        "id": "classic_vhs",
        "name": "Classic Timestamp",
        "description": "Soft tape texture with a chunky lower-corner date stamp.",
        "overlay_mode": "classic_timestamp",
        "effects": {
            "noise": 0.35,
            "scanlines": 0.25,
            "blur": 0.15,
            "contrast": 1.08,
            "saturation": 0.82,
            "brightness": -0.02,
            "sharpen": 0.12,
        },
    },
    {
        "id": "rec_camcorder",
        "name": "REC Camcorder UI",
        "description": "Red REC dot, corner brackets, SP marker, live counter, and date block.",
        "overlay_mode": "rec_camcorder",
        "effects": {
            "noise": 0.3,
            "scanlines": 0.18,
            "blur": 0.08,
            "contrast": 1.1,
            "saturation": 0.88,
            "brightness": -0.02,
            "sharpen": 0.2,
        },
    },
    {
        "id": "play_vhs_1985",
        "name": "PLAY VHS 1985",
        "description": "PLAY arrow, VHS label, date/time OSD, tracking bands, and white tape glitches.",
        "overlay_mode": "play_vhs_1985",
        "effects": {
            "noise": 0.42,
            "scanlines": 0.32,
            "blur": 0.16,
            "contrast": 1.2,
            "saturation": 0.7,
            "brightness": -0.05,
            "sharpen": 0.12,
        },
    },
    {
        "id": "dirty_camcorder",
        "name": "Dirty Camcorder",
        "description": "Heavy static, REC overlay, SP marker, and rough tape interference.",
        "overlay_mode": "dirty_camcorder",
        "effects": {
            "noise": 0.68,
            "scanlines": 0.48,
            "blur": 0.22,
            "contrast": 1.16,
            "saturation": 0.72,
            "brightness": -0.04,
            "sharpen": 0.08,
        },
    },
    {
        "id": "late_night_tv",
        "name": "Late Night TV",
        "description": "Dim taped-TV look with PLAY label, VHS OSD, tracking bars, and crushed color.",
        "overlay_mode": "play_vhs_1985",
        "effects": {
            "noise": 0.28,
            "scanlines": 0.42,
            "blur": 0.1,
            "contrast": 1.24,
            "saturation": 0.68,
            "brightness": -0.08,
            "sharpen": 0.18,
        },
    },
    {
        "id": "retro_tape_glitch",
        "name": "Retro Tape Glitch",
        "description": "Aggressive tracking noise, white glitch chunks, and unstable analog contrast.",
        "overlay_mode": "retro_tape_glitch",
        "effects": {
            "noise": 0.62,
            "scanlines": 0.34,
            "blur": 0.08,
            "contrast": 1.32,
            "saturation": 0.9,
            "brightness": -0.03,
            "sharpen": 0.28,
        },
    },
]


def list_presets() -> list[dict]:
    return PRESETS


def get_preset(preset_id: str) -> dict | None:
    for preset in PRESETS:
        if preset["id"] == preset_id:
            return preset

    return None
