# welcome.py: runs inside a container to prove Docker Compose works.
import platform

print("Hello from inside a container!")
print(f"Python {platform.python_version()} on {platform.system()}")
print("Bazaar says: welcome, your setup works.")
