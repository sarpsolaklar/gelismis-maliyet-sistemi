from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.equipment import EquipmentAsset as EquipmentModel
from schemas.equipment import EquipmentAsset, EquipmentAssetCreate

router = APIRouter(prefix="/equipment", tags=["equipment"])

@router.post("/", response_model=EquipmentAsset)
def create_equipment(equipment: EquipmentAssetCreate, db: Session = Depends(get_db)):
    db_equipment = EquipmentModel(**equipment.dict())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

@router.get("/", response_model=List[EquipmentAsset])
def read_equipment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(EquipmentModel).offset(skip).limit(limit).all()
