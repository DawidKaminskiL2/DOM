import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base
from app import models
from app.routers.books import get_db

# 1. Konfiguracja testowej bazy danych
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool 
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Konfiguracja haszowania
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. Nadpisanie zależności bazy danych
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Dane logowania
AUTH_USERNAME = "admin"
AUTH_PASSWORD = "secret"
AUTH_DATA = (AUTH_USERNAME, AUTH_PASSWORD)

# 3. Fixture bazy danych
@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        user = models.User(
            username=AUTH_USERNAME,         
            password_hash=AUTH_PASSWORD
        )
        db.add(user)
        db.commit()
    except Exception as e:
        print(f"DEBUG: Błąd podczas tworzenia admina: {e}")
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)

# --- TESTY ---

def test_create_book():
    response = client.post(
        "/books/",
        json={"title": "Test Book", "author": "Tester", "year": 2024},
        auth=AUTH_DATA 
    )
    assert response.status_code in [200, 201]
    data = response.json()
    assert data["title"] == "Test Book"
    assert "id" in data

def test_read_books():
    # 1. Dodajemy książkę
    create_res = client.post(
        "/books/", 
        json={"title": "B1", "author": "A1", "year": 2020}, 
        auth=AUTH_DATA
    )
    assert create_res.status_code in [200, 201]

    # 2. Pobieramy listę
    response = client.get("/books/")
    assert response.status_code == 200
    assert len(response.json()) >= 1 

def test_update_book():
    # 1. Dodajemy książkę
    create_res = client.post(
        "/books/", 
        json={"title": "Old Title", "author": "Old Author", "year": 1990},
        auth=AUTH_DATA
    )
    book_id = create_res.json()["id"]

    # 2. Edytujemy
    response = client.put(
        f"/books/{book_id}/",
        json={"title": "New Title", "author": "Old Author", "year": 2000},
        auth=AUTH_DATA
    )
    assert response.status_code == 200
    assert response.json()["title"] == "New Title"

def test_delete_book():
    # 1. Dodajemy książkę
    create_res = client.post(
        "/books/", 
        json={"title": "To Delete", "author": "X", "year": 2021}, 
        auth=AUTH_DATA
    )
    book_id = create_res.json()["id"]

    # 2. Usuwamy
    response = client.delete(f"/books/{book_id}/", auth=AUTH_DATA)
    assert response.status_code in [200, 204]
    
    # 3. Sprawdzamy czy zniknęła
    get_res = client.get(f"/books/{book_id}/")
    assert get_res.status_code == 404
