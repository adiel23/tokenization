from __future__ import annotations

import os
import sys
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, NamedTuple
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from services.auth.jwt_utils import issue_token_pair


class FakeUser(NamedTuple):
    id: uuid.UUID
    email: str
    display_name: str
    role: str
    created_at: datetime
    deleted_at: datetime | None


class FakeAsset(NamedTuple):
    id: uuid.UUID
    owner_id: uuid.UUID
    name: str
    description: str
    category: str
    valuation_sat: int
    documents_url: str | None
    status: str
    created_at: datetime
    updated_at: datetime
    ai_score: float | None = None
    ai_analysis: dict[str, Any] | None = None
    projected_roi: float | None = None
    token_id: uuid.UUID | None = None
    taproot_asset_id: str | None = None
    total_supply: int | None = None
    circulating_supply: int | None = None
    unit_price_sat: int | None = None
    minted_at: datetime | None = None


def _make_fake_user(*, role: str = "seller") -> FakeUser:
    return FakeUser(
        id=uuid.uuid4(),
        email="seller@example.com",
        display_name="Seller",
        role=role,
        created_at=datetime.now(tz=timezone.utc),
        deleted_at=None,
    )


def _make_fake_asset(
    owner_id: uuid.UUID,
    *,
    status: str = "pending",
    ai_score: float | None = None,
    ai_analysis: dict[str, Any] | None = None,
    projected_roi: float | None = None,
    tokenized: bool = False,
) -> FakeAsset:
    now = datetime.now(tz=timezone.utc)
    return FakeAsset(
        id=uuid.uuid4(),
        owner_id=owner_id,
        name="Downtown Office Building",
        description="3-story commercial office building in the central district.",
        category="real_estate",
        valuation_sat=100_000_000,
        documents_url="https://storage.example.com/docs/abc123",
        status=status,
        created_at=now,
        updated_at=now,
        ai_score=ai_score,
        ai_analysis=ai_analysis,
        projected_roi=projected_roi,
        token_id=uuid.uuid4() if tokenized else None,
        taproot_asset_id="ab" * 32 if tokenized else None,
        total_supply=1_000 if tokenized else None,
        circulating_supply=350 if tokenized else None,
        unit_price_sat=100_000 if tokenized else None,
        minted_at=now if tokenized else None,
    )


@pytest.fixture()
def fake_settings():
    return {
        "ENV_PROFILE": "local",
        "WALLET_SERVICE_URL": "http://wallet:8001",
        "TOKENIZATION_SERVICE_URL": "http://tokenization:8002",
        "MARKETPLACE_SERVICE_URL": "http://marketplace:8003",
        "EDUCATION_SERVICE_URL": "http://education:8004",
        "NOSTR_SERVICE_URL": "http://nostr:8005",
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_DB": "testdb",
        "POSTGRES_USER": "user",
        "DATABASE_URL": "postgresql://user:pass@localhost/testdb",
        "REDIS_URL": "redis://localhost:6379/0",
        "BITCOIN_RPC_HOST": "localhost",
        "BITCOIN_RPC_PORT": "18443",
        "BITCOIN_RPC_USER": "bitcoin",
        "BITCOIN_NETWORK": "regtest",
        "LND_GRPC_HOST": "localhost",
        "LND_GRPC_PORT": "10009",
        "LND_MACAROON_PATH": "tests/fixtures/admin.macaroon",
        "LND_TLS_CERT_PATH": "tests/fixtures/tls.cert",
        "TAPD_GRPC_HOST": "localhost",
        "TAPD_GRPC_PORT": "10029",
        "TAPD_MACAROON_PATH": "tests/fixtures/tapd.macaroon",
        "TAPD_TLS_CERT_PATH": "tests/fixtures/tapd.cert",
        "NOSTR_RELAYS": "wss://relay.example.com",
        "JWT_SECRET": "test-secret-key-for-tokenization-tests",
        "JWT_ACCESS_TOKEN_EXPIRE_MINUTES": "15",
        "JWT_REFRESH_TOKEN_EXPIRE_DAYS": "7",
        "TOTP_ISSUER": "Platform",
        "LOG_LEVEL": "INFO",
    }


