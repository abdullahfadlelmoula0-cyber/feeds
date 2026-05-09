"""
Fix admin user role - ensures admin user has role="admin"
Run this if admin login works but admin features don't show.
"""
import sys
sys.path.insert(0, ".")

from app.database import SessionLocal
from app.models import User, UserRole

def fix_admin():
    db = SessionLocal()
    try:
        admin_user = db.query(User).filter(User.national_id == "admin").first()
        if not admin_user:
            print("ERROR: Admin user not found. Run seed_db.py first.")
            return
        
        if admin_user.role != UserRole.admin.value:
            print(f"Fixing admin role: current role='{admin_user.role}', setting to 'admin'")
            admin_user.role = UserRole.admin.value
            db.commit()
            print("[OK] Admin role fixed!")
        else:
            print(f"[OK] Admin user already has correct role: '{admin_user.role}'")
        
        print(f"\nAdmin user details:")
        print(f"  National ID: {admin_user.national_id}")
        print(f"  Role: {admin_user.role}")
        print(f"  ID: {admin_user.id}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin()
