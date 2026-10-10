from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.performance import PerformanceReview as PerformanceModel
from schemas.performance import PerformanceReview, PerformanceReviewCreate

router = APIRouter(prefix="/performance", tags=["performance"])

@router.post("/", response_model=PerformanceReview)
def create_performance(review: PerformanceReviewCreate, db: Session = Depends(get_db)):
    db_review = PerformanceModel(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

@router.get("/", response_model=List[PerformanceReview])
def read_performance(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(PerformanceModel).offset(skip).limit(limit).all()
