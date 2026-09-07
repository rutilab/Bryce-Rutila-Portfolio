/**
 * Bot identification, shared by middleware (blocking), robots.txt (asking
 * nicely), and the analytics tracker (keeping the dashboard honest).
 *
 * Edge-safe: plain regex, no Node APIs.
 */

/**
 * Crawlers that earn their keep. Search engines so the portfolio is findable,
 * and link unfurlers so a pasted link still shows a preview card in LinkedIn,
 * Slack, iMessage, and the rest. Blocking these would be self-defeating.
 */
const ALLOWED = [
  // Search
  'googlebot',
  'google-inspectiontool',
  'storebot-google',
  'bingbot',
  'duckduckbot',
  'applebot', // Siri / Spotlight. Applebot-Extended (AI training) is denied below.
  // Link previews
  'linkedinbot',
  'twitterbot',
  'facebookexternalhit',
  'slackbot',
  'discordbot',
  'telegrambot',
  'whatsapp',
  'redditbot',
  'skypeuripreview',
] as const;

/**
 * AI training / dataset crawlers. These are the ones that read the case
 * studies wholesale, and the ones publishers most often turn away.
 */
export const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'PerplexityBot',
  'Perplexity-User',
  'Bytespider',
  'Amazonbot',
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'FacebookBot',
  'cohere-ai',
  'Diffbot',
  'ImagesiftBot',
  'Omgilibot',
  'Timpibot',
  'YouBot',
  'AI2Bot',
  'Kangaroo Bot',
  'PanguBot',
  'Webzio-Extended',
] as const;

/** SEO / marketing crawlers. No upside for a personal portfolio. */
export const SEO_CRAWLERS = [
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'DataForSeoBot',
  'BLEXBot',
  'rogerbot',
  'Barkrowler',
  'SeekportBot',
  'serpstatbot',
  'ZoominfoBot',
  'PetalBot',
  'Sogou',
  'YandexBot',
] as const;

/** Scripted fetches: scraping libraries and command-line tools. */
const TOOL_AGENTS = [
  'python-requests',
  'python-urllib',
  'aiohttp',
  'httpx',
  'scrapy',
  'go-http-client',
  'okhttp',
  'java/',
  'libwww-perl',
  'curl/',
  'wget/',
  'headlesschrome',
  'phantomjs',
  'puppeteer',
  'playwright',
  'axios/',
  'node-fetch',
] as const;

/** Catches the long tail that names itself honestly. */
const GENERIC = /bot\b|crawler|spider|scrape|crawl\b/i;

const DENY_NAMED = [...AI_CRAWLERS, ...SEO_CRAWLERS].map(s => s.toLowerCase());

function normalize(ua: string | null | undefined): string {
  return (ua ?? '').toLowerCase();
}

/** Search engines and link unfurlers, which we let through. */
export function isAllowedBot(ua: string | null | undefined): boolean {
  const s = normalize(ua);
  if (!s) return false;
  // Applebot-Extended is AI training wearing Applebot's name.
  if (s.includes('applebot-extended')) return false;
  return ALLOWED.some(name => s.includes(name));
}

/** Anything we actively turn away at the door. */
export function isBlockedBot(ua: string | null | undefined): boolean {
  const s = normalize(ua);
  if (!s) return true; // No user-agent at all is a script, not a person.
  if (isAllowedBot(s)) return false;
  if (DENY_NAMED.some(name => s.includes(name))) return true;
  if (TOOL_AGENTS.some(name => s.includes(name))) return true;
  return GENERIC.test(s);
}

/**
 * Any non-human request, allowed or not. Analytics uses this: Googlebot is
 * welcome on the site but has no business inflating the visitor count.
 */
export function isBot(ua: string | null | undefined): boolean {
  return isAllowedBot(ua) || isBlockedBot(ua);
}
