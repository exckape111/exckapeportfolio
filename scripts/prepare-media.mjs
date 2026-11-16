import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.resolve(root, '..', 'мои работы');
const OUT = path.join(root, 'public', 'media');
const FORCE = process.argv.includes('--force');

const VIDEO_EXT = new Set(['.mov', '.mp4', '.m4v', '.webm', '.avi', '.mkv']);
const isHidden = (n) => n.startsWith('.');
const findDir = (name) => {

  const hit = fs.readdirSync(SRC).find((d) => d.trim().toLowerCase() === name);
  if (!hit) throw new Error(`Folder not found: ${name}`);
  return path.join(SRC, hit);
};
const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .split('')
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

async function isImage(file) {
  try {
    const m = await sharp(file).metadata();
    return Boolean(m.width && m.height);
  } catch {
    return false;
  }
}

function probeVideo(file) {
  const r = spawnSync(ffmpegPath, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const m = /Video:.*?(\d{2,5})x(\d{2,5})/.exec(r.stderr);
  const d = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr);
  if (!m) return null;
  return {
    width: +m[1],
    height: +m[2],
    duration: d ? +d[1] * 3600 + +d[2] * 60 + +d[3] : 0,
  };
}

async function image(file, outFile, maxSide, quality = 82) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const meta = await sharp(file).rotate().metadata();
  const w = meta.autoOrient?.width ?? meta.width;
  const h = meta.autoOrient?.height ?? meta.height;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const W = Math.round(w * scale);
  const H = Math.round(h * scale);
  if (FORCE || !fs.existsSync(outFile)) {
    await sharp(file).rotate().resize(W, H).webp({ quality, effort: 5 }).toFile(outFile);
  }
  return { width: W, height: H };
}

const rel = (p) => '/' + path.relative(path.join(root, 'public'), p).split(path.sep).join('/');
const summary = { titles: [], covers: [], posters: [], branding: {} };

{
  const dir = findDir('титры');
  const folders = fs
    .readdirSync(dir)
    .filter((n) => !isHidden(n) && fs.statSync(path.join(dir, n)).isDirectory())
    .sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }));
  for (const f of folders) {
    const files = fs.readdirSync(path.join(dir, f)).filter((n) => !isHidden(n));
    let video = null;
    let still = null;
    for (const n of files) {
      const p = path.join(dir, f, n);
      if (VIDEO_EXT.has(path.extname(n).toLowerCase()) && probeVideo(p)) video = p;
      else if (await isImage(p)) still = p;
    }
    if (!video || !still) {
      console.warn(`! титры/${f}: pair incomplete`, { video, still });
      continue;
    }
    const outDir = path.join(OUT, 'titles', slug(f));
    fs.mkdirSync(outDir, { recursive: true });
    const vInfo = probeVideo(video);
    const mp4 = path.join(outDir, 'video.mp4');
    if (FORCE || !fs.existsSync(mp4)) {
      execFileSync(ffmpegPath, [
        '-y', '-hide_banner', '-loglevel', 'error',
        '-i', video,
        '-an',
        '-vf', "scale='min(960,iw)':-2:flags=lanczos,format=yuv420p",
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '23',
        '-profile:v', 'high', '-level', '4.0',
        '-movflags', '+faststart',
        mp4,
      ]);
    }
    const posterTmp = path.join(outDir, '_poster.png');
    const poster = path.join(outDir, 'poster.webp');
    if (FORCE || !fs.existsSync(poster)) {
      execFileSync(ffmpegPath, ['-y', '-hide_banner', '-loglevel', 'error', '-i', mp4, '-frames:v', '1', posterTmp]);
      await sharp(posterTmp).webp({ quality: 70 }).toFile(poster);
      fs.rmSync(posterTmp);
    }
    const out = probeVideo(mp4);
    const stillInfo = await image(still, path.join(outDir, 'still.webp'), 1280, 84);
    summary.titles.push({
      folder: f,
      source: { video: path.basename(video), still: path.basename(still), videoSize: `${vInfo.width}x${vInfo.height}` },
      video: rel(mp4),
      poster: rel(poster),
      videoWidth: out.width,
      videoHeight: out.height,
      duration: +vInfo.duration.toFixed(2),
      still: rel(path.join(outDir, 'still.webp')),
      stillWidth: stillInfo.width,
      stillHeight: stillInfo.height,
    });
  }
}

async function flat(folderName, outName, fullSide, thumbSide) {
  const dir = typeof folderName === 'string' ? findDir(folderName) : folderName;
  const files = fs
    .readdirSync(dir)
    .filter((n) => !isHidden(n))
    .sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }));
  const list = [];
  for (const n of files) {
    const p = path.join(dir, n);
    if (!(await isImage(p))) continue;
    const base = slug(n);
    const full = await image(p, path.join(OUT, outName, `${base}.webp`), fullSide);
    await image(p, path.join(OUT, outName, 'thumb', `${base}.webp`), thumbSide, 80);
    list.push({
      source: n,
      src: rel(path.join(OUT, outName, 'thumb', `${base}.webp`)),
      full: rel(path.join(OUT, outName, `${base}.webp`)),
      width: full.width,
      height: full.height,
    });
  }
  return list;
}

summary.covers = await flat('обложки', 'covers', 1600, 640);
summary.posters = await flat('афиши', 'posters', 2000, 1100);
summary.branding.visual = await flat('визуал', 'branding/visual', 2200, 1200);
summary.branding.sodaluv = await flat('оформление для видео soda luv', 'branding/soda-luv', 2200, 1200);

{
  const eyes = path.resolve(root, '..', 'эти глаза анимировать.png');
  await sharp(eyes).resize(64, 64).png().toFile(path.join(root, 'public', 'favicon.png'));
  await sharp(eyes).resize(180, 180).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'));
}

fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