@pytest.fixture()
def client(fake_settings):
    fake_conn = AsyncMock()

    @asynccontextmanager
    async def _fake_connect():
        yield fake_conn

    fake_engine = MagicMock()
    fake_engine.connect = _fake_connect
    fake_engine.dispose = AsyncMock()

    with patch.dict(os.environ, fake_settings, clear=False):
        for module_name in ("services.tokenization.main", "common", "common.config"):
            sys.modules.pop(module_name, None)

        import services.tokenization.main as tokenization_main

        tokenization_main._engine = fake_engine
        app = tokenization_main.app
        app.router.lifespan_context = None

        yield TestClient(app, raise_server_exceptions=True), tokenization_main.settings


def _issue_access_token(user: FakeUser, secret: str) -> str:
    return issue_token_pair(
        user_id=str(user.id),
        role=user.role,
        wallet_id=None,
        secret=secret,
    ).access_token


def _auth_headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


class TestSubmitAsset:
    def test_seller_can_create_asset_with_pending_initial_status(self, client):
        app_client, settings = client
        fake_user = _make_fake_user(role="seller")
        fake_asset = _make_fake_asset(fake_user.id)
        access_token = _issue_access_token(fake_user, settings.jwt_secret)
        create_asset_mock = AsyncMock(return_value=fake_asset)

        with (
            patch("services.tokenization.main.get_user_by_id", AsyncMock(return_value=fake_user)),
            patch("services.tokenization.main.create_asset", create_asset_mock),
        ):
            resp = app_client.post(
                "/assets",
                headers=_auth_headers(access_token),
                json={
                    "name": fake_asset.name,
                    "description": fake_asset.description,
                    "category": fake_asset.category,
                    "valuation_sat": fake_asset.valuation_sat,
                    "documents_url": fake_asset.documents_url,
                },
            )

        assert resp.status_code == 201
        body = resp.json()["asset"]
        assert body["owner_id"] == str(fake_user.id)
        assert body["name"] == fake_asset.name
        assert body["description"] == fake_asset.description
        assert body["category"] == fake_asset.category
        assert body["valuation_sat"] == fake_asset.valuation_sat
        assert body["documents_url"] == fake_asset.documents_url
        assert body["status"] == "pending"

        create_asset_mock.assert_awaited_once()
        assert create_asset_mock.await_args.args[0] is not None
        assert create_asset_mock.await_args.kwargs == {
            "owner_id": str(fake_user.id),
            "name": fake_asset.name,
            "description": fake_asset.description,
            "category": fake_asset.category,
            "valuation_sat": fake_asset.valuation_sat,
            "documents_url": fake_asset.documents_url,
        }

    def test_missing_documents_url_returns_clear_validation_error(self, client):
        app_client, settings = client
        fake_user = _make_fake_user(role="seller")
        access_token = _issue_access_token(fake_user, settings.jwt_secret)

        with patch("services.tokenization.main.get_user_by_id", AsyncMock(return_value=fake_user)):
            resp = app_client.post(
                "/assets",
                headers=_auth_headers(access_token),
                json={
                    "name": "Downtown Office Building",
                    "description": "3-story commercial office building in the central district.",
                    "category": "real_estate",
                    "valuation_sat": 100_000_000,
                },
            )

        assert resp.status_code == 422
        body = resp.json()
        assert body["error"]["code"] == "validation_error"
        assert body["error"]["message"] == "Request payload failed validation."
        assert {"field": "documents_url", "message": "Field required"} in body["error"]["details"]

    def test_invalid_category_returns_field_level_validation_error(self, client):
        app_client, settings = client
        fake_user = _make_fake_user(role="seller")
        access_token = _issue_access_token(fake_user, settings.jwt_secret)

        with patch("services.tokenization.main.get_user_by_id", AsyncMock(return_value=fake_user)):
            resp = app_client.post(
                "/assets",
                headers=_auth_headers(access_token),
                json={
                    "name": "Downtown Office Building",
                    "description": "3-story commercial office building in the central district.",
                    "category": "boats",
                    "valuation_sat": 100_000_000,
                    "documents_url": "https://storage.example.com/docs/abc123",
                },
            )

        assert resp.status_code == 422
        body = resp.json()
        assert body["error"]["code"] == "validation_error"
        assert any(detail["field"] == "category" for detail in body["error"]["details"])

    def test_non_seller_role_is_rejected(self, client):
        app_client, settings = client
        fake_user = _make_fake_user(role="user")
        access_token = _issue_access_token(fake_user, settings.jwt_secret)

        with patch("services.tokenization.main.get_user_by_id", AsyncMock(return_value=fake_user)):
            resp = app_client.post(
                "/assets",
                headers=_auth_headers(access_token),
                json={
                    "name": "Downtown Office Building",
                    "description": "3-story commercial office building in the central district.",
                    "category": "real_estate",
                    "valuation_sat": 100_000_000,
                    "documents_url": "https://storage.example.com/docs/abc123",
                },
            )

        assert resp.status_code == 403
        assert resp.json()["error"]["code"] == "forbidden"

    def test_missing_bearer_token_is_rejected(self, client):
        app_client, _ = client

        resp = app_client.post(
            "/assets",
            json={
                "name": "Downtown Office Building",
                "description": "3-story commercial office building in the central district.",
                "category": "real_estate",
                "valuation_sat": 100_000_000,
                "documents_url": "https://storage.example.com/docs/abc123",
            },
        )

        assert resp.status_code == 401
        assert resp.json()["error"]["code"] == "authentication_required"


