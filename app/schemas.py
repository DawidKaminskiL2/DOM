from pydantic import BaseModel


class BookBase(BaseModel):
    title: str
    author: str
    description: str | None = None
    year: int | None = None


class BookCreate(BookBase):
    pass


class Book(BookBase):
    id: int

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str


class User(BaseModel):
    id: int
    username: str
    class Config:
        from_attributes = True