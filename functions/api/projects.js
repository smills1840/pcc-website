/**
 * Cloudflare Pages Function: /api/projects
 * Automatically reads all JSON files from _projects/ using
 * Cloudflare's asset fetching — no manifest needed.
 */
export async function onRequest(context) {
  const { env, request } = context;
  const base = new URL(request.url).origin;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  try {
    // Cloudflare Pages exposes assets via env.ASSETS
    // We fetch a known index to get the list of _projects files
    // by trying to read each file until we run out
    // Since we can't list directories, we use the GitHub API
    // with a public raw URL instead
    const apiUrl = 'https://api.github.com/repos/smills1840/pcc-website/contents/_projects';
    const apiRes = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'pcc-website-gallery',
      }
    });

    if (!apiRes.ok) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    const files = await apiRes.json();
    const jsonFiles = Array.isArray(files)
      ? files.filter(f => f.name.endsWith('.json') && f.name !== 'manifest.json')
      : [];

    if (jsonFiles.length === 0) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    // Fetch each project's raw content
    const projectFetches = jsonFiles.map(f =>
      fetch(f.download_url).then(r => r.json()).catch(() => null)
    );
    const projects = (await Promise.all(projectFetches)).filter(Boolean);

    // Sort: featured first, then newest first
    projects.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.date || '').localeCompare(a.date || '');
    });

    return new Response(JSON.stringify(projects), { headers: corsHeaders });

  } catch (e) {
    return new Response(JSON.stringify([]), { headers: corsHeaders });
  }
}
