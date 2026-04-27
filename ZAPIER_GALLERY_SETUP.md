# Zapier Gallery Setup

Use Zapier to create a new file in GitHub when a Facebook or Instagram post is published.

## GitHub File

Repository:

```text
smills1840/pcc-website
```

File path:

```text
gallery/{{Post ID}}.json
```

The website also supports `_projects/{{Post ID}}.json`, but `gallery/` is fine if that is how the Zap is already configured.

## File Contents

The file must be valid JSON. Paste a structure like this into the GitHub file content field and map the Zapier values into it:

```json
{
  "title": "{{Caption or Post Title}}",
  "location": "Southwest Virginia",
  "category": "garage",
  "images": [
    "{{Full Image URL}}"
  ],
  "description": "{{Caption}}",
  "source_url": "{{Post URL}}",
  "source": "instagram",
  "featured": false,
  "date": "{{Created Date}}"
}
```

## Category Values

Use one of these exact values:

```text
garage
commercial
residential
polished
patio
```

## Important

Do not output raw Zapier fields one after another. The website can only read the post if the file content is valid JSON.

Instagram image URLs can expire. For the most reliable long-term gallery, configure Zapier to upload/copy the image into the repo `assets/` folder, then put that saved asset path in `images`.
