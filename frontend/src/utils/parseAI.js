export function parseAISections(text) {
  if (!text) return [];

  const parts = text.split(/^## /gm).filter(Boolean);

  return parts.map((block) => {
    const nl = block.indexOf("\n");

    return {
      title:
        nl === -1 ? block.trim() : block.slice(0, nl).trim(),
      content: nl === -1 ? "" : block.slice(nl + 1).trim(),
    };
  });
}
