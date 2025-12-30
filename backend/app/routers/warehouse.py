from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import Order, ProductStock, User  # ← Changed Stock → ProductStock
from ..schemas import OrderAdminResponse, StockAction, StockResponse, delivered

router = APIRouter(prefix="/warehouse", tags=["Warehouse Manager"])

@router.get("/confirmed-orders", response_model=list[OrderAdminResponse])
def get_confirmed_orders(
    current_user = Depends(require_role(["warehouse_manager"])),
    db: Session = Depends(get_db)
):
    # Get confirmed orders with shopkeeper username and payments
    orders = (
        db.query(Order, User.username)
        .join(User, Order.user_id == User.id)
        .filter(Order.status == "confirmed")
        .all()
    )

    result = []
    for order, username in orders:
        order_data = {
            "id": order.id,
            "user_id": order.user_id,
            "product_name": order.product_name,        # ← Now shows actual product
            "quantity": order.quantity,
            "total_amount": order.total_amount,
            "advance_payment": order.advance_payment,
            "remaining_payment": order.remaining_payment,
            "status": order.status,
            "created_at": order.created_at,
            "username": username,
            "payments": [],  # You can add joinedload(Order.payments) later if needed
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
    
    # Find stock for the SPECIFIC product in the order
    stock = db.query(ProductStock).filter(ProductStock.product_name == order.product_name).first()

    if action_data.action == "dispatch":
        # Check if enough stock
        if not stock or stock.quantity < order.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {order.product_name}. Available: {stock.quantity if stock else 0}, Required: {order.quantity}"
            )
        
        # Dispatch: reduce stock
        stock.quantity -= order.quantity
        order.status = "dispatched"  # You can add "delivered" step later
        db.commit()
        db.refresh(order)

        return {
            "message": "Order dispatched successfully",
            "order_id": order.id,
            "product": order.product_name,
            "dispatched_quantity": order.quantity,
            "remaining_stock": stock.quantity
        }

    elif action_data.action == "request_stock":
        order.status = "stock_requested"
        db.commit()
        db.refresh(order)

        return {
            "message": "Stock request sent to manufacturer",
            "order_id": order.id,
            "product": order.product_name,
            "requested_quantity": order.quantity
        }


@router.get("/stock", response_model=list[StockResponse])
def get_stock(
    current_user = Depends(require_role(["warehouse_manager"])),
    db: Session = Depends(get_db)
):
    all_stock = db.query(ProductStock).all()
    results = []
    for stock in all_stock:
        results.append(StockResponse(item_name=stock.product_name, quantity=stock.quantity, id=stock.id))
    return results


@router.get("/Delivered-Orders", response_model=list[delivered])
def get_delivered_orders(
    current_user = Depends(require_role(["warehouse_manager"])),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.status == "delivered").all()
    result = []
    for order in orders:
        result.append(delivered(order_id=order.id, product_name=order.product_name, quantity=order.quantity))
    return result