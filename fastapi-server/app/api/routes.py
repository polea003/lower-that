import asyncio
import base64
import json
from dataclasses import dataclass

from fastapi import APIRouter, Request

from app.constants import DEFAULT_CONTENT_DESCRIPTION
from app.models import AnalyzeJsonPayload, AnalyzeResponse
from app.services.contracts import TvRemoteService, VisionAnalysisService
from app.services.errors import BadRequestError


@dataclass
class ServiceContainer:
    vision_analysis: VisionAnalysisService
    tv_remote: TvRemoteService
    is_muted: bool
    mute_lock: asyncio.Lock


router = APIRouter(prefix="/api", tags=["analyze"])


def _coerce_form_value(value: object | None) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        return value
    return str(value)


async def _parse_request_payload(
    request: Request,
) -> tuple[str, str]:
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        form = await request.form()
        content_description = _coerce_form_value(form.get("contentDescription"))
        image_upload = form.get("image")
        if image_upload is None or not hasattr(image_upload, "read"):
            raise BadRequestError("Missing image or imageBase64")
        image_bytes = await image_upload.read()
        if not image_bytes:
            raise BadRequestError("Missing image or imageBase64")
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")
        return image_base64, content_description or DEFAULT_CONTENT_DESCRIPTION

    try:
        payload_data = await request.json()
    except json.JSONDecodeError as exc:
        raise BadRequestError("Invalid JSON body") from exc
    payload = AnalyzeJsonPayload(**payload_data)
    if not payload.imageBase64:
        raise BadRequestError("Missing image or imageBase64")
    return payload.imageBase64, payload.contentDescription or DEFAULT_CONTENT_DESCRIPTION


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: Request) -> AnalyzeResponse:
    container: ServiceContainer = request.app.state.services
    image_base64, content_description = await _parse_request_payload(request)
    result = await container.vision_analysis.analyze_video_content(
        image_base64=image_base64,
        content_description=content_description,
    )

    async with container.mute_lock:
        if not container.is_muted and result.should_mute_tv:
            await container.tv_remote.toggle_mute()
            container.is_muted = True
        elif container.is_muted and not result.should_mute_tv:
            await container.tv_remote.toggle_mute()
            container.is_muted = False

        return AnalyzeResponse(
            tv_content_description=result.tv_content_description,
            should_mute_tv=result.should_mute_tv,
            server_isMuted=container.is_muted,
        )
