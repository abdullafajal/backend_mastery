"""Average PAID order value, fixed: count and add in ONE pass, because a generator can only be used once."""


def paid_amounts(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            number, customer, product, price, status = line.rstrip("\n").split(",")
            if status == "PAID":
                yield int(price)


total = 0
count = 0
for amount in paid_amounts("data/orders.log"):    # one pass: both numbers at once
    total += amount
    count += 1
print(f"average paid order: ₹{total // count // 100:,}")
