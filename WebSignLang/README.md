# Sign Language Translator WebApp

A basic Next.js web app for sign language translation. 

## Features
- Home screen with a Try Out button
- Try Out page opens your webcam

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```
2. Run the development server:
   ```
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to GitHub Pages

To build and export your site for GitHub Pages:

1. From the `Web` folder, run:
   ```
   npm install
   npm run export
   ```
2. Commit and push the generated `docs/` folder to your repository.
3. In your repository settings on GitHub, set GitHub Pages to serve from the `docs/` folder.

Your site will be available at:
`https://aidanvb5.github.io/Gebarentaal_vertaler.github.io/`



UPDATING GITHUB PAGES
1. Clean and Rebuild the Static Export
PowerShell commands:

Remove-Item -Recurse -Force docs/*
cd WebSignLang
npm run build
npx next export
cd ..


2. Add .nojekyll File
PowerShell command:

New-Item -Path docs\.nojekyll -ItemType File

(Or, if created by the assistant: the file was created empty in the docs folder.)

3. Stage, Commit, and Push All Static Files
PowerShell commands:

git add docs
git add docs/_next/static -A
git add docs/.nojekyll
git commit -m "Add .nojekyll and ensure all static files are tracked for GitHub Pages"
git push

(You may have also used: git commit -m "Fix static export for GitHub Pages (clean rebuild)"

4. Wait for GitHub Pages to Update
No command needed—just wait a few minutes for the changes to go live.

Summary of commit messages you used:

"Fix static export for GitHub Pages (clean rebuild)"
"Add .nojekyll and ensure all static files are tracked for GitHub Pages"