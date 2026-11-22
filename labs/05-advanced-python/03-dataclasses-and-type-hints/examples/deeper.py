"""Going deeper: hints for containers and 'maybe nothing', and dataclass options."""

from dataclasses import dataclass, field


@dataclass(order=True)                          # order=True also writes <, <=, >, >= (compares fields in order)
class Product:
    price_paise: int                            # first field = first thing compared, so sorting goes by price
    name: str
    tags: list[str] = field(default_factory=list)


def find(catalog: list[Product], name: str) -> Product | None:     # "a Product, or None if not found"
    for product in catalog:
        if product.name == name:
            return product
    return None


stock_by_name: dict[str, int] = {"Masala Box": 40, "Cotton Kurta": 25}

catalog = [Product(149900, "Wireless Earbuds"), Product(29900, "Masala Box", ["spices"])]
print([p.name for p in sorted(catalog)])
print(find(catalog, "Masala Box"))
print(find(catalog, "Gold Watch"))
print(stock_by_name["Cotton Kurta"])
