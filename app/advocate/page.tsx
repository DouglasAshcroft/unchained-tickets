/**
 * Advocate Page - Join the Resistance
 *
 * Email signup to join the advocacy movement
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";

export default function AdvocatePage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);

    // Store email in localStorage for profile intake
    localStorage.setItem("advocate_email", email);

    // Redirect to profile page for full intake
    router.push("/profile?new=true");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-ink-900 to-ink-800">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="brand-heading text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
              Join the Resistance
            </h1>
            <p className="text-xl text-grit-300 max-w-2xl mx-auto mb-4">
              Help us bring fair, transparent ticketing to venues everywhere
            </p>
            <p className="text-lg text-grit-400 max-w-2xl mx-auto">
              Your voice matters in building a better music industry
            </p>
          </div>

          {/* Email Signup Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-ink-800/50 border border-resistance-500/30 rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-bone-100 text-center">
                Sign Up, Start Advocating
              </h2>
              <p className="text-grit-300 mb-6 text-center">
                Enter your email and message your favorite venues for better ticketing
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-ink-700 border border-grit-500/30 rounded-lg focus:ring-2 focus:ring-resistance-500 focus:border-transparent text-bone-100 placeholder:text-grit-500"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-4 bg-resistance-500 text-bone-100 rounded-lg hover:brightness-110 transition-all font-semibold text-lg disabled:opacity-50"
                >
                  {submitting ? "Joining..." : "Join the Resistance →"}
                </button>
              </form>

              <p className="text-sm text-grit-400 mt-6 text-center">
                Already have an account?{" "}
                <Link
                  href="/profile"
                  className="text-acid-400 hover:brightness-110 transition-all"
                >
                  Go to your profile
                </Link>
              </p>
            </div>

            {/* How It Works */}
            <div className="bg-ink-800/50 border border-grit-500/30 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-6 text-bone-100 text-center">
                How Advocacy Works
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-resistance-500 flex items-center justify-center text-bone-100 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-bone-100 mb-1">
                      Create Your Profile
                    </h4>
                    <p className="text-sm text-grit-300">
                      Sign up and tell us about your music preferences and
                      favorite venues.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-hack-green flex items-center justify-center text-ink-900 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-bone-100 mb-1">
                      Message Venues
                    </h4>
                    <p className="text-sm text-grit-300">
                      We&apos;ll help you reach out to venues to let them know there is a better way.
                      fair, transparent ticketing.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-acid-400 flex items-center justify-center text-ink-900 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-bone-100 mb-1">
                      Track Your Impact
                    </h4>
                    <p className="text-sm text-grit-300">
                      Earn rewards, climb tiers, see the venues you&apos;ve
                      brought on board.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
