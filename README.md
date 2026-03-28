# Prestige Concrete Coatings — Website

## File Structure

```
prestige-site/
├── index.html                  → Homepage
├── residential-epoxy.html      → Residential Epoxy page
├── commercial-coatings.html    → Commercial Coatings page
├── garage-makeovers.html       → Garage Makeovers + Quote Form page
├── assets/                     ← CREATE THIS FOLDER, put your images here
│   ├── logo.png                ← Your logo file (or .svg)
│   └── (your photos here)
└── README.md
```

## How to Add Your Logo

1. Create an `assets/` folder inside `prestige-site/`
2. Place your logo file there and name it `logo.png` (or update the `src="assets/logo.png"` references in each HTML file to match your filename)

## How to Replace Placeholder Images

Every image placeholder in the site has a comment directly above it showing exactly what to do. Search for `<!-- REPLACE:` in each HTML file.

### Example:
```html
<!-- REPLACE: <img class="w-full h-full object-cover opacity-40" src="assets/hero-epoxy-floor.jpg" alt="..."/> -->
<div class="img-placeholder w-full h-full opacity-40">...</div>
```

Simply delete the `<div class="img-placeholder ...">` block and uncomment (remove `<!--` and `-->`) the `<img>` tag above it. Then place your photo in the `assets/` folder with the matching filename.

## Recommended Photos

| File name | Description | Used on |
|-----------|-------------|---------|
| `logo.png` | Your company logo (transparent bg) | All pages |
| `hero-epoxy-floor.jpg` | Close-up metallic epoxy floor | Homepage hero |
| `residential-garage.jpg` | Luxury epoxy garage interior | Homepage & Residential |
| `commercial-hangar.jpg` | Large commercial facility floor | Homepage & Commercial |
| `concrete-polishing.jpg` | Polished concrete texture | Homepage |
| `technician-applying.jpg` | Tech applying coating | Homepage |
| `residential-hero.jpg` | Wide garage hero shot | Residential page hero |
| `garage-floor.jpg` | Garage makeover result | Residential page |
| `basement-floor.jpg` | Finished basement floor | Residential page |
| `patio-coating.jpg` | Patio/pool deck coating | Residential page |
| `application-process.jpg` | Process/application shot | Residential page |
| `commercial-hero.jpg` | Wide industrial floor | Commercial page hero |
| `restaurant-kitchen.jpg` | Commercial kitchen floor | Commercial page |
| `laboratory.jpg` | Clean room / lab floor | Commercial page |
| `warehouse.jpg` | Warehouse with epoxy floor | Commercial page |
| `epoxy-closeup.jpg` | Macro liquid epoxy shot | Commercial page |
| `garage-hero.jpg` | Garage hero + sports car | Garage page hero |
| `before-floor.jpg` | Old cracked concrete | Garage before/after |
| `after-floor.jpg` | New finished epoxy floor | Garage before/after |

## Customization Notes

- **Phone number**: Search for `(800) 555-FLAWLESS` in `garage-makeovers.html` and replace
- **Copyright year**: Currently set to 2025
- **Stats** (15+ years, 2M+ sq ft, etc.): Edit directly in each HTML file
- **Testimonials**: Edit in `residential-epoxy.html`
- **Colors**: The primary yellow is `#FEC300` — defined in each page's Tailwind config

## Hosting

These are plain HTML files. You can host them on any static hosting:
- **Netlify**: Drag and drop the `prestige-site/` folder
- **Vercel**: Connect your repo or drag and drop
- **GitHub Pages**: Push to a repo and enable Pages
- **Traditional web host**: Upload via FTP

No build step required — just open any `.html` file in a browser to preview.
