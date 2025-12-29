from fastapi import APIRouter, Depends 
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import User

router = APIRouter(
    prefix="/protected", tags=["protected Routes"])

# Anyone can access this route
@router.get("/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role
    }

# Only Shopkeepers can access this route
@router.get("/shopkeeper-only")
def shopkeeper_endpoint(current_user: User = Depends(require_role(["shopkeeper"]))):
    return {"message": f"Hello, Shopkeeper {current_user.username}!"}

# Only Salesman can access this route
@router.get("/salesman-only")
def salesman_endpoint(current_user: User = Depends(require_role(["salesman"]))):
    return {"message": f"Hello, Salesman {current_user.username}!"}

# Only Warehouse Managers can access this route
@router.get("/warehouse-manager-only")
def warehouse_manager_endpoint(current_user: User = Depends(require_role(["warehouse_manager"]))):
    return {"message": f"Hello, Warehouse Manager {current_user.username}!"}

# Only Manufacturers can access this route
@router.get("/manufacturer-only")
def manufacturer_endpoint(current_user: User = Depends(require_role(["manufacturer"]))):
    return {"message": f"Hello, Manufacturer {current_user.username}!"}

# Multiple roles can access this route
@router.get("/admin-or-manager")
def multi_role(current_user: User = Depends(require_role(["manufacturer", "warehouse_manager"]))):
    return {"message": f"Hello, {current_user.role} {current_user.username}!"}