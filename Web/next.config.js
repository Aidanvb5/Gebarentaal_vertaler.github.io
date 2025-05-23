// next.config.js for static export to 'docs' for GitHub Pages
const isGithubPages = process.env.GITHUB_PAGES === 'true';

module.exports = {
  output: 'export',
  distDir: 'docs',
  basePath: isGithubPages ? '/Gebarentaal_vertaler.github.io' : '',
  assetPrefix: isGithubPages ? '/Gebarentaal_vertaler.github.io/' : '',
};
