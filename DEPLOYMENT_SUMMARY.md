# 🚀 Unchained Tickets - Complete Deployment Guide

**Quick reference for all deployment phases and resources**

---

## 📚 Documentation Index

### Phase 1 & 2: Development & Smart Contract
- **[TESTING_MINTING_FLOW.md](TESTING_MINTING_FLOW.md)** - Test NFT minting on Base Sepolia testnet
- **[MAINNET_DEPLOYMENT.md](MAINNET_DEPLOYMENT.md)** - Deploy contract to Base mainnet
- **[scripts/initialize-production-contract.ts](scripts/initialize-production-contract.ts)** - Initialize contract with events

### Phase 3: Production Deployment
- **[PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)** - Full Vercel deployment guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Quick checklist for all phases
- **[.env.production.example](.env.production.example)** - Environment variables template
- **[vercel.json](vercel.json)** - Vercel configuration

### Development
- **[DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md)** - Coding standards (if exists)
- **[MVP_Deployment.md](MVP_Deployment.md)** - Complete MVP roadmap

---

## 🎯 Quick Start Paths

### Path 1: Test Locally (Development)
```bash
# 1. Start database
npm run start:db

# 2. Run migrations
npx prisma migrate dev

# 3. Seed data
npx prisma db seed

# 4. Start dev server
npm run dev
```

**Then follow**: [TESTING_MINTING_FLOW.md](TESTING_MINTING_FLOW.md)

---

### Path 2: Deploy to Base Mainnet
```bash
# 1. Fund production wallet with ETH

# 2. Update .env with production values

# 3. Deploy contract
npx hardhat run scripts/deploy.cjs --network baseMainnet

# 4. Verify contract
npx hardhat verify --network baseMainnet <ADDRESS> "https://your-domain.com/api/metadata/"

# 5. Initialize contract
npx tsx scripts/initialize-production-contract.ts
```

**Full guide**: [MAINNET_DEPLOYMENT.md](MAINNET_DEPLOYMENT.md)

---

### Path 3: Deploy to Vercel (Production)
```bash
# 1. Set up database (Vercel Postgres or Supabase)

# 2. Configure environment variables in Vercel dashboard

# 3. Deploy
vercel --prod

# Or push to GitHub for auto-deploy
git push origin main
```

**Full guide**: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

---

## 🔑 Environment Variables Checklist

Copy [.env.production.example](.env.production.example) and fill in:

### Critical (Required)
- [ ] `DATABASE_URL` - Production database connection
- [ ] `NFT_CONTRACT_ADDRESS` - Mainnet contract address
- [ ] `MINTING_WALLET_PRIVATE_KEY` - ⚠️ Keep secure!
- [ ] `JWT_SECRET` - 64-char hex string
- [ ] `COINBASE_COMMERCE_API_KEY` - Production API key
- [ ] `COINBASE_WEBHOOK_SECRET` - From Coinbase dashboard
- [ ] `NEXT_PUBLIC_APP_URL` - Your production domain

### Important
- [ ] `NEXT_PUBLIC_BASE_RPC_URL` - Coinbase Node or public RPC
- [ ] `NEXT_PUBLIC_ONCHAINKIT_API_KEY` - OnchainKit API key
- [ ] `BASESCAN_API_KEY` - For contract verification
- [ ] `NEXT_PUBLIC_DEV_MODE=false` - Must be false!

### Optional but Recommended
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Error tracking
- [ ] `UNCHAINED_TREASURY_WALLET` - Royalty recipient

**Total**: 20+ environment variables

---

## 📊 Deployment Phases Overview

### Phase 1: Development ✅
**Status**: Complete
- [x] NFTMintingService implemented
- [x] TicketScanService implemented
- [x] Webhook handler integrated
- [x] Metadata API checks on-chain state
- [x] My Tickets page displays souvenirs
- [x] Build passing
- [x] Testing guide created

**Time**: 2-3 days

---

### Phase 2: Smart Contract Deployment 🎯
**Next Step**: Deploy to mainnet when ready

