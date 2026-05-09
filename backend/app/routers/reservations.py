import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import User, Reservation, FeedType, ReservationStatus, BankInfo
from ..schemas import ReservationCreate, ReservationOut, BankDetailsOut
from ..auth import get_current_user
from ..services.notifications import create_notification

router = APIRouter(prefix="/reservations", tags=["reservations"])


def _reservation_to_out(r: Reservation) -> ReservationOut:
    return ReservationOut(
        id=r.id,
        user_id=r.user_id,
        feed_type_id=r.feed_type_id,
        quantity=r.quantity,
        status=r.status,
        receipt_path=r.receipt_path,
        created_at=r.created_at,
        feed_type_name=r.feed_type.name if r.feed_type else None,
        feed_type_unit=r.feed_type.unit if r.feed_type else None,
        unit_price=r.unit_price,
        total_price=r.total_price,
    )


@router.get("/bank-details", response_model=BankDetailsOut)
def bank_details(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get bank info from database, fallback to config if not set
    bank_info = db.query(BankInfo).first()
    if bank_info:
        return BankDetailsOut(
            account_name=bank_info.account_name,
            bank_name=bank_info.bank_name,
            account_number=bank_info.account_number,
            iban=bank_info.iban,
        )
    # Fallback to config values
    return BankDetailsOut(
        account_name=settings.bank_account_name,
        bank_name=settings.bank_name,
        account_number=settings.bank_account_number,
        iban=settings.bank_iban,
    )


@router.post("/", response_model=ReservationOut)
def create_reservation(
    data: ReservationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    feed = db.query(FeedType).filter(FeedType.id == data.feed_type_id).first()
    if not feed:
        raise HTTPException(status_code=404, detail="Feed type not found")
    if feed.quantity < data.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough stock. Available: {feed.quantity} {feed.unit}",
        )
    unit_price = feed.price or 0
    total_price = unit_price * data.quantity
    r = Reservation(
        user_id=user.id,
        feed_type_id=data.feed_type_id,
        quantity=data.quantity,
        status=ReservationStatus.pending_payment.value,
        unit_price=unit_price,
        total_price=total_price,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    create_notification(
        db,
        user.id,
        "Reservation created",
        f"Reservation for {data.quantity} {feed.unit} of {feed.name} created. Please upload your payment receipt when ready.",
    )
    return _reservation_to_out(r)


@router.get("/", response_model=list[ReservationOut])
def my_reservations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = db.query(Reservation).filter(Reservation.user_id == user.id).order_by(Reservation.created_at.desc()).all()
    return [_reservation_to_out(r) for r in rows]


@router.get("/{reservation_id}", response_model=ReservationOut)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = db.query(Reservation).filter(Reservation.id == reservation_id, Reservation.user_id == user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return _reservation_to_out(r)


@router.post("/{reservation_id}/receipt", response_model=ReservationOut)
async def upload_receipt(
    reservation_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    r = db.query(Reservation).filter(Reservation.id == reservation_id, Reservation.user_id == user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if r.status != ReservationStatus.pending_payment.value:
        raise HTTPException(status_code=400, detail="Receipt already uploaded or reservation no longer pending")
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")
    
    # Validate content type
    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}
    # Reset file pointer after reading
    await file.seek(0)
    content_type = file.content_type
    if not content_type or content_type.lower() not in allowed_types:
        # Also check file extension as fallback
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
        if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
            raise HTTPException(status_code=400, detail="Only image files are accepted (JPEG, PNG, WebP, GIF)")
    
    # Create upload directory
    upload_dir = os.path.abspath(settings.receipt_upload_dir)
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate filename
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
    if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        ext = "jpg"
    filename = f"{reservation_id}_{uuid.uuid4().hex[:8]}.{ext}"
    path = os.path.join(upload_dir, filename)
    
    # Save file
    try:
        with open(path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Update reservation
    r.receipt_path = path
    r.status = ReservationStatus.waiting_approval.value
    db.commit()
    db.refresh(r)
    create_notification(db, user.id, "Receipt uploaded", "Your payment receipt has been submitted. Waiting for admin approval.")
    return _reservation_to_out(r)
