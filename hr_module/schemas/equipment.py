from pydantic import BaseModel
from datetime import date
from typing import Optional

class EquipmentAssetBase(BaseModel):
    employee_id: int
    asset_name: str
    serial_number: str
    issue_date: date
    return_date: Optional[date] = None

class EquipmentAssetCreate(EquipmentAssetBase):
    pass

class EquipmentAsset(EquipmentAssetBase):
    id: int

    class Config:
        orm_mode = True
