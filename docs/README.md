# VitalMatrix Documentation

This directory contains the Mintlify documentation for the VitalMatrix project.

## Local Development

To preview the documentation locally:

1. Install dependencies:
```bash
npm install
```

2. Start the documentation server:
```bash
npm run dev
```

3. Open your browser at `http://localhost:3000` to see the documentation.

## Structure

- `mint.json`: Configuration for the Mintlify documentation
- `introduction.mdx`: Main landing page
- `quickstart.mdx`: Getting started guide
- `/features`: Feature-specific documentation
- `/technical`: Technical documentation on architecture and styling

## Adding New Documentation

1. Create a new `.mdx` file in the appropriate directory
2. Add the page to the navigation in `mint.json`
3. Link to the new page from relevant existing pages

## Publishing

The documentation is automatically published when changes are pushed to the main branch.
