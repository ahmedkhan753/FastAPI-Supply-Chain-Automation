from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import Order, ProductStock, User
from ..schemas import OrderAdminResponse, PaymentRequestResponse
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
        .filter(Order.status.in_(["stock_requested", "payment_requested", "paid_to_manufacturer"]))
        .all()
    )

    # Manufacturer specific prices (Wholesale)
    product_prices = { "candy": 80, "snacks": 120, "chocolates": 160, "biscuits": 240,
                       "cold_drinks": 40, "chewing_gums": 25, "juices": 100, "jelly": 60 }
    
    result = []
    for order, username in orders:
        m_price = order.quantity * product_prices.get(order.product_name, 0)
        order_data = {
            "id": order.id,
            "user_id": order.user_id,
            "product_name": order.product_name,
            "quantity": order.quantity,
            "total_amount": order.total_amount,
            "advance_payment": order.advance_payment,
            "remaining_payment": order.remaining_payment,
            "status": order.status,
            "manufacturer_price": m_price,
            "created_at": order.created_at,
            "username": username,
            "payments": order.payments,
            "fully_paid": (order.remaining_payment == 0)
        }
        result.append(OrderAdminResponse(**order_data))
    
    return result

@router.post("/request-payment/{order_id}")
def request_payment(
    order_id: int,
    current_user = Depends(require_role(["manufacturer"])),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "stock_requested":
        raise HTTPException(status_code=400, detail="Order is not in stock_requested status")
    
    # Prices for manufacturer (what warehouse pays)
    product_prices = { "candy": 90, "snacks": 140, "chocolates": 190, "biscuits": 240,
                        "cold_drinks": 40, "chewing_gums": 20, "juices": 110, "jelly": 70 }
    
    if order.product_name not in product_prices:
        raise HTTPException(
            status_code=400,
            detail="Invalid product name."
        )
        
    # We could update the order's total_amount or just leave it as is if it's the shopkeeper's price.
    # But usually, the manufacturer has its own bill. 
    # For simplicity, let's just change the status.
    # If the user wants to record this specific manufacturer price, we'd need another field or a payment record.
    # Let's just update the status to payment_requested.
    
    order.status = "payment_requested"
    db.commit()
    db.refresh(order)
    return {
        "message": "Payment requested from warehouse manager successfully",
        "order_id": order.id,
        "product": order.product_name,
        "quantity": order.quantity
    }
    

@router.post("/ship-stock/{order_id}")
def ship_stock(
    order_id: int,
    current_user = Depends(require_role(["manufacturer"])),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "paid_to_manufacturer":
        raise HTTPException(status_code=400, detail="Order is not paid by warehouse yet")

    # Increase stock in warehouse
    stock = db.query(ProductStock).filter(ProductStock.product_name == order.product_name).first()
    if not stock:
        stock = ProductStock(product_name=order.product_name, quantity=0)
        db.add(stock)
    
    stock.quantity += order.quantity
    
    # After shipping to warehouse, the order returns to 'confirmed' status 
    # so the warehouse manager can now 'dispatch' it to the salesman.
    order.status = "confirmed"
    
    db.commit()
    db.refresh(order)

    return {
        "message": "Stock shipped to warehouse successfully",
        "order_id": order.id,
        "new_stock_quantity": stock.quantity
    }
