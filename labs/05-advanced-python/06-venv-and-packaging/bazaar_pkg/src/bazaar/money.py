"""Money helpers for Bazaar. Every amount is an int number of paise (₹1 = 100 paise)."""


def rupees(paise):
    """Show paise as text, like ₹1,531.64. Only for showing; do the maths in paise."""
    return f"₹{paise // 100:,}.{paise % 100:02d}"


def parse_rupees(text):
    """Turn what a person typed ("299", "1,499" or "299.50") into paise. Raise ValueError for anything else."""
    cleaned = text.strip().replace(",", "")
    whole, dot, part = cleaned.partition(".")            # "299.50" -> "299", ".", "50"
    if not whole.isdigit() or (dot and not (part.isdigit() and len(part) <= 2)):
        raise ValueError(f"not a price: {text!r}")
    return int(whole) * 100 + (int(part.ljust(2, "0")) if part else 0)


if __name__ == "__main__":          # True only when you run: python3 money.py
    print(rupees(153164), parse_rupees("299"), parse_rupees("1,499.5"))
