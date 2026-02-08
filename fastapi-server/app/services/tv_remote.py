import asyncio
import logging

from samsungtvws import SamsungTVWS

from app.config import Settings
from app.services.errors import TvRemoteError


class SamsungTvRemoteService:
    def __init__(self, settings: Settings) -> None:
        self._logger = logging.getLogger("fastapi-server.tv")
        self._tv = SamsungTVWS(host=settings.samsung_tv_ip_address, port=8001)

    async def toggle_mute(self) -> None:
        try:
            await asyncio.to_thread(self._tv.send_key, "KEY_MUTE")
            self._logger.info("TV mute toggled successfully")
        except Exception as exc:  # noqa: BLE001
            self._logger.exception("TV remote operation failed")
            raise TvRemoteError("Failed to toggle TV mute") from exc


class NoopTvRemoteService:
    def __init__(self) -> None:
        self._logger = logging.getLogger("fastapi-server.tv")

    async def toggle_mute(self) -> None:
        self._logger.info("TV_CONTROL_ENABLED=false: toggleMute skipped (noop)")
