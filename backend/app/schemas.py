from pydantic import BaseModel, EmailStr
from typing import Literal
from datetime import datetime
from typing import Optional

#Base user schema
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Literal["shopkeeper", "salesman", "warehouse_manager", "manufacturer"]
    product_name: Literal["candy", "snacks", "chocolates", "biscuits", "cold_drinks", "chewing_gums", "juices","jelly"]

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

class OrderCreate(BaseModel):
    product_name: str
    quantity: int
    advance_payment: Optional[float] = 0.0

class OrderResponse(OrderBase):
    product_name: str
    quantity: int
    id: int
    user_id: int
    remaining_payment: float
    status: str
    manufacturer_price: Optional[float] = 0.0
    created_at: datetime
    payments: list['PaymentResponse'] = []
    fully_paid: bool = False

    class Config:
        from_attributes = True

class OrderConfirm(BaseModel):
    order_id: int

class OrderAdminResponse(OrderResponse):
    product_name: str
    quantity: int
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
    action: Literal["dispatch", "request_stock", "delivered"]


class PaymentResponse(BaseModel):
    id: int
    amount: float
    payment_type: str
    paid_at: datetime
    class Config:
        from_attributes = True


# New input schema for confirm with payment
class ConfirmOrderInput(BaseModel):
    order_id: int
    #remaining_payment_collected: float  # Amount salesman collected now

class delivered(BaseModel):
    order_id: int
    product_name: str
    quantity: int

class PaymentRequest(BaseModel):
    order_id: int
    amount: float
    payment_type: str

    class Config:
        from_attributes = True

class PaymentRequestResponse(BaseModel):
    total_amount: float

class PayManufacturerInput(BaseModel):
    order_id: int

class DeliverOrderInput(BaseModel):
    order_id: int
    collected_amount: float
    



        

