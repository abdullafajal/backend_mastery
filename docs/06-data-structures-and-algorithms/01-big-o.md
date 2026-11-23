# Big-O: how work grows

<div class="bz-meta" markdown>
**Module** 6 · Data structures and algorithms for backend
**Lesson** 1
**Reading time** 15 min (+ optional deeper parts)
**You will build** a lookup in 1,000,000 products that's 10,000 times faster, a 20-step search through a million prices, and a repeat-customer check that goes from seconds to instant
</div>

!!! abstract "In 1 minute"
    - **Big-O** describes how the work an algorithm does **grows** as the data grows. It ignores the exact seconds; it cares about the shape.
    - **O(1)**: the same work for 10 or 10 million items (a set or dict lookup). **O(n)**: twice the items, twice the work (`x in a_list`).
    - **O(log n)**: each step halves what's left, so a million items need only 20 steps (binary search on sorted data).
    - **O(n²)**: a loop inside a loop. Fine for 100 items, hopeless for a million.
    - The fix is often just the right **data structure**: in the lab, a set instead of a list makes a lookup about 20,000 times faster.

> **Previously in Bazaar:** Module 5 ended with 100 supplier calls in 0.2 s using asyncio.

## 1. Why learn this?

Bazaar's code worked fine with 5 products. Now the catalog has a million, and some pages take seconds. Nobody changed the code; the data grew.

A backend's data **always** grows. Code that's fine today can be unusable next year, and the reason is almost never "Python is slow".
It's an algorithm that does far more work than it needs to, like checking every product one by one when a set could jump straight to the answer.

Big-O gives you the words to spot this **before** it happens, and it's in every backend interview. This module then covers the data structures behind
caches, database indexes and job queues, all in Bazaar's terms.

## 2. The concept

### Count the steps, not the seconds

Seconds depend on the computer. **Steps** don't. Big-O asks: if the input has **n** items, roughly how many steps does the algorithm take?

```python title="count_steps.py"
--8<-- "labs/06-data-structures-and-algorithms/01-big-o/examples/count_steps.py"
```

```
        n   O(1)  O(log n)       O(n)   O(n log n)            O(n²)
       10      1         4         10           40              100
      100      1         7        100          700           10,000
    1,000      1        10      1,000       10,000        1,000,000
   10,000      1        14     10,000      140,000      100,000,000
1,000,000      1        20  1,000,000   20,000,000 1,000,000,000,000
```

Read the last line: for a million items, O(log n) needs 20 steps and O(n²) needs a **trillion**. At one microsecond per step, that's 20 µs versus 11.6 days.

### The five you'll meet all the time

| Big-O | Name | Bazaar example |
| --- | --- | --- |
| O(1) | constant | `price_of["Masala Box"]` in a dict; `sku in a_set` |
| O(log n) | logarithmic | finding a price in a sorted list by halving (binary search); a database index |
| O(n) | linear | `sku in a_list`; adding up every order |
| O(n log n) | "n log n" | sorting the catalog by price (`sorted()`) |
| O(n²) | quadratic | for each order, check every other order |

Big-O keeps only the part that grows fastest and drops constant factors: an algorithm doing `3n + 5` steps is still **O(n)**.

### O(n) vs O(1): a list vs a set

Is a product id in the catalog of 1,000,000?

```python title="list_vs_set.py"
--8<-- "labs/06-data-structures-and-algorithms/01-big-o/examples/list_vs_set.py"
```

```
list: 200 found, 9.5 ms per lookup
set:  200 found, 0.5 µs per lookup
the set was about 19,800 times faster
```

(Your times will differ; the ratio stays huge.) `x in a_list` walks the list from the start: up to a million comparisons. `x in a_set` uses a hash
(Module 4; Lesson 3 explains it fully) to jump straight to where the item would be. Same question, same answer, a different data structure.

### O(log n): halve it each time

If the data is **sorted**, you don't need to look at everything. Look at the middle: too small? Throw away the left half. Too big? The right half.

```python title="binary_search.py"
--8<-- "labs/06-data-structures-and-algorithms/01-big-o/examples/binary_search.py"
```

```
     29,900: index     298 after 19 steps
     64,900: index     648 after 19 steps
 99,999,900: index 999,998 after 19 steps
     12,345: index      -1 after 20 steps
```

A million prices, never more than 20 steps, even to find out that 12,345 isn't there. Double the data, and it costs just **one** more step.
Database indexes (Lesson 5) work on this idea.

### O(n²): the loop inside a loop

The classic slow code: for each of today's orders, search a **list** of past customers. 20,000 orders × 20,000 past customers = up to 400 million comparisons.
That's this lesson's exercise (part 4).

### An analogy

Finding Priya's order slip:

- **O(n):** the slips are in a pile. You check them one by one. Twice the pile, twice the time.
- **O(log n):** the slips are filed by order number. Open the file in the middle, decide which half, repeat. A pile of a million: about 20 looks.
- **O(1):** there's a pigeonhole with Priya's name on it. You reach straight in, however many pigeonholes there are.
- **O(n²):** for **every** slip in today's pile, you search the **whole** of yesterday's pile. The shop closes before you finish.

### Questions you may have

**Is O(1) always faster than O(n)?** For big n, yes. For tiny n (5 items), a list can even win: Big-O is about how things **grow**, not small cases.

**Do I need maths for this?** No. Count loops: one loop over the data is O(n); a loop inside a loop is O(n²); halving is O(log n); a dict/set lookup is O(1).

