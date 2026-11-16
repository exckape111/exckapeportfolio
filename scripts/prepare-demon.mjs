import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(root, 'public', 'media', 'demon');
const SRC = path.join(OUT, 'original.png');
fs.mkdirSync(OUT, { recursive: true });

const FG = [0xed, 0xec, 0xe7];
const BG = [0x0a, 0x09, 0x07];

const { data: gray, info } = await sharp(SRC)
  .removeAlpha()
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

const W = info.width;
const H = info.height;
const N = W * H;
const white = (i) => gray[i] > 160;

// Label connected white components
const lab = new Int32Array(N).fill(-1);
const comps = [];
for (let i = 0; i < N; i++) {
  if (!white(i) || lab[i] >= 0) continue;
  const id = comps.length;
  const c = { id, area: 0, x0: W, y0: H, x1: -1, y1: -1 };
  const st = [i];
  lab[i] = id;
  while (st.length) {
    const p = st.pop();
    c.area++;
    const x = p % W;
    const y = (p / W) | 0;
    if (x < c.x0) c.x0 = x;
    if (x > c.x1) c.x1 = x;
    if (y < c.y0) c.y0 = y;
    if (y > c.y1) c.y1 = y;
    if (x > 0 && lab[p - 1] < 0 && white(p - 1)) { lab[p - 1] = id; st.push(p - 1); }
    if (x < W - 1 && lab[p + 1] < 0 && white(p + 1)) { lab[p + 1] = id; st.push(p + 1); }
    if (y > 0 && lab[p - W] < 0 && white(p - W)) { lab[p - W] = id; st.push(p - W); }
    if (y < H - 1 && lab[p + W] < 0 && white(p + W)) { lab[p + W] = id; st.push(p + W); }
  }
  comps.push(c);
}

const bgId = lab[0];
const inBox = (c, x0, y0, x1, y1) => c.x0 >= x0 && c.x1 <= x1 && c.y0 >= y0 && c.y1 <= y1;

const lLid = comps.find((c) => c.area > 5000 && inBox(c, 600, 660, 800, 860));
const rLid = comps.find((c) => c.area > 5000 && inBox(c, 860, 660, 1110, 860));
const lRim = comps.find((c) => c.area > 2000 && inBox(c, 590, 880, 770, 1030));
const rRim = comps.find((c) => c.area > 2000 && inBox(c, 880, 920, 1110, 1060));
const lSclR = comps.find((c) => c.area > 2000 && inBox(c, 660, 800, 780, 1000) && c !== lRim);
const rSclR = comps.find((c) => c.area > 2000 && inBox(c, 960, 760, 1110, 980) && c !== rRim);
const lSclL = comps.find((c) => c.area > 500 && inBox(c, 605, 740, 660, 920) && c !== lRim);
const rSclL = comps.find((c) => c.area > 500 && inBox(c, 880, 810, 930, 1030) && c !== rRim);
const faceMask = comps.find((c) => c.area > 50000 && inBox(c, 550, 600, 1210, 1090));

if (!lLid || !rLid || !lRim || !rRim || !lSclL || !lSclR || !rSclL || !rSclR || !faceMask) {
  throw new Error('Could not locate demon eye components');
}

