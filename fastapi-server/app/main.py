import asyncio
import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import ServiceContainer, router
from app.config import EnvironmentError, load_settings
from app.services.errors import BadRequestError, TvRemoteError, VisionAnalysisError
from app.services.tv_remote import NoopTvRemoteService, SamsungTvRemoteService
from app.services.vision_analysis import OpenAIVisionAnalysisService


def configure_logging() -> None:
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=level,
        format="[%(asctime)s] %(levelname)s: %(message)s",
    )


def create_app() -> FastAPI:
    configure_logging()
    logger = logging.getLogger("fastapi-server")
    settings = load_settings()

    app = FastAPI(title="Lower That API", version="1.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    vision_analysis = OpenAIVisionAnalysisService(settings)
    tv_remote = (
        SamsungTvRemoteService(settings)
        if settings.tv_control_enabled
        else NoopTvRemoteService()
    )
    app.state.services = ServiceContainer(
        vision_analysis=vision_analysis,
        tv_remote=tv_remote,
        is_muted=False,
        mute_lock=asyncio.Lock(),
    )

    @app.get("/health")
    async def health() -> dict[str, bool]:
        return {"ok": True}

    app.include_router(router)

    @app.exception_handler(BadRequestError)
    async def bad_request_handler(_request: Request, exc: BadRequestError) -> JSONResponse:
        return JSONResponse(status_code=400, content={"error": str(exc)})

    @app.exception_handler(VisionAnalysisError)
    async def vision_error_handler(_request: Request, exc: VisionAnalysisError) -> JSONResponse:
        return JSONResponse(status_code=500, content={"error": str(exc)})

    @app.exception_handler(TvRemoteError)
    async def tv_error_handler(_request: Request, exc: TvRemoteError) -> JSONResponse:
        return JSONResponse(status_code=500, content={"error": str(exc)})

    @app.exception_handler(EnvironmentError)
    async def environment_error_handler(
        _request: Request, exc: EnvironmentError
    ) -> JSONResponse:
        return JSONResponse(status_code=500, content={"error": str(exc)})

    @app.exception_handler(Exception)
    async def generic_error_handler(_request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled application error", exc_info=exc)
        return JSONResponse(status_code=500, content={"error": "Internal Server Error"})

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        if exc.status_code == 404:
            return JSONResponse(
                status_code=404,
                content={"error": "Not Found", "path": request.url.path},
            )
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail if isinstance(exc.detail, str) else "HTTP Error"},
        )

    logger.info("FastAPI server initialized")
    return app


app = create_app()
