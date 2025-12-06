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