"""Average PAID order value from the log. BUG: it crashes with ZeroDivisionError.
Your task: find why `count` is 0, and fix it (hint: a generator can be used up only once)."""


def paid_amounts(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            number, customer, product, price, status = line.rstrip("\n").split(",")
            if status == "PAID":
                yield int(price)


amounts = paid_amounts("data/orders.log")
total = sum(amounts)
count = sum(1 for _ in amounts)
print(f"average paid order: ₹{total // count // 100:,}")
