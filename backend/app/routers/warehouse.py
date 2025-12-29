from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import Order, Stock, User
from ..schemas import OrderAdminResponse, StockAction

router = APIRouter(prefix="/warehouse", tags=["Warehouse Manager"])
@router.get("/confirmed-orders", response_model=list[OrderAdminResponse])
def get_confirmed_orders(
    current_user = Depends(require_role(["warehouse_manager"])),
    db: Session = Depends(get_db)
):
    # Join Order with User to get username
    orders = (
        db.query(Order, User.username)
        .options(joinedload(Order.payments))
        .join(User, Order.user_id == User.id)
        .filter(Order.status == "confirmed")
        .all()
    )

    # Manually construct the response with username
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
            "username": username,  # Add the shopkeeper's username
            "payments": order.payments,
            "fully_paid": (order.remaining_payment == 0)
        }
        result.append(OrderAdminResponse(**order_data))

    return result

@router.post("/process-order")
def process_order(
    action_data: StockAction,
    current_user = Depends(require_role(["warehouse_manager"])),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == action_data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "confirmed":
        raise HTTPException(status_code=400, detail="Only confirmed orders can be processed")
    
    # Simple stock check logic (for demo purposes)
    stock = db.query(Stock).filter(Stock.item_name == "Product A").first()
    if stock is None:
        # create initial stock record if not exists
        stock = Stock(item_name="Product A", quantity=5)
        db.add(stock)
        db.commit()

    if action_data.action == "dispatch":
        if stock.quantity > 0 :
            stock.quantity -= 1
            order.status = "dispatched"
            db.commit()
            db.refresh(order)
            return {"detail": "Order dispatched successfully"}
        else:
            raise HTTPException(status_code=400, detail="Insufficient stock to dispatch the order")
    elif action_data.action == "request_stock":
        order.status = "stock_requested"
        db.commit()
        db.refresh(order)
        return {"detail": "Stock request noted for the order"}
