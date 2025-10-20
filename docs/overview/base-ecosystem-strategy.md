# Base Ecosystem Strategy Guide

**Last Updated:** January 2025
**Purpose:** Ensure Unchained Tickets aligns with Base's best practices for featured apps

---

## Overview

This document outlines Base's recommended approach for wallet integration and ecosystem alignment to maximize our chances of being featured as a Base app.

---

## Wallet Integration Strategy

### Base's Philosophy

> "Use 'Log In' rather than 'Connect Wallet' to make onchain experiences more user-friendly"

Base emphasizes making crypto feel like web2 - seamless, fast, and accessible.

---

## The `baseAccount` Connector

### What It Is

`baseAccount` is Wagmi's connector for Coinbase Smart Wallet and EOA integration. It's the **recommended connector** for Base ecosystem apps.

```typescript
import { baseAccount } from 'wagmi/connectors'

const connector = baseAccount({
  appName: 'Unchained Tickets',
  appLogoUrl: 'https://yourapp.com/logo.png'
})
```

### Why Base Recommends It

1. **Smart Wallet First** - No app/extension install required
2. **Gasless Transactions** - Can sponsor user gas fees
3. **Cross-Platform** - Works on mobile and desktop
4. **Base Native** - Optimized for Base network

---

## Wallet Preferences

### Configuration Options

OnchainKit supports three wallet preference modes:

| Preference | What Users See | Best For |
|-----------|---------------|----------|
| `'all'` **(RECOMMENDED)** | Smart Wallet + EOA options | Maximum compatibility while favoring Smart Wallet |
| `'smartWalletOnly'` | Only Smart Wallet | Apps that want to force gasless UX |
| `'eoaOnly'` | Only EOA wallets | Legacy apps or specific use cases |

### Our Configuration

```typescript
config={{
  wallet: {
    preference: 'all', // ✅ Recommended by Base
    display: 'modal',  // Better UX
  }
}}
```

**Rationale:**
- Prioritizes Smart Wallet (featured, no extension needed)
- Supports power users with existing EOA wallets
- Maximizes user base without sacrificing Base ecosystem alignment

---

## What `preference: 'all'` Does

When a user clicks "Connect Wallet":

### Desktop (No Extension)
1. **Primary Option**: Create/Login with Coinbase Smart Wallet
2. **Secondary Option**: Connect with Coinbase Wallet mobile app (QR code)

### Desktop (With Coinbase Extension)
- **Direct**: Opens Coinbase Wallet Extension immediately
- **Seamless**: No modal, just extension popup

### Desktop (With MetaMask or Other Injected Wallet)
1. **Primary**: Coinbase Smart Wallet
2. **Secondary**: Coinbase Wallet mobile
3. **Fallback**: Other detected wallets (MetaMask, Brave, etc.)

**Key Point:** Smart Wallet is ALWAYS the primary/recommended option.

---

## Smart Wallet vs EOA

### Coinbase Smart Wallet (Recommended)

**Advantages:**
- ✅ No app/extension installation required
- ✅ Gasless transactions (can be sponsored)
- ✅ Simple onboarding (email/social)
- ✅ Works on mobile and desktop browsers
- ✅ Built on ERC-4337 Account Abstraction
- ✅ Best for Base network (low gas costs)

**When to Use:**
- New crypto users
- Mobile-first experiences
- Apps wanting to sponsor gas
- Base-native applications

### EOA (Externally Owned Account)

**Examples:** MetaMask, Coinbase Wallet Extension, Rainbow

**Advantages:**
- ✅ Full custody and control
- ✅ Works across all chains/dapps
- ✅ Preferred by power users/crypto natives
- ✅ Self-custodial

**When to Use:**
- Power users who already have wallets
- Multi-chain applications
- Users who prefer full custody

---

## Featured App Requirements

### Checklist for Base Featured Apps

- [x] **Use OnchainKit** - Official toolkit for Base apps
- [x] **Support Smart Wallet** - Primary wallet option
- [x] **Allow EOA wallets** - Don't lock out existing users
- [x] **Use `baseAccount` connector** - Base's recommended connector
- [x] **Optimize for Base network** - Low gas, fast transactions
- [ ] **Deploy on Base mainnet** - Currently on testnet
- [x] **Use "Login" terminology** - More user-friendly than "Connect"
- [x] **Mobile responsive** - Works on all devices
- [x] **OnchainKit API Key** - Configured in production
- [ ] **Feature Basenames** - Show ENS-like names (future enhancement)

### Additional Recommendations

1. **Gas Sponsorship** - Consider sponsoring user transactions (Paymasters)
2. **Coinbase Commerce** - Accept USDC payments natively
3. **Identity Components** - Use OnchainKit's Avatar and Name components
4. **Base Branding** - Highlight "Built on Base" in marketing
5. **Community Engagement** - Active in Base Discord/forums

---

## OnchainKit Configuration Reference

### Our Current Setup

```typescript
// app/rootProvider.tsx
<OnchainKitProvider
  apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
  chain={base} // Base mainnet (8453)
  config={{
    appearance: {
      mode: "dark",
    },
    wallet: {
      preference: 'all', // Smart Wallet + EOA
      display: 'modal',  // Modal UX
    },
  }}
>
```

### Available Wallet Options

