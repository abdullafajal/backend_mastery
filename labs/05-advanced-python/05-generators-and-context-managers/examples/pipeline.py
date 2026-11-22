"""Reading 200,000 orders with a pipeline of generators: only ONE line is in memory at a time."""


def read_lines(path):
    with open(path, encoding="utf-8") as f:
        for line in f:                          # a file is already a generator of lines
            yield line.rstrip("\n")


def parse(lines):
    for line in lines:
        number, customer, product, price, status = line.split(",")
        yield {"customer": customer, "product": product, "price_paise": int(price), "status": status}


def paid_only(orders):
    for order in orders:
        if order["status"] == "PAID":
            yield order


paid = paid_only(parse(read_lines("data/orders.log")))    # nothing has been read yet
count = 0
total = 0
for order in paid:                                          # now the lines flow through, one by one
    count += 1
    total += order["price_paise"]
print(f"paid orders: {count:,}")
print(f"paid total:  ₹{total // 100:,}")
