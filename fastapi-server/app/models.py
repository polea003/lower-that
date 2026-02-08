from pydantic import BaseModel


class AnalyzeJsonPayload(BaseModel):
    imageBase64: str | None = None
    contentDescription: str | None = None


class VisionDecision(BaseModel):
    tv_content_description: str
    should_mute_tv: bool


class AnalyzeResponse(VisionDecision):
    server_isMuted: bool
