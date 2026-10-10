from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.leave import LeaveRequest as LeaveModel
from schemas.leave import LeaveRequest, LeaveRequestCreate

router = APIRouter(prefix="/leaves", tags=["leaves"])

@router.post("/", response_model=LeaveRequest)
def create_leave(leave: LeaveRequestCreate, db: Session = Depends(get_db)):
    db_leave = LeaveModel(**leave.dict())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

@router.get("/", response_model=List[LeaveRequest])
def read_leaves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(LeaveModel).offset(skip).limit(limit).all()
