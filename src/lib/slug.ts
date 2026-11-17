/**
 * Kebab form of a printed name (tests/CONTRACT.md): strip accents (NFD), lowercase,
 * every run of non [a-z0-9] becomes one "-", ends trimmed.
 */
export function slug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
