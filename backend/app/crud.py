from sqlalchemy.orm import Session
from .models import User
from .schemas import UserCreate
from .auth import hash_password

def create_user(db: Session, user: UserCreate):
    hashed = hash_password(user.password)
    db_user = User(
        username=user.username,
        hashed_password=hashed,
        role=user.role, 
        email=user.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()
