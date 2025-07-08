from pydantic import BaseModel
from typing import Optional
from datetime import datetime



class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    is_admin: Optional[bool] = False
    role: str = "student"
    secret_question: str
    secret_answer: str



class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_admin: bool

    model_config = {
        "from_attributes": True
    }



class TestBase(BaseModel):
    title: str
    description: Optional[str] = ""
    creator_id: int
    time_limit: Optional[int] = 5


class TestCreate(TestBase):
    category: Optional[str] = "Общи"


class TestOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    creator_id: Optional[int]   # <-- промяна тук
    time_limit: int
    category: str

    model_config = {
        "from_attributes": True
    }



class ResultOut(BaseModel):
    id: int
    user_id: int
    test_id: int
    score: float
    timestamp: datetime

    model_config = {
        "from_attributes": True
    }
