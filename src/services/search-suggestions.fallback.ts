export async function requestSuggestionsWithFallback(
  primaryRequest: () => Promise<string[] | undefined>,
  fallbackRequest: () => Promise<string[]>,
): Promise<string[]> {
  try {
    const suggestions = await primaryRequest();
    if (suggestions) return suggestions;
  } catch {
    // The secondary path keeps suggestions available when the primary transport fails.
  }

  return fallbackRequest();
}
