def order_numbers():
    yield 1001
    yield 1002


numbers = order_numbers()
print(next(numbers), next(numbers))
print(next(numbers))                 # nothing left
