"""Bazaar's Cart as a dataclass, fixed: field(default_factory=list) makes a new list for every cart."""

from dataclasses import dataclass, field


@dataclass
class Cart:
    customer: str
    lines: list = field(default_factory=list)       # list() is called for each new Cart

    def add(self, name: str, quantity: int = 1) -> None:
        self.lines.append((name, quantity))


asha, ravi = Cart("Asha"), Cart("Ravi")
ravi.add("Cotton Kurta")
print("Asha:", asha.lines)
print("Ravi:", ravi.lines)