function fitQuadratic(pts, xMin, xMax) {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n;
  let s00 = n, s10 = 0, s20 = 0, s30 = 0, s40 = 0, sy0 = 0, sy1 = 0, sy2 = 0;
  for (const [px, py] of pts) {
    const x = px - mx;
    s10 += x; s20 += x * x; s30 += x * x * x; s40 += x * x * x * x;
    sy0 += py; sy1 += x * py; sy2 += x * x * py;
  }
  const M = [
    [s00, s10, s20, sy0],
    [s10, s20, s30, sy1],
    [s20, s30, s40, sy2],
  ];
  for (let i = 0; i < 3; i++) {
    let piv = i;
    for (let r = i + 1; r < 3; r++) if (Math.abs(M[r][i]) > Math.abs(M[piv][i])) piv = r;
    [M[i], M[piv]] = [M[piv], M[i]];
    for (let r = i + 1; r < 3; r++) {
      const f = M[r][i] / M[i][i];
      for (let c = i; c < 4; c++) M[r][c] -= f * M[i][c];
    }
  }
  const coef = [0, 0, 0];
  for (let i = 2; i >= 0; i--) {
    let sum = M[i][3];
    for (let c = i + 1; c < 3; c++) sum -= M[i][c] * coef[c];
    coef[i] = sum / M[i][i];
  }
  const out = new Float64Array(W).fill(NaN);
  for (let x = xMin; x <= xMax; x++) {
    const dx = x - mx;
    out[x] = coef[0] + coef[1] * dx + coef[2] * dx * dx;
  }
  return out;
}

function fitLinear(pts, xMin, xMax) {
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const [x, y] of pts) {
    sx += x; sy += y; sxx += x * x; sxy += x * y;
  }
  const n = pts.length;
  const slope = (n * sxy - sx * sy) / Math.max(1e-6, n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const out = new Float64Array(W).fill(NaN);
  for (let x = xMin; x <= xMax; x++) out[x] = slope * x + intercept;
  return out;
}

function buildEyeGeometry(lid, sclL, sclR, rim) {
  const xMin = Math.min(lid.x0, sclL.x0, rim.x0) - 12;
  const xMax = Math.max(lid.x1, sclR.x1, rim.x1) + 12;
  const yMin = lid.y0 - 6;
  const yMax = rim.y1;

  const lidBotPts = [];
  const rimTopPts = [];
  const lidTopRaw = new Float64Array(W).fill(NaN);

  for (let x = xMin; x <= xMax; x++) {
    let minLY = H, maxLY = -1, minRY = H;
    for (let y = yMin; y <= yMax; y++) {
      const l = lab[y * W + x];
      if (l === lid.id) {
        if (y < minLY) minLY = y;
        if (y > maxLY) maxLY = y;
      }
      if (l === rim.id && y < minRY) minRY = y;
    }
    if (maxLY > 0) {
      lidTopRaw[x] = minLY;
      if (x >= lid.x0 + 8 && x <= lid.x1 - 8) lidBotPts.push([x, maxLY]);
    }
    if (minRY < H && x >= rim.x0 + 10 && x <= rim.x1 - 10) {
      rimTopPts.push([x, minRY]);
    }
  }

  const lidBot = fitQuadratic(lidBotPts, xMin, xMax);
  // Fit bottom socket boundary along top of lower rim (step 3.5px up into the stroke edge)
  const rimTop = fitLinear(rimTopPts, xMin, xMax);
  const sclBot = new Float64Array(W);
  for (let x = xMin; x <= xMax; x++) sclBot[x] = rimTop[x] - 3.5;

  const lidTop = new Float64Array(W).fill(NaN);
  for (let x = xMin; x <= xMax; x++) if (!Number.isNaN(lidTopRaw[x])) lidTop[x] = lidTopRaw[x];
  const ltPts = [];
  for (let x = xMin; x <= xMax; x++) if (!Number.isNaN(lidTop[x])) ltPts.push([x, lidTop[x]]);
  for (let x = xMin; x < ltPts[0][0]; x++) lidTop[x] = ltPts[0][1] + (ltPts[0][0] - x) * 1.4;
  for (let i = 0; i < ltPts.length - 1; i++) {
    const [ax, ay] = ltPts[i], [bx, by] = ltPts[i + 1];
    for (let x = ax + 1; x < bx; x++) lidTop[x] = ay + ((by - ay) * (x - ax)) / (bx - ax);
  }
  const lastLT = ltPts[ltPts.length - 1];
  for (let x = lastLT[0] + 1; x <= xMax; x++) lidTop[x] = lastLT[1] + (x - lastLT[0]) * 1.4;

  const leftWall = new Float64Array(H).fill(NaN);
  const rightWall = new Float64Array(H).fill(NaN);
  const centerX = Math.round((sclL.x0 + sclR.x1) / 2);
  for (let y = yMin; y <= yMax; y++) {
    let hasEye = false;
    for (let x = xMin; x <= xMax; x++) {
      const l = lab[y * W + x];
      if (l === lid.id || l === sclL.id || l === sclR.id || l === rim.id) { hasEye = true; break; }
    }
    if (!hasEye) continue;
    let lx = centerX;
    while (lx > xMin - 30 && lab[y * W + lx] !== faceMask.id) lx--;
    let strokeStartL = lx;
    while (strokeStartL < centerX && lab[y * W + strokeStartL] === faceMask.id) strokeStartL++;
    let rx = centerX;
    while (rx < xMax + 30 && lab[y * W + rx] !== faceMask.id) rx++;
    leftWall[y] = strokeStartL + 5.8;
    rightWall[y] = rx - 5.8;
  }

  const smoothWall = (arr) => {
    const copy = Float64Array.from(arr);
    for (let y = yMin + 2; y <= yMax - 2; y++) {
      if (Number.isNaN(copy[y])) continue;
      let s = 0, c = 0;
      for (let k = -2; k <= 2; k++) if (!Number.isNaN(copy[y + k])) { s += copy[y + k]; c++; }
      arr[y] = s / c;
    }
  };
  smoothWall(leftWall);
  smoothWall(rightWall);

  const archMask = new Float32Array(N);
  for (let y = yMin; y <= yMax; y++) {
    if (Number.isNaN(leftWall[y]) || Number.isNaN(rightWall[y])) continue;
    const lw = leftWall[y];
    const rw = rightWall[y];
    for (let x = Math.floor(lw) - 2; x <= Math.ceil(rw) + 2; x++) {
      const topY = lidTop[x];
      const botY = sclBot[x];
      if (botY <= topY) continue;
      const dx = Math.min(x - lw, rw - x);
      const dy = Math.min(y - topY, botY - y);
      const d = Math.min(dx, dy);
      if (d > -1.0) archMask[y * W + x] = Math.max(0, Math.min(1, d + 0.85));
    }
  }

  // Compute ideal blink slide distance so closed lid lash lands cleanly just above sclBot
  let sumOpen = 0, cnt = 0;
  for (let x = Math.round(sclL.x0 + 8); x <= Math.round(sclR.x1 - 8); x++) {
    sumOpen += (sclBot[x] - 8) - (lidBot[x] + 4);
    cnt++;
  }
  const blinkPx = sumOpen / Math.max(1, cnt);

  return { archMask, lidTop, lidBot, sclBot, leftWall, rightWall, xMin, xMax, yMin, yMax, blinkPx };
}

