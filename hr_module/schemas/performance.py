from pydantic import BaseModel
from datetime import date

class PerformanceReviewBase(BaseModel):
    employee_id: int
    reviewer_id: int
    score: int
    notes: str
    review_date: date

class PerformanceReviewCreate(PerformanceReviewBase):
    pass

class PerformanceReview(PerformanceReviewBase):
    id: int

    class Config:
        orm_mode = True
