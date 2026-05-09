from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os

from ..database import get_db
from ..models import User, Reservation, FeedType, Notification, ReservationStatus, BankInfo, UserRole
from ..schemas import ReservationAdminOut, FeedTypeOut, FeedTypeAdminOut, FeedTypeCreate, BankDetailsOut, BankInfoUpdate, UserAdminOut, UserAdminCreate
from ..auth import get_current_user, require_admin, get_password_hash
from ..config import settings
from ..services.notifications import create_notification

router = APIRouter(prefix="/admin", tags=["admin"])


def _admin_out(r: Reservation) -> ReservationAdminOut:
    return ReservationAdminOut(
        id=r.id,
        user_id=r.user_id,
        feed_type_id=r.feed_type_id,
        quantity=r.quantity,
        status=r.status,
        receipt_path=r.receipt_path,
        created_at=r.created_at,
        feed_type_name=r.feed_type.name if r.feed_type else None,
        feed_type_unit=r.feed_type.unit if r.feed_type else None,
        user_national_id=r.user.national_id if r.user else None,
        unit_price=r.unit_price,
        total_price=r.total_price,
    )


@router.get("/reservations", response_model=list[ReservationAdminOut])
def list_all_reservations(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    # Show both pending_payment (no receipt yet) and waiting_approval (has receipt)
    rows = db.query(Reservation).filter(
        Reservation.status.in_([ReservationStatus.pending_payment.value, ReservationStatus.waiting_approval.value])
    ).order_by(
        # Prioritize waiting_approval (has receipt) over pending_payment
        Reservation.status == ReservationStatus.waiting_approval.value,
        Reservation.created_at.desc()
    ).all()
    return [_admin_out(r) for r in rows]


@router.get("/reservations/{reservation_id}/receipt")
def get_receipt_image(
    reservation_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    r = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not r or not r.receipt_path or not os.path.isfile(r.receipt_path):
        raise HTTPException(status_code=404, detail="Receipt not found")
    return FileResponse(r.receipt_path, media_type="image/jpeg")


@router.post("/reservations/{reservation_id}/approve")
def approve_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    r = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if r.status != ReservationStatus.waiting_approval.value:
        raise HTTPException(status_code=400, detail="Only reservations waiting for approval can be approved")
    feed = r.feed_type
    if feed.quantity < r.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock to fulfill this reservation")
    r.status = ReservationStatus.approved.value
    feed.quantity -= r.quantity
    db.commit()
    create_notification(
        db,
        r.user_id,
        "Reservation approved",
        f"Your reservation for {r.quantity} {feed.unit} of {feed.name} has been approved. You can collect the feed as per the logistics process.",
    )
    return {"message": "Approved", "reservation_id": reservation_id}


@router.post("/reservations/{reservation_id}/reject")
def reject_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    r = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if r.status not in (ReservationStatus.pending_payment.value, ReservationStatus.waiting_approval.value):
        raise HTTPException(status_code=400, detail="Reservation cannot be rejected in current state")
    r.status = ReservationStatus.rejected.value
    db.commit()
    feed = r.feed_type
    create_notification(
        db,
        r.user_id,
        "Reservation rejected",
        f"Your reservation for {r.quantity} {feed.unit} of {feed.name} has been rejected by the administrator.",
    )
    return {"message": "Rejected", "reservation_id": reservation_id}


def _has_pending_reservations(db: Session, *, feed_type_id: int = None, user_id: int = None) -> bool:
    """True if any reservation is pending_payment or waiting_approval (blocks deletion)."""
    q = db.query(Reservation).filter(
        Reservation.status.in_([ReservationStatus.pending_payment.value, ReservationStatus.waiting_approval.value])
    )
    if feed_type_id is not None:
        q = q.filter(Reservation.feed_type_id == feed_type_id)
    if user_id is not None:
        q = q.filter(Reservation.user_id == user_id)
    return q.first() is not None


@router.get("/feed-types", response_model=list[FeedTypeAdminOut])
def admin_list_feed_types(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    feed_types = db.query(FeedType).all()
    out = []
    for ft in feed_types:
        has_pending = _has_pending_reservations(db, feed_type_id=ft.id)
        out.append(FeedTypeAdminOut(
            id=ft.id,
            name=ft.name,
            description=ft.description or "",
            unit=ft.unit or "kg",
            price=ft.price or 0,
            quantity=ft.quantity,
            created_at=ft.created_at,
            has_reservations=has_pending,
        ))
    return out


@router.post("/feed-types", response_model=FeedTypeOut)
def create_feed_type(
    data: FeedTypeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    ft = FeedType(
        name=data.name,
        description=data.description,
        quantity=data.quantity,
        unit=data.unit,
        price=data.price,
    )
    db.add(ft)
    db.commit()
    db.refresh(ft)
    return ft


@router.put("/feed-types/{feed_type_id}", response_model=FeedTypeOut)
def update_feed_type(
    feed_type_id: int,
    data: FeedTypeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    ft = db.query(FeedType).filter(FeedType.id == feed_type_id).first()
    if not ft:
        raise HTTPException(status_code=404, detail="Feed type not found")
    ft.name = data.name
    ft.description = data.description
    ft.quantity = data.quantity
    ft.unit = data.unit
    ft.price = data.price
    db.commit()
    db.refresh(ft)
    return ft


@router.delete("/feed-types/{feed_type_id}")
def delete_feed_type(
    feed_type_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    ft = db.query(FeedType).filter(FeedType.id == feed_type_id).first()
    if not ft:
        raise HTTPException(status_code=404, detail="Feed type not found")
    # Block only if there are pending reservations (waiting for receipt or admin approval)
    has_pending = _has_pending_reservations(db, feed_type_id=feed_type_id)
    if has_pending:
        raise HTTPException(
            status_code=400,
            detail="This feed type has reservations pending payment or waiting approval. Only feeds with no active reservations can be removed.",
        )
    # Delete feed type's reservations (approved/rejected) to satisfy FK constraint
    db.query(Reservation).filter(Reservation.feed_type_id == feed_type_id).delete()
    db.delete(ft)
    db.commit()
    return {"message": "Feed type deleted", "id": feed_type_id}


@router.get("/bank-info", response_model=BankDetailsOut)
def get_bank_info(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    bank_info = db.query(BankInfo).first()
    if bank_info:
        return BankDetailsOut(
            account_name=bank_info.account_name,
            bank_name=bank_info.bank_name,
            account_number=bank_info.account_number,
            iban=bank_info.iban,
        )
    # Return default from config
    return BankDetailsOut(
        account_name=settings.bank_account_name,
        bank_name=settings.bank_name,
        account_number=settings.bank_account_number,
        iban=settings.bank_iban,
    )


@router.put("/bank-info", response_model=BankDetailsOut)
def update_bank_info(
    data: BankInfoUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    bank_info = db.query(BankInfo).first()
    if bank_info:
        bank_info.account_name = data.account_name
        bank_info.bank_name = data.bank_name
        bank_info.account_number = data.account_number
        bank_info.iban = data.iban
    else:
        bank_info = BankInfo(
            account_name=data.account_name,
            bank_name=data.bank_name,
            account_number=data.account_number,
            iban=data.iban,
        )
        db.add(bank_info)
    db.commit()
    db.refresh(bank_info)
    return BankDetailsOut(
        account_name=bank_info.account_name,
        bank_name=bank_info.bank_name,
        account_number=bank_info.account_number,
        iban=bank_info.iban,
    )


# ----- User Management -----


@router.get("/users", response_model=list[UserAdminOut])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    out = []
    for u in users:
        has_pending = _has_pending_reservations(db, user_id=u.id)
        out.append(UserAdminOut(
            id=u.id,
            national_id=u.national_id,
            role=u.role,
            created_at=u.created_at,
            has_reservations=has_pending,
        ))
    return out


@router.post("/users", response_model=UserAdminOut)
def create_user(
    data: UserAdminCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if db.query(User).filter(User.national_id == data.national_id).first():
        raise HTTPException(status_code=400, detail="National ID already registered")
    role = data.role if data.role in (UserRole.user.value, UserRole.admin.value) else UserRole.user.value
    user = User(
        national_id=data.national_id,
        hashed_password=get_password_hash(data.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserAdminOut(
        id=user.id,
        national_id=user.national_id,
        role=user.role,
        created_at=user.created_at,
        has_reservations=False,
    )


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.admin.value:
        admin_count = db.query(User).filter(User.role == UserRole.admin.value).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last admin")
    # Block only if there are pending reservations (waiting for receipt or admin approval)
    has_pending = _has_pending_reservations(db, user_id=user_id)
    if has_pending:
        raise HTTPException(
            status_code=400,
            detail="This user has reservations pending payment or waiting approval. Only users with no active reservations can be removed.",
        )
    # Delete user's reservations first (approved/rejected) to satisfy FK constraint
    db.query(Reservation).filter(Reservation.user_id == user_id).delete()
    # Delete user's notifications (no cascade on Notification)
    db.query(Notification).filter(Notification.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User deleted", "id": user_id}
