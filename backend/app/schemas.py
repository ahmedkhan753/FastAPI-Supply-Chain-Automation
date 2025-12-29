from pydantic import BaseModel, EmailStr
from typing import Literal
from datetime import datetime
from typing import Optional

#Base user schema
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Literal["shopkeeper", "salesman", "warehouse_manager", "manufacturer"]

#For creating a user (registration)
class UserCreate(UserBase):
    password: str

#Response (What we send back to client-no passwords)
class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

#Token response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class OrderBase(BaseModel):
    total_amount: float
    advance_payment: Optional[float] = 0.0

class OrderCreate(OrderBase):
    pass # Shopkeeper sends total + optional advance payment

class OrderResponse(OrderBase):
    id: int
    user_id: int
    remaining_payment: float
    status: str
    created_at: datetime
    payments: list['PaymentResponse'] = []
    fully_paid: bool = False

    class Config:
        from_attributes = True

class OrderConfirm(BaseModel):
    order_id: int

class OrderAdminResponse(OrderResponse):
    username: str
    payments: list['PaymentResponse'] = []
    fully_paid: bool = False

    class Config:
        from_attributes = True

class StockResponse(BaseModel):
    id: int
    item_name: str
    quantity: int

    class Config:
        from_attributes = True

class StockAction(BaseModel):
    order_id: int
    action: Literal["dispatch", "request_stock"]


class PaymentResponse(BaseModel):
    id: int
    amount: float
    payment_type: str
    paid_at: datetime
    class Config:
        from_attributes = True

class ConfirmOrderInput(BaseModel):
    order_id: int
    remaining_payment_collected: float

# New input schema for confirm with payment
class ConfirmOrderInput(BaseModel):
    order_id: int
    remaining_payment_collected: float  # Amount salesman collected now



        

