#!/usr/bin/env python3
"""
globe.py — halftone ASCII sphere that morphs into a ring and collapses back.

━━━ COORDINATE SYSTEM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  X → right    Y ↑ up    Z ● out of screen toward viewer

  Terminal rows increase downward, so we flip Y when mapping rows → world space.

━━━ SPHERE (unit sphere, parametric surface) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  P(θ, φ) = ( sin φ · cos θ,   ← X  (longitude slice, horizontal spread)
              cos φ,            ← Y  (latitude, top=0 bottom=π)
              sin φ · sin θ )   ← Z  (depth)

  θ ∈ [0, 2π)  azimuth  (longitude)
  φ ∈ [0,  π]  polar    (0 = north pole)

  Outward unit normal on a unit sphere equals the position itself: N = P.

━━━ TORUS ("eye of sauron" ring) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  The torus lies in the XZ plane (Y=0 is its equatorial plane, visible face-on).

  Q(θ, φ) = ( (R + r·cos φ) · cos θ,   ← X
               r · sin φ,               ← Y  (tube height above/below plane)
              (R + r·cos φ) · sin θ )   ← Z

  R = major radius (centre of tube from torus centre)
  r = minor radius (tube cross-section)

  SDF of the torus used for ray-marching:
    SDF(p) = √( (√(px²+pz²) − R)² + py² ) − r

━━━ MORPHING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  morph_t ∈ [0, 1]:  0 = pure sphere,  1 = pure torus.
  Pixel luminance is blended between both shapes' shading results.
  Transitions use a quintic smoothstep so velocity and acceleration are
  both zero at the endpoints (no pop or jerk).

━━━ LIGHTING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Lambertian diffuse:  lum = max(0, dot(N_world, L))
  Ambient fill:        lum += AMBIENT                  (lifts shadow side)
  Rim highlight:       thin back-lit edge added during ring phase

  The object rotates; normals are in object space and must be transformed
  to world space via R^T (transpose = inverse for orthogonal matrices).

━━━ RENDERING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  For each terminal cell (col, row):
    1. Map to normalised screen coords (sx, sy) ∈ [-1, 1]².
    2. Correct for non-square chars: sx /= ASPECT  (chars are ~2× taller).
    3. Rotate sample point into object space via R^T.
    4. Cast ray parallel to world -Z; find intersection with sphere / torus.
    5. Compute luminance; index into CHARS for final glyph.

  Refresh:  '\033[H' moves cursor to top-left without erasing the frame
            buffer — this eliminates the flicker you'd get from '\033[2J'.
  Cursor:   hidden with '\033[?25l' during the loop, restored on exit.
  Frame cap: sleep until the next frame deadline; absorbs render time.
"""

import sys, math, time, signal

# ── Character set ─────────────────────────────────────────────────────────────
# Ordered dark → bright (designed for DARK terminal backgrounds).
# Dot-heavy characters give the halftone feel; finer glyphs at low luminance,
# heavier blobs at high luminance (direct light hit).
CHARS = " `·.,:;+it1oO0Q@#"
CHAR_N = len(CHARS)

# ── Canvas ────────────────────────────────────────────────────────────────────
WIDTH  = 88    # character columns  (must be even for visual centering)
HEIGHT = 44    # character rows
ASPECT = 2.1   # terminal cell height / width ratio; squish X to get round circle

# ── Shape parameters ──────────────────────────────────────────────────────────
SPHERE_R = 0.82   # sphere radius in normalised [-1,1] space
TORUS_R  = 0.54   # torus major radius
TORUS_r  = 0.26   # torus minor (tube) radius

# ── Animation cycle (seconds) ─────────────────────────────────────────────────
FPS          = 30
FRAME_DT     = 1.0 / FPS

T_SPHERE     = 2.8   # hold as globe
T_TO_RING    = 2.2   # globe → ring morph
T_RING       = 2.4   # hold as ring (eye of sauron)
T_TO_SPHERE  = 2.0   # ring → globe collapse
CYCLE        = T_SPHERE + T_TO_RING + T_RING + T_TO_SPHERE

