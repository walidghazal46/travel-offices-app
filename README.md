# Travel Offices App

## Goal
Any code change should flow like this:

1. Local change
2. Git add + commit + push
3. GitHub gets latest code
4. Website auto deploy runs from GitHub Actions
5. Android Studio uses same Git repo (pull latest on open, push after edits)

## One-Time Setup

### 1) GitHub repo is the source of truth
Run these once to verify your remote:

1. `git remote -v`
2. `git branch --show-current`

Make sure your working branch is main and tracks origin/main.

### 2) Auto deploy on push
Auto deploy is configured using GitHub Actions workflow:

- [Auto deploy workflow](.github/workflows/auto-deploy.yml)

What it does:

1. Trigger on push to main
2. Install dependencies
3. Build production files
4. Publish dist to gh-pages branch

### 3) Android Studio Git integration
In Android Studio:

1. Open project from the same repository folder.
2. Ensure Version Control is Git:
	- Settings > Version Control > Git
3. Enable auto fetch in background:
	- Settings > Version Control > Git > Fetch in background
4. On opening project, do Pull.
5. After edits, do Commit then Push.

## Daily Flow (ON_CHANGE)

Use this every time you change code:

1. `git add -A`
2. `git commit -m "your message"`
3. `git push origin main`

After push:

1. GitHub is updated immediately.
2. Website deploy starts automatically from Actions.
3. Android Studio sees latest changes on next Pull.

## Result

Change -> Commit -> Push -> Auto Deploy -> Reflected on:

1. GitHub
2. Website
3. Android Studio project (after pull)
