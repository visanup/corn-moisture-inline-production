from dotenv import load_dotenv
import os
from pathlib import Path

# 1. หาโฟลเดอร์ services (สามระดับเหนือไฟล์นี้)
base_services = Path(__file__).resolve().parents[1]

# 2. โหลดค่าจาก .env.common
env = base_services / ".env"
if env.exists():
    load_dotenv(dotenv_path=env)
    print(f"Loaded common env: {env}")

class Config:
    # Database Config
    #PORT = int(os.getenv("PORT", 5004))  # default เป็น 5004 ก็ได้
    DB_NAME: str = os.getenv("DB_NAME", "")
    DB_USERNAME: str = os.getenv("DB_USER", "")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    #DB_HOST: str = os.getenv("DB_HOST", "host.docker.internal")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    FULL_DATABASE_URL: str = (f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

    # CORS Settings
    CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
    CORS_ALLOW_METHODS = os.getenv("CORS_ALLOW_METHODS", "GET,POST,PUT,DELETE").split(",")
    CORS_ALLOW_HEADERS = os.getenv("CORS_ALLOW_HEADERS", "Authorization,Content-Type,Accept").split(",")

    # API Key and JWT
    API_KEY: str = os.getenv("API_KEY", "default_api_key")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")

    # Logging and Timeouts
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "DEBUG")
    CONNECTION_TIMEOUT: int = int(os.getenv("CONNECTION_TIMEOUT", "10"))
    READ_TIMEOUT: int = int(os.getenv("READ_TIMEOUT", "30"))
    TOKEN_EXPIRE_MINUTES: int = int(os.getenv("TOKEN_EXPIRE_MINUTES", "30"))

    # Application
    PORT: int = int(os.getenv("MOISTURE_SENSOR_PORT", "5004"))

    # Sensor Registers and Serial config
    MOISTURE_SERIAL_PORT: str = os.getenv("MOISTURE_SERIAL_PORT", "/dev/ttyUSB0")
    MOISTURE_SERIAL_SLAVE_ID: int = int(os.getenv("MOISTURE_SERIAL_SLAVE_ID", "1"))
    MOISTURE_SERIAL_BAUDRATE: int = int(os.getenv("MOISTURE_SERIAL_BAUDRATE", "19200"))
    MOISTURE_SERIAL_TIMEOUT: float = float(os.getenv("MOISTURE_SERIAL_TIMEOUT", "1"))

    # Registers (one-based)
    MOISTURE_REGISTER_ONE_BASED: int = int(os.getenv("MOISTURE_REGISTER_ONE_BASED", "30014"))
    MOISTURE_REGISTER_DECIMALS: int = int(os.getenv("MOISTURE_REGISTER_DECIMALS", "0"))
    SENSOR_STATUS_REGISTER: int = int(os.getenv("SENSOR_STATUS", "30055"))
    MATERIAL_TEMPERATURE_REGISTER: int = int(os.getenv("MATERIAL_TEMPERATURE", "30021"))

    # Model
    MODEL_PATH: str = os.getenv("MODEL_PATH", "./best_model/best_model_rf.pkl")


    # Data reading config (ใช้ float สำหรับ INTERVAL)
    INTERVAL: float = float(os.getenv("INTERVAL", "1.0"))
    START_THRESHOLD: float = float(os.getenv("START_THRESHOLD", "1500"))
    END_THRESHOLD: float = float(os.getenv("END_THRESHOLD", "1500"))
    MAX_BELOW: int = int(os.getenv("MAX_BELOW", "5"))