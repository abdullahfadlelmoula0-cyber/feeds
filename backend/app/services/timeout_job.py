"""
Timeout rejection job (DISABLED).

This project previously auto-rejected reservations after a payment window.
Per latest requirements: reservations should NOT expire automatically.
"""

from sqlalchemy.orm import Session


def run_timeout_rejection(db: Session) -> int:
    # No-op: keep reservations pending indefinitely until receipt upload
    return 0
