from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "change-me-in-production-use-env"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    receipt_upload_dir: str = "uploads/receipts"
    payment_timeout_minutes: int = 20
    bank_account_name: str = "Feed Co. Official Account"
    bank_name: str = "Example Bank"
    bank_account_number: str = "1234567890"
    bank_iban: str = "XX00 0000 0000 0000 0000 0000"

    class Config:
        env_file = ".env"


settings = Settings()
