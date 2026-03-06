#!/bin/sh
#
# Setup script to install Git hooks
# Run this after cloning the repository
#

echo "🔧 Installing Git hooks..."

# Copy hooks to .git/hooks/
cp scripts/git-hooks/pre-commit .git/hooks/pre-commit
cp scripts/git-hooks/pre-commit-fast .git/hooks/pre-commit-fast

# Make them executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit-fast

echo "✅ Git hooks installed successfully!"
echo ""
echo "Available hooks:"
echo "  - pre-commit (full checks: format, lint, type, test)"
echo "  - pre-commit-fast (format check only)"
echo ""
echo "To switch to fast mode:"
echo "  cp .git/hooks/pre-commit-fast .git/hooks/pre-commit"
