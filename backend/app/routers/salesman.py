from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import Order, User, Payment
from ..schemas import OrderAdminResponse, ConfirmOrderInput




router = APIRouter(prefix="/salesman", tags=["Salesman"])

@router.get("/pending-orders", response_model=list[OrderAdminResponse])
def get_pending_orders(
    current_user = Depends(require_role(["salesman"])),
    db: Session = Depends(get_db)
):
    orders = (
        db.query(Order, User.username)
        .options(joinedload(Order.payments))
        .join(User, Order.user_id == User.id)
        .filter(Order.status == "placed")
        .all()
    )

    result = []
    for order, username in orders:
        order_data = {
            "id": order.id,
            "user_id": order.user_id,
            "total_amount": order.total_amount,
            "advance_payment": order.advance_payment,
            "remaining_payment": order.remaining_payment,
            "status": order.status,
            "created_at": order.created_at,
            "username": username,
            "payments": order.payments,
            "fully_paid": (order.remaining_payment == 0)
        }
        result.append(OrderAdminResponse(**order_data))

    return result


@router.post("/confirm-order")
def confirm_order(
    input_data: ConfirmOrderInput,
    current_user = Depends(require_role(["salesman"])),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == input_data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "placed":
        raise HTTPException(status_code=400, detail="Only placed orders can be confirmed")

    # Validate remaining payment collection
    expected_remaining = order.remaining_payment
    collected = input_data.remaining_payment_collected

    if expected_remaining > 0 and collected != expected_remaining:
        raise HTTPException(
            status_code=400,
            detail=f"Must collect exact remaining amount: {expected_remaining}. Collected: {collected}"
        )

    # Record remaining payment if any
    if collected > 0:
        payment = Payment(
            order_id=order.id,
            amount=collected,
            payment_type="remaining"
        )
        db.add(payment)

    # Confirm the order
    order.status = "confirmed"
    order.remaining_payment = 0  # Now fully paid
    db.commit()
    db.refresh(order)

    return {
        "message": "Order confirmed and remaining payment collected successfully!",
        "order_id": order.id,
        "remaining_payment_collected": collected
    }