import shutil
import subprocess
from pathlib import Path

from app.core.config import get_settings
from app.core.paths import resolve_project_path


def resolve_command(command: str) -> str:
    command = command.strip()

    # Plain executable name, e.g. "ffmpeg" or "ffprobe".
    if not any(separator in command for separator in ("/", "\\")) and not command.endswith(".exe"):
        found = shutil.which(command)
        return found or command

    resolved = resolve_project_path(Path(command))
    return str(resolved)


def run_version_command(command: str) -> dict:
    resolved_command = resolve_command(command)

    try:
        result = subprocess.run(
            [resolved_command, "-version"],
            capture_output=True,
            text=True,
            timeout=8,
            check=False,
        )

        if result.returncode != 0:
            return {
                "available": False,
                "command": command,
                "resolved_command": resolved_command,
                "error": result.stderr.strip() or "Command failed.",
            }

        first_line = result.stdout.splitlines()[0] if result.stdout else "Unknown version"

        return {
            "available": True,
            "command": command,
            "resolved_command": resolved_command,
            "version": first_line,
        }

    except FileNotFoundError:
        return {
            "available": False,
            "command": command,
            "resolved_command": resolved_command,
            "error": "Command not found. Make sure FFmpeg is installed or configured in .env.",
        }

    except PermissionError:
        return {
            "available": False,
            "command": command,
            "resolved_command": resolved_command,
            "error": "Command exists but cannot be executed. Check permissions.",
        }

    except OSError as exc:
        return {
            "available": False,
            "command": command,
            "resolved_command": resolved_command,
            "error": f"Command could not be executed: {exc}",
        }

    except subprocess.TimeoutExpired:
        return {
            "available": False,
            "command": command,
            "resolved_command": resolved_command,
            "error": "Command timed out.",
        }


def check_ffmpeg() -> dict:
    settings = get_settings()
    return run_version_command(settings.FFMPEG_PATH)


def check_ffprobe() -> dict:
    settings = get_settings()
    return run_version_command(settings.FFPROBE_PATH)


def run_ffmpeg(args: list[str], timeout: int | None = None) -> subprocess.CompletedProcess[str]:
    settings = get_settings()
    ffmpeg = resolve_command(settings.FFMPEG_PATH)

    return subprocess.run(
        [ffmpeg, *args],
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )
