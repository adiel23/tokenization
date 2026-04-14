from __future__ import annotations

from datetime import datetime, timedelta, timezone
import uuid

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncConnection

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from common.db.metadata import orders as orders_table
from common.db.metadata import token_balances as token_balances_table
from common.db.metadata import tokens as tokens_table
from common.db.metadata import trades as trades_table
from common.db.metadata import users as users_table
from common.db.metadata import wallets as wallets_table


_OPEN_ORDER_STATUSES = ("open", "partially_filled")


def _as_uuid(value: str | uuid.UUID) -> uuid.UUID:
    return value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))


def _utc_now() -> datetime:
    return datetime.now(tz=timezone.utc)


def _row_value(row: object, key: str, default: object | None = None):
    if isinstance(row, dict):
        return row.get(key, default)

    mapping = getattr(row, "_mapping", None)
    if mapping is not None and key in mapping:
        return mapping[key]
    return getattr(row, key, default)


async def get_user_by_id(
    conn: AsyncConnection,
    user_id: str | uuid.UUID,
) -> sa.engine.Row | None:
    result = await conn.execute(
        sa.select(users_table).where(users_table.c.id == _as_uuid(user_id))
    )
    return result.fetchone()


async def get_wallet_by_user_id(
    conn: AsyncConnection,
    user_id: str | uuid.UUID,
) -> sa.engine.Row | None:
    result = await conn.execute(
        sa.select(wallets_table).where(wallets_table.c.user_id == _as_uuid(user_id))
    )
    return result.fetchone()


async def get_token_by_id(
    conn: AsyncConnection,
    token_id: str | uuid.UUID,
) -> sa.engine.Row | None:
    result = await conn.execute(
        sa.select(tokens_table).where(tokens_table.c.id == _as_uuid(token_id))
    )
    return result.fetchone()


async def get_token_balance_for_user(
    conn: AsyncConnection,
    user_id: str | uuid.UUID,
    token_id: str | uuid.UUID,
) -> sa.engine.Row | None:
    result = await conn.execute(
        sa.select(token_balances_table)
        .where(token_balances_table.c.user_id == _as_uuid(user_id))
        .where(token_balances_table.c.token_id == _as_uuid(token_id))
    )
    return result.fetchone()


async def get_reserved_sell_quantity(
    conn: AsyncConnection,
    user_id: str | uuid.UUID,
    token_id: str | uuid.UUID,
) -> int:
    remaining = orders_table.c.quantity - orders_table.c.filled_quantity
    stmt = (
        sa.select(sa.func.coalesce(sa.func.sum(remaining), 0))
        .select_from(orders_table)
        .where(orders_table.c.user_id == _as_uuid(user_id))
        .where(orders_table.c.token_id == _as_uuid(token_id))
        .where(orders_table.c.side == "sell")
        .where(orders_table.c.status.in_(_OPEN_ORDER_STATUSES))
    )
    result = await conn.execute(stmt)
    return int(result.scalar_one())


async def get_reserved_buy_commitment(
    conn: AsyncConnection,
    user_id: str | uuid.UUID,
) -> int:
    remaining_commitment = (orders_table.c.quantity - orders_table.c.filled_quantity) * orders_table.c.price_sat
    stmt = (
        sa.select(sa.func.coalesce(sa.func.sum(remaining_commitment), 0))
        .select_from(orders_table)
        .where(orders_table.c.user_id == _as_uuid(user_id))
        .where(orders_table.c.side == "buy")
        .where(orders_table.c.status.in_(_OPEN_ORDER_STATUSES))
    )
    result = await conn.execute(stmt)
    return int(result.scalar_one())


async def create_order(
    conn: AsyncConnection,
    *,
    user_id: str | uuid.UUID,
    token_id: str | uuid.UUID,
    side: str,
    quantity: int,
    price_sat: int,
) -> sa.engine.Row:
    now = _utc_now()
    result = await conn.execute(
        sa.insert(orders_table)
        .values(
            id=uuid.uuid4(),
            user_id=_as_uuid(user_id),
            token_id=_as_uuid(token_id),
            side=side,
            quantity=quantity,
            price_sat=price_sat,
            filled_quantity=0,
            status="open",
            created_at=now,
            updated_at=now,
        )
        .returning(orders_table)
    )
    row = result.fetchone()
    await conn.commit()
    assert row is not None
    return row


async def get_order_by_id(
    conn: AsyncConnection,
    order_id: str | uuid.UUID,
) -> sa.engine.Row | None:
    result = await conn.execute(
        sa.select(orders_table).where(orders_table.c.id == _as_uuid(order_id))
    )
    return result.fetchone()


