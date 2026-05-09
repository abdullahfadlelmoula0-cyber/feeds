from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from .database import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class ReservationStatus(str, enum.Enum):
    pending_payment = "pending_payment"       # Created, waiting for receipt
    waiting_approval = "waiting_approval"     # Receipt uploaded, waiting admin
    approved = "approved"
    auto_rejected = "auto_rejected"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    national_id = Column(String(64), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(20), default=UserRole.user.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    reservations = relationship("Reservation", back_populates="user")
    notifications = relationship("Notification", back_populates="user", order_by="Notification.created_at")


class FeedType(Base):
    __tablename__ = "feed_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    description = Column(String(512), default="")
    quantity = Column(Float, default=0)  # Approved stock only (no reserved deduction until approval)
    unit = Column(String(32), default="kg")
    price = Column(Float, default=0)  # price per unit
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reservations = relationship("Reservation", back_populates="feed_type")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    feed_type_id = Column(Integer, ForeignKey("feed_types.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    status = Column(String(32), default=ReservationStatus.pending_payment.value)
    receipt_path = Column(String(512), nullable=True)  # path to uploaded image
    unit_price = Column(Float, default=0)   # price per unit at time of reservation
    total_price = Column(Float, default=0)  # quantity * unit_price
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # For 20-min timeout: we check created_at for pending_payment without receipt

    user = relationship("User", back_populates="reservations")
    feed_type = relationship("FeedType", back_populates="reservations")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(128), nullable=False)
    body = Column(String(512), default="")
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class BankInfo(Base):
    __tablename__ = "bank_info"

    id = Column(Integer, primary_key=True, index=True)
    account_name = Column(String(128), nullable=False)
    bank_name = Column(String(128), nullable=False)
    account_number = Column(String(64), nullable=False)
    iban = Column(String(64), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
