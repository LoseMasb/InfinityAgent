export function parseJsonObject(input) {
  const text = String(input || "").trim();

  try {
    return JSON.parse(text);
  } catch {
    // Some models still wrap JSON in fences even when asked not to.
  }

  const withoutFence = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    // Fall through to object slicing below.
  }

  const first = withoutFence.indexOf("{");
  const last = withoutFence.lastIndexOf("}");

  if (first >= 0 && last > first) {
    return JSON.parse(withoutFence.slice(first, last + 1));
  }

  throw new Error("Unable to parse JSON object from LLM response.");
}

export function stableStringify(value) {
  return JSON.stringify(value, null, 2);
}
