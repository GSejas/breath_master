# Banner Creation Guide for Health Watch Documentation

![Documentation Banner](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwZjE3MmEiLz4KICAgICAgPHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjIiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjcGF0dGVybikiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwgQmxhY2siIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Eb2N1bWVudGF0aW9uIEJhbm5lciBHdWlkZTwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9IjU1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzYjgyZjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNyZWF0aW5nIFByb2Zlc3Npb25hbCBTVkcgQmFubmVyczwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9Ijc1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC43KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+OqCBDb25zaXN0ZW50IFZpc3VhbCBJZGVudGl0eTwvdGV4dD4KPC9zdmc+)

## 🎯 Overview

This guide explains how to create and add professional banners to Health Watch documentation using SVG graphics embedded as base64 data URLs.

## 🛠️ Quick Start

### Method 1: Use the Banner Generator Script

```bash
# Navigate to project root
cd health-watch

# Generate a new banner
node scripts/create-banner.js "Your Title" "Subtitle" "Bottom Text" theme
```

**Available Themes:**
- `architecture` - Circuit patterns (default)
- `testing` - Grid patterns  
- `planning` - Dot patterns
- `monitoring` - Wave patterns
- `implementation` - Hexagon patterns

### Method 2: Manual SVG Creation

1. Create your SVG (800×100px recommended)
2. Convert to base64
3. Embed in markdown

## 📋 Examples

### Architecture Documentation
```bash
node scripts/create-banner.js "System Architecture" "Design Decisions & Patterns" "Technical Documentation" architecture
```

Result:
![Architecture Example](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJjaXJjdWl0IiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMxZjI5MzciLz4KICAgICAgPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iIzEwYjk4MSIgb3BhY2l0eT0iMC4zIi8+CiAgICA8L3BhdHRlcm4+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2NpcmN1aXQpIi8+CiAgPHRleHQgeD0iNDAwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIEJsYWNrIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3lzdGVtIEFyY2hpdGVjdHVyZTwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9IjU1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMxMGI5ODEiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRlc2lnbiBEZWNpc2lvbnMgJiBQYXR0ZXJuczwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9Ijc1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC43KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+PuO+4jyBUZWNobmljYWwgRG9jdW1lbnRhdGlvbjwvdGV4dD4KPC9zdmc+)

### Testing Documentation
```bash
node scripts/create-banner.js "Test Coverage Report" "Quality Assurance Metrics" "Automated Testing" testing
```

Result:
![Testing Example](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwZjE3MmEiLz4KICAgICAgPHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzNiODJmNiIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjIiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjcGF0dGVybikiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwgQmxhY2siIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5UZXN0IENvdmVyYWdlIFJlcG9ydDwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9IjU1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiMzYjgyZjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlF1YWxpdHkgQXNzdXJhbmNlIE1ldHJpY3M8L3RleHQ+CiAgPHRleHQgeD0iNDAwIiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuNykiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfp6ogQXV0b21hdGVkIFRlc3Rpbmc8L3RleHQ+Cjwvc3ZnPg==)

### Implementation Documentation
```bash
node scripts/create-banner.js "Feature Implementation" "Development Guidelines" "Code Standards" implementation
```

Result:
![Implementation Example](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjgiIGhlaWdodD0iMjQiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cmVjdCB3aWR0aD0iMjgiIGhlaWdodD0iMjQiIGZpbGw9IiMwNjVmNDYiLz4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIxNCwyIDI0LDggMjQsMTYgMTQsMjIgNCwxNiA0LDgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM0ZDM5OSIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjIiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjcGF0dGVybikiLz4KICA8dGV4dCB4PSI0MDAiIHk9IjM1IiBmb250LWZhbWlseT0iQXJpYWwgQmxhY2siIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5GZWF0dXJlIEltcGxlbWVudGF0aW9uPC90ZXh0PgogIDx0ZXh0IHg9IjQwMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0ZDM5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RGV2ZWxvcG1lbnQgR3VpZGVsaW5lczwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9Ijc1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC43KSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+4pqZ77iPIENvZGUgU3RhbmRhcmRzPC90ZXh0Pgo8L3N2Zz4=)

