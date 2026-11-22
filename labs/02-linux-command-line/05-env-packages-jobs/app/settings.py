# settings.py: Bazaar reads its settings from environment variables, not from the code.
# Run it with: python3 settings.py

import os
import sys

DB_HOST = os.environ.get("DB_HOST", "localhost")               # a setting with a default
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"      # environment values are always text
DB_PASSWORD = os.environ.get("DB_PASSWORD")                     # a secret: no default on purpose

if not DB_PASSWORD:
    sys.exit("ERROR: DB_PASSWORD is not set. Put it in the environment, never in the code.")

print(f"DB_HOST     = {DB_HOST}")
print(f"DEBUG       = {DEBUG}")
print(f"DB_PASSWORD = {DB_PASSWORD[:2]}{'*' * (len(DB_PASSWORD) - 2)}")   # never print a whole secret
