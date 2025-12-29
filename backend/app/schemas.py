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

    class Config:
        from_attributes = True

