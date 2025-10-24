# Claude AI Documentation Fixes TODO

## Critical Errors Made by AI Assistant

**Date:** October 24, 2025
**Issue:** AI assistant (Claude Code) created incorrect documentation with wrong assumptions

---

## 🚨 Priority 1: Security Issues

### 1. Leaked Mainnet Wallet Credentials
- **File:** `docs/deployment/MAINNET_DEPLOYMENT.md` (now hidden)
- **Issue:** Committed private key and mnemonic phrase to public repo
- **Status:** ✅ Wallet burned, funds recovered
- **Action:** ✅ File removed from tracking, docs hidden pending audit

---

## 📝 Priority 2: Incorrect Technical Documentation

### 2. Wrong Access Control Assumptions
- **Files Affected:**
  - `docs/deployment/MAINNET_DEPLOYMENT.md`
  - `docs/deployment/VERCEL_ENV_SETUP.md`
  - Multiple deployment scripts documentation

- **Issue:** AI incorrectly assumed contract uses AccessControl with MINTER_ROLE
  - Documented granting `MINTER_ROLE` to minting wallet
  - Provided Hardhat console commands for `grantRole()`
  - Created wallet separation strategy based on roles

- **Reality:** Contract uses `Ownable`, not `AccessControl`
  - Only contract owner can mint (via `onlyOwner` modifier)
  - No roles exist in the contract
  - Contract: `contracts/UnchainedTickets.sol:23` - `contract UnchainedTickets is ERC1155, Ownable, ...`
  - Minting function: `contracts/UnchainedTickets.sol:202` - `function mintTicketWithTier(...) external onlyOwner`

- **Correct Approach:**
  - Contract owner (deployer wallet) IS the minting wallet
  - No separate role-granting step needed
  - Single wallet handles deployment and minting

### 3. Wallet Confusion
- **Issue:** AI confused testnet wallet (`0x5B33...ECd9`) with mainnet deployer wallet (`0x12E9...0655`)
- **Impact:** Provided incorrect wallet addresses in instructions
- **Correct Info:**
  - Testnet wallet: `0x5B33aA418a6d455AADc391841788e8F72Df5ECd9`
  - Mainnet deployer/owner: `0x12E9b03e7E982f7385b8C7D26B0DA6905D610655`
  - Contract: `0xB6600348cc80619D606D4b83B0366ce5112D8aA2`
  - Verified: https://basescan.org/address/0xB6600348cc80619D606D4b83B0366ce5112D8aA2#code

---

## 📋 Documentation Files That Need Correction

### Files Currently Hidden (Need Review & Fix):
1. `docs/deployment/MAINNET_DEPLOYMENT.md`
   - [ ] Remove leaked credentials
   - [ ] Fix AccessControl → Ownable documentation
   - [ ] Correct wallet deployment instructions
   - [ ] Remove MINTER_ROLE granting steps
   - [ ] Update with correct owner-based access control

2. `docs/deployment/VERCEL_ENV_SETUP.md`
   - [ ] Fix minting wallet configuration section
   - [ ] Remove references to MINTER_ROLE
   - [ ] Clarify that deployer = minting wallet
   - [ ] Update troubleshooting for Ownable contracts

3. All deployment guides referencing roles
   - [ ] Search docs for "MINTER_ROLE" and "grantRole"
   - [ ] Replace with correct Ownable-based instructions
   - [ ] Update Hardhat console examples

---

## 🔧 Correct Technical Information

### Contract Access Control:
```solidity
// What the contract actually is:
contract UnchainedTickets is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply, ERC2981

// Minting function:
function mintTicketWithTier(...) external onlyOwner returns (uint256)
```

### Correct Deployment Flow:
1. Deploy contract with deployer wallet
2. Deployer becomes owner automatically
3. Owner can mint tickets (no role-granting needed)
4. Add deployer private key to Vercel as `MINTING_PRIVATE_KEY`

### Correct Vercel Configuration:
```bash
# Production - Mainnet
MINTING_PRIVATE_KEY=<deployer_wallet_private_key>
MINTING_WALLET_ADDRESS=0x12E9b03e7E982f7385b8C7D26B0DA6905D610655
NFT_CONTRACT_ADDRESS=0xB6600348cc80619D606D4b83B0366ce5112D8aA2

# Preview/Dev - Testnet
MINTING_PRIVATE_KEY=0xc2d4c6b6adfdeba5a4a8c73d8e908aa0fdcd3da03f4ac0cde264064aeac2f068
MINTING_WALLET_ADDRESS=0x5B33aA418a6d455AADc391841788e8F72Df5ECd9
NFT_CONTRACT_ADDRESS=0xeDAE8268830E998Ff359Fdd62CE33E3131731Aa3
```

---

## 🎯 Action Items

### Immediate:
- [x] Acknowledge mistakes to user (sassypants deserved! 😅)
- [x] Create this TODO document
- [ ] User configures Vercel correctly with deployer wallet
- [ ] User tests minting in production

### Before Making Docs Public Again:
- [ ] Review ALL deployment docs for AccessControl references
- [ ] Replace with correct Ownable-based instructions
- [ ] Remove all role-granting steps
- [ ] Test instructions with fresh deployment
- [ ] Have user review corrected docs

### Long-term:
- [ ] Consider if contract SHOULD use AccessControl for better security
  - Separate deployer from minter
  - Enable multiple minters if needed
  - More granular permission control
- [ ] If changing to AccessControl, update contract and redeploy

---

## 📚 Lessons Learned

1. **Always verify contract source before documenting**
   - Don't assume access control mechanism
   - Read the actual Solidity code
   - Check inheritance chain

2. **Verify wallet addresses from blockchain explorer**
   - Don't rely on terminal output alone
   - Use BaseScan/Etherscan to confirm
   - Cross-reference multiple sources

3. **Test documentation steps before providing**
   - Try Hardhat console commands
   - Verify functions exist
   - Don't assume APIs work certain ways

---

## 🙏 Apology

Sorry for the confusion and incorrect documentation! The user (@DougAJ) was right to call this out. The documentation will be corrected before being made public again.

**Owner:** Claude AI (to fix) / @DougAJ (to review)
**Priority:** HIGH
**Status:** TODO

---

*Note: This file exists to track AI-generated documentation errors and prevent them from causing issues in the future.*
