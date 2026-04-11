from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    env_profile: Literal["local", "staging", "production"] = "local"

    service_name: str
    service_host: str = "0.0.0.0"
    service_port: int

    wallet_service_url: str = "http://wallet:8001"
    tokenization_service_url: str = "http://tokenization:8002"
    marketplace_service_url: str = "http://marketplace:8003"
    education_service_url: str = "http://education:8004"
    nostr_service_url: str = "http://nostr:8005"

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "tokenization"
    postgres_user: str = ""
    postgres_password: str | None = None
    postgres_password_file: str | None = None
    database_url: str = "postgresql://user:pass@localhost:5432/tokenization"

    redis_url: str = "redis://localhost:6379/0"

    bitcoin_rpc_host: str = "localhost"
    bitcoin_rpc_port: int = 8332
    bitcoin_rpc_user: str = ""
    bitcoin_rpc_password: str | None = None
    bitcoin_rpc_password_file: str | None = None
    bitcoin_network: str = "regtest"

    lnd_grpc_host: str = "localhost"
    lnd_grpc_port: int = 10009
    lnd_macaroon_path: str = ""
    lnd_tls_cert_path: str = ""

    tapd_grpc_host: str = "localhost"
    tapd_grpc_port: int = 10029

    nostr_relays: str = "wss://relay.damus.io,wss://nos.lol"

    jwt_secret: str | None = None
    jwt_secret_file: str | None = None
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7
    totp_issuer: str = "RWAPlatform"

    openai_api_key: str | None = None
    openai_api_key_file: str | None = None

    log_level: str = "INFO"

    @property
    def nostr_relay_list(self) -> list[str]:
        return [relay.strip() for relay in self.nostr_relays.split(",") if relay.strip()]

    @staticmethod
    def _resolve_secret(secret_value: str | None, file_path: str | None) -> str | None:
        if file_path:
            secret_path = Path(file_path)
            if not secret_path.is_absolute():
                secret_path = (_repo_root() / file_path).resolve()
            if not secret_path.exists():
                raise ValueError(f"Secret file does not exist: {secret_path}")
            return secret_path.read_text(encoding="utf-8").strip()
        return secret_value

    @field_validator("log_level")
    @classmethod
    def _validate_log_level(cls, value: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        upper_value = value.upper()
        if upper_value not in allowed:
            raise ValueError(f"log_level must be one of: {', '.join(sorted(allowed))}")
        return upper_value

    @model_validator(mode="after")
    def _hydrate_secrets_and_validate(self) -> Settings:
        self.postgres_password = self._resolve_secret(self.postgres_password, self.postgres_password_file)
        self.bitcoin_rpc_password = self._resolve_secret(self.bitcoin_rpc_password, self.bitcoin_rpc_password_file)
        self.jwt_secret = self._resolve_secret(self.jwt_secret, self.jwt_secret_file)
        self.openai_api_key = self._resolve_secret(self.openai_api_key, self.openai_api_key_file)

        if self.env_profile in {"staging", "production"}:
            if not self.jwt_secret:
                raise ValueError("JWT secret is required for staging/production")
            if "user:pass@localhost" in self.database_url:
                raise ValueError("database_url must be overridden for staging/production")

        return self

def _repo_root() -> Path:
    return Path(__file__).resolve().parents[2]

def _infer_env_profile() -> str:
    profile = os.getenv("ENV_PROFILE", "local").strip().lower()
    return profile if profile in {"local", "staging", "production"} else "local"

def _env_files_for_profile(profile: str) -> list[Path]:
    infra_dir = _repo_root() / "infra"
    return [
        _repo_root() / ".env",
        infra_dir / ".env",
        infra_dir / f".env.{profile}",
    ]

@lru_cache(maxsize=16)
def get_settings(service_name: str, default_port: int) -> Settings:
    profile = _infer_env_profile()
    env_files = [path for path in _env_files_for_profile(profile) if path.exists()]
    return Settings(
        _env_file=env_files if env_files else None,
        service_name=service_name,
        service_port=default_port,
        env_profile=profile,
    )