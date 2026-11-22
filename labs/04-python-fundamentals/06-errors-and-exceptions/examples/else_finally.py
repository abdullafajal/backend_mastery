"""else runs when nothing went wrong; finally runs every time, error or not."""

for text in ["5", "five"]:
    try:
        quantity = int(text)
    except ValueError:
        print(f"{text!r}: not a number")
    else:                                          # only when try had no error
        print(f"{text!r}: {quantity} boxes")
    finally:                                       # always, like closing the shop door
        print("  (line checked)")
