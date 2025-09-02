## /app/services/sensor_reading.py
import time
from datetime import datetime
from app.config import Config
from app.services.sensor_service import MoistureSensor

def read_sensor_batch(
    interval = Config.INTERVAL,
    start_threshold= Config.START_THRESHOLD,
    end_threshold= Config.END_THRESHOLD,
    max_below= Config.MAX_BELOW
) -> dict:
    """
    รอให้ sensor ตรวจจับวัตถุดิบ (raw moisture > start_threshold) แล้วเก็บค่าต่อเนื่อง
    จนกว่า raw moisture จะต่ำกว่า end_threshold ติดต่อกันเกิน max_below ครั้ง
    คืนเป็น list ของ dict แต่ละรอบจะมี
    - id: timestamp ของการอ่าน (UTC ISO)
    - moisture: ค่า raw moisture
    - temperature: ค่า material temperature
    - status_flags: รายการ flags
    - timestamp: เวลาที่อ่าน
    """
    sensor = MoistureSensor(
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

    readings = []
    started = False
    below_count = 0

    print(f"Waiting for batch start (threshold > {start_threshold}):")
    while True:
        status = sensor.get_status()
        raw = status.get("moisture")
        now = datetime.utcnow().isoformat()
        temp = status.get("temperature")
        flags = status.get("status_flags")
        print(f"[{now}] Moisture={raw}, Temp={temp}, Flags={flags}")

        if not started:
            # เริ่ม batch เมื่อ raw > start_threshold
            if raw is not None and raw > start_threshold:
                started = True
                print(f"Batch started at {now}")
                readings.append({
                    "id": now,
                    "moisture": raw,
                    "temperature": temp,
                    "status_flags": flags,
                    "timestamp": now,
                })
        else:
            # ในระหว่าง batch ใช้ end_threshold ตรวจจบ
            if raw is not None and raw > end_threshold:
                readings.append({
                    "id": now,
                    "moisture": raw,
                    "temperature": temp,
                    "status_flags": flags,
                    "timestamp": now,
                })
                below_count = 0
            else:
                below_count += 1
                print(f"Below end threshold count: {below_count}/{max_below}")
                if below_count >= max_below:
                    print(f"Batch ended at {now} after {below_count} consecutive below-threshold readings")
                    break

        time.sleep(interval)

    print(f"Collected {len(readings)} readings")
    return {"sensor_data": readings}

