import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(root, 'public', 'media', 'eyes');
const externalSource = path.resolve(root, '..', 'эти глаза анимировать.png');
const SRC = fs.existsSync(externalSource) ? externalSource : path.join(OUT, 'original.png');
fs.mkdirSync(OUT, { recursive: true });

const FG = [0xed, 0xec, 0xe7];
const BG = [0x0a, 0x09, 0x07];
const GAP_R = 18;

const { data: gray, info } = await sharp(SRC).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const N = W * H;
const white = (i) => gray[i] > 128;

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
    const nb = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, p - W, p + W];
    for (const q of nb) {
      if (q >= 0 && q < N && lab[q] < 0 && white(q)) {
        lab[q] = id;
        st.push(q);
      }
    }
  }
  comps.push(c);
}
const big = comps.filter((c) => c.area > 5000).sort((a, b) => a.x0 - b.x0);

const outlines = big.filter((c) => c.y0 < 300).sort((a, b) => a.x0 - b.x0);
const scleras = big.filter((c) => c.y0 >= 300 && c.y1 < 820).sort((a, b) => a.x0 - b.x0);
if (outlines.length !== 2 || scleras.length !== 2) {
  console.error({ outlines, scleras });
  throw new Error('Unexpected eye structure');
}

function buildEye(sc, ol, side) {
  const S = new Uint8Array(N);

  const top = new Int32Array(W).fill(H);
  const left = new Int32Array(H).fill(W);
  const bottom = new Int32Array(W).fill(-1);
  for (let y = sc.y0; y <= sc.y1; y++) {
    for (let x = sc.x0; x <= sc.x1; x++) {
      const i = y * W + x;
      if (lab[i] === sc.id) {
        if (y < top[x]) top[x] = y;
        if (x < left[y]) left[y] = x;
        if (y > bottom[x]) bottom[x] = y;
      }
    }
  }

  const right = new Int32Array(H).fill(-1);
  for (let y = sc.y0; y <= sc.y1; y++) {
    for (let x = sc.x1; x >= sc.x0; x--) {
      if (lab[y * W + x] === sc.id) {
        right[y] = x;
        break;
      }
    }
  }
  const yBottom = sc.y1;
  for (let y = sc.y0; y <= yBottom; y++) {
    let xa;
    let xb;
    if (side === 'l') {

      xa = left[y];
      let xo = Math.max(right[y], sc.x0);
      while (xo < W && lab[y * W + xo] !== ol.id) xo++;
      xb = Math.min(xo - GAP_R, sc.x1 + 4);
    } else {
      xb = right[y];
      let xo = Math.min(left[y], sc.x1);
      while (xo > 0 && lab[y * W + xo] !== ol.id) xo--;
      xa = Math.max(xo + GAP_R, sc.x0 - 4);
    }
    if (xa > xb || xa >= W || xb < 0) continue;
    for (let x = xa; x <= xb; x++) {
      const tx = top[Math.min(Math.max(x, sc.x0), sc.x1)];
      if (y >= tx) S[y * W + x] = 1;
    }
  }

  const P = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (S[i] && !white(i)) P[i] = 1;

  for (let x = 0; x < W; x++) {
    let yb = -1;
    for (let y = H - 1; y >= 0; y--) if (S[y * W + x]) { yb = y; break; }
    if (yb < 0 || !P[yb * W + x]) continue;
    let r = 0;
    while (yb - r >= 0 && P[(yb - r) * W + x]) r++;
    const cut = r < 12 ? r : 3;
    for (let k = 0; k < cut; k++) S[(yb - k) * W + x] = P[(yb - k) * W + x] = 0;
  }
  for (let y = 0; y < H; y++) {
    let xb = -1;
    for (let x = W - 1; x >= 0; x--) if (S[y * W + x]) { xb = x; break; }
    if (xb < 0 || !P[y * W + xb]) continue;
    let r = 0;
    while (xb - r >= 0 && P[y * W + xb - r]) r++;
    const cut = r < 12 ? r : 3;
    for (let k = 0; k < cut; k++) S[y * W + xb - k] = P[y * W + xb - k] = 0;
  }

  const boundary = new Float64Array(H).fill(Infinity);
  const rightBoundary = new Float64Array(H).fill(Infinity);
  let lastEdge = Infinity;
  for (let y = sc.y0; y <= sc.y1; y++) {
    let start = -1;
    let runEnd = -1;
    for (let x = 0; x < W; x++) {
      if (!P[y * W + x]) continue;
      let end = x;
      while (end < W && P[y * W + end]) end++;
      if (end - x >= 8) {
        start = x;
        runEnd = end;
        break;
      }
      x = end;
    }
    if (start >= 0) {
      const light = gray[y * W + start - 1];
      const dark = gray[y * W + start];
      lastEdge = start - 1 + Math.max(0, Math.min(1, (light - 128) / Math.max(1, light - dark)));
      if (S[y * W + runEnd]) {
        const lastDark = gray[y * W + runEnd - 1];
        const firstLight = gray[y * W + runEnd];
        rightBoundary[y] = runEnd - 1 + Math.max(0, Math.min(1, (128 - lastDark) / Math.max(1, firstLight - lastDark)));
      }
    }
    boundary[y] = lastEdge;
  }
  for (let y = sc.y1 + 1; y < H; y++) boundary[y] = lastEdge;
  return { S, boundary, rightBoundary };
}

