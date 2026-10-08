const img = new Image();
img.src = new URL('./knight.jpeg', import.meta.url).href;

const IW = 864, IH = 1152;
const EYES: [number, number][] = [[413 / IW, 481 / IH], [490 / IW, 490 / IH]];

export function drawKnight(
  ctx: CanvasRenderingContext2D,
  cx: number, bottomY: number, h: number,
  yaw: number, pitch: number
) {
  if (!img.complete || !img.naturalWidth) return;
  const w = h * (IW / IH);
  const x0 = cx - w / 2, y0 = bottomY - h;
  ctx.drawImage(img, x0, y0, w, h);

  const er = w * 0.017;
  for (const [ex, ey] of EYES) {
    const x = x0 + ex * w, y = y0 + ey * h;
    ctx.fillStyle = '#140d08';
    ctx.beginPath(); ctx.arc(x, y, er * 1.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + yaw * er * 0.6 - er * 0.3, y + pitch * er * 0.6 - er * 0.4, er * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}
