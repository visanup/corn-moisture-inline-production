#!/usr/bin/env python3
import os
import joblib
import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats
from sklearn.ensemble import RandomForestRegressor

def remove_outliers(data: pd.DataFrame, columns: list, method: str = 'iqr', threshold: float = 3) -> pd.DataFrame:
    """
    Remove outliers from `data` based on the specified `method` ('iqr' or 'zscore').
    Skips any column that has zero variance (std == 0 or IQR == 0).
    """
    conditions = []
    for col in columns:
        col_data = data[col]
        if method == 'zscore':
            if col_data.std() == 0:
                continue
            z = stats.zscore(col_data)
            conditions.append((z < threshold) & (z > -threshold))
        else:  # IQR method
            Q1, Q3 = col_data.quantile([0.25, 0.75])
            IQR = Q3 - Q1
            if IQR == 0:
                continue
            lb, ub = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
            conditions.append((col_data >= lb) & (col_data <= ub))

    if not conditions:
        return data

    mask = conditions[0]
    for cond in conditions[1:]:
        mask &= cond
    return data[mask]

def load_data(filepath: str, outlier_method: str = 'iqr') -> pd.DataFrame | None:
    """
    Load data from CSV or Excel, clean up, and apply outlier removal.
    Returns None on error.
    """
    try:
        ext = os.path.splitext(filepath)[1].lower()
        if ext == '.csv':
            df = pd.read_csv(filepath)
        else:
            df = pd.read_excel(filepath, engine='openpyxl')

        # ลบคอลัมน์ Unnamed ถ้ามี (มักมาจาก Excel/CSV)
        for col in df.columns:
            if col.startswith('Unnamed'):
                df.drop(columns=[col], inplace=True)

        # drop only missing in the columns we care about
        df.dropna(subset=['moisture_standard', 'sensor_data'], inplace=True)

        # ถ้าอยากกรอง outliers ให้เปิดบรรทัดนี้
        df = remove_outliers(df, ['moisture_standard', 'sensor_data'], method=outlier_method)

        return df
    except Exception as e:
        print(f"❌ Error loading data: {e}")
        return None

def calibrate_and_plot_rf(
    data: pd.DataFrame,
    n_estimators: int = 100,
    max_depth: int | None = None,
    model_save_path: str | None = None
) -> str:
    """
    Train a RandomForestRegressor, plot calibration curve,
    and optionally save the trained model.
    """
    X = data[['sensor_data']].values
    y = data['moisture_standard'].values

    if X.shape[0] == 0:
        raise ValueError("No data available after cleaning – please check your CSV and outlier settings.")

    # Train model
    rf = RandomForestRegressor(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
    rf.fit(X, y)

    # Predict and score
    y_pred = rf.predict(X)
    r2 = rf.score(X, y)

    # Plot calibration curve
    plt.figure(figsize=(7, 5))
    plt.scatter(X, y, label='Data Points')
    plt.plot(X, y_pred, linestyle='--', label=f'RF (R²={r2:.4f})')
    plt.title('Calibration Curve - Random Forest')
    plt.xlabel('Sensor Data')
    plt.ylabel('Moisture Standard (%)')
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.show()

    # Save model if requested
    if model_save_path:
        os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
        joblib.dump(rf, model_save_path)
        print(f"✅ Model saved to: {model_save_path}")

    return f"✅ Random Forest Model R² = {r2:.4f}"

if __name__ == "__main__":
    data_path = "./Moisture_Sensor_calibrate.csv"
    model_path = "./model/best_model_rf.pkl"

    df = load_data(data_path, outlier_method='iqr')
    if df is None:
        exit(1)

    try:
        msg = calibrate_and_plot_rf(df, n_estimators=100, max_depth=10, model_save_path=model_path)
        print(msg)
    except Exception as e:
        print(f"❌ Training failed: {e}")
        exit(1)
