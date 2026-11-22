"""JSON is text. json.dumps turns Python data into JSON text; json.loads turns it back."""

import json

cart = {"customer": "Ravi", "items": [("Cotton Kurta", 1)], "coupon": None, "gift": True}

text = json.dumps(cart)                # dumps = dump to a String
print(text)
print(type(text).__name__)

back = json.loads(text)                # loads = load from a String
print(back)                            # the tuple came back as a list: JSON has no tuples
