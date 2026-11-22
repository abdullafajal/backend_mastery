"""Type hints say what a function expects and returns. Python itself does NOT check them while running."""


def line_total(price_paise: int, quantity: int) -> int:
    return price_paise * quantity


print(line_total(29900, 2))
print(line_total("299", 2))        # wrong type, but Python runs it anyway: str * int repeats the text
