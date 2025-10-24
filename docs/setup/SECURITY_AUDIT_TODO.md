# Security Audit TODO

## Critical Issue Discovered

**Date:** October 24, 2025
**Severity:** HIGH
**Status:** IN PROGRESS

### What Happened

During AI-assisted development, sensitive wallet credentials were accidentally committed to documentation:
- Private key and mnemonic phrase in `docs/deployment/MAINNET_DEPLOYMENT.md`
- Wallet immediately burned and funds recovered ✅
- Unknown if other docs contain sensitive data ⚠️

### Current Status

**Actions Taken:**
- ✅ Funds recovered from compromised wallet
- ✅ Wallet burned (never use again)
- ✅ ALL docs hidden except `/docs/setup/` and `/docs/README.md`
- ⚠️ Docs still exist in git history (PUBLIC REPO)

**Remaining Tasks:**
- [ ] Generate new mainnet wallet (done privately)
- [ ] Audit all 87 doc files for sensitive data
- [ ] Remove any sensitive content
- [ ] Decide on git history cleanup strategy
- [ ] Re-enable docs selectively after verification

### Audit Process

Run these commands to search for sensitive data:

```bash
# 1. Search for private keys
grep -r "0x[0-9a-fA-F]\{64\}" docs/

# 2. Search for mnemonics
grep -ri "mnemonic\|seed phrase\|recovery phrase" docs/

# 3. Search for API keys
grep -ri "api.key\|secret\|token" docs/ | grep -v "your_.*_here"

# 4. Search for wallet addresses
grep -r "0x[0-9a-fA-F]\{40\}" docs/

# 5. Search for emails
grep -rE "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-Z]{2,}" docs/

# 6. Search for database URLs
grep -ri "postgres://\|mysql://" docs/
```

### Files to Audit (Priority Order)

**HIGH RISK:**
- `docs/deployment/` - All files (deployment instructions)
- `docs/operations/` - All files (production config)
- `docs/internal/` - All files (internal processes)

**MEDIUM RISK:**
- `docs/product/` - May contain internal planning
- `docs/engineering/` - May contain architecture details
- `docs/overview/` - May contain sensitive status info

**LOW RISK:**
- `docs/features/` - Feature descriptions (probably safe)
- `docs/release-notes/` - Release notes (probably safe)

### Prevention Measures

**Immediate:**
1. Never commit real credentials to docs
2. Use placeholders: `YOUR_VALUE_HERE`, `0xYOUR_ADDRESS`, etc.
3. Store secrets only in password manager + Vercel

**Long-term:**
1. Install pre-commit hook to scan for secrets
2. Separate repo for internal docs
3. Document templates with clear placeholders
4. Regular security audits

### Owner

@DougAJ

### Deadline

BEFORE mainnet contract deployment
