from sqlalchemy import text
from database import SessionLocal

db = SessionLocal()

db.execute(text("TRUNCATE users, tests, questions, answers, results, test_access RESTART IDENTITY CASCADE;"))
db.commit()
db.close()
