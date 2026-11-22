#!/usr/bin/env bash
# verify_setup.sh: is your computer ready to build Bazaar?
# Run it from this folder:  bash verify_setup.sh
# Works on macOS, Linux, and Windows (inside "Git Bash", which comes with Git for Windows).
set -u
cd "$(dirname "$0")"

PROBLEMS=0
ok()   { echo "  ✓ $1"; }
bad()  { echo "  ✗ $1"; echo "      fix: $2"; PROBLEMS=$((PROBLEMS + 1)); }
warn() { echo "  ! $1"; echo "      tip: $2"; }

echo "Checking your Bazaar setup..."
echo

# 1. Python 3.13 or newer. Try the usual command names, keep the first good one.
PY_OK=""
for cmd in python3 python3.13 python py; do
  command -v "$cmd" >/dev/null 2>&1 || continue
  ver=$("$cmd" -c 'import sys; print("%d.%d.%d" % sys.version_info[:3])' 2>/dev/null) || continue
  major=${ver%%.*}; rest=${ver#*.}; minor=${rest%%.*}
  if [[ "$major" -eq 3 && "$minor" -ge 13 ]]; then PY_OK="$cmd ($ver)"; break; fi
  [[ -z "${PY_OLD:-}" ]] && PY_OLD="$cmd ($ver)"
done
if [[ -n "$PY_OK" ]]; then ok "Python: $PY_OK"
elif [[ -n "${PY_OLD:-}" ]]; then bad "Python is too old: $PY_OLD" "install Python 3.13 (Lesson 3), then open a new terminal"
else bad "Python not found" "install Python 3.13 (Lesson 3), then open a new terminal"; fi

# 2. Git
if ver=$(git --version 2>/dev/null); then ok "Git: ${ver#git version }"
else bad "Git not found" "install Git (this lesson), then open a new terminal"; fi

# 3. Git identity (only a warning: you can set it any time)
name=$(git config --global user.name 2>/dev/null || true)
email=$(git config --global user.email 2>/dev/null || true)
if [[ -n "$name" && -n "$email" ]]; then ok "Git identity: $name <$email>"
else warn "Git does not know your name and email yet" 'git config --global user.name "Your Name" && git config --global user.email "you@example.com"'; fi

# 4. Docker command
if ver=$(docker --version 2>/dev/null); then ok "Docker: ${ver#Docker version }"
else bad "Docker not found" "install Docker Desktop (Mac/Windows) or Docker Engine (Linux), then open a new terminal"; fi

# 5. Docker Engine running
if docker info >/dev/null 2>&1; then ok "Docker Engine is running"
else bad "Docker Engine is not running" "start Docker Desktop and wait until it says 'running' (Linux: sudo systemctl start docker)"; fi

# 6. Docker Compose v2
if ver=$(docker compose version --short 2>/dev/null); then ok "Docker Compose: $ver"
else bad "Docker Compose not found" "update Docker Desktop, or install the docker-compose-plugin package on Linux"; fi

# 7. A real container, started by Compose
if out=$(docker compose -p bz-verify run --rm -T welcome 2>/dev/null) && [[ "$out" == *"your setup works"* ]]; then
  ok "A container ran: \"$(echo "$out" | head -1)\""
else
  bad "Could not run a container" "fix the Docker problems above first; if there are none, check your internet (the first run downloads an image)"
fi
docker compose -p bz-verify down >/dev/null 2>&1 || true

# 8. VS Code 'code' command (only a warning)
if command -v code >/dev/null 2>&1; then ok "VS Code 'code' command found"
else warn "VS Code 'code' command not found" "in VS Code press Cmd/Ctrl+Shift+P and run: Shell Command: Install 'code' command in PATH"; fi

echo
if [[ $PROBLEMS -eq 0 ]]; then
  echo "Your computer is ready to build Bazaar!"
  exit 0
else
  echo "$PROBLEMS problem(s) to fix. Fix them one by one, then run this script again."
  exit 1
fi
