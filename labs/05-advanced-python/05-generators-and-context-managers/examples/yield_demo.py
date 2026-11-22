"""A generator pauses at each yield and carries on from there when asked for the next value."""


def order_numbers():
    print("  (generator starts)")
    yield 1001                              # hand out a value, then PAUSE here
    print("  (generator resumes)")
    yield 1002
    print("  (generator resumes again)")
    yield 1003
    print("  (generator ends)")


numbers = order_numbers()                   # nothing runs yet: you get a generator object
print(type(numbers).__name__)
print(next(numbers))                        # run until the first yield
print(next(numbers))                        # carry on until the next yield
for n in numbers:                           # a for loop calls next() for you, until the end
    print(n)
