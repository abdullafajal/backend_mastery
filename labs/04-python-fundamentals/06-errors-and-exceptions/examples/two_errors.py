"""Different errors, different answers: one except per error type."""

price_of = {"Masala Box": 29900, "Cotton Kurta": 64900}

orders = [("Masala Box", "2"), ("Gold Watch", "1"), ("Cotton Kurta", "two")]
for name, quantity_text in orders:
    try:
        price = price_of[name]                     # KeyError if we don't sell it
        quantity = int(quantity_text)              # ValueError if it isn't a number
        print(f"{name} x{quantity}: ₹{price * quantity // 100:,}")
    except KeyError:
        print(f"{name}: sorry, Bazaar doesn't sell this")
    except ValueError as error:                    # `as error` keeps the error object
        print(f"{name}: bad quantity ({error})")
