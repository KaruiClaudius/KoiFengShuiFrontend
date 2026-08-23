const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;
const MARGIN_X = 72;
const CONTENT_WIDTH = CANVAS_WIDTH - MARGIN_X * 2;

const POND = "#10233D";
const GOLD_SOFT = "rgba(201, 162, 39, 0.5)";
const SEAL_RED = "#A92C2C";
const PAPER_TEXT = "#F8F4EA";
const BODY_TEXT = "rgba(248, 244, 234, 0.92)";
const MUTED_TEXT = "rgba(248, 244, 234, 0.6)";
const TITLE_FONT = "700 44px 'Playfair Display', Georgia, serif";
const BODY_FONT = "26px 'Be Vietnam Pro', sans-serif";
const FOOTER_FONT = "20px 'Be Vietnam Pro', sans-serif";
const SEAL_FONT = "52px Georgia, 'Times New Roman', serif";

const TITLE_TOP = 232;
const TITLE_LINE_HEIGHT = 54;
const BULLETS_TOP = 330;
const BULLET_LINE_HEIGHT = 38;
const BULLETS_BOTTOM_LIMIT = 552;

const roundedRectPath = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
};

const wrapText = (ctx, text, maxWidth) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  const rows = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      rows.push(current);
      current = word;
    }
  }
  if (current) rows.push(current);
  return rows;
};

const drawSealStamp = (ctx) => {
  const size = 92;
  const x = MARGIN_X;
  const y = 60;
  ctx.fillStyle = SEAL_RED;
  roundedRectPath(ctx, x, y, size, size, 14);
  ctx.fill();
  ctx.fillStyle = PAPER_TEXT;
  ctx.font = SEAL_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("鯉", x + size / 2, y + size / 2 + 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
};

const drawTitle = (ctx, title) => {
  ctx.fillStyle = PAPER_TEXT;
  ctx.font = TITLE_FONT;
  const rows = wrapText(ctx, title, CONTENT_WIDTH);
  const visibleRows = rows.slice(0, 2);
  if (rows.length > 2 && visibleRows[1] !== undefined) {
    visibleRows[1] += "…";
  }
  visibleRows.forEach((row, index) => {
    ctx.fillText(row, MARGIN_X, TITLE_TOP + index * TITLE_LINE_HEIGHT);
  });
};

const drawLines = (ctx, lines) => {
  ctx.fillStyle = BODY_TEXT;
  ctx.font = BODY_FONT;
  const rows = [];
  lines.forEach((line) => {
    rows.push(...wrapText(ctx, `• ${line}`, CONTENT_WIDTH));
  });
  const maxRows =
    Math.floor((BULLETS_BOTTOM_LIMIT - BULLETS_TOP) / BULLET_LINE_HEIGHT) + 1;
  const visibleRows = rows.slice(0, maxRows);
  visibleRows.forEach((row, index) => {
    const suffix =
      index === visibleRows.length - 1 && rows.length > maxRows ? "…" : "";
    ctx.fillText(row, MARGIN_X, BULLETS_TOP + index * BULLET_LINE_HEIGHT);
    if (suffix) {
      const lastRow = visibleRows[index];
      ctx.fillText(
        suffix,
        MARGIN_X + ctx.measureText(lastRow).width,
        BULLETS_TOP + index * BULLET_LINE_HEIGHT
      );
    }
  });
};

const drawFooter = (ctx) => {
  ctx.fillStyle = MUTED_TEXT;
  ctx.font = FOOTER_FONT;
  ctx.fillText("Koi FengShui · koifengshui.vn", MARGIN_X, 582);
};

const triggerDownload = (blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ket-qua-phong-thuy.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export async function shareResultCard({ title, lines }) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = POND;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = GOLD_SOFT;
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, CANVAS_WIDTH - 56, CANVAS_HEIGHT - 56);

    drawSealStamp(ctx);
    drawTitle(ctx, title);
    drawLines(ctx, Array.isArray(lines) ? lines : []);
    drawFooter(ctx);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((value) =>
        value ? resolve(value) : reject(new Error("Canvas export failed"))
      );
    });
    const file = new File([blob], "ket-qua-phong-thuy.png", {
      type: "image/png",
    });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return "shared";
    }
    triggerDownload(blob);
    return "downloaded";
  } catch {
    return "error";
  }
}
