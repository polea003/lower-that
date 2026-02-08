from typing import Protocol

from app.models import VisionDecision


class VisionAnalysisService(Protocol):
    async def analyze_video_content(
        self, image_base64: str, content_description: str
    ) -> VisionDecision:
        ...


class TvRemoteService(Protocol):
    async def toggle_mute(self) -> None:
        ...
