export function parseAISections(text) {
  if (!text) return [];

  const parts = text.split(/^## /gm).filter(Boolean);

  return parts.map((block) => {
    const nl = block.indexOf("\n");
    const title = nl === -1 ? block.trim() : block.slice(0, nl).trim();
    const content = nl === -1 ? "" : block.slice(nl + 1).trim();
    return { title, content };
  });
}

export function formatAIContent(content) {
  if (!content) return [];

  const lines = content.split("\n").filter((l) => l.trim());
  return lines.map((line) => {
    const trimmed = line.trim();
    if (/^[-*•]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      return { type: "list", text: trimmed.replace(/^[-*•]\s/, "").replace(/^\d+\.\s/, "") };
    }
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      return { type: "bold", text: trimmed.slice(2, -2) };
    }
    return { type: "paragraph", text: trimmed };
  });
}
