"""Browser check for every page of the built site.

For every page that has diagrams or quizzes, in desktop-light AND mobile-dark:
  - each diagram draws an SVG, steps all the way to the end with Next,
    Back works, Reset returns to the intro
  - each quiz renders 5-10 questions, each with an explanation after answering
  - no JavaScript errors in the console
  - no horizontal page scroll
Screenshots of every diagram go to site-screens/ so a human (or Claude) can LOOK at them.

Usage:
  .venv/bin/mkdocs build --strict
  .venv-dev/bin/python scripts/check_site.py            # all pages
  .venv-dev/bin/python scripts/check_site.py 00-setup   # only pages whose URL contains this

One-time setup:
  uv venv .venv-dev --python 3.13 && uv pip install -r requirements-dev.txt --python .venv-dev/bin/python
  (uses your installed Google Chrome; or run `.venv-dev/bin/playwright install chromium` and set BZ_BROWSER=chromium)
"""

import functools
import http.server
import os
import re
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
SHOTS = ROOT / "site-screens"
PORT = 8765
MODES = {
    "desktop-light": dict(viewport={"width": 1280, "height": 900}, color_scheme="light"),
    "mobile-dark": dict(viewport={"width": 375, "height": 800}, color_scheme="dark", device_scale_factor=2),
}
fails = []


def check(ok, msg):
    print(("  PASS: " if ok else "  FAIL: ") + msg)
    if not ok:
        fails.append(msg)


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass

    handler = functools.partial(Quiet, directory=str(SITE))
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def pages(filter_text):
    for html in sorted(SITE.rglob("index.html")):
        rel = html.relative_to(SITE).parent.as_posix()
        rel = "" if rel == "." else rel + "/"
        if filter_text and filter_text not in rel:
            continue
        text = html.read_text(encoding="utf-8")
        if "bz-diagram" in text or "bz-quiz" in text:
            yield rel


def check_page(browser, rel, mode, opts):
    ctx = browser.new_context(**opts)
    page = ctx.new_page()
    errors = []
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))
    page.on("pageerror", lambda e: errors.append(str(e)))
    # don't wait for third-party fonts ("load"); our own scripts run at DOMContentLoaded
    page.goto(f"http://127.0.0.1:{PORT}/{rel}", wait_until="domcontentloaded")
    label = f"{mode} /{rel}"

    for i, d in enumerate(page.locator(".bz-diagram").all()):
        name = d.get_attribute("data-diagram")
        d.locator("svg").wait_for(timeout=5000)
        cap = d.locator(".bz-diagram__caption")
        nxt = d.get_by_role("button", name="Next ▶")
        guard = 0
        while not nxt.is_disabled() and guard < 60:
            nxt.click()
            guard += 1
        # read only the "Step x/y" label: the caption text right after it may start with a number too
        m = re.fullmatch(r"Step (\d+)/(\d+)", d.locator(".bz-diagram__step").inner_text().strip())
        check(m and m.group(1) == m.group(2), f"{label} [{name}] steps reach the end ({guard} steps)")
        page.wait_for_timeout(300)
        d.scroll_into_view_if_needed()
        d.screenshot(path=str(SHOTS / f"{rel.strip('/').replace('/', '__') or 'home'}__{name}__{mode}.png"))
        d.get_by_role("button", name="◀ Back").click()
        back_ok = guard == 1 or d.locator(".bz-diagram__step").inner_text().strip().startswith(f"Step {guard - 1}/")
        check(back_ok, f"{label} [{name}] Back goes one step back")
        d.get_by_role("button", name="↺ Reset").click()
        check("Step" not in cap.inner_text(), f"{label} [{name}] Reset returns to intro")

    for q in page.locator(".bz-quiz").all():
        qid = q.get_attribute("data-quiz")
        q.locator(".bz-quiz__q").first.wait_for(timeout=5000)
        qs = q.locator(".bz-quiz__q").all()
        check(5 <= len(qs) <= 10, f"{label} [quiz {qid}] has 5-10 questions (found {len(qs)})")
        for card in qs:
            card.locator(".bz-quiz__opt").first.click()
        explains = [e.inner_text().strip() for e in q.locator(".bz-quiz__explain").all()]
        check(all(len(e) > 15 for e in explains), f"{label} [quiz {qid}] every answer has an explanation")

    no_scroll = page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    check(no_scroll, f"{label} no horizontal scroll")
    check(not errors, f"{label} no console errors {errors if errors else ''}")
    ctx.close()


def main():
    if not SITE.exists():
        sys.exit("site/ not found. Run: .venv/bin/mkdocs build --strict")
    SHOTS.mkdir(exist_ok=True)
    filter_text = sys.argv[1] if len(sys.argv) > 1 else ""
    srv = serve()
    with sync_playwright() as p:
        kind = os.environ.get("BZ_BROWSER", "chrome")
        browser = p.chromium.launch(channel="chrome") if kind == "chrome" else p.chromium.launch()
        found = list(pages(filter_text))
        for rel in found:
            print(f"/{rel}")
            for mode, opts in MODES.items():
                check_page(browser, rel, mode, opts)
        browser.close()
    srv.shutdown()
    print(f"\nPages checked: {len(found)}. Screenshots: {SHOTS.relative_to(ROOT)}/")
    print("ALL CHECKS PASSED" if not fails else f"{len(fails)} CHECK(S) FAILED")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
