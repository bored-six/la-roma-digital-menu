#!/usr/bin/env python3
"""Generates La Roma SVG assets. Geometry is computed here so every curve is exact.
Usage: python3 tools/gen-svg.py design-system/svg [uris.txt]
Later "v2/v3" blocks override earlier drafts of the same icon on purpose (iteration history)."""
import math, os, sys, urllib.parse

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

def f(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s

def pt(p):
    return f"{f(p[0])} {f(p[1])}"

def add(a, b, k=1.0):
    return (a[0] + b[0] * k, a[1] + b[1] * k)

def lens(base, tip, width):
    """Leaf: two quadratic curves base->tip. width = full belly width."""
    mx, my = (base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2
    dx, dy = tip[0] - base[0], tip[1] - base[1]
    L = math.hypot(dx, dy)
    nx, ny = -dy / L, dx / L
    c1 = (mx + nx * width, my + ny * width)
    c2 = (mx - nx * width, my - ny * width)
    return f"M{pt(base)}Q{pt(c1)} {pt(tip)}Q{pt(c2)} {pt(base)}Z"

def diamond(cx, cy, r):
    return f"M{f(cx)} {f(cy-r)}L{f(cx+r)} {f(cy)}L{f(cx)} {f(cy+r)}L{f(cx-r)} {f(cy)}Z"

def dot(x, y):
    # zero-length round-capped stroke = a 1.5 dot that scales with stroke
    return f"M{f(x)} {f(y)}h0"

def catmull(points, closed=True):
    n = len(points)
    d = f"M{pt(points[0])}"
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = points[(i - 1) % n]; p1 = points[i]; p2 = points[(i + 1) % n]; p3 = points[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f"C{pt(c1)} {pt(c2)} {pt(p2)}"
    return d + ("Z" if closed else "")

ICON_HEAD = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" '
             'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" '
             'stroke-linejoin="round" aria-hidden="true">')

def P(d, solid=False):
    if solid:
        return f'<path d="{d}" fill="currentColor" stroke="none"/>'
    return f'<path d="{d}"/>'

BOWL = "M3.5 12.5h17M4.5 12.5a7.5 7 0 0 0 15 0M9.5 21h5"

icons = {}

# breakfast: fried egg, organic white, solid yolk
egg = []
for k in range(10):
    t = k / 10 * 2 * math.pi
    r = 8.3 + 0.75 * math.sin(3 * t + 0.7) + 0.35 * math.sin(5 * t + 2.1)
    egg.append((12 + r * math.cos(t), 12.2 + r * 0.92 * math.sin(t)))
icons["breakfast"] = [P(catmull(egg)), '<circle cx="13" cy="11.4" r="3" fill="currentColor" stroke="none"/>']

# noodles: bowl, broth wave, chopsticks
icons["noodles"] = [P(BOWL), P("M7 15.5c.8-.7 1.7-.7 2.5 0s1.7.7 2.5 0 1.7-.7 2.5 0 1.7.7 2.5 0"),
                    P("M12.6 10.2 18.6 2.8M15.2 10.7l5.6-6.4")]

# soup: bowl with three steam wisps
def wisp(x, y0, h):
    s = h / 3
    return f"M{f(x)} {f(y0)}c-.9-.8-.9-{f(s*0.6)} 0-{f(s*1.5)}s.9-{f(s*0.9)} 0-{f(s*1.5)}"
icons["soup"] = [P(BOWL), P(wisp(8.5, 10, 5.6) + wisp(12, 10, 7) + wisp(15.5, 10, 5.6))]

# rice: bowl heaped with a mound, grain dots
icons["rice"] = [P(BOWL), P("M6.2 12.5a5.8 5 0 0 1 11.6 0"), P(dot(10, 10.4) + dot(12.6, 9.3) + dot(14.3, 11))]

# unli rice: molded rice dome on a plate + infinity loop above
inf = "M8.6 8C6.7 8 5.3 6.9 5.3 5.5S6.7 3 8.6 3c3 0 3.8 5 6.8 5 1.9 0 3.3-1.1 3.3-2.5S17.3 3 15.4 3c-3 0-3.8 5-6.8 5z"
icons["unli-rice"] = [P(inf), P("M3.5 20.5h17M7 20.5V16a5 5 0 0 1 10 0v4.5"), P(dot(10.3, 15.6) + dot(13.4, 17.6))]

# pizza: slice, crust double arc, one solid pepperoni + one ring
icons["pizza"] = [P("M12 21.5 4 6.8M12 21.5l8-14.7M4 6.8C6.3 5.3 9.1 4.5 12 4.5s5.7.8 8 2.3M5.3 9.2C7.4 8 9.6 7.5 12 7.5s4.6.5 6.7 1.7"),
                  '<circle cx="11" cy="11.9" r="1.6" fill="currentColor" stroke="none"/>',
                  '<circle cx="13.4" cy="15.8" r="1.1"/>']

# starters: fries carton
icons["starters"] = [P("M5.5 10.5h13l-1.6 10a1 1 0 0 1-1 .8H8.1a1 1 0 0 1-1-.8z"),
                     P("M5.5 10.5c2.1 1.6 4.3 2.3 6.5 2.3s4.4-.7 6.5-2.3"),
                     P("M8.2 11.6 7.3 5.4M10.6 12.4l-.4-8.6M13.4 12.4l.5-8M15.8 11.6l1.1-5.6")]

# house favourites: bilao (woven tray, 3/4 view) with rice dome and two lumpia rolls
cx, cy, rx, ry, irx, iry = 12, 14.6, 9.5, 5.2, 6.9, 3.4
ticks = ""
for a in (40, 65, 90, 115, 140):
    t = math.radians(a)
    p1 = (cx + irx * math.cos(t), cy + iry * math.sin(t))
    p2 = (cx + (rx - 0.2) * math.cos(t), cy + (ry - 0.2) * math.sin(t))
    ticks += f"M{pt(p1)}L{pt(p2)}"
icons["house-favourites"] = [
    f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"/>',
    P(f"M{f(cx-irx)} {f(cy)}a{f(irx)} {f(iry)} 0 0 0 {f(2*irx)} 0"),
    P(ticks),
    P("M6.6 14.4a3 3 0 0 1 6 0"),
    P("M13.8 13.6l4.2-1.9M14.6 15.4l4.2-1.9"),
]

# vegetables: talong (eggplant), diagonal, calyx cap and stem
icons["vegetables"] = [
    P("M14 6.6C10.4 7.8 7.2 10.1 5.5 12.9c-1.9 3.2-1.6 6.1.1 7.6 1.6 1.4 4.6 1.4 7.6-.6 2.9-1.9 5-4.9 5.9-8.4"),
    P("M13 7.2c.9-1.9 2.6-2.9 4.3-2.4 1.7.5 2.4 2.3 2 4.3-.2 1.1-.9 2.2-2.1 2.9-.1-1.4-.6-2.6-1.6-3.4-.8-.7-1.6-1.1-2.6-1.4z"),
    P("M18.4 5.6 20.8 3.2"),
]

# chicken: drumstick, computed teardrop + dog-bone end
def drumstick():
    s2 = math.sqrt(0.5)
    dirv = (s2, s2); perp = (s2, -s2)
    J = (13.3, 13.3); E = (17.5, 17.5)
    C = (9.2, 9.2); R = 5.6
    P1 = add(J, perp, 1.7); P2 = add(J, perp, -1.7)
    def tangent(Pp, side):
        dx, dy = Pp[0] - C[0], Pp[1] - C[1]
        d = math.hypot(dx, dy)
        a = math.atan2(dy, dx); b = math.acos(R / d)
        ang = a + side * b
        return (C[0] + R * math.cos(ang), C[1] + R * math.sin(ang))
    T1 = tangent(P1, -1); T2 = tangent(P2, 1)
    meat = f"M{pt(P1)}L{pt(T1)}A{f(R)} {f(R)} 0 1 0 {pt(T2)}L{pt(P2)}"
    # bone
    b = 0.8; kr = 1.45; ko = 1.05
    B1s = add(add(J, dirv, 0.3), perp, b); B2s = add(add(J, dirv, 0.3), perp, -b)
    s = math.sqrt(kr**2 - (ko - b)**2)
    B1e = add(add(E, dirv, -s), perp, b); B2e = add(add(E, dirv, -s), perp, -b)
    n = math.sqrt(kr**2 - ko**2)
    N = add(E, dirv, n)
    bone = f"M{pt(B1s)}L{pt(B1e)}A{f(kr)} {f(kr)} 0 1 1 {pt(N)}A{f(kr)} {f(kr)} 0 1 1 {pt(B2e)}L{pt(B2s)}"
    shoulder = f"M{pt(P1)}L{pt(B1s)}M{pt(P2)}L{pt(B2s)}"
    return [P(meat), P(bone), P(shoulder)]
icons["chicken"] = drumstick()

# beef: bucranium-inspired bull head (Roman frieze motif)
icons["beef"] = [
    P("M8.5 8.5C6 8.6 3.7 7.3 3 4.5M15.5 8.5c2.5.1 4.8-1.2 5.5-4"),
    P("M8.5 8.5h7l-.6 7c-.3 3-1.4 5-2.9 5s-2.6-2-2.9-5z"),
    P("M8.6 10.2 5.3 11.3c.8 1.2 2.1 1.8 3.6 1.6M15.4 10.2l3.3 1.1c-.8 1.2-2.1 1.8-3.6 1.6"),
    P(dot(10.5, 12.2) + dot(13.5, 12.2)),
    P(diamond(12, 16.6, 1.25), solid=True),
]

# pork: pig face, ears on the circle, snout, nostril + eye dots
def onc(a, r=7, c=(12, 13.6)):
    t = math.radians(a); return (c[0] + r * math.cos(t), c[1] + r * math.sin(t))
icons["pork"] = [
    '<circle cx="12" cy="13.6" r="7"/>',
    P(f"M{pt(onc(-150))}L5.4 4.2L{pt(onc(-112))}M{pt(onc(-30))}L18.6 4.2L{pt(onc(-68))}"),
    '<ellipse cx="12" cy="15.8" rx="3.2" ry="2.3"/>',
    P(dot(10.9, 15.8) + dot(13.1, 15.8) + dot(9.2, 12) + dot(14.8, 12)),
]

# seafood: fish (bangus), forked tail, gill, eye
icons["seafood"] = [
    P("M2.5 12C4.5 8.4 7.6 6.5 11 6.5c3 0 5.4 1.6 7 4l3-2.3v7.6l-3-2.3c-1.6 2.4-4 4-7 4-3.4 0-6.5-1.9-8.5-5.5z"),
    P("M9.3 8.1c1 2.4 1 5.4 0 7.8"),
    P(dot(6.4, 11.2)),
]

# salad: shallow bowl, two leaves with veins, solid tomato
icons["salad"] = [
    P("M3 13h18M4.2 13c.9 3.9 4 6.5 7.8 6.5s6.9-2.6 7.8-6.5M9.5 21h5"),
    P(lens((8.4, 13), (4.6, 5.6), 2.6) + "M8.4 13 6.2 8.8"),
    P(lens((11.4, 13), (12.6, 3.6), 2.6) + "M11.4 13l.6-5.6"),
    '<circle cx="16.2" cy="10.6" r="1.8" fill="currentColor" stroke="none"/>',
]

# cold drinks: tall glass, straw, liquid line, one ice cube ring + one solid diamond cube
icons["cold-drinks"] = [
    P("M6.5 5.5h11l-1.5 14.6a1.5 1.5 0 0 1-1.5 1.4H9.5A1.5 1.5 0 0 1 8 20.1z"),
    P("M7 9h10"),
    P("M14.6 12.5 16.4 2.5h2.4"),
    P("M9.4 12.6l2.4-.6.6 2.4-2.4.6z"),
    P(diamond(12.2, 17.2, 1.5), solid=True),
]

# hot drinks: cup, handle, saucer, two wisps
icons["hot-drinks"] = [
    P("M5 10h11v3.5a5.5 5.5 0 0 1-5.5 5.5A5.5 5.5 0 0 1 5 13.5z"),
    P("M16 11h1.4a2.4 2.4 0 0 1 0 4.8h-1.9"),
    P("M3 21h15"),
    P(wisp(8.6, 7.6, 5) + wisp(12.4, 7.6, 5)),
]

# beer: mug, foam crown, ribs, handle
icons["beer"] = [
    P("M5 9.5h10v10a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 19.5z"),
    P("M15 11.5h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2"),
    P("M4.6 9.5a2.1 2.1 0 0 1 1.9-3.6 2.7 2.7 0 0 1 4.8-1.5 2.3 2.3 0 0 1 3.7 1.7 1.8 1.8 0 0 1 .4 3.4"),
    P("M8.3 12.5v5.5M11.7 12.5v5.5"),
]

# dessert: halo-halo goblet, scoop, layer wave, solid cherry with stem
icons["dessert"] = [
    P("M6.5 10.5h11c0 4-2.4 7-5.5 7s-5.5-3-5.5-7zM12 17.5v3M8.5 20.5h7"),
    P("M8.2 10.5a3.8 3.8 0 0 1 7.6 0"),
    P("M8.2 13.4c1.3-.8 2.6-.8 3.8 0s2.5.8 3.8 0"),
    '<circle cx="12.4" cy="5.2" r="1.3" fill="currentColor" stroke="none"/>',
    P("M12.8 3.9c.3-1 1.1-1.6 2.2-1.7"),
]


# ---------- revised icons (v2) ----------
def xf(local, origin, deg):
    t = math.radians(deg); c, s_ = math.cos(t), math.sin(t)
    return [(origin[0] + x * c - y * s_, origin[1] + x * s_ + y * c) for x, y in local]

def localpath(cmds, origin, deg):
    """cmds: list of (letter, [points...]) in local coords; arcs given as ('A', (rx, ry, large, sweep), point)."""
    out = ""
    for c in cmds:
        if c[0] == "A":
            rx, ry, lg, sw = c[1]
            p = xf([c[2]], origin, deg)[0]
            out += f"A{f(rx)} {f(ry)} 0 {lg} {sw} {pt(p)}"
        else:
            ps = xf(c[1], origin, deg)
            out += c[0] + " ".join(pt(p) for p in ps)
    return out

# chicken: teardrop drumstick on a 45 deg axis
O, R = (12.2, 12.2), 45
meat = localpath([("M", [(3.2, -1.05)]), ("C", [(1.0, -2.5), (-0.5, -5.7), (-4, -5.7)]),
                  ("C", [(-7.3, -5.7), (-8.9, -3), (-8.9, 0)]), ("C", [(-8.9, 3), (-7.3, 5.7), (-4, 5.7)]),
                  ("C", [(-0.5, 5.7), (1.0, 2.5), (3.2, 1.05)])], O, R)
bone = localpath([("M", [(3.2, -1.05)]), ("L", [(5.77, -0.85)]), ("A", (1.45, 1.45, 1, 1), (8.145, 0)),
                  ("A", (1.45, 1.45, 1, 1), (5.77, 0.85)), ("L", [(3.2, 1.05)])], O, R)
crumbs = "".join(dot(*p) for p in xf([(-5.2, -2), (-2.6, 1.9), (-6, 2.4)], O, R))
icons["chicken"] = [P(meat + bone), P(crumbs)]

# vegetables: long, slightly bent Filipino talong, three-lobed calyx, stem
def qb(p0, p1, p2, t):
    return ((1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0], (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1])
P0, P1, P2 = (3.4, 19.8), (8.4, 12.2), (17.2, 6.8)
def frame_at(t):
    a = qb(P0, P1, P2, max(t - 0.01, 0)); b = qb(P0, P1, P2, min(t + 0.01, 1))
    dx, dy = b[0]-a[0], b[1]-a[1]; L = math.hypot(dx, dy)
    return qb(P0, P1, P2, t), (-dy/L, dx/L)
def W(t):
    return 4.6 * math.sin(math.pi * min(t, 0.999)) ** 0.42 * (1 - 0.5 * t)
ts = [0, 0.03, 0.09, 0.18, 0.3, 0.45, 0.6, 0.75, 0.9]
left = []; right = []
for t in ts:
    c, n = frame_at(t); w = max(W(t), 0.0) if t > 0 else 0
    if t == 0:
        left.append(c); continue
    left.append((c[0] + n[0]*w, c[1] + n[1]*w)); right.append((c[0] - n[0]*w, c[1] - n[1]*w))
# open outline: right edge (top) -> bottom tip -> left edge (top)
outline_pts = list(reversed(right)) + left
body = catmull(outline_pts, closed=False)
def edge(t, side, k=1.0):
    c, n = frame_at(t); w = W(t) * k
    return (c[0] + side*n[0]*w, c[1] + side*n[1]*w)
cal = (f"M{pt(edge(0.9, 1))}L{pt(edge(0.64, 1, 0.95))}L{pt(edge(0.78, 1, 0.3))}L{pt(qb(P0,P1,P2,0.56))}"
       f"L{pt(edge(0.78, -1, 0.3))}L{pt(edge(0.64, -1, 0.95))}L{pt(edge(0.9, -1))}")
top = qb(P0, P1, P2, 0.9)
cap = f"M{pt(edge(0.9, 1))}Q{pt(qb(P0,P1,P2,1.0))} {pt(edge(0.9, -1))}"
cal = f"M{pt(edge(0.76, 1))}L{pt(qb(P0,P1,P2,0.6))}L{pt(edge(0.76, -1))}"
icons["vegetables"] = [P(body), P(cal + cap), P(f"M{pt(qb(P0,P1,P2,0.98))}L20.6 3.6")]

# house favourites: bilao tray with woven front band, rice mound and two lumpia rolls
cx, cy, rx, ry, iry = 12, 15.4, 9.5, 4.9, 3.0
ticks = ""
for a in (45, 75, 105, 135):
    t = math.radians(a)
    p1 = (cx + (rx - 2.2) * math.cos(t), cy + iry * math.sin(t))
    p2 = (cx + (rx - 0.15) * math.cos(t), cy + (ry - 0.15) * math.sin(t))
    ticks += f"M{pt(p1)}L{pt(p2)}"
icons["house-favourites"] = [
    f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"/>',
    P(f"M{f(cx-rx+2.2)} {f(cy)}a{f(rx-2.2)} {f(iry)} 0 0 0 {f(2*(rx-2.2))} 0" + ticks),
    P("M5.6 14.6c0-2.6 1.6-4.4 3.6-4.4s3.6 1.8 3.6 4.4"),
    '<rect x="13.8" y="9.4" width="5.4" height="2" rx="1" transform="rotate(-14 16.5 10.4)"/>',
    '<rect x="14.2" y="12.2" width="5.4" height="2" rx="1" transform="rotate(-14 16.9 13.2)"/>',
]

# unli rice: low rice mound on a plate under an infinity loop
icons["unli-rice"] = [P(inf), P("M3.5 20h17M5.6 20c0-4.2 2.9-7 6.4-7s6.4 2.8 6.4 7"),
                      P(dot(9.6, 16.6) + dot(12.4, 15.4) + dot(14.4, 17.4))]

# (replaced below)
# rice meals: plate from above, rice scoop + three tapa slices
icons["rice-meals"] = [
    '<circle cx="12" cy="12" r="9.5"/>',
    '<circle cx="9" cy="12.4" r="3.4"/>',
    P(dot(8.2, 11.6) + dot(10, 13.2)),
    P("M14 9.2c1.6-1.1 4-.8 4.6 1 .5 1.5-.2 2.3.3 3.5.5 1.4-.7 2.7-2.3 2.5-1.3-.1-1.9-1-2.9-1.5-1.3-.7-1.4-4.3.3-5.5z"),
]

# rice meals v3: divided canteen plate from above; rice grains | sauce wave / leaf
icons["rice-meals"] = [
    '<rect x="2.5" y="5" width="19" height="14" rx="3.5"/>',
    P("M11.5 5v14M11.5 12h10"),
    P(dot(5.6, 9) + dot(8.2, 10.4) + dot(5.8, 12.4) + dot(8.4, 14.4) + dot(6, 15.8)),
    P("M14 8.8c.8-.6 1.7-.6 2.5 0s1.7.6 2.5 0"),
    P(lens((14.2, 16.8), (19, 14.6), 2.4)),
]
# house favourites v3: simpler contents
icons["house-favourites"] = [
    f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"/>',
    P(f"M{f(cx-rx+2.2)} {f(cy)}a{f(rx-2.2)} {f(iry)} 0 0 0 {f(2*(rx-2.2))} 0" + ticks),
    P("M6.4 15c0-2.4 1.5-3.8 3.2-3.8s3.2 1.4 3.2 3.8"),
    '<rect x="13.8" y="12.6" width="4.8" height="2" rx="1" transform="rotate(-18 16.2 13.6)"/>',
    P(diamond(12, 7.4, 1.2), solid=True),
]
# breakfast: livelier egg white
egg = []
for k in range(12):
    t = k / 12 * 2 * math.pi
    r = 8.2 + 0.8 * math.sin(3 * t + 0.4) + 0.5 * math.sin(5 * t + 1.9)
    egg.append((12 + r * math.cos(t), 12.2 + r * 0.9 * math.sin(t)))
icons["breakfast"] = [P(catmull(egg)), '<circle cx="12.8" cy="11.6" r="3" fill="currentColor" stroke="none"/>']

for name, parts in icons.items():
    with open(os.path.join(OUT, f"icon-{name}.svg"), "w") as fh:
        fh.write(ICON_HEAD + "".join(parts) + "</svg>\n")

# ---------------- ornaments ----------------
def svg(vb, w, h, body, extra="", sw="1.5"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w}" height="{h}" fill="none" '
            f'stroke="currentColor" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" '
            f'aria-hidden="true"{extra}>{body}</svg>\n')

def branch(center, radius, a0, a1, n, leaf_len, leaf_w, paired=False):
    """Laurel branch along an arc from angle a0 to a1 (deg). Leaves alternate in/out, shrink to tip."""
    cxx, cyy = center
    pts = []
    stem = []
    for i in range(41):
        a = math.radians(a0 + (a1 - a0) * i / 40)
        stem.append((cxx + radius * math.cos(a), cyy + radius * math.sin(a)))
    d_stem = catmull(stem, closed=False)
    leaves = ""
    for i in range(n):
        u = (i + 0.6) / (n + 0.2)
        a = math.radians(a0 + (a1 - a0) * u)
        base = (cxx + radius * math.cos(a), cyy + radius * math.sin(a))
        tang = (-math.sin(a), math.cos(a))
        if a1 < a0: tang = (-tang[0], -tang[1])
        rad = (math.cos(a), math.sin(a))
        side = 1 if i % 2 == 0 else -1
        sides = (1, -1) if paired else (side,)
        ang = math.radians(28)
        for sd in sides:
            dv = (tang[0] * math.cos(ang) + rad[0] * sd * math.sin(ang),
                  tang[1] * math.cos(ang) + rad[1] * sd * math.sin(ang))
            ln = leaf_len * (1 - 0.3 * u)
            tip = (base[0] + dv[0] * ln, base[1] + dv[1] * ln)
            leaves += lens(base, tip, leaf_w * (1 - 0.25 * u))
    tipa = math.radians(a1)
    return d_stem, leaves

# Colosseum emblem, 64 grid
def colosseum(ox=0, oy=0, sx=1.0):
    def X(x): return ox + x * sx
    def Y(y): return oy + y * sx
    body = []
    # silhouette: tall left wall, broken step, lower right wall, curved like the oval in 3/4
    sil = (f"M{f(X(16))} {f(Y(33))}V{f(Y(19))}C{f(X(21))} {f(Y(17.4))} {f(X(26.5))} {f(Y(16.6))} {f(X(32))} {f(Y(16.4))}"
           f"V{f(Y(19.4))}H{f(X(35.2))}V{f(Y(22.4))}C{f(X(40))} {f(Y(22.6))} {f(X(44.5))} {f(Y(23.4))} {f(X(48))} {f(Y(24.6))}V{f(Y(33))}")
    body.append(sil)
    body.append(f"M{f(X(14.5))} {f(Y(33))}H{f(X(49.5))}")
    # cornices
    body.append(f"M{f(X(16))} {f(Y(28))}C{f(X(26))} {f(Y(27.2))} {f(X(38))} {f(Y(27.2))} {f(X(48))} {f(Y(28.6))}")
    body.append(f"M{f(X(16))} {f(Y(23.2))}C{f(X(22))} {f(Y(22.3))} {f(X(28))} {f(Y(21.9))} {f(X(35.2))} {f(Y(22.4))}")
    arches = ""
    for x in (18.4, 22.6, 26.8, 31, 35.2, 39.4, 43.6):
        arches += f"M{f(X(x-1.25))} {f(Y(33))}V{f(Y(30.6))}a{f(1.25*sx)} {f(1.25*sx)} 0 0 1 {f(2.5*sx)} 0V{f(Y(33))}"
    for x in (18.4, 22.6, 26.8, 31):
        arches += f"M{f(X(x-1.1))} {f(Y(27.4))}V{f(Y(25.6))}a{f(1.1*sx)} {f(1.1*sx)} 0 0 1 {f(2.2*sx)} 0V{f(Y(27.4))}"
    for x in (39.4, 43.6):
        arches += f"M{f(X(x-1.1))} {f(Y(28.1))}V{f(Y(26.5))}a{f(1.1*sx)} {f(1.1*sx)} 0 0 1 {f(2.2*sx)} 0V{f(Y(28.1))}"
    body.append(arches)
    win = "".join(dot(X(x), Y(20.4)) for x in (19, 22.5, 26, 29.5))
    return body, win

col, win = colosseum(-3.2, -5.2, 1.1)
ls, ll = branch((32, 31), 23, 99, 166, 6, 6.2, 2.9)
rs, rl = branch((32, 31), 23, 81, 14, 6, 6.2, 2.9)
emblem = ('<circle cx="32" cy="32" r="30.5"/><circle cx="32" cy="32" r="28" stroke-width=".75"/>'
          + f'<path d="{col[0]}{col[1]}"/>'
          + f'<path d="{col[2]}{col[3]}{col[4]}" stroke-width="1"/>'
          + f'<path d="{win}" stroke-width="1.2"/>'
          + f'<path d="{ls}{rs}" stroke-width="1.25"/><path d="{ll}{rl}" stroke-width="1"/>'
          + f'<path d="{diamond(32, 37.2, 1.6)}" fill="currentColor" stroke="none"/>'
          + '<path d="M24.5 37.2h5M34.5 37.2h5" stroke-width=".75"/>')
open(os.path.join(OUT, "emblem-colosseum.svg"), "w").write(svg("0 0 64 64", 64, 64, emblem))

# laurel ring for placeholder plates (category icon sits in the middle at 40%)
ls2, ll2 = branch((50, 50), 41, 98, 262, 16, 9, 3.8)
rs2, rl2 = branch((50, 50), 41, 82, -82, 16, 9, 3.8)
ring = (f'<circle cx="50" cy="50" r="48" stroke-width=".75"/><path d="{ls2}{rs2}" stroke-width="1.25"/><path d="{ll2}{rl2}" stroke-width="1"/>'
        f'<path d="{diamond(50, 91, 2)}" fill="currentColor" stroke="none"/>')
open(os.path.join(OUT, "laurel-ring.svg"), "w").write(svg("0 0 100 100", 100, 100, ring))

# olive sprig 64x32: gentle S stem, alternating long leaves, two olives (one solid)
stem_pts = [(4, 27), (16, 22.5), (30, 17), (44, 12), (58, 7.5)]
stem = catmull(stem_pts, closed=False)
leaves = ""
for i, (u, side) in enumerate([(0.14, 1), (0.26, -1), (0.40, 1), (0.53, -1), (0.66, 1), (0.78, -1), (0.9, 1)]):
    x = 4 + 54 * u; y = 27 - 19.5 * u - 2.5 * math.sin(u * math.pi)
    ang = math.radians(-20 + side * -50)
    ln = 11.5 * (1 - 0.3 * u)
    tip = (x + ln * math.cos(ang), y + ln * math.sin(ang))
    leaves += lens((x, y), tip, 2.8 * (1 - 0.2 * u))
olive_a = '<ellipse cx="22" cy="25.6" rx="2.2" ry="3" transform="rotate(-25 22 25.6)" fill="currentColor" stroke="none"/>'
olive_b = '<ellipse cx="40" cy="19.4" rx="2" ry="2.7" transform="rotate(-25 40 19.4)"/>'
sprig = (f'<path d="{stem}"/><path d="{leaves}" stroke-width="1.2"/>'
         '<path d="M21 23 19.6 20.8" stroke-width="1"/>' + olive_a)
open(os.path.join(OUT, "olive-sprig.svg"), "w").write(svg("0 0 64 32", 64, 32, sprig))

# flourish with diamond 96x16
fl = ("M4 8h22c3 0 4.2-3.2 7-3.2 2.6 0 3.4 3.2 1.2 3.9-1.6.5-2.6-1.3-1.2-2"
      "M92 8H70c-3 0-4.2-3.2-7-3.2-2.6 0-3.4 3.2-1.2 3.9 1.6.5 2.6-1.3 1.2-2"
      "M38.5 8h3.5M54 8h3.5")
flourish = f'<path d="{fl}" stroke-width="1"/><path d="{diamond(48, 8, 3.4)}" fill="currentColor" stroke="none"/>'
open(os.path.join(OUT, "flourish-diamond.svg"), "w").write(svg("0 0 96 16", 96, 16, flourish))

# gold rule ending in a diamond. pathLength=1 so it can be drawn with dashoffset 1 -> 0.
rule = ('<path class="lr-rule-line" d="M1 6H292" pathLength="1" stroke-width="1"/>'
        f'<path class="lr-rule-diamond" d="{diamond(296, 6, 3.6)}" fill="currentColor" stroke="none"/>')
open(os.path.join(OUT, "rule-diamond.svg"), "w").write(svg("0 0 300 12", 300, 12, rule, ' preserveAspectRatio="xMaxYMid meet"'))

# indicator arch pips
pip = '<path d="M1.5 13.5V6.5a3.5 3.5 0 0 1 7 0v7z"/>'
open(os.path.join(OUT, "pip-arch.svg"), "w").write(svg("0 0 10 15", 10, 15, pip, sw="1.25"))
pip_a = '<path d="M.5 14.5V8.5C.5 4.4 5.2 1.5 11 1.5s10.5 2.9 10.5 7v6z" fill="currentColor" stroke="none"/>'
open(os.path.join(OUT, "pip-arch-active.svg"), "w").write(svg("0 0 22 15", 22, 15, pip_a))

# scalloped-corner frame, 96x96 nine-slice source (slice 32). outer 1px line, inner .75 line, corner diamond.
def frame_svg(color=None):
    R1, R2, i1, i2 = 15, 21, 1, 6.5
    a1 = math.sqrt(R1**2 - i1**2); a2 = math.sqrt(R2**2 - i2**2)
    W = 96
    def loop(i, R, a):
        # concave quarter-circle corners centred on each frame corner
        return (f"M{f(a)} {f(i)}H{f(W-a)}A{f(R)} {f(R)} 0 0 0 {f(W-i)} {f(a)}"
                f"V{f(W-a)}A{f(R)} {f(R)} 0 0 0 {f(W-a)} {f(W-i)}H{f(a)}A{f(R)} {f(R)} 0 0 0 {f(i)} {f(W-a)}"
                f"V{f(a)}A{f(R)} {f(R)} 0 0 0 {f(a)} {f(i)}Z")
    st = color or "currentColor"
    dm = "".join(diamond(x, y, 1.8) for x, y in ((5.2, 5.2), (W-5.2, 5.2), (5.2, W-5.2), (W-5.2, W-5.2)))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" fill="none">'
            f'<path d="{loop(i1, R1, a1)}" stroke="{st}" stroke-width="1"/>'
            f'<path d="{loop(i2, R2, a2)}" stroke="{st}" stroke-width=".75"/>'
            f'<path d="{dm}" fill="{st}"/></svg>\n')
