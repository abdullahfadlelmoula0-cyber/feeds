from sqlalchemy.orm import Session
from ..models import Notification, User


def create_notification(db: Session, user_id: int, title: str, body: str = "") -> Notification:
    n = Notification(user_id=user_id, title=title, body=body)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


def get_user_notifications(db: Session, user_id: int, unread_only: bool = False):
    q = db.query(Notification).filter(Notification.user_id == user_id)
    if unread_only:
        q = q.filter(Notification.read == False)
    return q.order_by(Notification.created_at.desc()).all()
