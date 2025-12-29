from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
import time
import sqlalchemy
from .routers.auth import router as auth_router
from .routers.protected import router as protected_router
from .routers.orders import router as orders_router


app = FastAPI(title="Distributor Automation System")
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(orders_router)

# Improved startup: Wait for DB with retries
@app.on_event("startup")
def on_startup():
    max_retries = 20
    retry_delay = 3  # seconds

    for attempt in range(1, max_retries + 1):
        try:
            print(f"Attempting to connect to database... (attempt {attempt}/{max_retries})")
            Base.metadata.create_all(bind=engine)
            print("Database connected and tables created successfully!")
            return
        except sqlalchemy.exc.OperationalError as e:
            if "Connection refused" in str(e) or "Can't connect" in str(e):
                print("Database not ready yet. Retrying in {} seconds...".format(retry_delay))
                time.sleep(retry_delay)
            else:
                raise  # If it's a different error, crash immediately

    raise Exception("Failed to connect to database after multiple attempts")

@app.get("/")
def read_root():
    return {"message": "FastAPI connected to MySQL!"}

@app.get("/test-db")
def test_db(db: Session = Depends(get_db)):
    try:
        db.execute("SELECT 1")
        return {"status": "MySQL connection successful!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")
