from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import logging

from ...core.database import get_db
from ...models.wallet import WalletTransaction

logger = logging.getLogger(__name__)

router = APIRouter()

class TransactionRequest(BaseModel):
    hash: str
    from_address: str
    to_address: str
    amount: str
    token: str
    network: str = "ETHEREUM"
    status: str = "pending"

class TransactionResponse(BaseModel):
    id: int
    hash: str
    from_address: str
    to_address: str
    amount: str
    token: str
    network: str
    status: str
    created_at: str

@router.post("/tx", response_model=dict)
async def create_transaction(
    transaction: TransactionRequest,
    db: Session = Depends(get_db)
):
    """
    Save a new crypto transaction to the database
    """
    try:
        db_transaction = WalletTransaction(
            hash=transaction.hash,
            from_address=transaction.from_address,
            to_address=transaction.to_address,
            amount=transaction.amount,
            token=transaction.token,
            network=transaction.network,
            status=transaction.status
        )
        
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        
        logger.info(f"Transaction saved: {transaction.hash}")
        
        return {
            "message": "Transaction saved successfully",
            "id": db_transaction.id,
            "hash": transaction.hash
        }
        
    except Exception as e:
        logger.error(f"Error saving transaction: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save transaction: {str(e)}")

@router.get("/tx/{tx_hash}", response_model=TransactionResponse)
async def get_transaction(
    tx_hash: str,
    db: Session = Depends(get_db)
):
    """
    Get transaction details by hash
    """
    try:
        transaction = db.query(WalletTransaction).filter(
            WalletTransaction.hash == tx_hash
        ).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return TransactionResponse(
            id=transaction.id,
            hash=transaction.hash,
            from_address=transaction.from_address,
            to_address=transaction.to_address,
            amount=transaction.amount,
            token=transaction.token,
            network=transaction.network,
            status=transaction.status,
            created_at=transaction.created_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching transaction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch transaction: {str(e)}")

@router.patch("/tx/{tx_hash}/status")
async def update_transaction_status(
    tx_hash: str,
    status: str,
    db: Session = Depends(get_db)
):
    """
    Update transaction status (pending, confirmed, failed)
    """
    try:
        transaction = db.query(WalletTransaction).filter(
            WalletTransaction.hash == tx_hash
        ).first()
        
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        transaction.status = status
        db.commit()
        
        logger.info(f"Transaction {tx_hash} status updated to {status}")
        
        return {"message": "Transaction status updated", "status": status}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating transaction status: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update transaction: {str(e)}")