# ── Rotation speeds (radians / second) ────────────────────────────────────────
OMEGA_Y = 1.0    # primary spin around Y (longitude drift, makes sphere "spin")
OMEGA_X = 0.22   # slow tumble around X (latitude rock)
OMEGA_Z = 0.10   # gentle roll

# ── Lighting ──────────────────────────────────────────────────────────────────
_lk = (0.55, 0.75, 0.55)
_lk_mag = math.sqrt(sum(v*v for v in _lk))
LIGHT = tuple(v / _lk_mag for v in _lk)   # normalised key-light direction

AMBIENT = 0.15    # minimum luminance on the shadow side
RIM_STR = 0.30    # back-rim intensity added during ring phase

# ── Easing ────────────────────────────────────────────────────────────────────
def smootherstep(t: float) -> float:
    """Ken Perlin's quintic — zero 1st and 2nd derivatives at t=0 and t=1."""
    t = max(0.0, min(1.0, t))
    return t * t * t * (t * (t * 6 - 15) + 10)

# ── 3-D math helpers ──────────────────────────────────────────────────────────
def rot_x(a):
    c, s = math.cos(a), math.sin(a)
    return ((1,0,0), (0,c,-s), (0,s,c))

def rot_y(a):
    c, s = math.cos(a), math.sin(a)
    return ((c,0,s), (0,1,0), (-s,0,c))

def rot_z(a):
    c, s = math.cos(a), math.sin(a)
    return ((c,-s,0), (s,c,0), (0,0,1))

def mat_mul_3x3(A, B):
    return tuple(
        tuple(sum(A[r][k] * B[k][c] for k in range(3)) for c in range(3))
        for r in range(3)
    )

def mat_vec(M, v):
    return (
        M[0][0]*v[0] + M[0][1]*v[1] + M[0][2]*v[2],
        M[1][0]*v[0] + M[1][1]*v[1] + M[1][2]*v[2],
        M[2][0]*v[0] + M[2][1]*v[1] + M[2][2]*v[2],
    )

def normalize(v):
    d = math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
    return (v[0]/d, v[1]/d, v[2]/d) if d > 1e-9 else (0.0, 0.0, 1.0)

def dot3(a, b):
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]

# ── Ray–sphere intersection ───────────────────────────────────────────────────
def sphere_hit(sx: float, sy: float, R: float = SPHERE_R):
    """
    Ray: origin=(sx, sy, +∞), direction=(0, 0, -1).
    Sphere: x² + y² + z² = R².

    Substitute ray into sphere eq:  sx² + sy² + z² = R²
    → z² = R² − sx² − sy²

    Positive root (front face):  z = +√(R² − sx² − sy²)
    Normal on unit sphere:        N = (sx/R, sy/R, z/R)

    Returns (z_hit, normal) or None if miss.
    """
    disc = R*R - sx*sx - sy*sy
    if disc < 0.0:
        return None
    z  = math.sqrt(disc)
    return (z, (sx/R, sy/R, z/R))