async def list_orders(
    conn: AsyncConnection,
    *,
    token_id: str | uuid.UUID | None = None,
    side: str | None = None,
    status: str | None = None,
) -> list[sa.engine.Row]:
    stmt = sa.select(orders_table)

    if token_id is not None:
        stmt = stmt.where(orders_table.c.token_id == _as_uuid(token_id))
    if side is not None:
        stmt = stmt.where(orders_table.c.side == side)
    if status is not None:
        stmt = stmt.where(orders_table.c.status == status)

    stmt = stmt.order_by(orders_table.c.created_at.desc(), orders_table.c.id.desc())
    result = await conn.execute(stmt)
    return result.fetchall()


async def list_trades(
    conn: AsyncConnection,
    *,
    token_id: str | uuid.UUID | None = None,
) -> list[sa.engine.Row]:
    order_column = sa.func.coalesce(trades_table.c.settled_at, trades_table.c.created_at)
    stmt = sa.select(trades_table)

    if token_id is not None:
        stmt = stmt.where(trades_table.c.token_id == _as_uuid(token_id))

    stmt = stmt.order_by(order_column.desc(), trades_table.c.id.desc())
    result = await conn.execute(stmt)
    return result.fetchall()


async def cancel_order(
    conn: AsyncConnection,
    *,
    order_id: str | uuid.UUID,
    user_id: str | uuid.UUID,
) -> sa.engine.Row | None:
    result = await conn.execute(
        sa.update(orders_table)
        .where(orders_table.c.id == _as_uuid(order_id))
        .where(orders_table.c.user_id == _as_uuid(user_id))
        .where(orders_table.c.status.in_(_OPEN_ORDER_STATUSES))
        .values(
            status="cancelled",
            updated_at=_utc_now(),
        )
        .returning(orders_table)
    )
    row = result.fetchone()
    await conn.commit()
    return row


async def find_best_match(
    conn: AsyncConnection,
    *,
    token_id: str | uuid.UUID,
    incoming_side: str,
    incoming_price: int,
    requester_id: str | uuid.UUID,
) -> sa.engine.Row | None:
    stmt = sa.select(orders_table).where(orders_table.c.token_id == _as_uuid(token_id))
    stmt = stmt.where(orders_table.c.status.in_(_OPEN_ORDER_STATUSES))
    stmt = stmt.where(orders_table.c.user_id != _as_uuid(requester_id))

    if incoming_side == "buy":
        stmt = stmt.where(orders_table.c.side == "sell")
        stmt = stmt.where(orders_table.c.price_sat <= incoming_price)
        stmt = stmt.order_by(
            orders_table.c.price_sat.asc(),
            orders_table.c.created_at.asc(),
            orders_table.c.id.asc(),
        )
    else:
        stmt = stmt.where(orders_table.c.side == "buy")
        stmt = stmt.where(orders_table.c.price_sat >= incoming_price)
        stmt = stmt.order_by(
            orders_table.c.price_sat.desc(),
            orders_table.c.created_at.asc(),
            orders_table.c.id.asc(),
        )

    result = await conn.execute(stmt.limit(1))
    return result.fetchone()


async def get_last_trade_price_for_token(
    conn: AsyncConnection,
    token_id: str | uuid.UUID,
) -> int | None:
    result = await conn.execute(
        sa.select(trades_table.c.price_sat)
        .where(trades_table.c.token_id == _as_uuid(token_id))
        .where(trades_table.c.status == "settled")
        .order_by(
            sa.func.coalesce(trades_table.c.settled_at, trades_table.c.created_at).desc(),
            trades_table.c.id.desc(),
        )
        .limit(1)
    )
    value = result.scalar_one_or_none()
    return None if value is None else int(value)


async def get_trade_volume_24h(
    conn: AsyncConnection,
    token_id: str | uuid.UUID,
) -> int:
    since = _utc_now() - timedelta(hours=24)
    result = await conn.execute(
        sa.select(sa.func.coalesce(sa.func.sum(trades_table.c.quantity), 0))
        .where(trades_table.c.token_id == _as_uuid(token_id))
        .where(trades_table.c.status == "settled")
        .where(sa.func.coalesce(trades_table.c.settled_at, trades_table.c.created_at) >= since)
    )
    return int(result.scalar_one())


async def debit_wallet_balance(
    conn: AsyncConnection,
    *,
    wallet_row: object,
    amount_sat: int,
) -> None:
    onchain_balance = int(_row_value(wallet_row, "onchain_balance_sat", 0))
    lightning_balance = int(_row_value(wallet_row, "lightning_balance_sat", 0))
    total_balance = onchain_balance + lightning_balance

    if total_balance < amount_sat:
        raise ValueError("insufficient_wallet_balance")

    onchain_debit = min(onchain_balance, amount_sat)
    lightning_debit = amount_sat - onchain_debit

    await conn.execute(
        sa.update(wallets_table)
        .where(wallets_table.c.id == _row_value(wallet_row, "id"))
        .values(
            onchain_balance_sat=onchain_balance - onchain_debit,
            lightning_balance_sat=lightning_balance - lightning_debit,
            updated_at=_utc_now(),
        )
    )