open(os.path.join(OUT, "frame-scalloped.svg"), "w").write(frame_svg())
open(os.path.join(OUT, "frame-scalloped-gold.svg"), "w").write(frame_svg("#92754F"))
frame_uri = "data:image/svg+xml," + urllib.parse.quote(frame_svg("#92754F").strip(), safe=":/=,; ")

# squircle mask (superellipse n=5), 100x100
pts = []
for k in range(96):
    t = k / 96 * 2 * math.pi
    c, s = math.cos(t), math.sin(t)
    x = 50 + 50 * math.copysign(abs(c) ** (2 / 5), c)
    y = 50 + 50 * math.copysign(abs(s) ** (2 / 5), s)
    pts.append((x, y))
sq = "M" + "L".join(pt(p) for p in pts) + "Z"
sq_svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><path d="{sq}" fill="#000"/></svg>\n'
open(os.path.join(OUT, "squircle-mask.svg"), "w").write(sq_svg)
sq_uri = "data:image/svg+xml," + urllib.parse.quote(sq_svg.strip(), safe=":/=,; ")

if len(sys.argv) > 2:  # optional: write the CSS data URIs (frame, squircle) for stage.css
    with open(sys.argv[2], "w") as fh:
        fh.write(frame_uri + "\n" + sq_uri + "\n")
print("icons:", len(icons))
