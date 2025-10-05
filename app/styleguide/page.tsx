'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 text-left">
      <h2 className="brand-heading mb-4 text-xl text-resistance-500">{title}</h2>
      <Card>
        {children}
      </Card>
    </section>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-md border border-grit-500/30 ${className}`} />
      <code className="text-sm text-grit-300">{name}</code>
    </div>
  );
}

export default function StyleGuidePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-6xl px-4 py-10 text-left w-full">
        <h1 className="brand-heading mb-10 text-4xl bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400 bg-clip-text text-transparent">
          Unchained Style Guide (Dev)
        </h1>

        <Section title="Brand Colors">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            <Swatch name="resistance-500" className="bg-resistance-500" />
            <Swatch name="hack-green" className="bg-hack-green" />
            <Swatch name="acid-400" className="bg-acid-400" />
            <Swatch name="cobalt-500" className="bg-cobalt-500" />
            <Swatch name="signal-500" className="bg-signal-500" />
            <Swatch name="ink-900" className="bg-ink-900" />
            <Swatch name="ink-800" className="bg-ink-800" />
            <Swatch name="ink-700" className="bg-ink-700" />
            <Swatch name="bone-100" className="bg-bone-100" />
            <Swatch name="grit-500" className="bg-grit-500" />
            <Swatch name="grit-400" className="bg-grit-400" />
          </div>
        </Section>

        <Section title="Typography">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-grit-400 mb-1">Heading Font: Special Elite</p>
              <h1 className="brand-heading text-4xl text-bone-100">Headline H1 - Join the Resistance</h1>
            </div>
            <div>
              <h2 className="brand-heading text-2xl text-acid-400">Headline H2 - Punk Aesthetic</h2>
            </div>
            <div>
              <h3 className="brand-heading text-xl text-hack-green">Headline H3 - Underground Vibes</h3>
            </div>
            <div>
              <p className="text-sm text-grit-400 mb-1">Body Font: Inter</p>
              <p className="text-base text-bone-100">
                This is paragraph text. Experience live music like never before. Buy tickets as NFTs,
                own your memories, and support artists directly.
              </p>
            </div>
            <p className="text-sm text-grit-300">Secondary caption text for event details and metadata.</p>
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="primary" disabled>Disabled Button</Button>
          </div>
        </Section>

        <Section title="Inputs">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 focus:border-acid-400/50"
              placeholder="Your email"
              type="email"
            />
            <input
              className="w-full px-4 py-3 rounded-lg bg-ink-800 border border-grit-500/30 text-bone-100 placeholder-grit-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 focus:border-acid-400/50"
              placeholder="Search events..."
              type="search"
            />
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-3">
            <Badge tone="success" onClick={() => toast.success('Purchase confirmed!')}>
              Success Badge
            </Badge>
            <Badge tone="info" onClick={() => toast('Heads up, intel incoming.')}>
              Info Badge
            </Badge>
            <Badge tone="error" onClick={() => toast.error('Transmission failed.')}>
              Error Badge
            </Badge>
          </div>
          <p className="text-sm text-grit-400 mt-3">Click badges to test toast notifications</p>
        </Section>

        <Section title="Cards">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card accentLeft>
              <div className="aspect-[4/3] overflow-hidden rounded-md bg-ink-900 mb-3" />
              <h3 className="brand-heading text-acid-400 text-xl mb-2">Event Card Example</h3>
              <p className="text-sm text-grit-300 mb-3">Thu, Aug 7, 7:00 PM — National Theatre DC</p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="px-3 py-2 text-sm rounded-lg border border-grit-500/30 hover:border-grit-500/50 hover:bg-white/5 transition-colors"
                >
                  Details
                </a>
                <Button variant="primary" className="text-sm">
                  Buy Tickets
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="brand-heading mb-4 text-xl text-bone-100">Noise Overlay Card</h3>
              <p className="text-grit-300 mb-3">
                This card demonstrates the noise overlay effect that gives Unchained its gritty,
                punk aesthetic. The subtle texture adds depth to the dark interface.
              </p>
              <Button variant="ghost">Learn More</Button>
            </Card>
          </div>
        </Section>

        <Section title="Modal">
          <div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Open Modal
            </Button>
            <p className="text-sm text-grit-400 mt-2">Click to test modal component</p>
          </div>
        </Section>

        <Section title="Gradients">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-grit-400 mb-2">Primary Gradient (Resistance → Hack Green → Acid)</p>
              <div className="h-16 rounded-lg bg-gradient-to-r from-resistance-500 via-hack-green to-acid-400" />
            </div>
            <div>
              <p className="text-sm text-grit-400 mb-2">Background Gradient (Ink-900 → Ink-800)</p>
              <div className="h-16 rounded-lg bg-gradient-to-b from-ink-900 to-ink-800" />
            </div>
            <div>
              <p className="text-sm text-grit-400 mb-2">Accent Gradient (Resistance/Acid)</p>
              <div className="h-16 rounded-lg bg-gradient-to-br from-resistance-500/10 to-acid-400/10 border border-resistance-500/30" />
            </div>
          </div>
        </Section>
      </main>

      <Footer />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Example Modal">
        <div className="space-y-4">
          <p className="text-grit-300">
            This is a modal dialog with the Unchained branding. It features the noise overlay,
            brand colors, and Special Elite font for headings.
          </p>
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Confirm
            </Button>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
