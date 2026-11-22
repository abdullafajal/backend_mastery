"""One function, used three times: turn paise into text like ₹1,531.64."""


def rupees(paise):                                   # def = define a function; paise = its input
    """Return paise as rupee text. Only for showing; do maths in paise."""
    return f"₹{paise // 100:,}.{paise % 100:02d}"    # return = hand this value back to the caller


print(rupees(29900))           # Masala Box
print(rupees(153164))          # Ravi's invoice total
print("Earbuds cost", rupees(149900))
