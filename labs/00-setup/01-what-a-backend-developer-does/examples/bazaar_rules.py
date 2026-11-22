# bazaar_rules.py: the kind of rules a backend developer writes.
# Run it with: python3 bazaar_rules.py

# Bazaar's products. In a real backend these live in a database.
PRODUCTS = {
    1: {"name": "Red Running Shoes", "price": 999, "stock": 12},
    3: {"name": "Masala Box", "price": 299, "stock": 50},
    5: {"name": "Steel Water Bottle", "price": 349, "stock": 0},
}


def place_order(product_id, quantity, price_sent_by_phone):
    """Check an order the way Bazaar's backend would."""
    product = PRODUCTS.get(product_id)
    if product is None:  # rule 1: the product must exist
        return "Rejected: product not found"
    if quantity < 1:  # rule 2: you must buy at least one
        return "Rejected: quantity must be at least 1"
    if product["stock"] < quantity:  # rule 3: we cannot sell what we do not have
        return f"Rejected: only {product['stock']} {product['name']} left"
    if price_sent_by_phone != product["price"]:  # rule 4: never trust the price from the phone
        print(f"  (warning: phone said ₹{price_sent_by_phone}, real price is ₹{product['price']})")
    total = product["price"] * quantity  # always use OUR price, from OUR data
    product["stock"] -= quantity  # update the stock
    return f"Accepted: {quantity} x {product['name']} = ₹{total}"


print(place_order(3, 2, 299))  # a normal order
print(place_order(5, 1, 349))  # out of stock
print(place_order(1, 1, 1))    # someone edited the app to send price ₹1
print(place_order(42, 1, 100)) # a product that does not exist