const eyes = {
  l: buildEye(scleras[0], outlines[0], 'l'),
  r: buildEye(scleras[1], outlines[1], 'l'),
};

let cx0 = W, cy0 = H, cx1 = 0, cy1 = 0;
for (let i = 0; i < N; i++) {
  if (gray[i] > 18) {
    const x = i % W, y = (i / W) | 0;
    if (x < cx0) cx0 = x;
    if (x > cx1) cx1 = x;
    if (y < cy0) cy0 = y;
    if (y > cy1) cy1 = y;
  }
}
const PAD = 24;
cx0 = Math.max(0, cx0 - PAD);
cy0 = Math.max(0, cy0 - PAD);
cx1 = Math.min(W - 1, cx1 + PAD);
cy1 = Math.min(H - 1, cy1 + PAD);
const CW = cx1 - cx0 + 1;
const CH = cy1 - cy0 + 1;

function dilate(mask, r) {
  const tmp = new Uint8Array(N);
  const out = new Uint8Array(N);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let k = -r; k <= r && !v; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < W && mask[y * W + xx]) v = 1;
      }
      tmp[y * W + x] = v;
    }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let v = 0;
      for (let k = -r; k <= r && !v; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < H && tmp[yy * W + x]) v = 1;
      }
      out[y * W + x] = v;
    }
  return out;
}

async function save(name, fill) {
  const buf = Buffer.alloc(CW * CH * 4);
  for (let y = 0; y < CH; y++)
    for (let x = 0; x < CW; x++) {
      const si = (y + cy0) * W + (x + cx0);
      const o = (y * CW + x) * 4;
      const [r, g, b, a] = fill(si);
      buf[o] = r;
      buf[o + 1] = g;
      buf[o + 2] = b;
      buf[o + 3] = a;
    }
  await sharp(buf, { raw: { width: CW, height: CH, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, name));
}

const scleraAny = new Uint8Array(N);
for (let i = 0; i < N; i++) scleraAny[i] = eyes.l.S[i] || eyes.r.S[i] || lab[i] === scleras[0].id || lab[i] === scleras[1].id ? 1 : 0;
const scleraRim = dilate(scleraAny, 4);
const outlineNear = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  const l = lab[i];
  outlineNear[i] = l >= 0 && l !== scleras[0].id && l !== scleras[1].id ? 1 : 0;
}
const outlineRim = dilate(outlineNear, 5);

await save('frame.png', (i) => {
  const a = scleraRim[i] && !outlineRim[i] ? 0 : gray[i];
  return [...FG, a];
});

for (const side of ['l', 'r']) {
  const { S, boundary, rightBoundary } = eyes[side];
  const sc = scleras[side === 'l' ? 0 : 1];
  const Sr = dilate(S, 1);
  await save(`sclera-${side}.png`, (i) => {
    if (S[i]) return [...FG, 255];

    if (Sr[i] && lab[i] !== -1 ? lab[i] === sc.id : Sr[i]) return [...FG, Math.max(gray[i], 0)];
    return [...FG, 0];
  });
  await save(`pupil-${side}.png`, (i) => {
    const x = i % W;
    const y = Math.floor(i / W);
    const leftAlpha = Math.max(0, Math.min(1, x - boundary[y] + 0.5));
    const rightAlpha = Math.max(0, Math.min(1, rightBoundary[y] - x + 0.5));
    const alpha = Math.round(leftAlpha * rightAlpha * 255);
    return [...BG, alpha];
  });
}

const meta = { width: CW, height: CH, crop: { x: cx0, y: cy0 }, source: { width: W, height: H } };
fs.writeFileSync(path.join(OUT, 'eyes.json'), JSON.stringify(meta, null, 2));
console.log('eyes layers ->', OUT, meta);