async def credit_wallet_balance(
    conn: AsyncConnection,
    *,
    wallet_row: object,
    amount_sat: int,
) -> None:
    current_onchain = int(_row_value(wallet_row, "onchain_balance_sat", 0))
    await conn.execute(
        sa.update(wallets_table)
        .where(wallets_table.c.id == _row_value(wallet_row, "id"))
        .values(
            onchain_balance_sat=current_onchain + amount_sat,
            updated_at=_utc_now(),
        )
    )


async def decrement_token_balance(
    conn: AsyncConnection,
    *,
    user_id: str | uuid.UUID,
    token_id: str | uuid.UUID,
    quantity: int,
) -> None:
    result = await conn.execute(
        sa.update(token_balances_table)
        .where(token_balances_table.c.user_id == _as_uuid(user_id))
        .where(token_balances_table.c.token_id == _as_uuid(token_id))
        .where(token_balances_table.c.balance >= quantity)
        .values(
            balance=token_balances_table.c.balance - quantity,
            updated_at=_utc_now(),
        )
        .returning(token_balances_table.c.id)
    )
    if result.fetchone() is None:
        raise ValueError("insufficient_token_balance")


async def increment_token_balance(
    conn: AsyncConnection,
    *,
    user_id: str | uuid.UUID,
    token_id: str | uuid.UUID,
    quantity: int,
) -> None:
    now = _utc_now()
    stmt = pg_insert(token_balances_table).values(
        id=uuid.uuid4(),
        user_id=_as_uuid(user_id),
        token_id=_as_uuid(token_id),
        balance=quantity,
        updated_at=now,
    )
    await conn.execute(
        stmt.on_conflict_do_update(
            index_elements=[token_balances_table.c.user_id, token_balances_table.c.token_id],
            set_={
                "balance": token_balances_table.c.balance + quantity,
                "updated_at": now,
            },
        )
    )


async def apply_order_fill(
    conn: AsyncConnection,
    *,
    order_row: object,
    quantity: int,
) -> None:
    current_filled = int(_row_value(order_row, "filled_quantity", 0))
    total_quantity = int(_row_value(order_row, "quantity", 0))
    new_filled = current_filled + quantity
    new_status = "filled" if new_filled >= total_quantity else "partially_filled"

    await conn.execute(
        sa.update(orders_table)
        .where(orders_table.c.id == _row_value(order_row, "id"))
        .values(
            filled_quantity=new_filled,
            status=new_status,
            updated_at=_utc_now(),
        )
    )


async def settle_trade(
    conn: AsyncConnection,
    *,
    buy_order: object,
    sell_order: object,
    quantity: int,
    price_sat: int,
    fee_sat: int = 0,
) -> sa.engine.Row:
    buyer_id = _row_value(buy_order, "user_id")
    seller_id = _row_value(sell_order, "user_id")
    token_id = _row_value(buy_order, "token_id")
    total_sat = quantity * price_sat

    buyer_wallet = await get_wallet_by_user_id(conn, buyer_id)
    seller_wallet = await get_wallet_by_user_id(conn, seller_id)
    if buyer_wallet is None or seller_wallet is None:
        raise LookupError("wallet_not_found")

    await debit_wallet_balance(conn, wallet_row=buyer_wallet, amount_sat=total_sat + fee_sat)
    await credit_wallet_balance(conn, wallet_row=seller_wallet, amount_sat=total_sat)
    await decrement_token_balance(conn, user_id=seller_id, token_id=token_id, quantity=quantity)
    await increment_token_balance(conn, user_id=buyer_id, token_id=token_id, quantity=quantity)
    await apply_order_fill(conn, order_row=buy_order, quantity=quantity)
    await apply_order_fill(conn, order_row=sell_order, quantity=quantity)

    result = await conn.execute(
        sa.insert(trades_table)
        .values(
            id=uuid.uuid4(),
            buy_order_id=_row_value(buy_order, "id"),
            sell_order_id=_row_value(sell_order, "id"),
            token_id=token_id,
            quantity=quantity,
            price_sat=price_sat,
            total_sat=total_sat,
            fee_sat=fee_sat,
            status="settled",
            created_at=_utc_now(),
            settled_at=_utc_now(),
        )
        .returning(trades_table)
    )
    trade_row = result.fetchone()
    await conn.commit()
    assert trade_row is not None
    return trade_row