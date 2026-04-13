"""remaining schema tables

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-13 13:30:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. nostr_identities
    op.create_table(
        "nostr_identities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pubkey", sa.String(length=64), nullable=False),
        sa.Column("relay_urls", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_nostr_identities_user_id_users"),
        sa.PrimaryKeyConstraint("id", name="pk_nostr_identities"),
        sa.UniqueConstraint("pubkey", name="uq_nostr_identities_pubkey"),
    )

    # 2. courses
    op.create_table(
        "courses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("content_url", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("difficulty", sa.String(length=20), nullable=False),
        sa.Column("is_published", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_courses"),
    )

    # 3. assets
    op.create_table(
        "assets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("valuation_sat", sa.BigInteger(), nullable=False),
        sa.Column("documents_url", sa.Text(), nullable=True),
        sa.Column("ai_score", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("ai_analysis", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("projected_roi", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], name="fk_assets_owner_id_users"),
        sa.PrimaryKeyConstraint("id", name="pk_assets"),
    )
    op.create_index("ix_assets_category", "assets", ["category"], unique=False)
    op.create_index("ix_assets_owner_id", "assets", ["owner_id"], unique=False)
    op.create_index("ix_assets_status", "assets", ["status"], unique=False)

    # 4. tokens
    op.create_table(
        "tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("asset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("taproot_asset_id", sa.String(length=64), nullable=False),
        sa.Column("total_supply", sa.BigInteger(), nullable=False),
        sa.Column("circulating_supply", sa.BigInteger(), server_default="0", nullable=False),
        sa.Column("unit_price_sat", sa.BigInteger(), nullable=False),
        sa.Column("metadata_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("minted_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["asset_id"], ["assets.id"], name="fk_tokens_asset_id_assets"),
        sa.PrimaryKeyConstraint("id", name="pk_tokens"),
        sa.UniqueConstraint("taproot_asset_id", name="uq_tokens_taproot_asset_id"),
    )
    op.create_index("ix_tokens_asset_id", "tokens", ["asset_id"], unique=False)

    # 5. token_balances
    op.create_table(
        "token_balances",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("balance", sa.BigInteger(), server_default="0", nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["token_id"], ["tokens.id"], name="fk_token_balances_token_id_tokens"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_token_balances_user_id_users"),
        sa.PrimaryKeyConstraint("id", name="pk_token_balances"),
        sa.UniqueConstraint("user_id", "token_id", name="uq_token_balances_user_token"),
    )
    op.create_index("ix_token_balances_token_id", "token_balances", ["token_id"], unique=False)
    op.create_index("ix_token_balances_user_id", "token_balances", ["user_id"], unique=False)

    # 6. transactions
    op.create_table(
        "transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("wallet_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("type", sa.String(length=30), nullable=False),
        sa.Column("amount_sat", sa.BigInteger(), nullable=False),
        sa.Column("direction", sa.String(length=4), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("txid", sa.String(length=64), nullable=True),
        sa.Column("ln_payment_hash", sa.String(length=64), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("amount_sat > 0", name="ck_transactions_amount_positive"),
        sa.CheckConstraint(
            "direction IN ('in', 'out')",
            name="ck_transactions_direction_allowed",
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'confirmed', 'failed')",
            name="ck_transactions_status_allowed",
        ),
        sa.CheckConstraint(
            "type IN ('deposit', 'withdrawal', 'ln_send', 'ln_receive', 'escrow_lock', 'escrow_release', 'fee')",
            name="ck_transactions_type_allowed",
        ),
        sa.ForeignKeyConstraint(["wallet_id"], ["wallets.id"], name="fk_transactions_wallet_id_wallets"),
        sa.PrimaryKeyConstraint("id", name="pk_transactions"),
    )
    op.create_index("ix_transactions_created_at", "transactions", ["created_at"], unique=False)
    op.create_index("ix_transactions_status", "transactions", ["status"], unique=False)
    op.create_index("ix_transactions_type", "transactions", ["type"], unique=False)
    op.create_index("ix_transactions_wallet_id", "transactions", ["wallet_id"], unique=False)

    # 7. orders
    op.create_table(
        "orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("side", sa.String(length=4), nullable=False),
        sa.Column("quantity", sa.BigInteger(), nullable=False),
        sa.Column("price_sat", sa.BigInteger(), nullable=False),
        sa.Column("filled_quantity", sa.BigInteger(), server_default="0", nullable=False),
        sa.Column("status", sa.String(length=20), server_default="open", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["token_id"], ["tokens.id"], name="fk_orders_token_id_tokens"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_orders_user_id_users"),
        sa.PrimaryKeyConstraint("id", name="pk_orders"),
    )
    op.create_index("ix_orders_token_id", "orders", ["token_id"], unique=False)
    op.create_index("ix_orders_user_id", "orders", ["user_id"], unique=False)

    # 8. trades
    op.create_table(
        "trades",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("buy_order_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sell_order_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quantity", sa.BigInteger(), nullable=False),
        sa.Column("price_sat", sa.BigInteger(), nullable=False),
        sa.Column("total_sat", sa.BigInteger(), nullable=False),
        sa.Column("fee_sat", sa.BigInteger(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("settled_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["buy_order_id"], ["orders.id"], name="fk_trades_buy_order_id_orders"),
        sa.ForeignKeyConstraint(["sell_order_id"], ["orders.id"], name="fk_trades_sell_order_id_orders"),
        sa.ForeignKeyConstraint(["token_id"], ["tokens.id"], name="fk_trades_token_id_tokens"),
        sa.PrimaryKeyConstraint("id", name="pk_trades"),
    )
    op.create_index("ix_trades_status", "trades", ["status"], unique=False)
    op.create_index("ix_trades_token_id", "trades", ["token_id"], unique=False)

    # 9. escrows
    op.create_table(
        "escrows",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("trade_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("multisig_address", sa.String(length=100), nullable=False),
        sa.Column("buyer_pubkey", sa.String(length=66), nullable=False),
        sa.Column("seller_pubkey", sa.String(length=66), nullable=False),
        sa.Column("platform_pubkey", sa.String(length=66), nullable=False),
        sa.Column("locked_amount_sat", sa.BigInteger(), nullable=False),
        sa.Column("funding_txid", sa.String(length=64), nullable=True),
        sa.Column("release_txid", sa.String(length=64), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="created", nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["trade_id"], ["trades.id"], name="fk_escrows_trade_id_trades"),
        sa.PrimaryKeyConstraint("id", name="pk_escrows"),
        sa.UniqueConstraint("trade_id", name="uq_escrows_trade_id"),
    )
    op.create_index("ix_escrows_status", "escrows", ["status"], unique=False)

    # 10. treasury
    op.create_table(
        "treasury",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_trade_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("type", sa.String(length=20), nullable=False),
        sa.Column("amount_sat", sa.BigInteger(), nullable=False),
        sa.Column("balance_after_sat", sa.BigInteger(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["source_trade_id"], ["trades.id"], name="fk_treasury_trade_id_trades"),
        sa.PrimaryKeyConstraint("id", name="pk_treasury"),
    )
    op.create_index("ix_treasury_created_at", "treasury", ["created_at"], unique=False)
    op.create_index("ix_treasury_type", "treasury", ["type"], unique=False)

    # 11. enrollments
    op.create_table(
        "enrollments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("progress", sa.Numeric(precision=5, scale=2), server_default="0", nullable=False),
        sa.Column("enrolled_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], name="fk_enrollments_course_id_courses"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_enrollments_user_id_users"),
        sa.PrimaryKeyConstraint("id", name="pk_enrollments"),
        sa.UniqueConstraint("user_id", "course_id", name="uq_enrollments_user_course"),
    )


def downgrade() -> None:
    op.drop_table("enrollments")
    op.drop_table("treasury")
    op.drop_table("escrows")
    op.drop_table("trades")
    op.drop_table("orders")
    op.drop_table("token_balances")
    op.drop_table("transactions")
    op.drop_table("tokens")
    op.drop_table("assets")
    op.drop_table("courses")
    op.drop_table("nostr_identities")
