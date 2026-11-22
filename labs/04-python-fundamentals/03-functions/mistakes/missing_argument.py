def delivery_charge(total):
    if total >= 99900:
        return 0
    return 4900


print(delivery_charge())
