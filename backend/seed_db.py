"""
Run once to create the database, one admin user, and sample feed types.
Admin: National ID = admin, Password = admin123
"""
import sys
sys.path.insert(0, ".")

from app.database import SessionLocal, engine
from app.models import Base, User, FeedType, UserRole, BankInfo
from app.auth import get_password_hash

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).filter(User.national_id == "admin").first():
            print("Admin user already exists.")
        else:
            admin_user = User(
                national_id="admin",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.admin.value,
            )
            db.add(admin_user)
            db.commit()
            print("Admin created: National ID = admin, Password = admin123")

        if db.query(FeedType).count() == 0:
            for name, qty, price, desc in [
                ("Cattle Feed Premium", 500, 12.5, "High protein cattle feed"),
                ("Poultry Feed Standard", 1200, 8.0, "Standard poultry feed 25kg bags"),
                ("Sheep & Goat Feed", 800, 9.5, "Mixed feed for sheep and goats"),
            ]:
                ft = FeedType(name=name, quantity=qty, price=price, description=desc, unit="kg")
                db.add(ft)
            db.commit()
            print("Sample feed types created.")

        if db.query(BankInfo).count() == 0:
            bank_info = BankInfo(
                account_name="Feed Co. Official Account",
                bank_name="Example Bank",
                account_number="1234567890",
                iban="XX00 0000 0000 0000 0000 0000",
            )
            db.add(bank_info)
            db.commit()
            print("Default bank info created.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
