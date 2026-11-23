"""O(log n): find a price in a SORTED list by halving the search space each step."""


def binary_search(sorted_prices, target):
    low, high, steps = 0, len(sorted_prices) - 1, 0
    while low <= high:
        steps += 1
        middle = (low + high) // 2
        if sorted_prices[middle] == target:
            return middle, steps
        if sorted_prices[middle] < target:
            low = middle + 1                              # throw away the left half
        else:
            high = middle - 1                             # throw away the right half
    return -1, steps


prices = list(range(100, 100_000_100, 100))              # 1,000,000 sorted prices in paise
for target in [29900, 64900, 99_999_900, 12345]:
    index, steps = binary_search(prices, target)
    print(f"{target:>11,}: index {index:>7,} after {steps} steps")
