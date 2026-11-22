"""Defaults, a fresh list per object, checks in __post_init__, and frozen (unchangeable) objects."""

from dataclasses import dataclass, field


@dataclass
class Product:
    name: str
    price_paise: int
    seller: str
    stock: int = 0                                    # a default value: can be left out

    def __post_init__(self):                          # runs right after the generated __init__
        if not isinstance(self.price_paise, int) or self.price_paise <= 0:
            raise ValueError(f"price_paise must be a whole number above 0, not {self.price_paise!r}")


@dataclass
class Cart:
    customer: str
    lines: list = field(default_factory=list)        # a NEW empty list for every cart


@dataclass(frozen=True)                               # frozen: can't be changed after it's made
class Coupon:
    code: str
    discount_paise: int


print(Product("Cotton Kurta", 64900, "Meera Handloom"))
asha, ravi = Cart("Asha"), Cart("Ravi")
ravi.lines.append("Cotton Kurta")
print(asha.lines, ravi.lines)                         # Lesson 1's shared-list bug can't happen
try:
    Product("Masala Box", "cheap", "Patel Spices")
except ValueError as error:
    print("Refused:", error)
print(Coupon("DIWALI150", 15000))
