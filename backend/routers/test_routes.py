from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, crud
from database import SessionLocal

router = APIRouter()

# Връща сесия към базата
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/users/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db, user)

@router.post("/tests/", response_model=schemas.TestOut)
def create_test(test: schemas.TestCreate, db: Session = Depends(get_db)):
    return crud.create_test(db, test)

@router.get("/tests/", response_model=list[schemas.TestOut])
def read_tests(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_tests(db, skip=skip, limit=limit)
