from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.mysql import ENUM
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        ENUM("shopkeeper", "salesman", "warehouse_manager", "manufacturer", name="user_role_enum"),
        nullable=False
    )

    orders = relationship("Order", back_populates="user")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    advance_payment = Column(Float, default=0.0)
    remaining_payment = Column(Float, nullable=False)
    status = Column(
        ENUM(
            "placed",
            "confirmed",
            "stock_checked",
            "dispatched",
            "delivered",
            "stock_requested",
            name="order_status_enum"
        ),
        default="placed",  # ← lowercase string
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")

class Stock(Base):
    __tablename__ = "stock"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(100), unique=True, nullable=False)
    quantity = Column(Integer, default=0, nullable=False)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_type = Column(ENUM("advance", "remaining", name="payment_type_enum"), nullable=False)
    paid_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payments")

# Add back-relationship to Order
Order.payments = relationship("Payment", back_populates="order")
