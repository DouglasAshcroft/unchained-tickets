#!/bin/bash

###############################################################################
# Git Cleanup Script - Remove Markdown Files and Scripts from Git Tracking
###############################################################################
#
# PURPOSE: Remove all .md files (except project README.md) and the entire
#          /scripts/ directory from git tracking to prevent secret leaks.
#
# CRITICAL SECURITY ISSUE:
# - Hardcoded testnet private key found in scripts/generate-mainnet-wallet.mjs:157
# - Multiple private keys leaked in markdown documentation files
#
# WHAT THIS SCRIPT DOES:
# 1. Removes ALL .md files from git tracking (except /README.md)
# 2. Removes ENTIRE /scripts/ directory from git tracking
# 3. Keeps all files locally (only removes from git index)
# 4. Asks for confirmation before making changes
#
# USAGE:
#   chmod +x git-cleanup-secrets.sh
#   ./git-cleanup-secrets.sh
#
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  🚨 CRITICAL SECURITY CLEANUP - Git File Removal Script 🚨        ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This script will remove files from git tracking!${NC}"
echo -e "${YELLOW}⚠️  Files will remain on your local filesystem.${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository!${NC}"
    exit 1
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PART 1: Markdown Files to Remove (Except /README.md)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Get all tracked .md files except /README.md
MD_FILES=$(git ls-files "*.md" | grep -v "^README.md$" || true)

if [ -z "$MD_FILES" ]; then
    echo -e "${GREEN}✓ No markdown files to remove (except README.md)${NC}"
    MD_COUNT=0
else
    MD_COUNT=$(echo "$MD_FILES" | wc -l)
    echo -e "${YELLOW}Found ${MD_COUNT} markdown files to remove:${NC}"
    echo ""
    echo "$MD_FILES" | while read -r file; do
        # Check if file contains potential secrets
        if [ -f "$file" ]; then
            if grep -qE "0x[0-9a-fA-F]{64}|PRIVATE_KEY.*=.*0x" "$file" 2>/dev/null; then
                echo -e "  ${RED}🔴 $file (CONTAINS POTENTIAL SECRET!)${NC}"
            else
                echo -e "  - $file"
            fi
        else
            echo -e "  - $file (deleted/missing)"
        fi
    done
    echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 PART 2: Scripts Directory${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Get all tracked files in scripts/
SCRIPT_FILES=$(git ls-files "scripts/" || true)

if [ -z "$SCRIPT_FILES" ]; then
    echo -e "${GREEN}✓ No script files to remove${NC}"
    SCRIPT_COUNT=0
else
    SCRIPT_COUNT=$(echo "$SCRIPT_FILES" | wc -l)
    echo -e "${YELLOW}Found ${SCRIPT_COUNT} script files to remove:${NC}"
    echo ""
    echo "$SCRIPT_FILES" | while read -r file; do
        # Highlight the file with known hardcoded secret
        if [ "$file" = "scripts/generate-mainnet-wallet.mjs" ]; then
            echo -e "  ${RED}🔴 $file (CONTAINS HARDCODED PRIVATE KEY!)${NC}"
        else
            echo -e "  - $file"
        fi
    done
    echo ""
fi

# Calculate total files
TOTAL_FILES=$((MD_COUNT + SCRIPT_COUNT))

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Markdown files:    ${MD_COUNT}"
echo -e "  Script files:      ${SCRIPT_COUNT}"
echo -e "  ─────────────────────────"
echo -e "  Total to remove:   ${YELLOW}${TOTAL_FILES}${NC}"
echo ""
echo -e "${GREEN}✓ Keeping: /README.md${NC}"
echo ""

if [ "$TOTAL_FILES" -eq 0 ]; then
    echo -e "${GREEN}✓ Nothing to remove! All files are already untracked.${NC}"
    exit 0
fi

# Ask for confirmation
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  CONFIRMATION REQUIRED${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "This will execute: ${BLUE}git rm --cached${NC} on ${YELLOW}${TOTAL_FILES}${NC} files"
echo -e ""
echo -e "Files will ${GREEN}remain on your filesystem${NC} but be ${RED}removed from git tracking${NC}."
echo -e "After running this script, you'll need to:"
echo -e "  1. Update .gitignore (if not already done)"
echo -e "  2. Commit the changes"
echo -e "  3. Force push to clean GitHub history: ${BLUE}git push --force origin main${NC}"
echo ""
read -p "Do you want to proceed? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}❌ Aborted by user${NC}"
    exit 1
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 EXECUTING CLEANUP...${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Remove markdown files
if [ -n "$MD_FILES" ]; then
    echo -e "${BLUE}📝 Removing markdown files from git...${NC}"
    echo "$MD_FILES" | xargs -I {} git rm --cached "{}" 2>/dev/null || true
    echo -e "${GREEN}✓ Removed ${MD_COUNT} markdown files from git tracking${NC}"
    echo ""
fi

# Remove scripts directory
if [ -n "$SCRIPT_FILES" ]; then
    echo -e "${BLUE}📜 Removing scripts directory from git...${NC}"
    git rm --cached -r scripts/ 2>/dev/null || true
    echo -e "${GREEN}✓ Removed ${SCRIPT_COUNT} script files from git tracking${NC}"
    echo ""
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ CLEANUP COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo -e "1. Verify .gitignore is updated with:"
echo -e "   ${YELLOW}**/*.md${NC}"
echo -e "   ${YELLOW}!README.md${NC}"
echo -e "   ${YELLOW}/scripts/${NC}"
echo ""
echo -e "2. Check git status:"
echo -e "   ${BLUE}git status${NC}"
echo ""
echo -e "3. Commit the changes:"
echo -e "   ${BLUE}git commit -m \"security: remove markdown and scripts from tracking"
echo -e ""
echo -e "   Removed files containing leaked private keys and secrets."
echo -e "   Files remain locally but are now gitignored."
echo -e ""
echo -e "   I WILL NOT COMMIT PRIVATE KEYS OR SECRETS TO GITHUB!"
echo -e ""
echo -e "   🤖 Generated with [Claude Code](https://claude.com/claude-code)"
echo -e ""
echo -e "   Co-Authored-By: Claude <noreply@anthropic.com>\"${NC}"
echo ""
echo -e "4. Force push to clean history (⚠️  DANGER - only if repo is yours!):"
echo -e "   ${RED}git push --force origin main${NC}"
echo ""
echo -e "${YELLOW}⚠️  Remember: Force pushing rewrites git history!${NC}"
echo -e "${YELLOW}⚠️  Only do this if you're the sole contributor or have coordinated with your team.${NC}"
echo ""