# ── Ray–torus intersection via sphere tracing ─────────────────────────────────
def torus_hit(sx: float, sy: float, R: float = TORUS_R, r: float = TORUS_r):
    """
    Torus SDF (torus lies in XZ plane, centre at origin):
      q  = √(px² + pz²) − R      (distance from tube-centre ring in XZ plane)
      SDF(p) = √(q² + py²) − r   (distance from tube surface)

    We sphere-march a ray (sx, sy, t) along t (world Z axis).
    Start t just past the back of the torus; march inward (+t direction).
    On sign change → bisect once for a sharper surface.

    Normal is estimated via central finite differences on the SDF.
    """
    def sdf(px, py, pz):
        q = math.sqrt(px*px + pz*pz) - R
        return math.sqrt(q*q + py*py) - r

    # Bound: torus fits in a sphere of radius R+r; march from back to front.
    extent = R + r + 0.05
    t   = -extent
    end =  extent
    dt  = (end - t) / 96   # 96 steps — good enough for up to ~90 cols wide

    prev_d = sdf(sx, sy, t)
    while t < end:
        t += dt
        d = sdf(sx, sy, t)
        if prev_d > 0.0 and d <= 0.0:
            # Bisect for precision
            t_lo, t_hi = t - dt, t
            for _ in range(6):
                t_mid = (t_lo + t_hi) * 0.5
                if sdf(sx, sy, t_mid) > 0.0:
                    t_lo = t_mid
                else:
                    t_hi = t_mid
            t_hit = (t_lo + t_hi) * 0.5
            px, py, pz = sx, sy, t_hit
            e = 1e-3
            nx = sdf(px+e, py,   pz  ) - sdf(px-e, py,   pz  )
            ny = sdf(px,   py+e, pz  ) - sdf(px,   py-e, pz  )
            nz = sdf(px,   py,   pz+e) - sdf(px,   py,   pz-e)
            return (t_hit, normalize((nx, ny, nz)))
        prev_d = d
    return None

# ── Shade a surface point ─────────────────────────────────────────────────────
def shade(normal_obj, R_mat, morph_t: float) -> float:
    """
    Transform normal from object space → world space via R^T (transpose = inverse).
    Compute Lambertian + ambient + optional rim.
    morph_t drives rim intensity so the ring glows on its back edge.
    """
    # R^T applied to the normal vector
    n = (
        R_mat[0][0]*normal_obj[0] + R_mat[1][0]*normal_obj[1] + R_mat[2][0]*normal_obj[2],
        R_mat[0][1]*normal_obj[0] + R_mat[1][1]*normal_obj[1] + R_mat[2][1]*normal_obj[2],
        R_mat[0][2]*normal_obj[0] + R_mat[1][2]*normal_obj[1] + R_mat[2][2]*normal_obj[2],
    )
    diffuse = max(0.0, dot3(n, LIGHT))
    rim     = max(0.0, -dot3(n, LIGHT)) * RIM_STR * morph_t * morph_t
    return min(1.0, AMBIENT + diffuse * (1.0 - AMBIENT) + rim)

def lum_to_char(lum: float) -> str:
    idx = max(0, min(CHAR_N - 1, int(lum * (CHAR_N - 1) + 0.5)))
    return CHARS[idx]

