export interface ReceiptContent {
  brand: string;
  question: string;
  title: string;
  attemptsLabel: string;
  durationLabel: string;
  footer: string;
  site: string;
}

export const RECEIPT_WIDTH = 1080;
export const RECEIPT_HEIGHT = 1350;

const FONT = "Arial, sans-serif";

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  const consumed = lines.join(" ").split(/\s+/).length;
  if (consumed < words.length && lines.length > 0) {
    const last = lines[lines.length - 1];
    let truncated = last;
    while (
      truncated.length > 1 &&
      ctx.measureText(`${truncated}…`).width > maxWidth
    ) {
      truncated = truncated.slice(0, -1);
    }
    lines[lines.length - 1] = `${truncated}…`;
  }
  return lines;
};

const drawSparkles = (ctx: CanvasRenderingContext2D): void => {
  const colors = ["#FDE68A", "#F9A8D4", "#DDD6FE", "#FFFFFF"];
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * RECEIPT_WIDTH;
    const y = Math.random() * RECEIPT_HEIGHT;
    const size = 4 + Math.random() * 10;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.random() * Math.PI);
    ctx.globalAlpha = 0.25 + Math.random() * 0.35;
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillRect(-size / 2, -size / 4, size, size / 2);
    ctx.restore();
  }
};

const drawCheckBadge = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number
): void => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.strokeStyle = "#10B981";
  ctx.lineWidth = radius * 0.22;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.42, cy + radius * 0.02);
  ctx.lineTo(cx - radius * 0.1, cy + radius * 0.36);
  ctx.lineTo(cx + radius * 0.46, cy - radius * 0.32);
  ctx.stroke();
  ctx.restore();
};

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
};

export const drawReceipt = (
  canvas: HTMLCanvasElement,
  content: ReceiptContent
): void => {
  canvas.width = RECEIPT_WIDTH;
  canvas.height = RECEIPT_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, RECEIPT_WIDTH, RECEIPT_HEIGHT);
  gradient.addColorStop(0, "#EC4899");
  gradient.addColorStop(1, "#7C3AED");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, RECEIPT_WIDTH, RECEIPT_HEIGHT);
  drawSparkles(ctx);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  drawCheckBadge(ctx, RECEIPT_WIDTH / 2, 150, 64);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold 56px ${FONT}`;
  ctx.fillText(content.brand, RECEIPT_WIDTH / 2, 280);

  const cardX = 90;
  const cardY = 370;
  const cardWidth = RECEIPT_WIDTH - cardX * 2;
  const cardHeight = 400;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  roundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 40);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#1F2937";
  ctx.font = `bold 58px ${FONT}`;
  const questionLines = wrapText(ctx, `“${content.question}”`, cardWidth - 120, 4);
  const lineHeight = 76;
  const questionStart =
    cardY + cardHeight / 2 - ((questionLines.length - 1) * lineHeight) / 2;
  questionLines.forEach((line, index) => {
    ctx.fillText(line, RECEIPT_WIDTH / 2, questionStart + index * lineHeight);
  });

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold 88px ${FONT}`;
  const titleLines = wrapText(ctx, content.title, RECEIPT_WIDTH - 160, 2);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, RECEIPT_WIDTH / 2, 900 + index * 104);
  });

  ctx.globalAlpha = 0.92;
  ctx.font = `48px ${FONT}`;
  ctx.fillText(
    `${content.attemptsLabel} · ${content.durationLabel}`,
    RECEIPT_WIDTH / 2,
    1080
  );
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.85;
  ctx.font = `40px ${FONT}`;
  ctx.fillText(content.footer, RECEIPT_WIDTH / 2, 1220);
  ctx.globalAlpha = 1;
  ctx.font = `bold 44px ${FONT}`;
  ctx.fillText(content.site, RECEIPT_WIDTH / 2, 1282);
};
