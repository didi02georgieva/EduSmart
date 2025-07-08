from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.types import JSON
from database import Base
from sqlalchemy import Column, DateTime
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="student")
    
    secret_question = Column(String, nullable=True)
    secret_answer = Column(String, nullable=True)

    tests = relationship("Test", back_populates="creator")
    results = relationship("Result", back_populates="user")
    answers = relationship("Answer", back_populates="student")



class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    creator_id = Column(Integer, ForeignKey("users.id"))
    time_limit = Column(Integer, default=5)
    category = Column(String, default="Общи")

    creator = relationship("User", back_populates="tests")
    questions = relationship("Question", back_populates="test")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False, default="multiple_choice")
    correct_answer = Column(Text, nullable=True)
    expected_answer = Column(Text, nullable=True)

    test_id = Column(Integer, ForeignKey("tests.id"))
    test = relationship("Test", back_populates="questions")


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    question_id = Column(Integer, ForeignKey("questions.id"))

    answer_text = Column(Text, nullable=True)
    score = Column(Float, nullable=True)

    student_answer = Column(Text, nullable=True)
    reviewed_score = Column(Float, nullable=True)

    student = relationship("User", back_populates="answers")
    question = relationship("Question")


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    test_id = Column(Integer, ForeignKey("tests.id"))
    score = Column(Integer)
    selected_answers = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="results")


class TestAccess(Base):
    __tablename__ = "test_access"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    test = relationship("Test", backref="access_list")
    user = relationship("User", backref="test_access")
