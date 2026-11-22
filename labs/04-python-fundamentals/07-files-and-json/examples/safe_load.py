"""Loading a cart safely: a missing file means an empty cart; a broken file gets a clear message."""

import json


def load_cart(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:                      # first visit: no saved cart yet
        return {"items": []}
    except json.JSONDecodeError as error:          # the file isn't valid JSON
        print(f"{path} is broken ({error}); starting with an empty cart")
        return {"items": []}


with open("data/broken.json", "w", encoding="utf-8") as f:
    f.write('{"items": [')                         # half a file, as if the disk filled up mid-save

print(load_cart("data/no_such_cart.json"))
print(load_cart("data/broken.json"))
