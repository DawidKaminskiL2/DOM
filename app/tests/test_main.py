import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base
from app.routers.books import get_db

# 1. Konfiguracja testowej bazy danych
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# 2. Nadpisanie zależności bazy danych w FastAPI
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

# 3. Klient testowy
client = TestClient(app)


# 4. Przygotowanie tabel przed testami
@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# --- TESTY ---

def test_create_book():
    response = client.post(
        "/books/",
        json={"title": "Test Book", "author": "Tester", "year": 2024},
        auth = ("admin", "secret")
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Book"
    assert "id" in data


def test_read_books():
    # Najpierw dodaj książkę
    client.post("/books/", json={"title": "B1", "author": "A1"})

    response = client.get("/books/")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_update_book():
    # Dodaj książkę
    create_res = client.post("/books/", json={"title": "Old Title", "author": "Old Author"})
    book_id = create_res.json()["id"]

    # Edytuj (PUT)
    response = client.put(
        f"/books/{book_id}",
        json={"title": "New Title", "author": "Old Author", "year": 2000},
        auth = ("admin", "secret")
    )
    assert response.status_code == 200
    assert response.json()["title"] == "New Title"


def test_delete_book():
    create_res = client.post("/books/", json={"title": "To Delete", "author": "X"}, auth=("admin", "secret"))
    book_id = create_res.json()["id"]

    response = client.delete(f"/books/{book_id}")
    assert response.status_code == 200

    # Sprawdź czy zniknęła
    get_res = client.get(f"/books/{book_id}")
    assert get_res.status_code == 404