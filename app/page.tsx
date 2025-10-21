import Link from "next/link";
import { BaseCompliantHero } from "@/components/sections/BaseCompliantHero";
import { ValuePropsGrid, UserJourneyGrid } from "@/components/sections/ValuePropsGrid";
import { PoweredByBaseBanner } from "@/components/branding/BuiltOnBaseBadge";
import { HERO_MESSAGES } from "@/lib/content/baseMessaging";
import { CORE_VALUE_PROPS, USER_JOURNEY } from "@/lib/content/valueProps";

export default function HomePage() {
  // Convert USER_JOURNEY object to array for UserJourneyGrid
  const journeySteps = Object.values(USER_JOURNEY);

  return (
    <>
      {/* Hero Section - Base Compliant */}
      <BaseCompliantHero
        message={HERO_MESSAGES.home}
        variant="centered"
        background="gradient"
      />

      {/* Core Value Propositions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-bone-100 mb-4">
            A Better Way to Experience Live Events
          </h2>
          <p className="text-xl text-grit-300 max-w-2xl mx-auto">
            The internet is broken. We&apos;re building something better.
          </p>
        </div>

        <ValuePropsGrid
          items={CORE_VALUE_PROPS}
          columns={3}
          variant="detailed"
        />
      </section>

      {/* How It Works - User Journey */}
      <section className="bg-ink-900/50 border-y border-grit-500/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-bone-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-grit-300 max-w-2xl mx-auto">
              From discovery to collectible, your onchain journey in four steps
            </p>
          </div>

          <UserJourneyGrid steps={journeySteps} />
        </div>
      </section>

      {/* Join the Resistance CTA - Updated with Base messaging */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ink-800 to-ink-900">
        <div className="noise-overlay absolute inset-0 opacity-30"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="brand-heading text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
            Help Bring the World Onchain
          </h2>
          <p className="text-xl text-grit-300 mb-8 max-w-2xl mx-auto">
            Tired of being a guest on someone else&apos;s platform? Help us bring
            transparent, fan-first ticketing to venues everywhere.
          </p>

          <div className="bg-ink-800/50 border border-resistance-500/30 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-bone-100 mb-4">
              Join the Resistance
            </h3>
            <p className="text-grit-300 mb-6">
              Advocate for fair ticketing at your favorite venues. We&apos;ll help you reach out
              and track your impact as we bring more events onchain.
            </p>

            <Link
              href="/advocate"
              className="inline-block px-8 py-4 bg-resistance-500 hover:brightness-110 text-bone-100 rounded-lg font-semibold text-lg transition-all"
            >
              Start Advocating
            </Link>

            <p className="text-sm text-grit-400 mt-6">
              Already advocating?{" "}
              <Link
                href="/profile"
                className="text-acid-400 hover:brightness-110 transition-all"
              >
                Track your impact
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Built on Base Attribution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PoweredByBaseBanner />
      </section>
    </>
  );
}
