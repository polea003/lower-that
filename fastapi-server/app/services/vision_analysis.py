import json
import logging

from openai import OpenAI

from app.config import Settings
from app.constants import AI_IMAGE_DETAIL_LEVEL, AI_MODEL, AI_REASONING_EFFORT
from app.models import VisionDecision
from app.services.errors import VisionAnalysisError


def _system_prompt(content_description: str) -> str:
    return f"""
You are an assistant optimized for muting/unmuting the tv based on the user's preferences.

User's preferred content: {content_description}.

With that in mind, follow these directions:

1. Analyze the provided photo to identify the content that appears on the tv screen.

2. Respond with a JSON object containing two fields: "tv_content_description" and "should_mute_tv".

3. For the "tv_content_description" field, respond with 2 short sentences.
The first sentence is a description of what you see on the tv screen. Only describe the content on the tv. Nothing else in the image.
The second sentence should evaluate if the content on the tv is the user's preferred content.

4. For the "should_mute_tv" field, assign a boolean value:
   - True: If the tv screen IS NOT showing {content_description}
   - False: If the tv screen IS showing {content_description}.
""".strip()


def _analysis_schema() -> dict:
    return {
        "type": "object",
        "properties": {
            "tv_content_description": {"type": "string"},
            "should_mute_tv": {"type": "boolean"},
        },
        "required": ["tv_content_description", "should_mute_tv"],
        "additionalProperties": False,
    }


class OpenAIVisionAnalysisService:
    def __init__(self, settings: Settings) -> None:
        self._logger = logging.getLogger("fastapi-server.vision")
        self._client = OpenAI(api_key=settings.openai_api_key)
        self._logger.info("OpenAIVisionAnalysisService initialized")

    async def analyze_video_content(
        self, image_base64: str, content_description: str
    ) -> VisionDecision:
        try:
            image_data_url = (
                image_base64
                if image_base64.startswith("data:")
                else f"data:image/jpeg;base64,{image_base64}"
            )
            response = self._client.responses.create(
                model=AI_MODEL,
                instructions=_system_prompt(content_description),
                reasoning={"effort": AI_REASONING_EFFORT},
                input=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_image",
                                "image_url": image_data_url,
                                "detail": AI_IMAGE_DETAIL_LEVEL,
                            }
                        ],
                    }
                ],
                store=False,
                text={
                    "format": {
                        "type": "json_schema",
                        "name": "tv_analysis_result",
                        "schema": _analysis_schema(),
                        "strict": True,
                    }
                },
            )
            parsed = json.loads(response.output_text)
            return VisionDecision(**parsed)
        except Exception as exc:  # noqa: BLE001
            self._logger.exception("Vision analysis failed")
            raise VisionAnalysisError("Failed to analyze video content") from exc
