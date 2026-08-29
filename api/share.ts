interface ShareRequest {
  query: Record<string, string | string[] | undefined>;
}

interface ShareResponse {
  status(code: number): ShareResponse;
  setHeader(name: string, value: string): ShareResponse;
  send(body: string): ShareResponse;
}

const SITE = "https://www.yes.vbss.io";
const API = "https://svc-mini.vbss.io/v1/only-yes/question";
const CODE_PATTERN = /^[A-Za-z0-9]{5}$/;
const TITLE_MAX = 90;
const DEFAULT_TITLE = "Only Yes — The question that only accepts Yes";
const DESCRIPTION =
  "Só tem um botão que funciona. Responde aí · Only one button works. Go answer.";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const htmlToText = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (value: string, max: number): string =>
  value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;

const buildPage = (title: string, url: string): string => {
  const safeTitle = escapeHtml(title);
  const safeUrl = escapeHtml(url);
  const safeDescription = escapeHtml(DESCRIPTION);
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${safeTitle}</title>
<meta name="robots" content="noindex" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Only Yes" />
<meta property="og:url" content="${safeUrl}" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDescription}" />
<meta property="og:image" content="${SITE}/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDescription}" />
<meta name="twitter:image" content="${SITE}/og-image.png" />
<meta http-equiv="refresh" content="0;url=${safeUrl}" />
</head>
<body>
<p><a href="${safeUrl}">${safeTitle}</a></p>
</body>
</html>`;
};

export default async function handler(
  req: ShareRequest,
  res: ShareResponse
): Promise<void> {
  const rawCode = Array.isArray(req.query.code)
    ? req.query.code[0]
    : req.query.code;
  const code = typeof rawCode === "string" ? rawCode : "";
  const url = CODE_PATTERN.test(code) ? `${SITE}/${code}` : `${SITE}/`;

  let title = DEFAULT_TITLE;
  if (CODE_PATTERN.test(code)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${API}?code=${encodeURIComponent(code)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const question = (await response.json()) as { question?: string };
        const text = truncate(htmlToText(question.question ?? ""), TITLE_MAX);
        if (text) title = `“${text}” — Only Yes`;
      }
    } catch {
      title = DEFAULT_TITLE;
    }
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=3600");
  res.status(200).send(buildPage(title, url));
}
