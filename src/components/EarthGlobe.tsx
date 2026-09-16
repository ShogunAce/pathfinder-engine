import React, { useEffect, useRef } from "react";

export const EarthGlobe: React.FC = () => {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const holder = holderRef.current;
    const canvas = canvasRef.current;
    if (!holder || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isDestroyed = false;

    const SPIN_DIR = -1;
    const IDLE_RATE = (2 * Math.PI) / 200000;
    const TEX_W = 1024;
    const TEX_H = 512;
    const CLD_W = 512;
    const CLD_H = 256;

    function px(lon: number, lat: number): [number, number] {
      return [((lon + 180) / 360) * TEX_W, ((90 - lat) / 180) * TEX_H];
    }

    const LAND = [
      /* North America */
      [[-168,66],[-160,71],[-140,70],[-128,70],[-115,73],[-100,74],[-85,73],[-72,73],[-62,66],[-56,60],[-53,53],[-60,47],[-66,44],[-70,41],[-74,35],[-79,32],[-81,25],[-83,29],[-90,29],[-94,29],[-97,26],[-105,22],[-107,25],[-113,31],[-117,33],[-122,37],[-124,42],[-124,48],[-131,53],[-140,59],[-150,59],[-158,56],[-165,60]],
      /* Central America */
      [[-105,22],[-97,26],[-94,18],[-88,21],[-87,16],[-84,11],[-79,9],[-77,8],[-83,9],[-86,13],[-92,15],[-97,18],[-102,20]],
      /* South America */
      [[-77,8],[-72,12],[-62,11],[-52,5],[-50,0],[-44,-2],[-35,-5],[-38,-13],[-39,-18],[-48,-25],[-54,-34],[-58,-39],[-62,-41],[-65,-45],[-68,-50],[-72,-54],[-75,-52],[-74,-44],[-73,-37],[-71,-30],[-70,-22],[-71,-16],[-77,-8],[-80,-3],[-79,2]],
      /* Greenland */
      [[-45,60],[-52,64],[-56,70],[-58,76],[-48,82],[-32,83],[-20,80],[-22,74],[-30,68],[-38,63]],
      /* Iceland */
      [[-24,64],[-18,66],[-14,65],[-19,63]],
      /* Africa */
      [[-17,15],[-16,21],[-10,27],[-5,31],[3,34],[10,34],[20,32],[28,31],[33,31],[36,23],[38,18],[43,12],[48,12],[51,11],[46,3],[41,-1],[40,-8],[36,-15],[33,-22],[31,-26],[27,-33],[20,-35],[17,-29],[13,-20],[11,-10],[9,-1],[5,4],[-2,5],[-8,5],[-13,9]],
      /* Madagascar */
      [[44,-12],[49,-15],[50,-19],[47,-25],[44,-22],[43,-17]],
      /* Eurasia */
      [[-10,36],[-9,43],[-2,48],[0,49],[4,52],[8,54],[9,57],[13,55],[19,55],[22,59],[25,65],[30,70],[42,68],[55,70],[68,73],[78,73],[90,76],[105,77],[113,74],[125,73],[136,72],[150,70],[162,69],[172,66],[180,65],[180,58],[170,60],[160,58],[150,59],[142,54],[135,48],[131,43],[127,39],[122,37],[121,31],[117,24],[110,21],[106,18],[103,13],[100,13],[98,17],[95,16],[92,21],[88,22],[83,18],[80,13],[77,8],[73,20],[68,24],[64,25],[60,25],[57,22],[52,18],[45,13],[43,13],[40,20],[37,26],[35,31],[34,35],[30,37],[26,39],[22,40],[16,41],[12,45],[8,44],[3,43],[-2,40],[-6,37]],
      /* British Isles */
      [[-6,50],[-5,55],[-3,58],[-1,54],[-1,51],[-4,50]],
      [[-10,52],[-8,55],[-6,54],[-6,52]],
      /* Japan */
      [[130,32],[135,34],[140,37],[143,43],[145,44],[141,40],[137,36],[133,34]],
      /* Philippines */
      [[120,18],[124,16],[126,10],[122,6],[120,12]],
      /* Borneo */
      [[109,2],[117,4],[119,-2],[115,-4],[110,-3]],
      /* Sumatra, Java, New Guinea arc */
      [[95,5],[103,1],[106,-6],[114,-8],[120,-9],[127,-8],[132,-4],[141,-3],[147,-8],[150,-10],[143,-9],[135,-8],[128,-4],[120,-3],[113,-3],[108,-4],[104,2],[98,6]],
      /* Australia */
      [[113,-22],[114,-27],[116,-33],[120,-34],[125,-33],[130,-32],[134,-33],[138,-35],[141,-38],[146,-39],[150,-37],[153,-31],[153,-25],[148,-20],[145,-15],[142,-11],[137,-12],[133,-11],[130,-12],[127,-14],[122,-17],[117,-20]],
      /* New Zealand */
      [[166,-46],[170,-43],[174,-41],[178,-38],[176,-40],[172,-44],[168,-47]],
      /* Antarctica */
      [[-180,-72],[-150,-75],[-120,-73],[-90,-72],[-62,-64],[-45,-70],[-20,-70],[10,-69],[40,-67],[70,-68],[100,-66],[130,-66],[160,-70],[180,-78],[180,-90],[-180,-90]]
    ];

    function landPath(c: CanvasRenderingContext2D) {
      c.beginPath();
      for (let i = 0; i < LAND.length; i++) {
        const poly = LAND[i];
        for (let j = 0; j < poly.length; j++) {
          const p = px(poly[j][0], poly[j][1]);
          if (j === 0) c.moveTo(p[0], p[1]);
          else c.lineTo(p[0], p[1]);
        }
        c.closePath();
      }
    }

    function buildSurface(): Uint8ClampedArray {
      const c = document.createElement("canvas");
      c.width = TEX_W;
      c.height = TEX_H;
      const g = c.getContext("2d", { willReadFrequently: true });
      if (!g) return new Uint8ClampedArray();

      /* ocean */
      const ocean = g.createLinearGradient(0, 0, 0, TEX_H);
      ocean.addColorStop(0.0, "#07182a");
      ocean.addColorStop(0.16, "#082742");
      ocean.addColorStop(0.34, "#0b3963");
      ocean.addColorStop(0.5, "#0e4a7d");
      ocean.addColorStop(0.68, "#0b3963");
      ocean.addColorStop(0.86, "#082742");
      ocean.addColorStop(1.0, "#07182a");
      g.fillStyle = ocean;
      g.fillRect(0, 0, TEX_W, TEX_H);

      /* deep ocean basins */
      for (let k = 0; k < 30; k++) {
        const ox = Math.random() * TEX_W;
        const oy = Math.random() * TEX_H;
        const orad = 70 + Math.random() * 200;
        const og = g.createRadialGradient(ox, oy, 0, ox, oy, orad);
        og.addColorStop(0, "rgba(5,20,38,.34)");
        og.addColorStop(1, "rgba(5,20,38,0)");
        g.fillStyle = og;
        g.fillRect(ox - orad, oy - orad, orad * 2, orad * 2);
      }

      /* land, tinted by latitude band */
      const land = g.createLinearGradient(0, 0, 0, TEX_H);
      land.addColorStop(0.0, "#d7e4e7");
      land.addColorStop(0.08, "#8ca093");
      land.addColorStop(0.15, "#41623f");
      land.addColorStop(0.24, "#2f5c34");
      land.addColorStop(0.32, "#3a6a38");
      land.addColorStop(0.385, "#7d7346");
      land.addColorStop(0.44, "#4a6f31");
      land.addColorStop(0.5, "#1f5c2c");
      land.addColorStop(0.56, "#246430");
      land.addColorStop(0.635, "#79713f");
      land.addColorStop(0.71, "#37613a");
      land.addColorStop(0.8, "#5d7566");
      land.addColorStop(0.89, "#a9bcb8");
      land.addColorStop(1.0, "#e4eef0");

      g.save();
      landPath(g);
      g.fillStyle = land;
      g.fill();
      g.restore();

      /* coastline lift */
      g.save();
      landPath(g);
      g.strokeStyle = "rgba(180,212,196,.16)";
      g.lineWidth = 1;
      g.stroke();
      g.restore();

      /* polar ice */
      const north = g.createLinearGradient(0, 0, 0, TEX_H * 0.085);
      north.addColorStop(0, "rgba(236,244,247,.9)");
      north.addColorStop(1, "rgba(236,244,247,0)");
      g.fillStyle = north;
      g.fillRect(0, 0, TEX_W, TEX_H * 0.085);

      const south = g.createLinearGradient(0, TEX_H, 0, TEX_H * 0.855);
      south.addColorStop(0, "rgba(238,245,248,.92)");
      south.addColorStop(1, "rgba(238,245,248,0)");
      g.fillStyle = south;
      g.fillRect(0, TEX_H * 0.855, TEX_W, TEX_H * 0.145);

      /* micro-grain */
      const imgData = g.getImageData(0, 0, TEX_W, TEX_H);
      const d = imgData.data;
      for (let y2 = 0; y2 < TEX_H; y2++) {
        for (let x2 = 0; x2 < TEX_W; x2++) {
          let h = (x2 * 374761393 + y2 * 668265263) | 0;
          h = Math.imul(h ^ (h >>> 13), 1274126177);
          h = (h ^ (h >>> 16)) >>> 0;
          const n = (h % 1024) / 1024 - 0.5;
          const i = (y2 * TEX_W + x2) * 4;
          d[i] += n * 11;
          d[i + 1] += n * 11;
          d[i + 2] += n * 11;
        }
      }
      return d;
    }

    function buildClouds(): Uint8Array {
      const c = document.createElement("canvas");
      c.width = CLD_W;
      c.height = CLD_H;
      const g = c.getContext("2d", { willReadFrequently: true });
      if (!g) return new Uint8Array();
      g.fillStyle = "#000";
      g.fillRect(0, 0, CLD_W, CLD_H);
      g.globalCompositeOperation = "lighter";

      const bands = [0.5, 0.5, 0.31, 0.31, 0.69, 0.69, 0.24, 0.76, 0.42, 0.58];
      for (let i = 0; i < 96; i++) {
        const band = bands[i % bands.length];
        const cy = (band + (Math.random() - 0.5) * 0.09) * CLD_H;
        const cx = Math.random() * CLD_W;
        const r = 7 + Math.random() * 24;
        const a = 0.2 + Math.random() * 0.55;
        for (let pass = -1; pass <= 1; pass++) {
          const gx = cx + pass * CLD_W;
          const rg = g.createRadialGradient(gx, cy, 0, gx, cy, r);
          rg.addColorStop(0, "rgba(255,255,255," + a + ")");
          rg.addColorStop(1, "rgba(255,255,255,0)");
          g.fillStyle = rg;
          g.fillRect(gx - r, cy - r, r * 2, r * 2);
        }
      }
      const imgData = g.getImageData(0, 0, CLD_W, CLD_H);
      const out = new Uint8Array(CLD_W * CLD_H);
      for (let j = 0; j < out.length; j++) out[j] = imgData.data[j * 4];
      return out;
    }

    const TEX = buildSurface();
    const CLD = buildClouds();

    let R = 0;
    let img: ImageData | null = null;
    let valid: Uint8Array;
    let alpha: Uint8Array;
    let texRow: Int32Array;
    let cldRow: Int32Array;
    let lon0: Float32Array;
    let shade: Float32Array;
    let rim: Float32Array;
    let tilt = 0.36;

    function rebuild(force?: boolean) {
      if (!holder) return;
      const box = holder.getBoundingClientRect();
      const disp = Math.max(160, Math.min(box.width, 900));
      const next = Math.round(Math.max(260, Math.min(disp * 0.86, 560)));
      if (next === R && !force) return;

      if (next !== R) {
        R = next;
        canvas.width = R;
        canvas.height = R;
        img = ctx.createImageData(R, R);
      }

      const n = R * R;
      if (!valid || valid.length !== n) {
        valid = new Uint8Array(n);
        alpha = new Uint8Array(n);
        texRow = new Int32Array(n);
        cldRow = new Int32Array(n);
        lon0 = new Float32Array(n);
        shade = new Float32Array(n);
        rim = new Float32Array(n);
      }

      const c = (R - 1) / 2;
      const rad = R / 2 - 1;
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      let lx = -0.42;
      let ly = 0.36;
      let lz = 0.83;
      const ll = Math.sqrt(lx * lx + ly * ly + lz * lz);
      lx /= ll;
      ly /= ll;
      lz /= ll;

      for (let y = 0; y < R; y++) {
        const ny = (y - c) / rad;
        for (let x = 0; x < R; x++) {
          const i = y * R + x;
          const nx = (x - c) / rad;
          const d2 = nx * nx + ny * ny;
          if (d2 >= 1) {
            valid[i] = 0;
            alpha[i] = 0;
            continue;
          }

          const nz = Math.sqrt(1 - d2);
          valid[i] = 1;
          const edge = rad - Math.sqrt(d2) * rad;
          alpha[i] = edge >= 1 ? 255 : Math.max(0, Math.round(edge * 255));

          const py = -ny;
          const ey = py * ct - nz * st;
          const ez = py * st + nz * ct;
          const lat = Math.asin(ey < -1 ? -1 : ey > 1 ? 1 : ey);

          lon0[i] = Math.atan2(nx, ez);

          const rowF = 0.5 - lat / Math.PI;
          let tr = (rowF * TEX_H) | 0;
          if (tr < 0) tr = 0;
          if (tr > TEX_H - 1) tr = TEX_H - 1;
          texRow[i] = tr * TEX_W;

          let cr = (rowF * CLD_H) | 0;
          if (cr < 0) cr = 0;
          if (cr > CLD_H - 1) cr = CLD_H - 1;
          cldRow[i] = cr * CLD_W;

          let dot = nx * lx + py * ly + nz * lz;
          if (dot < 0) dot = 0;
          shade[i] = 0.08 + 1.04 * dot;
          rim[i] = Math.pow(1 - nz, 3.6);
        }
      }
    }

    let spin = -0.5;
    const uScale = TEX_W / (2 * Math.PI);
    const cScale = CLD_W / (2 * Math.PI);

    function draw() {
      if (!img || !ctx) return;
      const d = img.data;
      const n = R * R;
      const base = spin;
      const cbase = spin * 1.22 + 0.9;

      for (let i = 0; i < n; i++) {
        const o = i << 2;
        if (!valid[i]) {
          d[o + 3] = 0;
          continue;
        }

        let u = ((lon0[i] + base) * uScale) % TEX_W;
        if (u < 0) u += TEX_W;
        const t = (texRow[i] + (u | 0)) << 2;
        let r = TEX[t];
        let g = TEX[t + 1];
        let b = TEX[t + 2];

        let cu = ((lon0[i] + cbase) * cScale) % CLD_W;
        if (cu < 0) cu += CLD_W;
        const ca = CLD[cldRow[i] + (cu | 0)] * 0.0018;
        if (ca > 0) {
          r += (238 - r) * ca;
          g += (245 - g) * ca;
          b += (252 - b) * ca;
        }

        const s = shade[i];
        const rm = rim[i];
        const vr = r * s + rm * 34;
        const vg = g * s + rm * 92;
        const vb = b * s + rm * 168;

        d[o] = vr > 255 ? 255 : vr;
        d[o + 1] = vg > 255 ? 255 : vg;
        d[o + 2] = vb > 255 ? 255 : vb;
        d[o + 3] = alpha[i];
      }
      ctx.putImageData(img, 0, 0);
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dragging = false;
    let pid: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;
    let onScreen = true;
    let raf: number | null = null;
    let prev = 0;

    function idle() {
      return reduced ? 0 : SPIN_DIR * IDLE_RATE;
    }

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      pid = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      velocity = 0;
      holder.classList.add("dragging");
      holder.setPointerCapture(pid);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pid) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dt = Math.max(1, now - lastT);

      // Natural drag controls (non-inverted):
      // Dragging RIGHT (dx > 0) rotates the globe RIGHT.
      // Dragging LEFT (dx < 0) rotates the globe LEFT.
      const dSpin = -dx * 0.006;
      spin += dSpin;
      velocity = dSpin / dt;

      // Dragging DOWN (dy > 0) tilts the globe DOWN.
      // Dragging UP (dy < 0) tilts the globe UP.
      if (dy !== 0) {
        let nt = tilt - dy * 0.004;
        nt = Math.max(-0.85, Math.min(0.95, nt));
        if (nt !== tilt) {
          tilt = nt;
          rebuild(true);
        }
      }

      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };

    const endDrag = (e?: PointerEvent) => {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false;
      holder.classList.remove("dragging");
      try {
        if (pid !== null) holder.releasePointerCapture(pid);
      } catch {}
      velocity = Math.max(-0.004, Math.min(0.004, velocity));
    };

    holder.addEventListener("pointerdown", onPointerDown);
    holder.addEventListener("pointermove", onPointerMove);
    holder.addEventListener("pointerup", endDrag);
    holder.addEventListener("pointercancel", endDrag);

    function frame(now: number) {
      if (isDestroyed) return;
      const dt = prev ? Math.min(64, now - prev) : 16;
      prev = now;

      if (!dragging) {
        const target = idle();
        velocity += (target - velocity) * (1 - Math.pow(0.0016, dt / 1000));
        spin += velocity * dt;
      }
      if (spin > 1e6 || spin < -1e6) spin = spin % (2 * Math.PI);

      draw();
      raf = onScreen ? requestAnimationFrame(frame) : null;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
        if (onScreen && !raf) {
          prev = 0;
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0 }
    );
    observer.observe(holder);

    let resizeTimer: any = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!isDestroyed) {
          rebuild();
          draw();
        }
      }, 160);
    };
    window.addEventListener("resize", onResize);

    velocity = idle();
    rebuild();
    raf = requestAnimationFrame(frame);

    return () => {
      isDestroyed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      holder.removeEventListener("pointerdown", onPointerDown);
      holder.removeEventListener("pointermove", onPointerMove);
      holder.removeEventListener("pointerup", endDrag);
      holder.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  return (
    <div className="globe-stage">
      <div className="globe-halo" aria-hidden="true" />
      <div className="globe-ring" aria-hidden="true" />
      <div
        ref={holderRef}
        className="globe-holder"
        role="img"
        aria-label="A slowly rotating Earth. Click and hold to rotate it yourself."
      >
        <canvas ref={canvasRef} />
        <div className="globe-atmo" aria-hidden="true" />
      </div>
      <span className="globe-hint mono">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 stroke-[#9FD0FF]/70 stroke-[1.2] fill-none">
          <path d="M9 7 5 12l4 5M15 7l4 5-4 5" />
        </svg>
        Drag to rotate
      </span>
    </div>
  );
};