**Does memory have a Big-O too?** Yes, "space complexity". A set uses more memory than a list of the same items, the price of its speed. Module 5's generators were the O(1)-memory trick.

## 3. See it in action

Type n (try 100, then 1,000,000), then press **Play**.

<div class="bz-diagram" data-diagram="big-o"></div>

## 4. Code example

The lab's exercise: which of today's 20,000 orders come from customers who ordered before? It works, but slowly:

```python title="exercises/repeat_customers.py"
--8<-- "labs/06-data-structures-and-algorithms/01-big-o/exercises/repeat_customers.py"
```

```
repeat customers: 386
took 3.47 s
```

`customer in past_customers` is O(n) on a list, and it runs once per order: O(n) × n = **O(n²)**. The fix builds a set **once** (O(n)),
then each check is O(1):

```python title="solutions/repeat_customers.py (lines 11-17)"
--8<-- "labs/06-data-structures-and-algorithms/01-big-o/solutions/repeat_customers.py:11:17"
```

```
repeat customers: 386
took 0.00 s
```

Same answer. From 3.5 seconds to under a hundredth. At Diwali scale (10× the data), the slow version would take 100× longer: about 6 minutes.

## 5. Under the hood

### A set built in the wrong place

```python title="mistakes/set_in_loop.py"
--8<-- "labs/06-data-structures-and-algorithms/01-big-o/mistakes/set_in_loop.py"
```

```
repeat customers: 28, took 1.22 s
```

`set(past_customers)` inside the loop rebuilds a 20,000-item set for **every** order: O(n) work, n times, O(n²) again, even with only 2,000 orders.
Build the set (or dict) **once**, before the loop.

### What's O(1) and what isn't, in Python

| Operation | Cost |
| --- | --- |
| `d[key]`, `key in d`, `x in a_set` | O(1) |
| `a_list[i]`, `a_list.append(x)`, `a_list.pop()` | O(1) |
| `x in a_list`, `a_list.index(x)`, `a_list.remove(x)` | O(n) |
| `a_list.insert(0, x)`, `a_list.pop(0)` | O(n): everything shifts (Lesson 2) |
| `sorted(a_list)`, `a_list.sort()` | O(n log n) |

??? note "Going deeper: average vs worst case, and amortised cost"

    - Big-O usually means the **worst case**. Binary search's worst case is 20 steps for a million; its best case is 1 (the middle is the answer).
    - A dict lookup is O(1) **on average**. With many hash collisions it can degrade (Lesson 3).
    - `list.append` is **amortised** O(1): now and then the list must grow and copy itself (O(n)), but spread over all appends, each costs O(1) on average.
    - `bisect` (standard library) does binary search for you: `bisect.bisect_left(prices, 64900)`.

??? note "Going deeper: where Big-O bites a backend"

    - **N+1 queries:** a page loops over 100 orders and makes one database query per order. That's 101 round trips: O(n) network calls where one query would do (Module 17).
    - **Missing index:** without an index, a database checks every row: O(n). With one, it walks a B-tree: O(log n) (Lesson 5, Module 17).
    - **Sorting in a loop:** calling `sorted()` inside a loop is O(n² log n). Sort once, outside.
    - Measure with real data. Big-O tells you **why** it's slow; a profiler (`python -m cProfile`) tells you **where**.

## 6. Lab

**Lab folder:** `labs/06-data-structures-and-algorithms/01-big-o/`

```bash
cd labs/06-data-structures-and-algorithms/01-big-o
docker compose run --rm python
```

Print the step table, time a million-item lookup in a list vs a set, find prices with binary search in at most 20 steps,
see a set built in the wrong place, and fix the repeat-customer check from seconds to instant.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **`x in a_list` inside a loop.** O(n²) hiding in one line. **Fix:** build a set or dict once, then look up in O(1).
2. **Building the set inside the loop.** Same O(n²), different place. **Fix:** build it once, before the loop.
3. **Binary search on unsorted data.** Wrong answers, no error. **Fix:** sort first (O(n log n)), or use a set.
4. **Testing only with tiny data.** Everything is fast with 5 products. **Fix:** test with realistic sizes (a million rows).
5. **Optimising the wrong thing.** Shaving a constant off O(n) while an O(n²) loop sits next to it. **Fix:** find the worst growth first.

## 8. Quiz

<div class="bz-quiz" data-quiz="m06-01"></div>

## 9. What's next

Next: how a Python list is really stored, why inserting at the front is slow, and the linked list that does it in O(1): Arrays and linked lists *(coming soon)*.

**In one line:** Big-O describes how work grows with n: O(1) set/dict lookups, O(log n) halving, O(n) one pass, O(n log n) sorting, O(n²) loops inside loops;
choosing the right data structure often turns seconds into microseconds.

### Cheat sheet

| You see | It's usually |
| --- | --- |
| a dict/set lookup | O(1) |
| halving sorted data | O(log n) |
| one loop over the data, or `x in a_list` | O(n) |
| `sorted()` | O(n log n) |
| a loop inside a loop over the same data | O(n²) |

| Instead of | Use |
| --- | --- |
| `x in a_list` in a loop | `s = set(a_list)` once, then `x in s` |
| searching a list for a product by name | `by_name = {p["name"]: p for p in catalog}` once |
| scanning a sorted list | `bisect.bisect_left(...)` |

> **Next in Bazaar:** the "recently viewed" list puts the newest product at the front, and it's getting slow. Why is adding to the front of a Python list
> O(n)? Next lesson: arrays and linked lists.

<div class="bz-complete" data-lesson="m06-01"></div>
