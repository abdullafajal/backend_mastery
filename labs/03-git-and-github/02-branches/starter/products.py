"""Bazaar's product catalog, version 0. Prices are in paise (₹1 = 100 paise), never float."""

PRODUCTS = [
    {"name": "Red Running Shoes", "price_paise": 99900, "seller": "Kumar Footwear"},
    {"name": "Cotton Kurta", "price_paise": 64900, "seller": "Meera Handloom"},
    {"name": "Masala Box", "price_paise": 29900, "seller": "Patel Spices"},
    {"name": "Wireless Earbuds", "price_paise": 149900, "seller": "Sharma Electronics"},
]


def rupees(paise):
    return f"₹{paise // 100:,}"          # 149900 -> "₹1,499"


if __name__ == "__main__":
    for p in PRODUCTS:
        print(f"{p['name']:<20} {rupees(p['price_paise']):>7}  ({p['seller']})")
