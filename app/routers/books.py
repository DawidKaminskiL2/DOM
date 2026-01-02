from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

from app import models, schemas
from app.database import SessionLocal

router = APIRouter(prefix="/books")
security = HTTPBasic()


def get_current_username(credentials: HTTPBasicCredentials = Depends(security)):
    # Login: admin, Hasło: secret
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(credentials.password, "secret")

    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def list_books(db: Session = Depends(get_db)):
    return db.query(models.Book).all()


@router.get("/{book_id}", response_model=schemas.Book)
def get_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    return book



@router.post("/", response_model=schemas.Book)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db), username: str = Depends(get_current_username)):
    obj = models.Book(title=book.title, author=book.author, description=book.description, year=book.year)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db), username: str = Depends(get_current_username)):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted successfully"}


@router.put("/{book_id}", response_model=schemas.Book)
def update_book(book_id: int, book_update: schemas.BookCreate, db: Session = Depends(get_db),
                username: str = Depends(get_current_username)):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()

    if db_book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    db_book.title = book_update.title
    db_book.author = book_update.author
    db_book.description = book_update.description
    db_book.year = book_update.year

    db.commit()
    db.refresh(db_book)

    return db_book