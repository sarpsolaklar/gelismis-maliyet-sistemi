from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    type = Column(String)  # e.g., Yıllık, Hastalık, Mazeret
    status = Column(String, default="Bekliyor")  # Bekliyor, Onaylandı, Reddedildi
    
    employee = relationship("Employee")
