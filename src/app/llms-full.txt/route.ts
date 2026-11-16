import { buildLlmsFullTxt } from "@/lib/seo/llms";
import { SITE } from "@/lib/seo/site";

export const revalidate = 3600;

export async function GET() {
  let body: string;
  try {
    body = await buildLlmsFullTxt();
  } catch (error) {
    console.error("[llms-full.txt] catalogue unavailable:", error);
    body = `# ${SITE.name}\n\n> ${SITE.description}\n`;
  }
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
