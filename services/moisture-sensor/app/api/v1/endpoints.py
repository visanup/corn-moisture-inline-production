# app/api/v1/endpoints.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
import logging

from jose import jwt, JWTError
from jose.exceptions import ExpiredSignatureError

from app.config import Config
from app.services.sensor_service import MoistureSensor
from app.services.sensor_reading import read_sensor_batch
from app.services.moisture_converter import moisture_calculate
from app.database import get_db
from app.models.moisture_result_model import MoistureResult

router = APIRouter(prefix="/api/v1/sensor")
bearer = HTTPBearer()

# สร้าง instance ของ sensor ด้วยค่าจาก Config
moisture_sensor = MoistureSensor(
    port=Config.MOISTURE_SERIAL_PORT,
    slave_id=Config.MOISTURE_SERIAL_SLAVE_ID,
    baudrate=Config.MOISTURE_SERIAL_BAUDRATE,
    timeout=Config.MOISTURE_SERIAL_TIMEOUT,
    moisture_register=Config.MOISTURE_REGISTER_ONE_BASED,
    status_register=Config.SENSOR_STATUS_REGISTER,
    temp_register=Config.MATERIAL_TEMPERATURE_REGISTER,
    moisture_decimals=Config.MOISTURE_REGISTER_DECIMALS,
    temp_decimals=1,
    functioncode=4,
)

class SensorDataRequest(BaseModel):
    queue: str
    ins_lot: str
    material: str
    batch: str
    plant: str
    sample_no: str


def verify_token(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    token = creds.credentials
    try:
        payload = jwt.decode(
            token,
            Config.JWT_SECRET_KEY,
            algorithms=[Config.ALGORITHM],
            options={"verify_aud": False},
        )
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError as e:
        logging.error("JWT decode error: %s", e)
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload

@router.get("/sensor-status")
def sensor_status(token: str = Depends(verify_token)):
    status = moisture_sensor.get_status()
    return {"status": status}

@router.post("/sensor-start")
def sensor_start(
    req: SensorDataRequest,
    token: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    logging.info(f"Received request for queue: {req.queue}")

    # 1. เรียก batch reader แล้วดึงเอา list ของ readings ออกมา
    batch = read_sensor_batch(
        interval=Config.INTERVAL,
        start_threshold=Config.START_THRESHOLD,
        end_threshold=Config.END_THRESHOLD,
        max_below=Config.MAX_BELOW
    )
    sensor_list = batch.get("sensor_data", [])
    if not sensor_list:
        raise HTTPException(status_code=503, detail="No valid sensor readings")

    # 2. สกัดค่า moisture และ temperature (แล้วสเกล moisture)
    sensor_data = {
        r["id"]: round(r["moisture"] / 100.0, Config.MOISTURE_REGISTER_DECIMALS)
        for r in sensor_list
    }
    temp_data = {
        r["id"]: (round(r["temperature"] / 10, 2) if r.get("temperature") is not None else None)
        for r in sensor_list
    }

    # 3. ผสาน metadata ลงใน dict
    raw_data = {
        "sensor_data": sensor_data,
        "queue":       req.queue,
        "ins_lot":     req.ins_lot,
        "material":    req.material,
        "batch":       req.batch,
        "plant":       req.plant,
        "sample_no":   req.sample_no,
    }

    # 4. คำนวณ moisture
    result = moisture_calculate(raw_data)

    # 5. ผสม temperature เข้าไปในผลลัพธ์
    combined_result_data = {
        "predictions": result.get("predictions", []),
        "temperature": temp_data
    }

    # 6. บันทึกลง DB
    db_obj = MoistureResult.create_result(
        db=db,
        ins_lot=req.ins_lot,
        material=req.material,
        batch=req.batch,
        plant=req.plant,
        sample_no=req.sample_no,
        #queue=result.get("queue"),
        queue=req.queue,
        result_data=combined_result_data,
        statistics=result.get("statistics", {})
    )
    logging.info(f"MoistureResult created with id {db_obj.id}")

    # 7. ตอบกลับ client
    return {
        "status": "success",
        "data": {
            "predictions": result.get("predictions"),
            "temperature": temp_data,
            "statistics": result.get("statistics")
        }
    }
