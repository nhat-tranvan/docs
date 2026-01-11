# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **Mintlify-based documentation site** for CloudThinker, a Multi-Agent System (MAS) orchestration platform for cloud operations. The documentation is written in MDX format and uses Mintlify's tooling for development and deployment.

## Development Commands

### Local Development

```bash
# Install Mintlify CLI globally (required for development)
npm i -g mintlify

# Start local development server (runs on http://localhost:3000)
mintlify dev

# Use custom port if needed
mintlify dev --port 3333

# Update Mintlify to latest version
npm i -g mintlify@latest
```

### Content Validation

```bash
# Check for broken links in documentation
mintlify broken-links
```

## Architecture & Structure

### Configuration Files

- **`docs.json`**: Main Mintlify configuration file defining navigation, theme, colors, and site structure
- **`README.md`**: Basic setup instructions (Mintlify starter template)

### Content Structure

- **Root pages**: `index.mdx`, `quickstart.mdx`, `innovation.mdx`, `development.mdx`
- **Guide pages**: `/guide/` - Core product guides (connections, agents, workspaces, etc.)
- **Blog posts**: `/blog/` - Technical blog articles
- **Learning resources**: `/learn/` - FAQ and learning materials
- **API reference**: `/api-reference/` - OpenAPI documentation
- **Essentials**: `/essentials/` - Mintlify documentation features
- **Assets**: `/images/`, `/logo/`, `/snippets/`

### Platform-Specific Details

**CloudThinker Platform**: Multi-cloud AI operations platform with specialized agents:

- **Alex**: Cloud Engineer (infrastructure, cost optimization)
- **Oliver**: Security Professional (compliance, vulnerability assessment)
- **Tony**: Database Administrator (performance tuning)
- **Kai**: Kubernetes Administrator (container orchestration)
- **Anna**: Technology Leader (strategy, transformation)

**Multi-cloud support**: AWS, Azure, GCP with unified operations interface

## Content Guidelines

### MDX Format

- All content files use `.mdx` extension
- Front matter with `title` and `description` required
- Uses Mintlify components: `Card`, `CardGroup`, `Steps`, `Tabs`, `Accordion`, etc.

### Navigation Management

- Navigation structure defined in `docs.json` under `navigation.tabs`
- Pages must be referenced in navigation to appear in site
- Use descriptive page names and proper grouping

### Asset Management

- Images stored in `/images/` directory
- Logos in `/logo/` (light.svg, dark.svg for theme variants)
- Reference images with `/images/filename` in MDX

## Prerequisites

- **Node.js version 19 or higher** required for Mintlify CLI
- **Global Mintlify CLI installation** required for development
- Use `docs.json` (not legacy `mint.json`)

## Deployment

- Automatic deployment via GitHub integration
- Changes deploy to production after pushing to default branch
- Mintlify handles hosting and CDN distribution

## Common Tasks

### Adding New Pages

1. Create `.mdx` file in appropriate directory
2. Add front matter with title and description
3. Update `docs.json` navigation structure
4. Test locally with `mintlify dev`

### Updating Navigation

1. Edit `docs.json` navigation section
2. Ensure all referenced pages exist
3. Test navigation structure locally

### Content Updates

1. Edit existing `.mdx` files
2. Use Mintlify components for consistent styling
3. Validate links with `mintlify broken-links`
4. Preview changes with `mintlify dev`

### Adding Images to MDX Files

#### Image Naming Convention

Use descriptive kebab-case names with a numeric prefix to indicate position:

```
01-context-name.jpg
02-filter-pane.png
03-results-summary.jpg
```

- Preserve leading number as-is (01, 02, 03, etc.)
- Convert rest to concise, kebab-case descriptions
- Names should hint at where they're used in the document
- Supported formats: `.jpg`, `.png`, `.gif`, `.svg`, `.webp`

#### File Placement

1. Create subdirectory in `/images/` matching the content location
   - Example: `/images/use-cases/kubernetes-health-monitoring/`
2. Place all related images in this directory
3. Update image references in MDX if renaming

#### MDX Image Syntax

Use the `<Frame>` component for consistent styling and responsiveness:

```mdx
<Frame>
  <img src="/images/use-cases/example/01-image-name.jpg" alt="Descriptive alt text for accessibility" />
</Frame>
<p style={{textAlign: 'center', fontSize: '0.9em', color: '#666', marginTop: '8px'}}>Visible caption text</p>
```

**Components explained:**
- `<Frame>`: Mintlify wrapper for proper image rendering
- `src`: Absolute path starting with `/images/`
- `alt`: Accessibility text (not visible but required)
- `<p>`: Visible caption below image (optional but recommended)
  - Centered alignment: `textAlign: 'center'`
  - Small font: `fontSize: '0.9em'`
  - Subtle color: `color: '#666'`
  - Spacing above: `marginTop: '8px'` (prevents overlap)

#### Alt Text Guidelines

- Descriptive: Explains what the image shows in plain language
- Action-oriented: Includes UI elements or actions being demonstrated
- Length: 3-15 words typically
- Examples:
  - "AWS cost dashboard with spending trends and cost drivers"
  - "Pod resource utilization analysis showing CPU and memory usage patterns"
  - "Security code review creating Jira ticket with vulnerability details"

#### Complete Example

```mdx
### Step 1: Analyze Resources

```
@alex #dashboard
Generate a comprehensive AWS cost dashboard
```

<Frame>
  <img src="/images/use-cases/dashboards/01-aws-cost-dashboard.jpg" alt="AWS cost dashboard with spending trends and cost drivers" />
</Frame>
<p style={{textAlign: 'center', fontSize: '0.9em', color: '#666', marginTop: '8px'}}>AWS cost dashboard with spending trends and cost drivers</p>

The dashboard shows your current spending patterns...
```

#### Batch Image Updates

When updating multiple image references:

1. Rename files with descriptive names (preserving numeric prefix)
2. Update all MDX files using those images:
   ```bash
   # Example: Find all references to old filenames
   grep -r "/images/old-pattern" guide/use-cases/
   ```
3. Replace each reference with `<Frame>` component + visible caption
4. Test with `mintlify dev` to verify rendering

@./docs-writing-workflow.md
