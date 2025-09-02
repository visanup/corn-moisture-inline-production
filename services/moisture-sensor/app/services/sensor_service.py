## app/services/sensor_service.py
import minimalmodbus
import serial
from datetime import datetime
from app.config import Config


class MoistureSensor:
    """อ่านค่า Raw Moisture, ตรวจสอบสถานะ และอ่านอุณหภูมิจาก Modbus RTU sensor"""

    # mapping bit positions to status labels for SENSOR_STATUS register
    STATUS_FLAGS = {
        0: "Invalid (Live)",
        1: "Invalid (Latched)",
        2: "Unreliable (Live)",
        3: "Unreliable (Latched)",
        4: "Offscale (Live)",
        5: "Offscale (Latched)",
        6: "Too Hot (Live)",
        7: "Too Hot (Latched)",
        8: "Too Cold (Live)",
        9: "Too Cold (Latched)",
        10: "Stable (Live)",
        11: "Stable (Latched)",
        12: "Material Too Hot (Live)",
        13: "Material Too Hot (Latched)",
        14: "Material Too Cold (Live)",
        15: "Material Too Cold (Latched)",
        16: "Cal Out of Range (Live)",
        17: "Cal Out of Range (Latched)",
        18: "Unscaled Out of Range (Live)",
        19: "Unscaled Out of Range (Latched)",
        20: "Supply 5V Error (Live)",
        21: "Supply 5V Error (Latched)",
        22: "RF Ref Error (Live)",
        23: "RF Ref Error (Latched)",
        24: "Digital IO Mode",
        25: "Digital Input Status Flag",
        26: "Digital IO Status Flag"
    }

    def __init__(
        self,
        port: str = Config.MOISTURE_SERIAL_PORT,
        slave_id: int = Config.MOISTURE_SERIAL_SLAVE_ID,
        baudrate: int = Config.MOISTURE_SERIAL_BAUDRATE,
        timeout: float = Config.MOISTURE_SERIAL_TIMEOUT,
        moisture_register: int = Config.MOISTURE_REGISTER_ONE_BASED,
        status_register: int = Config.SENSOR_STATUS_REGISTER,
        temp_register: int = Config.MATERIAL_TEMPERATURE_REGISTER,
        moisture_decimals: int = Config.MOISTURE_REGISTER_DECIMALS,
        temp_decimals: int = 1,
        functioncode: int = 4,
        register_base: int = 30014,
    ):
        # สร้าง Instrument
        self.inst = minimalmodbus.Instrument(port, slave_id, mode=minimalmodbus.MODE_RTU)
        self.inst.serial.baudrate = baudrate
        self.inst.serial.bytesize = 8
        self.inst.serial.parity = serial.PARITY_NONE
        self.inst.serial.stopbits = 1
        self.inst.serial.timeout = timeout
        self.inst.clear_buffers_before_each_transaction = True

        # กำหนด register addresses (one-based) และ base address
        self.moisture_reg = moisture_register
        self.status_reg = status_register
        self.temp_reg = temp_register
        self.moisture_decimals = moisture_decimals
        self.temp_decimals = temp_decimals
        self.fc = functioncode
        # base address สำหรับ zero-based calculation
        self.register_base = register_base

    def read_raw_moisture(self) -> float:
        """
        อ่านค่า raw moisture และคืนเป็น float
        zero-based address = one_based - register_base
        """
        addr = self.moisture_reg - self.moisture_reg
        return self.inst.read_register(addr, self.moisture_decimals, functioncode=self.fc)

    def read_material_temperature(self) -> float:
        """
        อ่านค่า Material Temperature และคืนเป็น float
        zero-based address = one_based - register_base
        """
        addr = self.temp_reg - self.temp_reg
        return self.inst.read_register(addr, self.temp_decimals, functioncode=self.fc)

    def read_sensor_status(self) -> dict:
        """
        อ่านค่า status register (2 registers) และคืนค่า flags ที่ active
        zero-based address = one_based - register_base
        """
        addr = self.status_reg - self.register_base
        try:
            raw = self.inst.read_long(
                addr,
                functioncode=self.fc,
                number_of_registers=2,
                signed=False
            )
        except Exception as e:
            return {"error": str(e)}

        flags = [label for bit, label in self.STATUS_FLAGS.items() if raw & (1 << bit)]
        return {"raw": raw, "flags": flags}

    def get_status(self) -> dict:
        """
        รวบรวมสถานะเซ็นเซอร์, ค่า moisture, temperature, และ timestamp
        """
        result = {"timestamp": datetime.utcnow().isoformat()}
        # moisture
        try:
            result["moisture"] = self.read_raw_moisture()
        except Exception as e:
            result["moisture_error"] = str(e)
        # temperature
        try:
            result["temperature"] = self.read_material_temperature()
        except Exception as e:
            result["temp_error"] = str(e)
        # status flags
        status_info = self.read_sensor_status()
        if "error" in status_info:
            result["status_error"] = status_info["error"]
        else:
            result["status_flags"] = status_info["flags"]
            result["status_raw"] = status_info["raw"]

        return result

    def close(self):
        """
        ปิดการเชื่อมต่อ serial
        """
        try:
            self.inst.serial.close()
        except Exception:
            pass

    def close_connection(self):
        """
        alias ของ close() เพื่อปิด connection
        """
        self.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        self.close()
