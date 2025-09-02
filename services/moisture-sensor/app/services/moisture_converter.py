## app/services/moisture_converter.py
import logging
import joblib
import pandas as pd
import warnings
import uuid
from scipy.stats import skew, kurtosis
from app.config import Config
from math import isnan

warnings.filterwarnings('ignore')
logger = logging.getLogger(__name__)

# โหลดโมเดลครั้งเดียว
try:
    model = joblib.load(Config.MODEL_PATH)
    logger.info("Model loaded from %s", Config.MODEL_PATH)
except Exception as e:
    logger.error("Model load failed: %s", e)
    model = None


def calculate_statistics(predicted_values: list) -> dict:
    series = pd.Series(predicted_values)

    # helper to round or map NaN → None
    def r(v):
        try:
            return round(v, 2)
        except (TypeError, ValueError):
            return None

    sk = skew(predicted_values)
    ku = kurtosis(predicted_values)

    return {
        "N":     int(series.count()),
        "min":   r(series.min()),
        "max":   r(series.max()),
        "range": r(series.max() - series.min()),
        "average":    r(series.mean()),
        "SD":         r(series.std()),
        "CV":   None if series.mean() == 0 else r(series.std() / series.mean() * 100),
        "median":     r(series.median()),
        "variance":   r(series.var()),
        "skewness":   None if isnan(sk) else r(sk),
        "kurtosis":   None if isnan(ku) else r(ku)
    }

def moisture_calculate(raw_data: dict) -> dict:
    if model is None:
        return {"error": "Model not loaded"}

    sensor_data = raw_data.get("sensor_data", {})
    queue_id = raw_data.get("queue", str(uuid.uuid4()))

    predictions = []
    preds = []

    for key, raw in sensor_data.items():
        logger.info(f"📥 Predicting for id={key}, raw={raw}")  # ก่อนเข้าโมเดล

        df = pd.DataFrame({'sensor_value': [raw]})
        try:
            pred = round(float(model.predict(df)[0]), 2)
            logger.info(f"✅ Prediction result for id={key}: {pred}")  # หลัง predict

            predictions.append({"id": key, "prediction": pred, "unit": "%"})
            preds.append(pred)
        except Exception as e:
            logger.info(f"❌ Prediction error for id={key}: {e}")
            predictions.append({"id": key, "error": str(e)})

    stats = calculate_statistics(preds)
    logger.info(f"📊 Statistics: {stats}")  # ผลรวมของ prediction ทั้งหมด

    return {"queue": queue_id, "predictions": predictions, "statistics": stats}

