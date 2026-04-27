/**
 * Cloudflare Pages Function: /api/projects
 * Reads project JSON files from _projects/ and gallery/ via GitHub API.
 * The gallery/ folder is supported for Zapier-created social post files.
 */
export async function onRequest() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  async function listJsonFiles(folder) {
    const apiUrl = `https://api.github.com/repos/smills1840/pcc-website/contents/${folder}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'pcc-website-gallery/1.0',
      },
      cf: { cacheTtl: 60 },
    });

    if (!apiRes.ok) {
      console.error(`GitHub API error for ${folder}:`, apiRes.status, await apiRes.text());
      return [];
    }

    const files = await apiRes.json();
    if (!Array.isArray(files)) return [];

    return files.filter(file =>
      file.name.endsWith('.json') &&
      file.name !== 'manifest.json' &&
      !file.name.startsWith('.')
    );
  }

  async function readProjectFile(file) {
    try {
      const res = await fetch(file.download_url, { cf: { cacheTtl: 60 } });
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error(`Invalid gallery JSON in ${file.path || file.name}:`, error.message);
      return null;
    }
  }

  try {
    const files = [
      ...(await listJsonFiles('_projects')),
      ...(await listJsonFiles('gallery')),
    ];

    if (!files.length) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    const projects = (await Promise.all(files.map(readProjectFile))).filter(Boolean);

    projects.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.date || '').localeCompare(a.date || '');
    });

    return new Response(JSON.stringify(projects), { headers: corsHeaders });
  } catch (error) {
    console.error('Projects function error:', error);
    return new Response(JSON.stringify([]), { headers: corsHeaders });
  }
}
