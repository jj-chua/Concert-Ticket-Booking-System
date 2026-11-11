"""
Draws the report diagrams with matplotlib (Allen, Member 1).
  python docs/diagrams/generate_diagrams.py
Outputs: architecture.png, sequence.png, states.png (same folder)
"""
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402

OUT = Path(__file__).parent
INK, MUTED = "#1d2433", "#5b6478"
C_CLIENT, C_BOOK, C_AVAIL, C_NOTE, C_DB = "#dce8ff", "#ffe9cc", "#d9f2e3", "#f1e1ff", "#eef0f4"
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


def arrow(ax, p1, p2, text="", color=INK, both=False, text_xy=None, ls="-", fs=7.6, ha="center"):
    ax.add_patch(FancyArrowPatch(p1, p2, arrowstyle="<|-|>" if both else "-|>", mutation_scale=11,
                                 color=color, lw=1.3, ls=ls, shrinkA=2, shrinkB=2))
    if text:
        tx, ty = text_xy or ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)
        ax.text(tx, ty, text, ha=ha, va="center", fontsize=fs, color=color, linespacing=1.3,
                bbox=dict(fc="white", ec="none", pad=1.5))


# ======================================================================= architecture
def architecture():
    fig, ax = plt.subplots(figsize=(11, 6.6))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    # deployment nodes
    node(ax, 0.02, 0.70, 0.30, 0.26, "Node 1 · user device (web browser)")
    node(ax, 0.38, 0.52, 0.27, 0.44, "Node 2 · booking host  (127.0.0.1 in demo)")
    node(ax, 0.71, 0.52, 0.27, 0.44, "Node 3 · availability host")
    node(ax, 0.38, 0.0, 0.27, 0.34, "Node 4 · notification host")

    box(ax, 0.05, 0.74, 0.24, 0.15, "Client application", "HTML + JavaScript\nserved on :3000", fc=C_CLIENT)
    box(ax, 0.41, 0.74, 0.21, 0.15, "Booking Service", "FastAPI · port 5001\nidempotency + outbox", fc=C_BOOK)
    box(ax, 0.74, 0.74, 0.21, 0.15, "Availability Service", "FastAPI · port 5002\nseat holds + locking", fc=C_AVAIL)
    box(ax, 0.41, 0.17, 0.21, 0.14, "Notification Service", "FastAPI · port 5003\nidempotent consumer", fc=C_NOTE)

    box(ax, 0.43, 0.56, 0.17, 0.10, "booking.db", "SQLite · bookings, outbox", fc=C_DB, tsize=9)
    box(ax, 0.76, 0.56, 0.17, 0.10, "availability.db", "SQLite · showtimes, seats", fc=C_DB, tsize=9)
    box(ax, 0.43, 0.065, 0.17, 0.07, "notification.db + log", "", fc=C_DB, tsize=8.5)

    # data access (local)
    arrow(ax, (0.515, 0.74), (0.515, 0.66), color=MUTED, both=True)
    arrow(ax, (0.845, 0.74), (0.845, 0.66), color=MUTED, both=True)
    arrow(ax, (0.515, 0.17), (0.515, 0.135), color=MUTED, both=True)
    ax.text(0.508, 0.70, "SQL (local file)", fontsize=7, color=MUTED, ha="right")
    ax.text(0.838, 0.70, "SQL · BEGIN IMMEDIATE", fontsize=7, color=MUTED, ha="right")

    # network calls
    arrow(ax, (0.29, 0.83), (0.41, 0.83), "HTTP/REST · JSON\nPOST /bookings\n(Idempotency-Key)\nGET, DELETE /bookings/{id}",
          text_xy=(0.20, 0.60), fs=7.3)
    ax.plot([0.35, 0.29], [0.83, 0.64], color="#c9ceda", lw=0.8, ls=":")
    arrow(ax, (0.62, 0.84), (0.74, 0.84), "HTTP/REST · JSON\nPOST /seats/hold\n/seats/confirm\n/seats/release\nX-Service-Key · 3 s timeout",
          text_xy=(0.68, 0.43), fs=7.3)
    ax.plot([0.68, 0.68], [0.49, 0.84], color="#c9ceda", lw=0.8, ls=":")
    # client -> availability (read only), routed over the top
    ax.add_patch(FancyArrowPatch((0.17, 0.89), (0.845, 0.89), connectionstyle="arc3,rad=-0.18",
                                 arrowstyle="-|>", mutation_scale=11, color="#2457c5", lw=1.3))
    ax.text(0.51, 0.985, "HTTP GET /showtimes/{id}/seats  (public, read-only seat map)", ha="center", fontsize=7.6,
            color="#2457c5", bbox=dict(fc="white", ec="none", pad=1))
    # booking -> notification
    arrow(ax, (0.515, 0.56), (0.515, 0.32), color="#7a3db8")
    ax.text(0.27, 0.43, "HTTP POST /notifications\n2 s timeout; on failure the event\nstays in the outbox and a worker\nretries (2, 4, 8 … 60 s back-off)",
            fontsize=7.3, color="#7a3db8", ha="center", va="center", bbox=dict(fc="white", ec="#e4d4f5", pad=3))
    ax.annotate("", xy=(0.505, 0.44), xytext=(0.36, 0.44),
                arrowprops=dict(arrowstyle="-", color="#cdb6ea", lw=0.8, ls=":"))

    # legend / notes
    ax.text(0.71, 0.33, "Independent processes", weight="bold", fontsize=8.5, color=INK)
    ax.text(0.71, 0.13,
            "• each service is its own OS process with its own\n  port and its own database file\n"
            "• no service reads another service's database\n"
            "• HOST=0.0.0.0 + service URLs in env variables\n  let each node run on a separate machine\n"
            "• X-Request-ID is passed along every call so one\n  booking can be traced across all logs",
            fontsize=7.6, color=MUTED, linespacing=1.4)
    fig.savefig(OUT / "architecture.png", dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


# ======================================================================= sequence
def sequence():
    parts = [("Client", C_CLIENT), ("Booking\nService :5001", C_BOOK), ("booking.db", C_DB),
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

    # 1. availability check
    msg(0, 3, "1  GET /showtimes/1/seats")
    msg(3, 4, "2  SELECT seat, status")
    msg(4, 3, "rows", ret=True, dy=0.03)
    msg(3, 0, "3  200 OK  seat map (C4 = AVAILABLE)", ret=True)
    # 2. booking request
    msg(0, 1, "4  POST /bookings  {showtime 1, seats [C4]}  Idempotency-Key: K", dy=0.045, left=True)
    msg(1, 2, "5  INSERT booking PENDING  (UNIQUE key K)")
    msg(1, 3, "6  POST /seats/hold  {C4, booking_id}  X-Service-Key")
    msg(3, 4, "7  BEGIN IMMEDIATE; UPDATE seats SET status='HELD'\nWHERE id = C4 AND status = 'AVAILABLE'; COMMIT",
        dy=0.052)
    alt_top = y[0] - 0.012
    msg(4, 3, "rowcount = 1", ret=True, dy=0.035)
    msg(3, 1, "8  200 OK  status HELD", ret=True)
    msg(1, 3, "9  POST /seats/confirm")
    msg(3, 4, "UPDATE HELD -> BOOKED", dy=0.034)
    msg(3, 1, "200 OK  status BOOKED", ret=True, dy=0.034)
    msg(1, 2, "10  one txn: status CONFIRMED + INSERT outbox event")
    msg(1, 5, "11  POST /notifications  (2 s timeout)", color="#7a3db8")
    msg(5, 5, "write notification log", color="#7a3db8", dy=0.03)
    msg(5, 1, "201 Created  ->  outbox event SENT", ret=True, color="#7a3db8", dy=0.032)
    msg(1, 0, "12  201 Created  {booking_id, CONFIRMED}", ret=True)
    div1 = y[0] - 0.018
    divider(div1, "[seat already HELD / BOOKED]")
    y[0] = div1 - 0.005
    msg(4, 3, "rowcount = 0  ->  ROLLBACK", ret=True, color="#c0392b", dy=0.03)
    msg(3, 1, "409 Conflict  (problem+json, unavailable_seats [C4])", ret=True, color="#c0392b")
    msg(1, 2, "status REJECTED, store response for key K", color="#c0392b", dy=0.034)
    msg(1, 0, "409 Conflict  'Seat C4 is no longer available'", ret=True, color="#c0392b", dy=0.034)
    alt_bot = y[0] - 0.015
    frame(alt_top, alt_bot, "alt", "[seat still AVAILABLE]")
    # partial failure fragment
    y[0] = alt_bot - 0.012
    opt_top = y[0]
    msg(1, 5, "POST /notifications  ->  connection refused / timeout", color="#c0392b", dy=0.034)
    msg(1, 0, "201 Created anyway (notification_status PENDING)", ret=True, dy=0.04, left=True)
    msg(1, 1, "outbox worker retries every 5 s with back-off until 201", dy=0.032)
    msg(1, 5, "Notification Service back: POST /notifications  ->  201", color="#7a3db8", dy=0.045)
    frame(opt_top, y[0] - 0.018, "opt", "[Notification Service down: partial failure]", x0=0.02, x1=0.98, color="#c0392b")
    ax.set_ylim(y[0] - 0.03, 1)
    for x in xs:  # extend lifelines to the end of the diagram
        ax.plot([x, x], [y[0] - 0.025, bottom], color="#9aa2b3", lw=1, ls=(0, (4, 3)), zorder=0)
    fig.savefig(OUT / "sequence.png", dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


# ======================================================================= states
def states():
    fig, axes = plt.subplots(1, 2, figsize=(11, 3.4))
    for ax in axes:
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        ax.axis("off")

    # seat states (Availability Service)
    ax = axes[0]
    ax.set_title("(a) Seat state – Availability Service", fontsize=9.5, loc="left", color=INK)
    pos = {"AVAILABLE": (0.04, 0.42), "HELD": (0.40, 0.42), "BOOKED": (0.76, 0.42)}
    cols = {"AVAILABLE": "#d9f2e3", "HELD": "#ffe9cc", "BOOKED": "#fbe2df"}
    for k, (x, yy) in pos.items():
        box(ax, x, yy, 0.20, 0.16, k, fc=cols[k], tsize=8.5, radius=0.04)
    arrow(ax, (0.24, 0.53), (0.40, 0.53), "hold", text_xy=(0.32, 0.60))
    arrow(ax, (0.60, 0.53), (0.76, 0.53), "confirm", text_xy=(0.68, 0.60))
    ax.add_patch(FancyArrowPatch((0.50, 0.42), (0.14, 0.42), connectionstyle="arc3,rad=-0.5",
                                 arrowstyle="-|>", mutation_scale=10, color=MUTED, lw=1.1))
    ax.text(0.32, 0.12, "release / hold expired (5 min)", ha="center", fontsize=7.6, color=MUTED)
    ax.add_patch(FancyArrowPatch((0.86, 0.58), (0.14, 0.58), connectionstyle="arc3,rad=0.42",
                                 arrowstyle="-|>", mutation_scale=10, color=MUTED, lw=1.1))
    ax.text(0.50, 0.93, "release (booking cancelled)", ha="center", fontsize=7.6, color=MUTED)

    # booking states (Booking Service)
    ax = axes[1]
    ax.set_title("(b) Booking state – Booking Service", fontsize=9.5, loc="left", color=INK)
    pos = {"PENDING": (0.04, 0.42), "CONFIRMED": (0.40, 0.62), "REJECTED": (0.40, 0.14), "CANCELLED": (0.76, 0.62)}
    cols = {"PENDING": "#eef0f4", "CONFIRMED": "#d9f2e3", "REJECTED": "#fbe2df", "CANCELLED": "#f1e1ff"}
    for k, (x, yy) in pos.items():
        box(ax, x, yy, 0.21, 0.16, k, fc=cols[k], tsize=8.5, radius=0.04)
    arrow(ax, (0.25, 0.54), (0.40, 0.68), "hold + confirm OK", text_xy=(0.30, 0.70), ha="right")
    arrow(ax, (0.25, 0.46), (0.40, 0.24), "409 / 404 / 422", text_xy=(0.30, 0.30), ha="right")
    arrow(ax, (0.61, 0.70), (0.76, 0.70), "DELETE", text_xy=(0.685, 0.80))
    ax.text(0.62, 0.30, "final states are stored with the\nresponse, so a retry with the same\nIdempotency-Key replays them",
            fontsize=7.4, color=MUTED, linespacing=1.3)
    fig.savefig(OUT / "states.png", dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)


if __name__ == "__main__":
    architecture()
    sequence()
    states()
    print("diagrams written to", OUT)
