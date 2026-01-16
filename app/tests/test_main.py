import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base
from app import models
from app.routers.books import get_db

# 1. Konfiguracja testowej bazy danych
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 2. Nadpisanie zależności
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# Dane do logowania
AUTH_DATA = ("admin", "secret")

# 3. Fixture bazy danych
@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

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
    create_res = client.post(
        "/books/", 
        json={"title": "B1", "author": "A1", "year": 2020}, 
        auth=AUTH_DATA
    )
    assert create_res.status_code in [200, 201]

    response = client.get("/books/")
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_update_book():
    # 1. Dodajemy książkę
    create_res = client.post(
        "/books/", 
        json={"title": "Old Title", "author": "Old Author", "year": 1990},
        auth=AUTH_DATA
    )
    book_id = create_res.json()["id"]

    # 2. Edytujemy (Z UKOŚNIKIEM)
    response = client.put(
        f"/books/{book_id}/",  # 👈 To jest kluczowe
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

    # 2. Usuwamy (Z UKOŚNIKIEM)
    response = client.delete(f"/books/{book_id}/", auth=AUTH_DATA) # 👈 I tutaj
    assert response.status_code in [200, 204]

    # Sprawdzenie czy usunięto
    get_res = client.get(f"/books/{book_id}/")
    assert get_res.status_code == 404
