/**
 * synthosresearch.com edge worker — canonicalization + Ghost-era redirects.
 *
 * The site moved off Ghost (2026-08-19): apex + www now serve the static hub that
 * previously lived only at research.synthosresearch.com. Old Ghost URLs 301 to their
 * static equivalents so search results and shared links keep working.
 */

const APEX = "synthosresearch.com";

// Ghost page/post slugs -> static paths. Trailing slashes handled before lookup.
const LEGACY = {
  "/the-synthos-flagship": "/flagship",
  "/portfolios": "/",
  "/scorecard": "/verified",
  "/methodology": "/research",
  "/how-synthos-posts": "/research",
  "/pricing": "/",
  "/coming-soon": "/",
  "/eli-lilly-lly-a-magnificent-business-priced-for-it": "/LLY",
  "/circle-crcl-a-real-theme-a-questionable-vehicle": "/CRCL",
  "/sector-breakdown-where-the-cheap-growth-is-hiding-and-where-it-isnt": "/",
  "/market-status-no-landing-sticky-inflation-and-a-tape-that-wont-quit": "/",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // One canonical origin: https on the apex. research.* and www.* fold in,
    // preserving path + query (chart images linked from sent emails included).
    if (url.protocol === "http:" || url.hostname !== APEX) {
      url.protocol = "https:";
      url.hostname = APEX;
      return Response.redirect(url.toString(), 301);
    }

    const bare = url.pathname.replace(/\/+$/, "") || "/";

    if (LEGACY[bare]) {
      return Response.redirect(`https://${APEX}${LEGACY[bare]}`, 301);
    }

    // Ghost deep-dive posts: /deep-dive-aaoi -> /AAOI.html
    const dd = bare.match(/^\/deep-dive-([a-z0-9-]+)$/i);
    if (dd) {
      return Response.redirect(
        `https://${APEX}/${dd[1].replace(/-/g, "").toUpperCase()}`, 301);
    }

    return env.ASSETS.fetch(request);
  },
};
