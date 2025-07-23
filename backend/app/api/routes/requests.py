from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from ...core.database import get_db
from ...models.request import DemoRequest, InvestorRequest

router = APIRouter()


class DemoRequestCreate(BaseModel):
    name: str
    email: EmailStr
    telegram: Optional[str] = None


class InvestorRequestCreate(BaseModel):
    name: str
    email: EmailStr
    expected_investment: str


@router.post("/demo")
async def create_demo_request(
    request: DemoRequestCreate,
    db: Session = Depends(get_db)
):
    demo_request = DemoRequest(
        name=request.name,
        email=request.email,
        telegram=request.telegram
    )
    
    db.add(demo_request)
    db.commit()
    db.refresh(demo_request)
    
    return {
        "message": "Demo request submitted successfully",
        "id": demo_request.id
    }


@router.post("/investor")
async def create_investor_request(
    request: InvestorRequestCreate,
    db: Session = Depends(get_db)
):
    investor_request = InvestorRequest(
        name=request.name,
        email=request.email,
        expected_investment=request.expected_investment
    )
    
    db.add(investor_request)
    db.commit()
    db.refresh(investor_request)
    
    return {
        "message": "Investor request submitted successfully",
        "id": investor_request.id
    }