Tasks:
1. Fund production wallet (0.05 ETH minimum)
2. Deploy contract to Base mainnet
3. Verify on Basescan
4. Initialize events and tiers
5. Update environment variables

**Estimated Time**: 3-4 hours
**Estimated Cost**: $50-150 (one-time)

**Guide**: [MAINNET_DEPLOYMENT.md](MAINNET_DEPLOYMENT.md)

---

### Phase 3: Production Deployment 🎯
**Next Step**: After Phase 2

Tasks:
1. Set up production database (Vercel Postgres/Supabase)
2. Run migrations
3. Configure Vercel environment variables
4. Deploy to Vercel
5. Configure custom domain (optional)
6. Set up monitoring (Sentry)
7. Test end-to-end

**Estimated Time**: 4-6 hours
**Estimated Cost**: $0-20/month (database, depending on usage)

**Guide**: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

---

### Phase 4: Testing & Launch 📝
**After**: Phase 3 complete

Tasks:
1. End-to-end testing
2. Cross-browser testing
3. Performance optimization (Lighthouse)
4. Security review
5. Record demo video
6. Update README with screenshots
7. Submit to hackathon

**Estimated Time**: 2-3 days

**Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

## 🛠️ Useful Scripts

### Development
```bash
npm run dev              # Start dev server
npm run build            # Test production build
npm test                 # Run tests
npm run lint             # Lint code
```

### Database
```bash
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations (dev)
npx prisma migrate deploy # Run migrations (production)
npx prisma db seed       # Seed database
npx prisma studio        # Open database GUI
```

### Smart Contract
```bash
# Deploy
npx hardhat run scripts/deploy.cjs --network baseMainnet

# Verify
npx hardhat verify --network baseMainnet <ADDRESS> "<BASE_URI>"

# Initialize
npx tsx scripts/initialize-production-contract.ts

# Transform souvenirs
npx tsx scripts/transform-souvenirs.ts --eventId=5
```

### Deployment
```bash
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel logs              # View deployment logs
vercel env ls            # List environment variables
```

---

## 🔍 Health Checks & Testing

### Local Development
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/events
```

### Production
```bash
curl https://YOUR_DOMAIN.com/api/health
curl https://YOUR_DOMAIN.com/api/metadata/1000001
```

### Blockchain
```bash
# Check contract
cast call <CONTRACT_ADDRESS> "owner()(address)" --rpc-url https://mainnet.base.org

# Check wallet balance
cast balance <WALLET_ADDRESS> --rpc-url https://mainnet.base.org