# ── Frame renderer ─────────────────────────────────────────────────────────────
def render_frame(R_mat, morph_t: float) -> str:
    """
    R_mat   : 3×3 world rotation matrix (object → world).
    morph_t : 0 = sphere, 1 = torus; drives per-pixel blend.

    We need to rotate screen-space sample points into object space.
    Since the rotation R rotates object→world, the inverse (world→object)
    is R^T.  We apply R^T to the 2-D screen sample to get object-space coords.
    """
    # Precompute R^T columns (applied per pixel)
    Rt = (
        (R_mat[0][0], R_mat[1][0], R_mat[2][0]),
        (R_mat[0][1], R_mat[1][1], R_mat[2][1]),
        (R_mat[0][2], R_mat[1][2], R_mat[2][2]),
    )

    rows = []
    for row in range(HEIGHT):
        # sy: +1 at top row, -1 at bottom (Y-up convention)
        sy_w = 1.0 - 2.0 * row / (HEIGHT - 1)
        line = []
        for col in range(WIDTH):
            sx_w = (-1.0 + 2.0 * col / (WIDTH - 1)) / ASPECT

            # Rotate screen position into object space (Z component → 0 origin)
            ox = Rt[0][0]*sx_w + Rt[0][1]*sy_w
            oy = Rt[1][0]*sx_w + Rt[1][1]*sy_w

            # Both shapes receive rotated (ox, oy) as their 2-D sample point.
            # Their Z axis aligns with world -Z (the view direction).

            ch = ' '
            if morph_t < 1e-6:
                # ── Pure sphere ────────────────────────────────────────────
                h = sphere_hit(ox, oy)
                if h:
                    ch = lum_to_char(shade(h[1], R_mat, 0.0))

            elif morph_t > 1.0 - 1e-6:
                # ── Pure torus ─────────────────────────────────────────────
                h = torus_hit(ox, oy)
                if h:
                    lum = shade(h[1], R_mat, 1.0)
                    # Inner-fire ember: extra brightness near the torus hole
                    # (oy ≈ 0 in object space = equatorial rim of the ring)
                    ember = max(0.0, 1.0 - abs(oy) * 4.5) * 0.4
                    ch = lum_to_char(min(1.0, lum + ember))

            else:
                # ── Blended morph ─────────────────────────────────────────
                hs = sphere_hit(ox, oy)
                ht = torus_hit(ox, oy)
                lum_s = shade(hs[1], R_mat, morph_t) if hs else 0.0
                lum_t = shade(ht[1], R_mat, morph_t) if ht else 0.0

                # Coverage blend: a pixel is "filled" if either shape covers it,
                # weighted by morph_t so the torus silhouette fades in.
                cov_s = (1.0 if hs else 0.0) * (1.0 - morph_t)
                cov_t = (1.0 if ht else 0.0) * morph_t
                total = cov_s + cov_t
                if total > 0.35:
                    lum = (lum_s * cov_s + lum_t * cov_t) / total
                    ch = lum_to_char(lum)

            line.append(ch)
        rows.append(''.join(line))
    return '\n'.join(rows)

# ── Cycle → morph_t ───────────────────────────────────────────────────────────
def cycle_morph(elapsed: float) -> float:
    t = elapsed % CYCLE
    if t < T_SPHERE:
        return 0.0
    t -= T_SPHERE
    if t < T_TO_RING:
        return smootherstep(t / T_TO_RING)
    t -= T_TO_RING
    if t < T_RING:
        return 1.0
    t -= T_RING
    return 1.0 - smootherstep(t / T_TO_SPHERE)

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    # Hide cursor; do NOT clear the screen yet (avoids initial flash)
    sys.stdout.write('\033[?25l')
    sys.stdout.flush()

    def cleanup(sig=None, frame=None):
        # Restore cursor, clear screen, reset
        sys.stdout.write('\033[?25h\033[2J\033[H')
        sys.stdout.flush()
        sys.exit(0)

    signal.signal(signal.SIGINT,  cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    start      = time.perf_counter()
    next_frame = start

    while True:
        now = time.perf_counter()
        # ── Frame-rate cap ─────────────────────────────────────────────────
        # Accumulate render time into the deadline; if a frame is expensive
        # we drop to the *next* deadline rather than spinning.
        if now < next_frame:
            time.sleep(next_frame - now)
        next_frame += FRAME_DT

        elapsed = time.perf_counter() - start
        morph_t = cycle_morph(elapsed)

        # ── Build rotation matrix ──────────────────────────────────────────
        # Compose three independent rotations.  The order matters:
        #   Ry rotates around the vertical axis → longitude spin (most visible)
        #   Rx tilts the pole toward the viewer  → latitude rock
        #   Rz rolls the whole thing gently      → subtle cyclical lean
        Ry = rot_y(elapsed * OMEGA_Y)
        Rx = rot_x(elapsed * OMEGA_X)
        Rz = rot_z(elapsed * OMEGA_Z)
        R  = mat_mul_3x3(Ry, mat_mul_3x3(Rx, Rz))

        frame = render_frame(R, morph_t)

        # ── Flicker-free refresh ───────────────────────────────────────────
        # '\033[H'  moves cursor to (1,1) without erasing.
        # Writing over the same cells in-place is faster and flicker-free
        # compared to '\033[2J' (full erase) which causes a visible repaint.
        sys.stdout.write('\033[H' + frame)
        sys.stdout.flush()

if __name__ == '__main__':
    main()
