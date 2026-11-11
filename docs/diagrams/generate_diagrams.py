"""
Draws the report diagrams with matplotlib (Allen, Member 1).
  python docs/diagrams/generate_diagrams.py
Outputs: architecture.png, sequence.png, states.png (same folder)

The diagrams show the ECHO LIVE system as implemented on main:
client -> Booking Service -> Availability Service / Notification Service.
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Circle, FancyArrowPatch, FancyBboxPatch  # noqa: E402

OUT = Path(__file__).parent
INK, MUTED = "#1d2433", "#5b6478"
C_CLIENT, C_BOOK, C_AVAIL, C_NOTE, C_DB = "#dce8ff", "#ffe9cc", "#d9f2e3", "#f1e1ff", "#eef0f4"
RED, PURPLE = "#c0392b", "#7a3db8"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9})


def box(ax, x, y, w, h, title, sub="", fc="#fff", ec=INK, lw=1.4, ls="-", tsize=10, radius=0.02):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0,rounding_size={radius}",
                                fc=fc, ec=ec, lw=lw, ls=ls))
    if sub:
        ax.text(x + w / 2, y + h * 0.62, title, ha="center", va="center", fontsize=tsize, weight="bold", color=INK)
        ax.text(x + w / 2, y + h * 0.30, sub, ha="center", va="center", fontsize=8, color=MUTED, linespacing=1.3)
    else:
        ax.text(x + w / 2, y + h / 2, title, ha="center", va="center", fontsize=tsize, weight="bold", color=INK)


def node(ax, x, y, w, h, label):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=0.015",
                                fc="none", ec="#8a93a6", lw=1.1, ls=(0, (5, 3))))
    ax.text(x + 0.01, y + 0.012, label, ha="left", va="bottom", fontsize=8, color=MUTED, style="italic")


def arrow(ax, p1, p2, text="", color=INK, both=False, text_xy=None, ls="-", fs=7.6, ha="center", rad=0.0):
    ax.add_patch(FancyArrowPatch(p1, p2, arrowstyle="<|-|>" if both else "-|>", mutation_scale=11,
                                 color=color, lw=1.3, ls=ls, shrinkA=2, shrinkB=2,
                                 connectionstyle=f"arc3,rad={rad}"))
    if text:
        tx, ty = text_xy or ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)
        ax.text(tx, ty, text, ha=ha, va="center", fontsize=fs, color=color, linespacing=1.3,
                bbox=dict(fc="white", ec="none", pad=1.5))


# ======================================================================= architecture
def architecture():
    fig, ax = plt.subplots(figsize=(11, 6.2))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 0.98)
    ax.axis("off")

    node(ax, 0.02, 0.66, 0.30, 0.30, "Node 1 · user device (web browser)")
    node(ax, 0.38, 0.50, 0.27, 0.46, "Node 2 · booking host  (127.0.0.1 in demo)")
    node(ax, 0.71, 0.50, 0.27, 0.46, "Node 3 · availability host")
    node(ax, 0.38, 0.0, 0.27, 0.34, "Node 4 · notification host")

    box(ax, 0.05, 0.74, 0.24, 0.15, "ECHO LIVE client", "HTML + JavaScript\nserved on :3000", fc=C_CLIENT)
    box(ax, 0.41, 0.74, 0.21, 0.15, "Booking Service", "FastAPI · port 5001\norchestration + idempotency", fc=C_BOOK)
    box(ax, 0.74, 0.74, 0.21, 0.15, "Availability Service", "FastAPI · port 5002\nseat holds + locking", fc=C_AVAIL)
    box(ax, 0.41, 0.17, 0.21, 0.14, "Notification Service", "FastAPI · port 5003\nlogs booking events", fc=C_NOTE)

    box(ax, 0.42, 0.55, 0.19, 0.115, "", fc=C_DB)
    ax.text(0.515, 0.64, "bookings.db", ha="center", va="center", fontsize=9, weight="bold", color=INK)
    ax.text(0.515, 0.588, "SQLite · bookings,\nidempotency_records", ha="center", va="center", fontsize=8,
            color=MUTED, linespacing=1.3)
    box(ax, 0.76, 0.56, 0.17, 0.10, "availability.db", "SQLite · events, seats", fc=C_DB, tsize=9)
    box(ax, 0.405, 0.065, 0.22, 0.07, "console log (no database)", "", fc=C_DB, tsize=8)

    arrow(ax, (0.515, 0.74), (0.515, 0.66), color=MUTED, both=True)
    arrow(ax, (0.845, 0.74), (0.845, 0.66), color=MUTED, both=True)
    ax.text(0.508, 0.70, "SQL (local file)", fontsize=7, color=MUTED, ha="right")
    ax.text(0.838, 0.70, "SQL · BEGIN IMMEDIATE", fontsize=7, color=MUTED, ha="right")

    arrow(ax, (0.29, 0.83), (0.41, 0.83),
          "HTTP/REST · JSON\nGET /events, /ticket-listings\nPOST /bookings (Idempotency-Key)\nGET, DELETE /bookings/{id}",
          text_xy=(0.17, 0.585), fs=7.3)
    ax.plot([0.35, 0.29], [0.83, 0.64], color="#c9ceda", lw=0.8, ls=":")
    arrow(ax, (0.62, 0.84), (0.74, 0.84),
          "HTTP/REST · JSON\nPOST /seats/hold\n/seats/confirm\n/seats/release\n3 s timeout",
          text_xy=(0.68, 0.43), fs=7.3)
    ax.plot([0.68, 0.68], [0.50, 0.84], color="#c9ceda", lw=0.8, ls=":")
    arrow(ax, (0.515, 0.56), (0.515, 0.32), color=PURPLE)
    ax.text(0.20, 0.43, "HTTP POST /notifications\n2 s timeout; if it fails, the booking\nstill succeeds and a warning is logged",
            fontsize=7.3, color=PURPLE, ha="center", va="center", bbox=dict(fc="white", ec="#e4d4f5", pad=3))
    ax.annotate("", xy=(0.505, 0.44), xytext=(0.335, 0.44), arrowprops=dict(arrowstyle="-", color="#cdb6ea", lw=0.8, ls=":"))

    ax.text(0.71, 0.33, "Independent processes", weight="bold", fontsize=8.5, color=INK)
    ax.text(0.71, 0.15,
            "• each service is its own OS process with its own\n  port and its own data\n"
            "• no service reads another service's database\n"
            "• service URLs come from environment variables,\n  so each node can run on a separate machine\n"
            "  (docker-compose.yml runs one container each)",
            fontsize=7.6, color=MUTED, linespacing=1.4)
    fig.savefig(OUT / "architecture.png", dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


# ======================================================================= sequence
def sequence():
    parts = [("Client", C_CLIENT), ("Booking\nService :5001", C_BOOK), ("bookings.db", C_DB),
             ("Availability\nService :5002", C_AVAIL), ("availability.db", C_DB), ("Notification\nService :5003", C_NOTE)]
    xs = [0.07, 0.25, 0.40, 0.56, 0.74, 0.92]
    fig, ax = plt.subplots(figsize=(11.5, 12.5))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    top, bottom = 0.955, 0.02
    for (name, col), x in zip(parts, xs):
        box(ax, x - 0.065, top - 0.01, 0.13, 0.05, name, fc=col, tsize=8.5)
        ax.plot([x, x], [bottom, top - 0.01], color="#9aa2b3", lw=1, ls=(0, (4, 3)), zorder=0)

    y = [top - 0.05]

    def msg(a, b, text, ret=False, color=INK, dy=0.038, left=False):
        y[0] -= dy
        x1, x2 = xs[a], xs[b]
        if a == b:  # self call
            ax.add_patch(FancyArrowPatch((x1, y[0] + 0.008), (x1, y[0] - 0.012), connectionstyle="arc3,rad=-1.6",
                                         arrowstyle="-|>", mutation_scale=9, color=color, lw=1))
            ax.text(x1 + 0.025, y[0], text, fontsize=7.4, va="center", color=color)
            return
        ax.add_patch(FancyArrowPatch((x1, y[0]), (x2, y[0]), arrowstyle="-|>", mutation_scale=10, color=color,
                                     lw=1.1, ls=(0, (4, 2)) if ret else "-"))
        if left:
            ax.text(min(x1, x2) + 0.008, y[0] + 0.009, text, ha="left", va="bottom", fontsize=7.4, color=color)
        else:
            ax.text((x1 + x2) / 2, y[0] + 0.009, text, ha="center", va="bottom", fontsize=7.4, color=color,
                    linespacing=1.3)

    def frame(y_top, y_bot, label, guard, x0=0.015, x1=0.985, color="#8a93a6"):
        ax.add_patch(FancyBboxPatch((x0, y_bot), x1 - x0, y_top - y_bot, boxstyle="square,pad=0",
                                    fc="none", ec=color, lw=1))
        ax.text(x0 + 0.004, y_top - 0.004, f" {label} ", fontsize=7.5, weight="bold", va="top",
                bbox=dict(fc="#eef0f4", ec=color, pad=1.5))
        ax.text(x0 + 0.06, y_top - 0.006, guard, fontsize=7.4, va="top", color=MUTED, style="italic")

    def divider(yy, guard, x0=0.015, x1=0.985):
        ax.plot([x0, x1], [yy, yy], color="#8a93a6", lw=0.9, ls=(0, (6, 3)))
        ax.text(x0 + 0.06, yy - 0.004, guard, fontsize=7.4, va="top", color=MUTED, style="italic")

    msg(0, 1, "1  POST /bookings  {eventId, section VIP, row C, quantity 2}  Idempotency-Key: K", dy=0.02, left=True)
    msg(1, 2, "2  SELECT idempotency_records WHERE key = K")
    msg(2, 1, "no stored response", ret=True, dy=0.03)
    msg(1, 3, "3  POST /seats/hold  {showtime_id, seat_ids [VIP-C-1, VIP-C-2], booking_id ECHO-…}")
    msg(3, 4, "4  BEGIN IMMEDIATE; UPDATE seats SET status = 'HELD'\nWHERE label IN (...) AND status = 'AVAILABLE'; COMMIT",
        dy=0.052)
    alt_top = y[0] - 0.012
    msg(4, 3, "rowcount = 2", ret=True, dy=0.035)
    msg(3, 1, "5  200 OK  status HELD", ret=True)
    msg(1, 2, "6  INSERT booking CONFIRMED; store 201 response under K")
    msg(1, 5, "7  POST /notifications  (2 s timeout)", color=PURPLE)
    msg(5, 5, "log event", color=PURPLE, dy=0.03)
    msg(5, 1, "200 OK", ret=True, color=PURPLE, dy=0.032)
    msg(1, 0, "8  201 Created  {id ECHO-…, status confirmed}", ret=True)
    div1 = y[0] - 0.018
    divider(div1, "[a requested seat is already HELD or BOOKED]")
    y[0] = div1 - 0.005
    msg(4, 3, "rowcount < 2  ->  ROLLBACK", ret=True, color=RED, dy=0.03)
    msg(3, 1, "409 Conflict  (problem+json, unavailable_seats)", ret=True, color=RED)
    msg(1, 2, "store 409 response under K (no booking row)", color=RED, dy=0.034)
    msg(1, 0, "409 'Those tickets are no longer available'", ret=True, color=RED, dy=0.034)
    alt_bot = y[0] - 0.015
    frame(alt_top, alt_bot, "alt", "[all requested seats AVAILABLE]")

    y[0] = alt_bot - 0.012
    opt1 = y[0]
    msg(0, 1, "same request again with Idempotency-Key: K", dy=0.042, left=True)
    msg(1, 2, "SELECT ... WHERE key = K  ->  stored response", dy=0.034)
    msg(1, 0, "201 Created  (X-Cache: HIT, no seat or notification call)", ret=True, dy=0.034, left=True)
    frame(opt1, y[0] - 0.015, "opt", "[client retries]", x0=0.02, x1=0.98)

    y[0] = y[0] - 0.027
    opt2 = y[0]
    msg(1, 5, "7'  POST /notifications  ->  connection refused / timeout", color=RED, dy=0.042)
    msg(1, 1, "log [WARN]; booking stays CONFIRMED (notification not resent)", dy=0.032)
    msg(1, 0, "8'  201 Created anyway", ret=True, dy=0.034, left=True)
    frame(opt2, y[0] - 0.018, "opt", "[Notification Service down: partial failure]", x0=0.02, x1=0.98, color=RED)
    ax.set_ylim(y[0] - 0.03, 1)
    for x in xs:
        ax.plot([x, x], [y[0] - 0.025, bottom], color="#9aa2b3", lw=1, ls=(0, (4, 3)), zorder=0)
    fig.savefig(OUT / "sequence.png", dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


# ======================================================================= states
def states():
    fig, axes = plt.subplots(1, 2, figsize=(11, 3.9))
    for ax in axes:
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis("off")

    ax = axes[0]
    ax.set_ylim(0, 1.12)
    ax.set_title("(a) Seat state – Availability Service", fontsize=9.5, loc="left", color=INK)
    pos = {"AVAILABLE": (0.04, 0.42), "HELD": (0.40, 0.42), "BOOKED": (0.76, 0.42)}
    cols = {"AVAILABLE": "#d9f2e3", "HELD": "#ffe9cc", "BOOKED": "#fbe2df"}
    for k, (x, yy) in pos.items():
        box(ax, x, yy, 0.20, 0.14, k, fc=cols[k], tsize=8.5, radius=0.04)
    arrow(ax, (0.24, 0.49), (0.40, 0.49), "hold", text_xy=(0.32, 0.565))
    arrow(ax, (0.60, 0.49), (0.76, 0.49), "confirm", text_xy=(0.68, 0.565))
    arrow(ax, (0.10, 0.56), (0.90, 0.56), "", color="#2457c5", rad=-0.62)
    ax.text(0.50, 1.00, "hold with confirm: true (one step)", ha="center", fontsize=7.4, color="#2457c5")
    arrow(ax, (0.84, 0.56), (0.16, 0.56), "", color=MUTED, rad=0.22)
    ax.text(0.50, 0.75, "release (booking cancelled)", ha="center", fontsize=7.4, color=MUTED)
    arrow(ax, (0.50, 0.42), (0.14, 0.42), "", color=MUTED, rad=-0.45)
    ax.text(0.32, 0.22, "release / hold expired (5 min)", ha="center", fontsize=7.4, color=MUTED)

    ax = axes[1]
    ax.set_title("(b) Booking state – Booking Service", fontsize=9.5, loc="left", color=INK)
    ax.add_patch(Circle((0.07, 0.57), 0.025, color=INK))
    ax.text(0.07, 0.47, "POST\n/bookings", ha="center", va="top", fontsize=7.2, color=MUTED)
    box(ax, 0.36, 0.64, 0.24, 0.15, "CONFIRMED", fc="#d9f2e3", tsize=8.5, radius=0.04)
    box(ax, 0.74, 0.64, 0.23, 0.15, "CANCELLED", fc="#f1e1ff", tsize=8.5, radius=0.04)
    box(ax, 0.32, 0.14, 0.32, 0.24, "", fc="#fbe2df", radius=0.04)
    ax.text(0.48, 0.31, "no booking row", ha="center", va="center", fontsize=8.5, weight="bold", color=INK)
    ax.text(0.48, 0.21, "409 response stored\nunder Idempotency-Key", ha="center", va="center", fontsize=7.4,
            color=MUTED, linespacing=1.3)
    arrow(ax, (0.10, 0.59), (0.36, 0.71), "seat hold 200", text_xy=(0.20, 0.74), fs=7.4)
    arrow(ax, (0.10, 0.55), (0.32, 0.28), "seat hold 409", text_xy=(0.12, 0.33), fs=7.4, color=RED)
    arrow(ax, (0.60, 0.715), (0.74, 0.715), "DELETE\n(seats released)", text_xy=(0.67, 0.90), fs=7.2)
    ax.text(0.68, 0.26, "A retry with the same\nIdempotency-Key returns\nthe stored response", fontsize=7.4,
            color=MUTED, linespacing=1.3, va="center")
    fig.savefig(OUT / "states.png", dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


if __name__ == "__main__":
    architecture()
    sequence()
    states()
    print("diagrams written to", OUT)
