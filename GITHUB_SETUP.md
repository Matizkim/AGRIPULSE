# GitHub Setup Guide - AgriPulse


### Step 1: Initialize Git (if not already done)

### Step 2: Create/Update .gitignore

Ensure you have a `.gitignore` file in the root directory. It should include:

# Build outputs
dist/
build/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
.cache/
```

### Step 3: Add Remote Repository

```bash
# Add your GitHub repository as remote origin

# If remote already exists, update it:

# Verify remote is set correctly
git remote -v
```

### Step 4: Stage All Files

```bash
# Add all files to staging
git add .

```

### Step 5: Commit Changes

```bash
# Create a commit with a descriptive message
```

### Step 6: Push to GitHub

#### First Time Push (if repository is empty)

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

#### If Repository Already Has Content

```bash
# Pull existing content first (if any)
git pull origin main --allow-unrelated-histories

# Resolve any conflicts if they occur, then:
git add .
git commit -m "Merge with remote repository"

# Push your changes
git push -u origin main
```

### Step 7: Verify Upload

1. Go to your github repository
2. Verify all files are uploaded correctly
3. Check that README files are displaying properly

## Troubleshooting

### Authentication Issues

If you get authentication errors:

**Option 1: Use Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` permissions
3. Use token as password when prompted

**Option 2: Use SSH**
```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add SSH key to GitHub (Settings → SSH and GPG keys)
# Then change remote URL:
git remote set-url origin git@github.com:your repo
```

### Large Files Issue

If you have large files that shouldn't be committed:

```bash
# Remove from git cache (but keep local file)
git rm --cached large-file.zip

# Add to .gitignore
echo "large-file.zip" >> .gitignore

# Commit the change
git add .gitignore
git commit -m "Remove large files from tracking"
```

### Merge Conflicts

If you have merge conflicts:

```bash
# Pull latest changes
git pull origin main

# Resolve conflicts in your editor
# Then:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

## Future Updates

For future updates to your code:

```bash
# 1. Check status
git status

# 2. Add changes
git add .

# 3. Commit
git commit -m "Description of changes"

# 4. Push
git push origin main
```

## Branching Strategy (Optional)

For better code management:

```bash
# Create a new branch for features
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch to GitHub
git push origin feature/new-feature

# Merge to main (via GitHub Pull Request or locally)
git checkout main
git merge feature/new-feature
git push origin main
```


## Quick Reference Commands

```bash
# Check status
git status

# View changes
git diff

# View commit history
git log

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- .

# Update from remote
git pull origin main
```

---

**Need Help?** Open an issue on GitHub or check Git documentation.

