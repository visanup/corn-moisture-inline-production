# app/models/moisture_result_model.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import Base


class MoistureResult(Base):
    __tablename__ = 'result'
    __table_args__ = {'schema': 'moisture'}

    id = Column(Integer, primary_key=True, index=True)
    ins_lot = Column(String(255), nullable=False)
    material = Column(String(255), nullable=False)
    batch = Column(String(255), nullable=False)
    plant = Column(String(255), nullable=False)
    sample_no = Column(String(255), nullable=False)
    queue = Column(String(255), unique=True, index=True, nullable=False)
    result = Column(JSONB)
    statistics = Column(JSONB)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    @staticmethod
    def create_result(
        db: Session,
        ins_lot: str,
        material: str,
        batch: str,
        plant: str,
        sample_no: str,
        queue: str,
        result_data: dict,
        statistics: dict
    ) -> 'MoistureResult':
        """
        Insert a new moisture result record into the database.
        """
        db_obj = MoistureResult(
            ins_lot=ins_lot,
            material=material,
            batch=batch,
            plant=plant,
            sample_no=sample_no,
            queue=queue,
            result=result_data,
            statistics=statistics,
            created_at=datetime.utcnow(),
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def upsert_result(
        db: Session,
        ins_lot: str,
        material: str,
        batch: str,
        plant: str,
        sample_no: str,
        queue: str,
        result_data: dict,
        statistics: dict
    ) -> 'MoistureResult':
        """
        Insert or update a moisture result record based on the queue identifier.
        """
        db_obj = db.query(MoistureResult).filter(MoistureResult.queue == queue).first()
        if db_obj:
            # Update existing record
            db_obj.ins_lot = ins_lot
            db_obj.material = material
            db_obj.batch = batch
            db_obj.plant = plant
            db_obj.sample_no = sample_no
            db_obj.result = result_data
            db_obj.statistics = statistics
            db_obj.created_at = datetime.utcnow()
            db.commit()
            db.refresh(db_obj)
            return db_obj
        # Otherwise, create a new record
        return MoistureResult.create_result(
            db,
            ins_lot,
            material,
            batch,
            plant,
            sample_no,
            queue,
            result_data,
            statistics
        )