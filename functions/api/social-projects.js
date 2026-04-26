const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

const CATEGORY_LABELS = {
  garage: ["garage", "garagefloor", "garagefloors", "garagecoating", "garagecoatings", "polyaspartic"],
  commercial: ["commercial", "warehouse", "restaurant", "retail", "industrial", "facility"],
  polished: ["polished", "polishedconcrete", "concretepolishing"],
  patio: ["patio", "pooldeck", "pool", "outdoor"],
  residential: ["residential", "basement", "home", "porch"],
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  });
}

function getEnv(context, name) {
  return context.env && typeof context.env[name] === "string"
    ? context.env[name].trim()
    : "";
}

function stripHashtags(text) {
  return String(text || "").replace(/(^|\s)#[\w-]+/g, "").replace(/\s+/g, " ").trim();
}

function hashtags(text) {
  return Array.from(String(text || "").matchAll(/#([\w-]+)/g))
    .map(match => match[1].toLowerCase());
}

function titleFromCaption(caption, fallback) {
  const firstLine = String(caption || "")
    .split(/\r?\n/)
    .map(line => stripHashtags(line))
    .find(Boolean);
  return firstLine || fallback;
}

function descriptionFromCaption(caption) {
  return stripHashtags(caption).slice(0, 360);
}

function categoryFromCaption(caption) {
  const tags = hashtags(caption);
  for (const [category, matches] of Object.entries(CATEGORY_LABELS)) {
    if (tags.some(tag => matches.includes(tag))) return category;
  }
  return "garage";
}

function locationFromCaption(caption) {
  const text = String(caption || "");
  const explicit = text.match(/(?:location|city)\s*:\s*([^\n#]+)/i);
  if (explicit) return explicit[1].trim();
  const vaCity = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*(?:VA|Virginia)\b/);
  return vaCity ? `${vaCity[1]}, VA` : "Southwest Virginia";
}

function dateOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

async function graphFetch(path, token) {
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${GRAPH_BASE}${path}${separator}access_token=${encodeURIComponent(token)}`);
  if (!response.ok) {
    throw new Error(`Meta Graph API ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

function imageFromInstagramMedia(media) {
  if (!media) return "";
  return media.media_type === "VIDEO"
    ? media.thumbnail_url || media.media_url || ""
    : media.media_url || media.thumbnail_url || "";
}

function normalizeInstagramPost(media) {
  const caption = media.caption || "";
  const children = media.children && Array.isArray(media.children.data)
    ? media.children.data
    : [];
  const images = [
    imageFromInstagramMedia(media),
    ...children.map(imageFromInstagramMedia),
  ].filter(Boolean);

  if (!images.length) return null;

  return {
    source: "instagram",
    sourceId: media.id,
    title: titleFromCaption(caption, "Instagram Project"),
    location: locationFromCaption(caption),
    category: categoryFromCaption(caption),
    description: descriptionFromCaption(caption),
    date: dateOnly(media.timestamp),
    permalink: media.permalink || "",
    images,
  };
}

function collectFacebookImages(post) {
  const images = [];
  if (post.full_picture) images.push(post.full_picture);
  const attachments = post.attachments && Array.isArray(post.attachments.data)
    ? post.attachments.data
    : [];

  for (const attachment of attachments) {
    if (attachment.media && attachment.media.image && attachment.media.image.src) {
      images.push(attachment.media.image.src);
    }
    const subattachments = attachment.subattachments && Array.isArray(attachment.subattachments.data)
      ? attachment.subattachments.data
      : [];
    for (const item of subattachments) {
      if (item.media && item.media.image && item.media.image.src) images.push(item.media.image.src);
    }
  }

  return Array.from(new Set(images.filter(Boolean)));
}

function normalizeFacebookPost(post) {
  const message = post.message || post.story || "";
  const images = collectFacebookImages(post);
  if (!images.length) return null;

  return {
    source: "facebook",
    sourceId: post.id,
    title: titleFromCaption(message, "Facebook Project"),
    location: locationFromCaption(message),
    category: categoryFromCaption(message),
    description: descriptionFromCaption(message),
    date: dateOnly(post.created_time),
    permalink: post.permalink_url || "",
    images,
  };
}

function dedupeProjects(projects) {
  const seen = new Set();
  return projects.filter(project => {
    const key = project.permalink || project.sourceId || project.images[0];
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function onRequest(context) {
  const token = getEnv(context, "META_ACCESS_TOKEN");
  const instagramUserId = getEnv(context, "META_IG_USER_ID");
  const facebookPageId = getEnv(context, "META_FB_PAGE_ID");
  const limit = Math.min(Math.max(parseInt(getEnv(context, "META_GALLERY_LIMIT") || "24", 10), 1), 50);

  if (!token || (!instagramUserId && !facebookPageId)) {
    return json([]);
  }

  const requests = [];

  if (instagramUserId) {
    const fields = [
      "id",
      "caption",
      "media_type",
      "media_url",
      "permalink",
      "thumbnail_url",
      "timestamp",
      "children{media_type,media_url,thumbnail_url,permalink,id}",
    ].join(",");
    requests.push(
      graphFetch(`/${instagramUserId}/media?fields=${encodeURIComponent(fields)}&limit=${limit}`, token)
        .then(data => (data.data || []).map(normalizeInstagramPost))
        .catch(error => {
          console.error("Instagram gallery feed error:", error.message);
          return [];
        })
    );
  }

  if (facebookPageId) {
    const fields = [
      "id",
      "message",
      "story",
      "created_time",
      "permalink_url",
      "full_picture",
      "attachments{media,type,title,description,url,subattachments}",
    ].join(",");
    requests.push(
      graphFetch(`/${facebookPageId}/posts?fields=${encodeURIComponent(fields)}&limit=${limit}`, token)
        .then(data => (data.data || []).map(normalizeFacebookPost))
        .catch(error => {
          console.error("Facebook gallery feed error:", error.message);
          return [];
        })
    );
  }

  const projects = dedupeProjects((await Promise.all(requests)).flat().filter(Boolean))
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, limit);

  return json(projects);
}
