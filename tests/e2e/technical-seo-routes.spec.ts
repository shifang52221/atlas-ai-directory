import { expect, test } from "@playwright/test";

test("robots.txt exposes crawl rules and sitemap location", async ({
  request,
}) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain("User-Agent: *");
  expect(body).toContain("Allow: /");
  expect(body).toContain("Disallow: /admin");
  expect(body).toContain("Sitemap: http://localhost:3000/sitemap.xml");
});

test("sitemap.xml exposes core URLs and hreflang alternates", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);

  const body = await response.text();
  expect(body).toContain("<urlset");
  expect(body).toContain("<loc>http://localhost:3000/</loc>");
  expect(body).toContain("<loc>http://localhost:3000/tools</loc>");
  expect(body).toContain("<loc>http://localhost:3000/use-cases</loc>");
  expect(body).toContain("<loc>http://localhost:3000/compare</loc>");
  expect(body).toContain("<loc>http://localhost:3000/workflows</loc>");
  expect(body).toContain("<loc>http://localhost:3000/best-ai-automation-tools</loc>");
  expect(body).toContain("<loc>http://localhost:3000/best-ai-agents-for-sales</loc>");
  expect(body).toContain("<loc>http://localhost:3000/best-ai-tools-for-support</loc>");
  expect(body).toContain("<loc>http://localhost:3000/best-ai-tools-for-marketing</loc>");
  expect(body).toContain("<loc>http://localhost:3000/tools/zapier-ai</loc>");
  expect(body).toContain(
    "<loc>http://localhost:3000/use-cases/support-automation</loc>",
  );
  expect(body).toContain('hreflang="en"');
  expect(body).toContain('hreflang="x-default"');
});