# Check ticket state
cast call <CONTRACT_ADDRESS> "getTicketState(uint256)(uint8)" 1000001 --rpc-url https://mainnet.base.org
```

---

## 🚨 Troubleshooting

### Common Issues

**Build fails: "Cannot find module '@prisma/client'"**
```bash
# Add to vercel.json buildCommand:
"buildCommand": "npx prisma generate && next build"
```

**Minting fails: "Insufficient funds"**
```bash
# Check balance and fund wallet
cast balance $MINTING_WALLET_ADDRESS --rpc-url https://mainnet.base.org
```

**Webhook not working: "Invalid signature"**
- Verify `COINBASE_WEBHOOK_SECRET` in Vercel environment variables
- Check webhook URL in Coinbase Commerce dashboard
- Review Vercel function logs

**Environment variables not loading**
- Redeploy after adding new variables
- Check variable names (case-sensitive)
- Verify scope (Production/Preview/Development)

---

## 📈 Success Metrics

### Day 1 Targets
- [ ] 0 critical errors
- [ ] 100% minting success rate
- [ ] < 3s page load time
- [ ] 10+ test transactions

### Week 1 Targets
- [ ] 50+ tickets sold
- [ ] 95%+ uptime
- [ ] < 500ms API response time
- [ ] Positive user feedback

### Month 1 Targets
- [ ] 500+ tickets sold
- [ ] Multiple events completed
- [ ] Souvenir transformations working
- [ ] Secondary sales tracking

---

## 🔐 Security Checklist

### Pre-Deployment
- [ ] Private keys never committed to git
- [ ] `.env` files in `.gitignore`
- [ ] JWT_SECRET is 64+ characters
- [ ] Admin password is strong and unique
- [ ] All sensitive variables marked as "Sensitive" in Vercel

### Post-Deployment
- [ ] 2FA enabled on Vercel account
- [ ] 2FA enabled on GitHub account
- [ ] 2FA enabled on Coinbase Commerce
- [ ] Database connection uses SSL
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (if implemented)
- [ ] Error messages don't expose sensitive data

### Ongoing
- [ ] Rotate JWT_SECRET quarterly
- [ ] Monitor Sentry for security issues
- [ ] Keep dependencies updated
- [ ] Regular security audits
- [ ] Backup private keys securely

---

## 💰 Cost Estimates

### One-Time Costs
| Item | Cost |
|------|------|
| Domain name | $10-15/year |
| Contract deployment | $50-150 |
| Contract initialization (10 events) | $25-50 |
| **Total One-Time** | **$85-215** |

### Monthly Costs (Starting)
| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel Hosting | ✅ Free | $20/mo Pro |
| Database (Vercel) | 256MB free | $0.25/GB |
| Database (Supabase) | 500MB free | $25/mo |
| Sentry | 5k events/mo | $26/mo |
| **Total Monthly (Launch)** | **$0-10** | Free tiers sufficient |

### Per-Transaction Costs
| Operation | Gas | Cost @ 1 gwei |
|-----------|-----|---------------|
| Mint ticket | ~150k | $0.37 |
| Use ticket | ~80k | $0.20 |
| Batch transform (10) | ~200k | $0.50 |

**Note**: Base typically runs at 0.1-1 gwei, so costs are very low!

---

## 📞 Support & Resources

### Documentation
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Vercel**: https://vercel.com/docs
- **Base**: https://docs.base.org
- **OnchainKit**: https://onchainkit.xyz

### Community
- **Base Discord**: https://discord.gg/base
- **Coinbase Developers**: https://discord.gg/coinbase-cloud

### Tools
- **Basescan**: https://basescan.org
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Vercel Status**: https://www.vercel-status.com

---

## 🎉 Launch Checklist

When ready to go live:

### Pre-Launch (Day Before)
- [ ] All documentation reviewed
- [ ] Team trained on monitoring
- [ ] Backup procedures tested
- [ ] Emergency contacts documented
- [ ] Rollback plan prepared

### Launch Day
- [ ] Announce on social media
- [ ] Monitor logs closely (every 30 min)
- [ ] Test first purchase immediately
- [ ] Verify all features working
- [ ] Be ready to rollback if needed

### Post-Launch (First Week)
- [ ] Daily error rate review
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Feature usage analytics
- [ ] Plan improvements

---

## 🗺️ Roadmap

### Immediate (Week 1)
- Complete Phase 2 (Mainnet deployment)
- Complete Phase 3 (Vercel deployment)
- Complete Phase 4 (Testing & launch)
- Submit to hackathon

### Short-term (Month 1)
- Perk redemption UI
- Venue staff scanner app
- Mobile optimization
- Performance improvements

### Long-term (Months 2-3)
- Secondary marketplace integration
- Mobile app (iOS/Android)
- Advanced analytics dashboard
- Multi-chain support

---

## 🎯 Current Status

**Phase 1**: ✅ Complete (Development)
**Phase 2**: 🎯 Ready to deploy (Mainnet)
**Phase 3**: 🎯 Ready to deploy (Vercel)
**Phase 4**: 📝 Pending (Testing)

**Next Action**: Deploy contract to Base mainnet

**Estimated Time to Launch**: 7-10 days (with testing)

---

Ready to deploy? Start with:
1. [MAINNET_DEPLOYMENT.md](MAINNET_DEPLOYMENT.md) for contract deployment
2. [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for Vercel deployment
3. [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for step-by-step guide

Good luck! 🚀