const left = buildEyeGeometry(lLid, lSclL, lSclR, lRim);
const right = buildEyeGeometry(rLid, rSclL, rSclR, rRim);

// Crop around demon silhouette
let dx0 = W, dy0 = H, dx1 = 0, dy1 = 0;
for (let i = 0; i < N; i++) {
  if (lab[i] !== bgId) {
    const x = i % W;
    const y = (i / W) | 0;
    if (x < dx0) dx0 = x;
    if (x > dx1) dx1 = x;
    if (y < dy0) dy0 = y;
    if (y > dy1) dy1 = y;
  }
}
const PAD = 20;
dx0 = Math.max(0, dx0 - PAD);
dy0 = Math.max(0, dy0 - PAD);
dx1 = Math.min(W - 1, dx1 + PAD);
dy1 = Math.min(H - 1, dy1 + PAD);
const CW = dx1 - dx0 + 1;
const CH = dy1 - dy0 + 1;

function openMetrics(eye) {
  let sx = 0, sy = 0, sw = 0;
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (let y = eye.yMin; y <= eye.yMax; y++) {
    for (let x = eye.xMin; x <= eye.xMax; x++) {
      const m = eye.archMask[y * W + x];
      if (m > 0.5 && y > eye.lidBot[x] + 6) {
        sx += x * m; sy += y * m; sw += m;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return {
    cx: sx / sw - dx0,
    cy: sy / sw - dy0,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

const lOpen = openMetrics(left);
const rOpen = openMetrics(right);

function buildPupilBuffer(cx, cy, rx, ry, tiltRad, notchAngleDeg) {
  const buf = Buffer.alloc(CW * CH * 4);
  const cos = Math.cos(-tiltRad);
  const sin = Math.sin(-tiltRad);
  const halfNotch = (notchAngleDeg * Math.PI) / 360;
  for (let py = Math.max(0, Math.floor(cy - ry - 4)); py <= Math.min(CH - 1, Math.ceil(cy + ry + 4)); py++) {
    for (let px = Math.max(0, Math.floor(cx - rx - 4)); px <= Math.min(CW - 1, Math.ceil(cx + rx + 4)); px++) {
      const dx = px - cx;
      const dy = py - cy;
      const ux = dx * cos - dy * sin;
      const uy = dx * sin + dy * cos;
      const nx = Math.abs(ux) / rx;
      const ny = Math.abs(uy) / ry;
      const distCapsule = Math.pow(Math.pow(nx, 3.0) + Math.pow(ny, 3.0), 1 / 3.0);
      const shapeAlpha = Math.max(0, Math.min(1, (1.0 - distCapsule) * Math.min(rx, ry) * 0.7 + 0.5));
      if (shapeAlpha <= 0) continue;
      const vx = ux + 0.06 * rx;
      const vy = uy + 0.04 * ry;
      const ang = Math.atan2(vy, vx);
      let notchAlpha = 1;
      if (vx > -2) {
        const edgeDist = (Math.abs(ang) - halfNotch) * Math.hypot(vx, vy);
        notchAlpha = Math.max(0, Math.min(1, edgeDist + 0.5));
      }
      const a = shapeAlpha * notchAlpha;
      if (a > 0) {
        const idx = (py * CW + px) * 4;
        buf[idx] = BG[0];
        buf[idx + 1] = BG[1];
        buf[idx + 2] = BG[2];
        buf[idx + 3] = Math.round(a * 255);
      }
    }
  }
  return buf;
}

function buildEyelidBuffer(eye) {
  const buf = Buffer.alloc(CW * CH * 4);
  const x0 = Math.max(0, eye.xMin - 24 - dx0);
  const x1 = Math.min(CW - 1, eye.xMax + 24 - dx0);
  const strokeThick = 7.5;
  for (let x = x0; x <= x1; x++) {
    const wx = Math.min(eye.xMax, Math.max(eye.xMin, x + dx0));
    const topLash = eye.lidBot[wx] - dy0;
    const botEdge = topLash + strokeThick;
    const yStart = Math.max(0, Math.floor(eye.yMin - 300 - dy0));
    const yEnd = Math.min(CH - 1, Math.ceil(botEdge + 2));
    for (let y = yStart; y <= yEnd; y++) {
      const idx = (y * CW + x) * 4;
      if (y <= topLash) {
        buf[idx] = FG[0]; buf[idx + 1] = FG[1]; buf[idx + 2] = FG[2]; buf[idx + 3] = 255;
      } else {
        const edgeA = Math.max(0, Math.min(1, botEdge - y + 0.5));
        const lashT = Math.max(0, Math.min(1, y - topLash));
        buf[idx] = Math.round(FG[0] * (1 - lashT) + BG[0] * lashT);
        buf[idx + 1] = Math.round(FG[1] * (1 - lashT) + BG[1] * lashT);
        buf[idx + 2] = Math.round(FG[2] * (1 - lashT) + BG[2] * lashT);
        buf[idx + 3] = Math.round(edgeA * 255);
      }
    }
  }
  return buf;
}

function buildScleraMaskBuffer(eye) {
  const buf = Buffer.alloc(CW * CH * 4);
  for (let y = 0; y < CH; y++) {
    for (let x = 0; x < CW; x++) {
      const si = (y + dy0) * W + (x + dx0);
      const a = Math.round(eye.archMask[si] * 255);
      if (a > 0) {
        const idx = (y * CW + x) * 4;
        buf[idx] = FG[0];
        buf[idx + 1] = FG[1];
        buf[idx + 2] = FG[2];
        buf[idx + 3] = a;
      }
    }
  }
  return buf;
}

const frameBuf = Buffer.alloc(CW * CH * 4);
for (let y = 0; y < CH; y++) {
  for (let x = 0; x < CW; x++) {
    const si = (y + dy0) * W + (x + dx0);
    const o = (y * CW + x) * 4;
    const isExt = lab[si] === bgId;
    const sm = Math.max(left.archMask[si], right.archMask[si]);
    const rawG = gray[si];
    const cleanT = Math.max(0, Math.min(1, (rawG - 32) / (230 - 32)));

    let fa = 0;
    let fr = BG[0], fg = BG[1], fb = BG[2];
    if (!isExt) {
      fa = 1 - sm;
      fr = Math.round(BG[0] + cleanT * (FG[0] - BG[0]));
      fg = Math.round(BG[1] + cleanT * (FG[1] - BG[1]));
      fb = Math.round(BG[2] + cleanT * (FG[2] - BG[2]));
    } else if (rawG < 238) {
      let nearBody = false;
      for (let ny = -2; ny <= 2 && !nearBody; ny++) {
        for (let nx = -2; nx <= 2 && !nearBody; nx++) {
          const ni = (y + dy0 + ny) * W + (x + dx0 + nx);
          if (ni >= 0 && ni < N && lab[ni] !== bgId) nearBody = true;
        }
      }
      if (nearBody) fa = Math.max(0, Math.min(1, (240 - rawG) / 200));
    }
    frameBuf[o] = fr;
    frameBuf[o + 1] = fg;
    frameBuf[o + 2] = fb;
    frameBuf[o + 3] = Math.round(fa * 255);
  }
}

const TARGET_W = 1145;
const TARGET_H = Math.round((CH * TARGET_W) / CW);

async function saveLayer(name, rawBuf) {
  await sharp(rawBuf, { raw: { width: CW, height: CH, channels: 4 } })
    .resize(TARGET_W, TARGET_H, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, name));
}

await saveLayer('frame.png', frameBuf);
await saveLayer('sclera-l.png', buildScleraMaskBuffer(left));
await saveLayer('sclera-r.png', buildScleraMaskBuffer(right));
await saveLayer('pupil-l.png', buildPupilBuffer(lOpen.cx, lOpen.cy, 36, 86, -0.14, 58));
await saveLayer('pupil-r.png', buildPupilBuffer(rOpen.cx, rOpen.cy, 46, 106, -0.10, 58));
await saveLayer('eyelid-l.png', buildEyelidBuffer(left));
await saveLayer('eyelid-r.png', buildEyelidBuffer(right));

const meta = {
  width: TARGET_W,
  height: TARGET_H,
  crop: { x: dx0, y: dy0, width: CW, height: CH },
  source: { width: W, height: H },
  eyes: {
    left: {
      anchorX: +(lOpen.cx / CW).toFixed(4),
      anchorY: +(lOpen.cy / CH).toFixed(4),
      blinkShiftY: +((left.blinkPx / CH) * 100).toFixed(3),
      range: {
        minX: -1.85,
        maxX: 1.85,
        minY: -1.45,
        maxY: 1.45,
      },
    },
    right: {
      anchorX: +(rOpen.cx / CW).toFixed(4),
      anchorY: +(rOpen.cy / CH).toFixed(4),
      blinkShiftY: +((right.blinkPx / CH) * 100).toFixed(3),
      range: {
        minX: -2.45,
        maxX: 2.45,
        minY: -1.65,
        maxY: 1.65,
      },
    },
  },
};

fs.writeFileSync(path.join(OUT, 'demon.json'), JSON.stringify(meta, null, 2));
console.log('demon layers ->', OUT, meta);
