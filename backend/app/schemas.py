from datetime import datetime
from pydantic import BaseModel, Field


# ----- Auth -----
class UserCreate(BaseModel):
    national_id: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    national_id: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class UserOut(BaseModel):
    id: int
    national_id: str
    role: str

    class Config:
        from_attributes = True


class UserAdminCreate(BaseModel):
    """Admin creates user; can set role."""
    national_id: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=6)
    role: str = "user"


class UserAdminOut(BaseModel):
    id: int
    national_id: str
    role: str
    created_at: datetime
    has_reservations: bool = False

    class Config:
        from_attributes = True


# ----- Feed -----
class FeedTypeBase(BaseModel):
    name: str
    description: str = ""
    unit: str = "kg"
    price: float = 0.0


class FeedTypeCreate(FeedTypeBase):
    quantity: float = 0


class FeedTypeOut(FeedTypeBase):
    id: int
    quantity: float
    created_at: datetime

    class Config:
        from_attributes = True


class FeedTypeAdminOut(FeedTypeOut):
    """Feed type with flag for admin: can only delete when no reservations."""
    has_reservations: bool = False


# ----- Reservation -----
class ReservationCreate(BaseModel):
    feed_type_id: int
    quantity: float = Field(..., gt=0)


class ReservationOut(BaseModel):
    id: int
    user_id: int
    feed_type_id: int
    quantity: float
    status: str
    receipt_path: str | None
    created_at: datetime
    feed_type_name: str | None = None
    feed_type_unit: str | None = None
    unit_price: float | None = None
    total_price: float | None = None

    class Config:
        from_attributes = True


class ReservationAdminOut(ReservationOut):
    user_national_id: str | None = None


# ----- Bank -----
class BankDetailsOut(BaseModel):
    account_name: str
    bank_name: str
    account_number: str
    iban: str


class BankInfoUpdate(BaseModel):
    account_name: str = Field(..., min_length=1)
    bank_name: str = Field(..., min_length=1)
    account_number: str = Field(..., min_length=1)
    iban: str = Field(..., min_length=1)


# ----- Notification -----
class NotificationOut(BaseModel):
    id: int
    title: str
    body: str
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationRead(BaseModel):
    read: bool = True
