"""Importing a module runs it once, but its __name__ is its own name, so the __main__ part is skipped."""

import who_am_i                               # runs who_am_i.py from the top

print("import_it.py is", repr(__name__))
