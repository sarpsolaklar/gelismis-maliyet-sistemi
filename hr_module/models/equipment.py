from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class EquipmentAsset(Base):
    __tablename__ = "equipment_assets"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    asset_name = Column(String, index=True)
    serial_number = Column(String, index=True)
    issue_date = Column(Date)
    return_date = Column(Date, nullable=True)
    
    employee = relationship("Employee")
