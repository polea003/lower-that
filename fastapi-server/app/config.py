import os
from dataclasses import dataclass


class EnvironmentError(Exception):
    pass


def _to_bool(value: str | None, default: bool = True) -> bool:
    if value is None:
        return default
    normalized = value.strip().lower()
    return normalized in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    openai_api_key: str
    tv_control_enabled: bool
    samsung_tv_ip_address: str | None
    samsung_tv_mac_address: str | None
    log_level: str

    def validate(self) -> None:
        if not self.openai_api_key:
            raise EnvironmentError("Required environment variable OPENAI_API_KEY is not set")
        if self.tv_control_enabled:
            if not self.samsung_tv_ip_address:
                raise EnvironmentError(
                    "Required environment variable SAMSUNG_TV_IP_ADDRESS is not set"
                )
            if not self.samsung_tv_mac_address:
                raise EnvironmentError(
                    "Required environment variable SAMSUNG_TV_MAC_ADDRESS is not set"
                )


def load_settings() -> Settings:
    settings = Settings(
        openai_api_key=os.getenv("OPENAI_API_KEY", ""),
        tv_control_enabled=_to_bool(os.getenv("TV_CONTROL_ENABLED"), True),
        samsung_tv_ip_address=os.getenv("SAMSUNG_TV_IP_ADDRESS"),
        samsung_tv_mac_address=os.getenv("SAMSUNG_TV_MAC_ADDRESS"),
        log_level=os.getenv("LOG_LEVEL", "info"),
    )
    settings.validate()
    return settings
