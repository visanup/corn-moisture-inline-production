#/home/piqi/corn-moisture-inline v.01/services/moisture-sensor/app/main.py
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import Config
# นำเข้า instance moisture_sensor จาก endpoints แทนการสร้างใหม่
from app.api.v1.endpoints import router as api_router, moisture_sensor

# Initialize FastAPI app
app = FastAPI()
logging.basicConfig(level=logging.INFO)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ALLOWED_ORIGINS,
    allow_credentials=Config.CORS_ALLOW_CREDENTIALS,
    allow_methods=Config.CORS_ALLOW_METHODS,
    allow_headers=Config.CORS_ALLOW_HEADERS,
)

# Health Check
@app.get("/health", tags=["Health Check"])
async def health_check():
    logging.debug("Health check endpoint called")
    return {"status": "healthy"}

# Register router
app.include_router(api_router)  # prefix is already set in endpoints.py

# ปิด connection ใน instance ที่มีอยู่ตอน shutdown
@app.on_event("shutdown")
def shutdown_event():
    try:
        moisture_sensor.close()
        logging.info("Sensor connection closed.")
    except Exception as e:
        logging.error(f"Error closing sensor connection: {e}")

if __name__ == "__main__":
    HOST = "0.0.0.0"
    PORT = Config.PORT
    logging.info(f"Starting sensor-service on {HOST}:{PORT}")
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True, workers=2)
