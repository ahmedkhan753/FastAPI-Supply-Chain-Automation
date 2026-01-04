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


class ProductStock(Base):
    __tablename__ = "product_stock"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(100), unique=True, nullable=False)
    quantity = Column(Integer, default=0, nullable=False)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_name = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)
    advance_payment = Column(Float, default=0.0)
    remaining_payment = Column(Float, nullable=False)
    status = Column(
        ENUM("placed", "confirmed", "dispatched", "delivered", "stock_requested", "payment_requested", "paid_to_manufacturer", name="order_status_enum"),
        default="placed",
        nullable=False
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    payments = relationship("Payment", back_populates="order")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_type = Column(ENUM("advance", "remaining", "stock_supply", name="payment_type_enum"), nullable=False)
    paid_at = Column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payments")