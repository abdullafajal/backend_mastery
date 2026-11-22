"""Bazaar's Cart as a dataclass. BUG: Python refuses to even create the class.
Your task: read the error, and give every cart its own new list."""

from dataclasses import dataclass


@dataclass
class Cart:
    customer: str
    lines: list = []

    def add(self, name: str, quantity: int = 1) -> None:
        self.lines.append((name, quantity))


asha, ravi = Cart("Asha"), Cart("Ravi")
ravi.add("Cotton Kurta")
print("Asha:", asha.lines)
print("Ravi:", ravi.lines)
