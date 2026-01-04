from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import Order, Payment, ProductStock
from ..schemas import OrderCreate, OrderResponse
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
def place_order(
    order_in: OrderCreate,
    current_user = Depends(require_role(["shopkeeper"])),
    db: Session = Depends(get_db)
):
    # CALCULATE total
    amounts = [100, 150, 200, 250, 50, 30, 120, 80]  # Example fixed prices for products
    product_prices = { "candy": 100, "snacks": 150, "chocolates": 200, "biscuits": 250,
                       "cold_drinks": 50, "chewing_gums": 30, "juices": 120, "jelly": 80 }
    if order_in.product_name not in product_prices:
        raise HTTPException(
            status_code=400,
            detail="Invalid product name."
        )
    total_amount = order_in.quantity * product_prices[order_in.product_name]

    if order_in.advance_payment > total_amount * 0.6:
        raise HTTPException(
            status_code=400,
            detail="Advance payment cannot exceed 60% of total amount."
        )

    remaining_payment = total_amount - order_in.advance_payment
    if remaining_payment < 0:
        raise HTTPException(
            status_code=400,
            detail="Advance payment cannot exceed total amount."
        )

    db_order = Order(
        user_id=current_user.id,
        product_name=order_in.product_name,
        quantity=order_in.quantity,
        total_amount=total_amount,
        advance_payment=order_in.advance_payment,
        remaining_payment=remaining_payment
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # CREATE advance payment
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

@router.get("/{order_id}/invoice")
def generate_invoice(
    order_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"DEBUG: Generating invoice. OrderID: {order_id}, UserID: {current_user.id}")
    order = db.query(Order).options(joinedload(Order.payments)).filter(
        Order.id == order_id
    ).first()

    if not order:
        print("DEBUG: Order not found in DB at all.")
        raise HTTPException(status_code=404, detail="Order not found")
    
    print(f"DEBUG: Order found. OrderUserID: {order.user_id}")
    if order.user_id != current_user.id:
        print("DEBUG: User mismatch.")
        raise HTTPException(status_code=404, detail="Order not found (user mismatch)")

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Header
    c.setFont("Helvetica-Bold", 24)
    c.drawString(50, 750, "INVOICE")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, 730, f"Order ID: #{order.id}")
    c.drawString(50, 715, f"Date: {order.created_at.strftime('%Y-%m-%d %H:%M')}")
    c.drawString(50, 700, f"Customer: {current_user.username}")
    
    # Line
    c.setStrokeColor(colors.grey)
    c.line(50, 680, 550, 680)
    
    # Order Details
    y = 650
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Item")
    c.drawString(300, y, "Quantity")
    c.drawString(450, y, "Total")
    
    y -= 30
    c.setFont("Helvetica", 12)
    c.drawString(50, y, order.product_name)
    c.drawString(300, y, str(order.quantity))
    c.drawString(450, y, f"${order.total_amount:.2f}")

    # Payment Details
    y -= 50
    c.line(50, y, 550, y)
    y -= 30
    
    c.drawString(350, y, "Total Amount:")
    c.drawString(450, y, f"${order.total_amount:.2f}")
    y -= 20
    c.drawString(350, y, "Advance Paid:")
    c.drawString(450, y, f"${order.advance_payment:.2f}")
    y -= 20
    c.drawString(350, y, "Remaining Due:")
    c.drawString(450, y, f"${order.remaining_payment:.2f}")
    y -= 20
    
    # Status
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, f"Status: {order.status.upper()}")

    c.save()
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=invoice_{order.id}.pdf"}
    )
