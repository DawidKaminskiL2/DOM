from fastapi import FastAPI, Request
from app.routers import books
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from app.init_db import init_db
from prometheus_fastapi_instrumentator import Instrumentator

# 1. Tworzymy tabele
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LibraryLite")

# 2. CORS - pozwala frontendowi na komunikację z API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Dodanie endpointów API
app.include_router(books.router)

# 3. Monitoring
Instrumentator().instrument(app).expose(app)

# 5. Inicjalizacja danych przy starcie
@app.on_event("startup")
async def startup_event():
    try:
        init_db()
        print("Baza danych zainicjalizowana (sample data).")
    except Exception as e:
        print(f"Błąd podczas inicjalizacji bazy: {e}")

@app.get("/")
def read_root():
    return {"message": "LibraryLite API is running", "docs": "/docs"}



if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
