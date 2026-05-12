export function slugify(input, fallback = "vue-site") {
  const slug = String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return slug || fallback;
}

export function titleFromName(input, fallback = "Vue Site") {
  const text = String(input || "").trim();
  if (!text) {
    return fallback;
  }

  return text
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
