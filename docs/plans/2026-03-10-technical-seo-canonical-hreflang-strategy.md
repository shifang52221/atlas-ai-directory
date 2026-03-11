# Technical SEO Canonical and Hreflang Strategy

**Date:** March 10, 2026  
**Site:** Atlas AI Directory (global English)

## Goals

- Keep one canonical URL per indexable page.
- Avoid duplicate URL variants splitting ranking signals.
- Provide explicit language targeting for an English-first global site.
- Ensure search engines can discover all high-value pages quickly.

## Canonical Strategy

- Every core route emits `rel="canonical"` via Next.js metadata `alternates.canonical`.
- Canonical base is controlled by `APP_BASE_URL`.
- Canonicals use absolute URLs and stable path format:
  - `/`
  - `/tools`, `/tools/[slug]`
  - `/use-cases`, `/use-cases/[slug]`
  - `/compare`, `/workflows`
  - `/submit`, `/affiliate-disclosure`, `/editorial-policy`

## Hreflang Strategy (English-only phase)

- Current launch is a single language: English.
- Sitemap entries include alternates:
  - `hreflang="en"` -> self URL
  - `hreflang="x-default"` -> self URL
- This keeps locale signaling explicit and creates a forward-compatible structure
  for future localized editions.

## Indexation Controls

- `robots.txt`:
  - Allow all public crawling (`Allow: /`)
  - Block admin area (`Disallow: /admin`)
  - Expose sitemap URL.
- `sitemap.xml`:
  - Includes core static routes.
  - Includes current tool and use-case detail URLs.
  - Includes `lastModified`, `changeFrequency`, `priority`, and hreflang alternates.

## Automated Validation

- E2E checks validate:
  - `/robots.txt` status and key directives.
  - `/sitemap.xml` status, required URLs, and `hreflang` alternates.
  - Canonical presence on core pages and detail pages.
  - Structured data presence on core intent pages.

## Operational Notes

- Production deploy must set `APP_BASE_URL` to the final domain.
- After domain cutover, resubmit sitemap in Google Search Console.
- If localized sites are added later, extend alternates with locale-specific URLs
  and move `x-default` to the global language selector or primary default locale.
