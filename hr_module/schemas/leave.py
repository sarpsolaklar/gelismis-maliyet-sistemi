from pydantic import BaseModel
from datetime import date
from typing import Optional

class LeaveRequestBase(BaseModel):
    employee_id: int
    start_date: date
    end_date: date
    type: str

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequest(LeaveRequestBase):
    id: int
    status: str

    class Config:
        orm_mode = True