class TestGetAssetDetails:
    def test_user_can_fetch_asset_details_with_ai_and_token_fields(self, client):
        app_client, settings = client
        fake_user = _make_fake_user(role="user")
        fake_asset = _make_fake_asset(
            fake_user.id,
            status="tokenized",
            ai_score=78.5,
            ai_analysis={
                "risk_level": "moderate",
                "projected_roi_annual": 7.2,
                "market_timing": "favorable",
                "summary": "Strong location with consistent occupancy rates.",
            },
            projected_roi=7.2,
            tokenized=True,
        )
        access_token = _issue_access_token(fake_user, settings.jwt_secret)

        with (
            patch("services.tokenization.main.get_user_by_id", AsyncMock(return_value=fake_user)),
            patch("services.tokenization.main.get_asset_by_id", AsyncMock(return_value=fake_asset)),
        ):
            resp = app_client.get(
                f"/assets/{fake_asset.id}",
                headers=_auth_headers(access_token),
            )

        assert resp.status_code == 200
        body = resp.json()["asset"]
        assert body["id"] == str(fake_asset.id)
        assert body["owner_id"] == str(fake_user.id)
        assert body["status"] == "tokenized"
        assert body["ai_score"] == 78.5
        assert body["ai_analysis"] == fake_asset.ai_analysis
        assert body["projected_roi"] == 7.2
        assert body["token"] == {
            "id": str(fake_asset.token_id),
            "taproot_asset_id": fake_asset.taproot_asset_id,
            "total_supply": fake_asset.total_supply,
            "circulating_supply": fake_asset.circulating_supply,
            "unit_price_sat": fake_asset.unit_price_sat,
            "minted_at": fake_asset.minted_at.isoformat().replace("+00:00", "Z"),
        }

    def test_missing_asset_returns_contract_404(self, client):
        app_client, settings = client
        fake_user = _make_fake_user(role="user")
        access_token = _issue_access_token(fake_user, settings.jwt_secret)
        missing_asset_id = uuid.uuid4()

        with (
            patch("services.tokenization.main.get_user_by_id", AsyncMock(return_value=fake_user)),
            patch("services.tokenization.main.get_asset_by_id", AsyncMock(return_value=None)),
        ):
            resp = app_client.get(
                f"/assets/{missing_asset_id}",
                headers=_auth_headers(access_token),
            )

        assert resp.status_code == 404
        assert resp.json()["error"] == {
            "code": "asset_not_found",
            "message": "Asset not found.",
        }
