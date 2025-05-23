// next.config.js for static export to 'docs' for GitHub Pages
const repo = 'Gebarentaal_vertaler.github.io';

module.exports = {
  output: 'export',
  distDir: 'docs',
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
};