```typescript
wallet?: {
  /** Wallet preference */
  preference?: 'all' | 'smartWalletOnly' | 'eoaOnly';

  /** Display mode */
  display?: 'modal' | null;

  /** Terms of service URL */
  termsUrl?: string | null;

  /** Privacy policy URL */
  privacyUrl?: string | null;

  /** Additional supported wallets */
  supportedWallets?: {
    rabby?: boolean;
    trust?: boolean;
    frame?: boolean;
  };
}
```

---

## Multi-Wallet Support (Optional)

### Should We Support Non-Coinbase Wallets?

**Base's Stance:** Not required, but not discouraged.

**Our Decision:** `preference: 'all'` naturally includes:
- ✅ Coinbase Smart Wallet (primary)
- ✅ Coinbase Wallet Extension/Mobile (secondary)
- ✅ Other injected wallets (automatic fallback)

**Rationale:**
- Doesn't require additional code
- Maximizes compatibility
- Still prioritizes Coinbase/Base ecosystem
- Won't disqualify us from being featured

**Alternative:** If we want to be **exclusively Coinbase**, we could:
- Use `preference: 'smartWalletOnly'` - Forces Smart Wallet only
- Or only support Coinbase wallets explicitly

---

## Testing Wallet Integration

### Test Cases

1. **Desktop (No Extension)**
   - [ ] Opens modal with Smart Wallet option
   - [ ] Can create new Smart Wallet
   - [ ] Can login with existing Smart Wallet
   - [ ] Shows QR code for mobile wallet

2. **Desktop (Coinbase Extension Installed)**
   - [ ] Opens Coinbase Wallet Extension directly
   - [ ] No modal shown (direct connection)

3. **Desktop (MetaMask Installed)**
   - [ ] Shows Coinbase Smart Wallet as primary
   - [ ] Shows MetaMask as alternative option

4. **Mobile (Coinbase Wallet App)**
   - [ ] Opens Coinbase Wallet app via deep link
   - [ ] Seamless connection experience

---

## Common Issues & Solutions

### Issue: Only Seeing "Sign in with Base Account"

**Cause:** Using `preference: 'smartWalletOnly'` or misconfigured

**Solution:** Set `preference: 'all'` in OnchainKitProvider config

### Issue: Can't Connect with MetaMask

**Cause:** `preference: 'smartWalletOnly'` blocks non-Coinbase wallets

**Solution:**
- Use `preference: 'all'` to allow all wallets
- Or explicitly add MetaMask connector (advanced)

### Issue: Wallet Modal Not Appearing

**Cause:** Missing `display: 'modal'` config

**Solution:** Add `display: 'modal'` to wallet config

### Issue: Wallet Connection Spinning / "Failed to Fetch" Error

**Cause:** OnchainKit's auto-generated config uses public RPC (rate-limited)

**Solution:** Create custom Wagmi config with authenticated RPC

**Why This Happens:**
- OnchainKit's `createWagmiConfig` uses Base's public RPC by default
- Public RPC endpoints are heavily rate-limited
- Results in connection timeouts and "Failed to fetch" errors
- MetaMask and other wallets fail to connect

**How We Fixed It:**

1. **Created `/app/wagmi.config.ts`**
   - Custom `createConfig` from wagmi
   - Uses authenticated Coinbase RPC from `.env`
   - Properly configured connectors (`baseAccount` + `injected`)

2. **Updated `/app/rootProvider.tsx`**
   - Wrapped OnchainKit with `WagmiProvider`
   - Passed custom config to WagmiProvider
   - Removed duplicate QueryClient (uses app/providers.tsx one)

3. **Key Configuration:**
   ```typescript
   // wagmi.config.ts
   transports: {
     [primaryChain.id]: http(
       process.env.NEXT_PUBLIC_BASE_RPC_URL, // Your authenticated RPC
       {
         retryCount: 3,
         timeout: 20_000,
       }
     ),
   }
   ```

**Result:** Wallet connections now work reliably with no spinning/timeouts

---

## Resources

### Official Documentation

- **Base Docs**: https://docs.base.org
- **OnchainKit**: https://docs.base.org/builderkits/onchainkit
- **Base Account (Wagmi)**: https://docs.base.org/base-account/framework-integrations/wagmi/setup
- **Smart Wallet Guide**: https://help.coinbase.com/en/wallet/getting-started/smart-wallet

### Key Links

- **Base Discord**: https://discord.gg/base
- **OnchainKit GitHub**: https://github.com/coinbase/onchainkit
- **Wagmi Docs**: https://wagmi.sh
- **Base Blog**: https://blog.base.dev

---

## Migration Checklist

### From Current State to Production

- [x] Configure OnchainKit with correct wallet preferences
- [x] Support both Smart Wallet and EOA
- [ ] Deploy smart contract to Base mainnet
- [ ] Switch from testnet to mainnet in `.env`
- [ ] Test wallet connections on production
- [ ] Apply for Base featured app program
- [ ] Submit to Base ecosystem directory
- [ ] Engage with Base community

---

## Summary

**For Maximum Base Alignment:**

1. ✅ Use `baseAccount` connector (via OnchainKit)
2. ✅ Set `preference: 'all'` (Smart Wallet + EOA)
3. ✅ Use `display: 'modal'` for better UX
4. ✅ Deploy on Base mainnet
5. ✅ Feature Smart Wallet prominently
6. ✅ Use "Login" not "Connect Wallet"
7. ✅ Request Base featured app status

**Current Status:** ✅ Wallet configuration aligned with Base strategy

**Next Steps:** Deploy to Base mainnet and apply for featured app program

---

**Questions?** Check Base Discord or review this document before making changes to wallet integration.
