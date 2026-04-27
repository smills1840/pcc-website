# Zapier Gallery Setup

Use Zapier to create a new JSON file in GitHub when a Facebook or Instagram post is published.

Repository:

```text
smills1840/pcc-website
```

File path:

```text
gallery/{{Post ID}}.json
```

The website also supports `_projects/{{Post ID}}.json`, but `gallery/` is fine if the Zap is already configured that way.

## Required File Format

The file content must be valid JSON. For a 1:1 social import, map the real social post fields into this structure:

```json
{
  "title": "{{First Line of Caption}}",
  "location": "Southwest Virginia",
  "category": "garage",
  "media_url_1": "{{Image URL 1}}",
  "media_url_2": "{{Image URL 2}}",
  "media_url_3": "{{Image URL 3}}",
  "caption": "{{Full Caption}}",
  "source_url": "{{Post URL}}",
  "source": "instagram",
  "featured": false,
  "date": "{{Created Date}}"
}
```

The gallery uses `caption` as the project description when `description` is not provided.

In Zapier, the image fields must be URL text fields, not file/image objects. If the file content starts with `JFIF` or unreadable symbols, Zapier saved the actual image binary into the `.json` file instead of saving JSON text.

## Simple First Test

If the carousel fields are hard to map, start with one image so you can confirm the Zap is creating real JSON:

```json
{"title":"Instagram Project","location":"Southwest Virginia","category":"garage","media_url":"{{Media URL}}","caption":"{{Full Caption}}","source_url":"{{Permalink}}","source":"instagram","featured":false,"date":"{{Timestamp}}"}
```

Once that appears on the site, add `media_url_2`, `media_url_3`, and so on.

## Easier Multi-Image Option

If Zapier gives carousel/media URLs as one line-item field, use `media_urls` instead of manually building the `images` array:

```json
{
  "title": "{{First Line of Caption}}",
  "location": "Southwest Virginia",
  "category": "garage",
  "media_urls": "{{All Media URLs}}",
  "caption": "{{Full Caption}}",
  "source_url": "{{Post URL}}",
  "source": "instagram",
  "featured": false,
  "date": "{{Created Date}}"
}
```

`media_urls` may be newline-separated, comma-separated, or pipe-separated.

You can also use separate numbered fields instead of an array. The gallery accepts `media_url_1` through `media_url_10`.

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

If Zapier says `sha wasn't supplied`, it is trying to update a file that already exists. Use a fresh test file path, delete the existing test file, or add GitHub's file SHA field before updating an existing file.

Instagram CDN image URLs can expire. For the most reliable long-term gallery, use a Zapier step to upload/copy each image into the repo `assets/` folder, then put those saved asset paths in `images`.
