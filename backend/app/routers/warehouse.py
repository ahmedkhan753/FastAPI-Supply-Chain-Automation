from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import Order, ProductStock, User  # ← Changed Stock → ProductStock
from ..schemas import OrderAdminResponse, StockAction, StockResponse, delivered, PayManufacturerInput
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

router = APIRouter(prefix="/warehouse", tags=["Warehouse Manager"])

# Manufacturer specific prices (Wholesale)
MANUFACTURER_PRICES = { 
    "candy": 80, "snacks": 120, "chocolates": 160, "biscuits": 240,
    "cold_drinks": 40, "chewing_gums": 25, "juices": 100, "jelly": 60 
}

@router.get("/pending-actions", response_model=list[OrderAdminResponse])
def get_pending_actions(
    current_user = Depends(require_role(["warehouse_manager"])),
    db: Session = Depends(get_db)
):
    # Manager needs to see confirmed orders AND payment requests from manufacturer
    orders = (
        db.query(Order, User.username)
        .join(User, Order.user_id == User.id)
        .filter(Order.status.in_(["confirmed", "payment_requested", "paid_to_manufacturer", "stock_requested"]))
        .all()
    )

    result = []
    for order, username in orders:
        m_price = order.quantity * MANUFACTURER_PRICES.get(order.product_name, 0)
        result.append(OrderAdminResponse(
            id=order.id,
            user_id=order.user_id,
            product_name=order.product_name,
            quantity=order.quantity,
            total_amount=order.total_amount,
            advance_payment=order.advance_payment,
            remaining_payment=order.remaining_payment,
            status=order.status,
            manufacturer_price=m_price,
            created_at=order.created_at,
            username=username,
            payments=[], # Assuming payments are not directly loaded here, keep as empty list
            fully_paid=(order.remaining_payment == 0)
        ))
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
    
    stock = db.query(ProductStock).filter(ProductStock.product_name == order.product_name).first()

    if action_data.action == "dispatch":
        if order.status != "confirmed":
            raise HTTPException(status_code=400, detail="Order must be confirmed before dispatch")
            
        if not stock or stock.quantity < order.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {order.product_name}. Available: {stock.quantity if stock else 0}, Required: {order.quantity}"
            )
        
        stock.quantity -= order.quantity
        order.status = "dispatched"
        db.commit()
        db.refresh(order)

        return {
            "message": "Order dispatched successfully to salesman",
            "order_id": order.id,
            "remaining_stock": stock.quantity
        }

    elif action_data.action == "request_stock":
        if order.status != "confirmed":
            raise HTTPException(status_code=400, detail="Can only request stock for confirmed orders")
            
        order.status = "stock_requested"
        db.commit()
        db.refresh(order)

        return {
            "message": "Stock request sent to manufacturer",
            "order_id": order.id
        }

@router.post("/pay-manufacturer")
def pay_manufacturer(
    input_data: PayManufacturerInput,
    current_user = Depends(require_role(["warehouse_manager"])),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == input_data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "payment_requested":
        raise HTTPException(status_code=400, detail="No payment requested for this order")
    
    # Record the payment logic
    order.status = "paid_to_manufacturer"
    db.commit()
    db.refresh(order)
    
    return {"message": "Payment sent to manufacturer successfully", "order_id": order.id}

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


@router.get("/delivered-orders", response_model=list[delivered])
def get_delivered_orders(
    current_user = Depends(require_role(["warehouse_manager"])),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.status == "delivered").all()
    result = []
    for order in orders:
        result.append(delivered(order_id=order.id, product_name=order.product_name, quantity=order.quantity))
    return result

@router.get("/{order_id}/invoice")
def generate_manufacturer_invoice(
    order_id: int,
    current_user = Depends(require_role(["warehouse_manager", "manufacturer"])),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Calculate wholesale amount
    m_price = order.quantity * MANUFACTURER_PRICES.get(order.product_name, 0)

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Header
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, 750, "STOCK SUPPLY INVOICE")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, 730, f"Stock Request ID: #{order.id}")
    c.drawString(50, 715, f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M')}")
    c.drawString(50, 700, f"From: Manufacturer")
    c.drawString(50, 685, f"To: Warehouse Manager")
    
    # Line
    c.setStrokeColor(colors.grey)
    c.line(50, 665, 550, 665)
    
    # Order Details
    y = 630
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Item")
    c.drawString(300, y, "Quantity")
    c.drawString(450, y, "Wholesale Total")
    
    y -= 30
    c.setFont("Helvetica", 12)
    c.drawString(50, y, order.product_name.replace("_", " ").title())
    c.drawString(300, y, str(order.quantity))
    c.drawString(450, y, f"INR {m_price:.2f}")

    # Payment Details
    y -= 50
    c.line(50, y, 550, y)
    y -= 30
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(350, y, "TOTAL DUE:")
    c.drawString(450, y, f"INR {m_price:.2f}")
    y -= 30
    
    # Status
    # Based on our logic, if status is 'paid_to_manufacturer' or later, it's paid.
    payment_status = "PENDING PAYMENT"
    if order.status in ["paid_to_manufacturer", "dispatched", "delivered", "confirmed"]:
        if order.status != "stock_requested" and order.status != "payment_requested":
             payment_status = "PAID"
             
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, f"Status: {payment_status}")
    c.drawString(50, y-20, f"Workflow State: {order.status.upper()}")

    c.save()
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=stock_invoice_{order.id}.pdf"}
    )
