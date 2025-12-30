from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import Order, ProductStock, User
from ..schemas import OrderAdminResponse
from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/manufacturer", tags=["Manufacturer"])

@router.get("/stock-requests", response_model=list[OrderAdminResponse])
def get_stock_requests(
    current_user = Depends(require_role(["manufacturer"])),
    db: Session = Depends(get_db)
):
    orders = (
        db.query(Order, User.username)
        .options(joinedload(Order.payments))
        .join(User, Order.user_id == User.id)
        .filter(Order.status == "stock_requested")
        .all()
    )

    result = []
    for order, username in orders:
        order_data = {
            "id": order.id,
            "user_id": order.user_id,
            "product_name": order.product_name,
            "quantity": order.quantity,
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

@router.post("/ship-stock/{order_id}")
def ship_stock(
    order_id: int,
    current_user = Depends(require_role(["manufacturer"])),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "stock_requested":
        raise HTTPException(status_code=400, detail="Order is not in stock_requested status")

    # Increase stock
    stock = db.query(ProductStock).filter(ProductStock.product_name == order.product_name).first()
    if not stock:
        stock = ProductStock(product_name=order.product_name, quantity=0)
        db.add(stock)
    
    stock.quantity += order.quantity
    order.status = "delivered"  # Now warehouse can deliver
    db.commit()
    db.refresh(order)

    return {
        "message": "Stock shipped successfully",
        "order_id": order.id,
        "new_stock_quantity": stock.quantity
    }