## 🎨 Theme Reference

### Architecture Theme (Circuit Pattern)
- **Background**: Dark gray (`#1f2937`)
- **Accent**: Green (`#10b981`)
- **Pattern**: Circuit dots
- **Best for**: System design, ADRs, architecture docs

### Testing Theme (Grid Pattern)
- **Background**: Dark blue (`#0f172a`)
- **Accent**: Blue (`#3b82f6`)
- **Pattern**: Grid lines
- **Best for**: Test reports, QA docs, coverage analysis

### Planning Theme (Dot Pattern)
- **Background**: Purple (`#581c87`)
- **Accent**: Light purple (`#a855f7`)
- **Pattern**: Scattered dots
- **Best for**: Roadmaps, planning docs, strategy

### Monitoring Theme (Wave Pattern)
- **Background**: Red (`#dc2626`)
- **Accent**: Yellow (`#fbbf24`)
- **Pattern**: Wave lines
- **Best for**: Monitoring docs, alerts, metrics

### Implementation Theme (Hexagon Pattern)
- **Background**: Dark green (`#065f46`)
- **Accent**: Light green (`#34d399`)
- **Pattern**: Hexagonal grid
- **Best for**: Implementation guides, code docs

## 🔧 Manual Creation Process

### Step 1: Create SVG
Create an 800×100px SVG with your desired styling:

```xml
<svg width="800" height="100" xmlns="http://www.w3.org/2000/svg">
  <!-- Your SVG content here -->
</svg>
```

### Step 2: Convert to Base64
Use Node.js or online tools:

```javascript
const fs = require('fs');
const svg = fs.readFileSync('banner.svg', 'utf8');
const base64 = Buffer.from(svg).toString('base64');
console.log(`data:image/svg+xml;base64,${base64}`);
```

### Step 3: Add to Markdown
```markdown
![Your Banner Title](data:image/svg+xml;base64,YOUR_BASE64_STRING)
```

## 📐 Design Guidelines

### Dimensions
- **Width**: 800px (standard)
- **Height**: 100px (recommended)
- **Aspect Ratio**: 8:1

### Typography
- **Title**: Arial Black, 24px, white
- **Subtitle**: Arial, 14px, accent color
- **Bottom Text**: Arial, 12px, rgba(255,255,255,0.7)

### Colors
Use the predefined theme colors for consistency:
- Keep contrast high for readability
- Use accent colors sparingly
- White text on dark backgrounds

### Patterns
- Keep patterns subtle (low opacity)
- Ensure they don't interfere with text
- Use consistent spacing (20-40px grids work well)

## 🚀 Adding to Existing Documents

To add a banner to any existing documentation:

1. **Choose appropriate theme** based on document type
2. **Generate banner** using the script
3. **Place at top** of markdown file (after title if present)
4. **Test rendering** in VS Code preview

Example placement:
```markdown
# Document Title

![Banner](data:image/svg+xml;base64,...)

## Content starts here...
```

## 🎯 Best Practices

### Consistency
- Use the same theme for related documents
- Keep text lengths similar across banners
- Maintain consistent emoji usage

### Performance
- Base64 encoding increases file size (~33% overhead)
- Consider external SVG files for very large documents
- Optimize SVG before encoding (remove unnecessary whitespace)

### Accessibility
- Ensure good contrast ratios
- Use descriptive alt text
- Don't rely solely on color for information

### Maintenance
- Document which banners use which themes
- Keep a centralized record of banner styles
- Update banners when brand guidelines change

## 🔗 Related Resources

- [SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)
- [Base64 Encoding](https://developer.mozilla.org/en-US/docs/Web/API/btoa)
- [Markdown Image Syntax](https://www.markdownguide.org/basic-syntax/#images)
- [Color Accessibility](https://webaim.org/resources/contrastchecker/)

---

This guide provides everything needed to create professional, consistent banners for Health Watch documentation. The automated script handles most use cases, while manual creation allows for completely custom designs when needed.