from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import Order, Payment
from ..schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
def place_order(
    order_in: OrderCreate,
    current_user = Depends(require_role(["shopkeeper"])),  # ← String, not Enum
    db: Session = Depends(get_db)
):
    if order_in.advance_payment > order_in.total_amount * 0.6:
        raise HTTPException(
            status_code=400,
            detail="Advance payment cannot exceed 60% of total amount."
        )

    remaining = order_in.total_amount - order_in.advance_payment
    if remaining < 0:
        raise HTTPException(
            status_code=400,
            detail="Advance payment cannot exceed total amount."
        )

    db_order = Order(
        user_id=current_user.id,
        total_amount=order_in.total_amount,
        advance_payment=order_in.advance_payment,
        remaining_payment=remaining
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    if order_in.advance_payment > 0:
        advance_payment = Payment(
            order_id=db_order.id,
            amount=order_in.advance_payment,
            payment_type="advance"
        )
        db.add(advance_payment)

    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/my-orders", response_model=list[OrderResponse])
def get_my_orders(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).options(joinedload(Order.payments)).filter(Order.user_id == current_user.id).all()
    for order in orders:
        order.fully_paid = (order.remaining_payment == 0)
    return orders