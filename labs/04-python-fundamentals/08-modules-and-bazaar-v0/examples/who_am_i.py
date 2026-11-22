"""Every module has a __name__. It is "__main__" only for the file you ran."""

print("who_am_i.py says its __name__ is", repr(__name__))

if __name__ == "__main__":
    print("I was run directly, so this part runs too.")
