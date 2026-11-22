from dataclasses import dataclass


@dataclass
class Product:
    name: str
    stock: int = 0
    seller: str                   # a field without a default after one with a default
