from __future__ import annotations

import os
from pathlib import Path

import pytest
import sqlalchemy as sa
from alembic import command
from alembic.config import Config


DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    pytest.skip("DATABASE_URL is required for migration schema tests.", allow_module_level=True)


REPO_ROOT = Path(__file__).resolve().parents[1]


def _alembic_config() -> Config:
    config = Config(str(REPO_ROOT / "alembic.ini"))
    config.set_main_option("script_location", str(REPO_ROOT / "alembic"))
    config.set_main_option("sqlalchemy.url", DATABASE_URL)
    return config


def _reset_database(engine: sa.Engine) -> None:
    metadata = sa.MetaData()

    with engine.begin() as connection:
        metadata.reflect(bind=connection)
        metadata.drop_all(bind=connection)


def _column_map(inspector: sa.Inspector, table_name: str) -> dict[str, dict[str, object]]:
    return {column["name"]: column for column in inspector.get_columns(table_name)}


def _constraint_names(constraints: list[dict[str, object]]) -> set[str]:
    return {constraint["name"] for constraint in constraints if constraint.get("name")}


def _assert_foreign_key(
    foreign_keys: list[dict[str, object]],
    *,
    name: str,
    constrained_columns: list[str],
    referred_table: str,
    referred_columns: list[str],
) -> None:
    assert len(foreign_keys) == 1

    foreign_key = foreign_keys[0]
    assert foreign_key["name"] == name
    assert foreign_key["constrained_columns"] == constrained_columns
    assert foreign_key["referred_table"] == referred_table
    assert foreign_key["referred_columns"] == referred_columns


@pytest.fixture(scope="module")
def inspector() -> sa.Inspector:
    config = _alembic_config()
    engine = sa.create_engine(DATABASE_URL)

    try:
        _reset_database(engine)
        command.upgrade(config, "head")
        yield sa.inspect(engine)
    finally:
        command.downgrade(config, "base")
        engine.dispose()


def test_target_tables_exist(inspector: sa.Inspector) -> None:
    table_names = set(inspector.get_table_names())

    assert {"users", "nostr_identities", "wallets", "transactions"}.issubset(table_names)


def test_users_schema_matches_spec(inspector: sa.Inspector) -> None:
    columns = _column_map(inspector, "users")
    unique_constraints = _constraint_names(inspector.get_unique_constraints("users"))
    indexes = _constraint_names(inspector.get_indexes("users"))
    checks = _constraint_names(inspector.get_check_constraints("users"))

    assert columns["email"]["nullable"] is True
    assert columns["display_name"]["nullable"] is False
    assert columns["role"]["nullable"] is False
    assert columns["role"]["default"] is not None
    assert columns["is_verified"]["default"] is not None
    assert columns["deleted_at"]["nullable"] is True

    assert "uq_users_email" in unique_constraints
    assert "ix_users_role" in indexes
    assert "ck_users_role_allowed" in checks


def test_nostr_identities_schema_matches_spec(inspector: sa.Inspector) -> None:
    columns = _column_map(inspector, "nostr_identities")
    unique_constraints = _constraint_names(inspector.get_unique_constraints("nostr_identities"))
    foreign_keys = inspector.get_foreign_keys("nostr_identities")

    assert columns["user_id"]["nullable"] is False
    assert columns["pubkey"]["nullable"] is False
    assert columns["created_at"]["default"] is not None

    assert "uq_nostr_identities_pubkey" in unique_constraints
    _assert_foreign_key(
        foreign_keys,
        name="fk_nostr_identities_user_id_users",
        constrained_columns=["user_id"],
        referred_table="users",
        referred_columns=["id"],
    )


def test_wallets_schema_matches_spec(inspector: sa.Inspector) -> None:
    columns = _column_map(inspector, "wallets")
    unique_constraints = _constraint_names(inspector.get_unique_constraints("wallets"))
    foreign_keys = inspector.get_foreign_keys("wallets")
    checks = _constraint_names(inspector.get_check_constraints("wallets"))

    assert columns["user_id"]["nullable"] is False
    assert columns["onchain_balance_sat"]["default"] is not None
    assert columns["lightning_balance_sat"]["default"] is not None
    assert columns["encrypted_seed"]["nullable"] is False
    assert columns["derivation_path"]["default"] is not None

    assert "uq_wallets_user_id" in unique_constraints
    assert "ck_wallets_balances_non_negative" in checks
    _assert_foreign_key(
        foreign_keys,
        name="fk_wallets_user_id_users",
        constrained_columns=["user_id"],
        referred_table="users",
        referred_columns=["id"],
    )


def test_transactions_schema_matches_spec(inspector: sa.Inspector) -> None:
    columns = _column_map(inspector, "transactions")
    indexes = _constraint_names(inspector.get_indexes("transactions"))
    foreign_keys = inspector.get_foreign_keys("transactions")
    checks = _constraint_names(inspector.get_check_constraints("transactions"))

    assert columns["wallet_id"]["nullable"] is False
    assert columns["type"]["nullable"] is False
    assert columns["amount_sat"]["nullable"] is False
    assert columns["direction"]["nullable"] is False
    assert columns["status"]["default"] is not None
    assert columns["confirmed_at"]["nullable"] is True

    assert {
        "ix_transactions_wallet_id",
        "ix_transactions_type",
        "ix_transactions_status",
        "ix_transactions_created_at",
    }.issubset(indexes)
    assert {
        "ck_transactions_amount_positive",
        "ck_transactions_direction_allowed",
        "ck_transactions_status_allowed",
        "ck_transactions_type_allowed",
    }.issubset(checks)
    _assert_foreign_key(
        foreign_keys,
        name="fk_transactions_wallet_id_wallets",
        constrained_columns=["wallet_id"],
        referred_table="wallets",
        referred_columns=["id"],
    )