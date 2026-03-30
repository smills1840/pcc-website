/**
 * Cloudflare Pages Function: /api/projects
 * Reads project JSON files from _projects/ via GitHub API.
 * Falls back gracefully if API is unavailable.
 */
export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  try {
    // Use GitHub API to list _projects directory
    const apiUrl = 'https://api.github.com/repos/smills1840/pcc-website/contents/_projects';
    const apiRes = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'pcc-website-gallery/1.0',
      },
      cf: { cacheTtl: 60 } // Cache at Cloudflare edge for 60 seconds
    });

    if (!apiRes.ok) {
      console.error('GitHub API error:', apiRes.status, await apiRes.text());
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    const files = await apiRes.json();

    if (!Array.isArray(files)) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    // Filter to JSON files only, exclude manifest and hidden files
    const jsonFiles = files.filter(f =>
      f.name.endsWith('.json') &&
      f.name !== 'manifest.json' &&
      !f.name.startsWith('.')
    );

    if (jsonFiles.length === 0) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    // Fetch each project file in parallel
    const projectFetches = jsonFiles.map(async f => {
      try {
        const res = await fetch(f.download_url);
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    });

    const projects = (await Promise.all(projectFetches)).filter(Boolean);

    // Sort: featured first, then newest first
    projects.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.date || '').localeCompare(a.date || '');
    });

    return new Response(JSON.stringify(projects), { headers: corsHeaders });

  } catch (e) {
    console.error('Projects function error:', e);
    return new Response(JSON.stringify([]), { headers: corsHeaders });
  }
}
