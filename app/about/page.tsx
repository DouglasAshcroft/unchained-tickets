import Link from "next/link";
import { MissionHero } from "@/components/sections/BaseCompliantHero";
import { ValuePropsGrid, ComparisonGrid } from "@/components/sections/ValuePropsGrid";
import { PoweredByBaseBanner } from "@/components/branding/BuiltOnBaseBadge";
import { CORE_VALUE_PROPS } from "@/lib/content/valueProps";
import { TICKETING_COMPARISON, WHY_ONCHAIN } from "@/lib/content/valueProps";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ink-900 to-ink-800">
      <main className="flex-1">
        {/* Hero Section - Base Compliant */}
        <MissionHero
          tagline="BRINGING THE WORLD ONCHAIN"
          mission="About Unchained"
          vision="We're building a fairer ticketing ecosystem where fans own their tickets as NFTs and creators get their fair share."
        />

        {/* Why Onchain? Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-bone-100 mb-4">
              {WHY_ONCHAIN.headline}
            </h2>
            <p className="text-xl text-grit-300 max-w-3xl mx-auto">
              {WHY_ONCHAIN.subheadline}
            </p>
          </div>

          <ValuePropsGrid
            items={WHY_ONCHAIN.reasons}
            columns={4}
            variant="default"
          />
        </section>

        {/* Old Way vs New Way Comparison */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-bone-100 mb-4">
              The Future of Ticketing
            </h2>
            <p className="text-xl text-grit-300 max-w-2xl mx-auto">
              Stop being a guest on someone else&apos;s platform. Take back ownership.
            </p>
          </div>

          <ComparisonGrid
            oldWay={TICKETING_COMPARISON.oldWay}
            newWay={TICKETING_COMPARISON.newWay}
          />
        </section>

        {/* Core Values */}
        <section className="bg-ink-900/50 border-y border-grit-500/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-bone-100 mb-4">
                Our Values
              </h2>
              <p className="text-xl text-grit-300 max-w-2xl mx-auto">
                Built by and for real people who want something better
              </p>
            </div>

            <ValuePropsGrid
              items={CORE_VALUE_PROPS}
              columns={3}
              variant="detailed"
            />
          </div>
        </section>

        {/* Join the Resistance CTA */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-resistance-500/20 to-acid-400/20 border border-resistance-500/50 rounded-xl p-8 text-center">
            <h2 className="brand-heading text-3xl font-bold mb-4 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
              Help Bring the World Onchain
            </h2>
            <p className="text-lg text-grit-300 mb-6 max-w-2xl mx-auto">
              Advocate for fair ticketing at your favorite venues. Help us bring
              more events onchain and track your impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/advocate"
                className="px-8 py-4 bg-resistance-500 hover:brightness-110 text-bone-100 rounded-lg font-semibold text-lg transition-all"
              >
                Start Advocating
              </Link>
              <Link
                href="/events"
                className="px-8 py-4 border-2 border-acid-400/60 text-acid-400 hover:bg-acid-400/10 rounded-lg font-semibold text-lg transition-all"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </section>

        {/* Built on Base Attribution */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <PoweredByBaseBanner />
        </section>
      </main>
    </div>
  );
}
