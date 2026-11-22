"""Before decorators: a function is a value. You can store it, pass it in, and return it."""


def rupees(paise):
    return f"₹{paise // 100:,}"


show = rupees                                  # no (): store the function itself, don't call it
print(show(29900))


def apply_to_all(func, prices):                # a function that takes a function
    return [func(p) for p in prices]


print(apply_to_all(rupees, [29900, 64900]))


def make_discount(percent):                    # a function that BUILDS and returns a function
    def discount(paise):
        return paise * (100 - percent) // 100
    return discount


diwali = make_discount(10)
print(diwali(99900))                           # the inner function still remembers percent = 10
