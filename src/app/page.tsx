import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Role } from '@/types';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import { Shield, TriangleAlert as AlertTriangle, Search, Bus, Car, ArrowRight, ChevronRight } from 'lucide-react';

const ROLE_HOME: Record<Role, string> = {
  worshipper:       '/dashboard/worshipper',
  responder:        '/dashboard/medical',
  medical_officer:  '/dashboard/medical',
  security_officer: '/dashboard/security',
  driver:           '/dashboard/driver',
  admin:            '/dashboard/admin',
  host:             '/host/properties',
};

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role) {
    redirect(ROLE_HOME[session.user.role]);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#1B3A6B]" />
            <span className="text-lg font-semibold text-[#1B3A6B]">Nexum</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#features" className="transition-colors hover:text-[#1B3A6B]">Features</a>
            <a href="#modules" className="transition-colors hover:text-[#1B3A6B]">Modules</a>
            <Link href="/properties" className="transition-colors hover:text-[#1B3A6B]">Properties</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-700 transition-colors hover:text-[#1B3A6B]">Sign In</Link>
            <Link href="/register" className="rounded-full bg-[#1B3A6B] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2563EB]">Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-[#0F1F3D] pt-32 pb-24 text-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_35%)]" />
          <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-[#2563EB] opacity-20 blur-3xl" />
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid gap-10 lg:grid-cols-[1.75fr_1fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 shadow-sm shadow-slate-900/10">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Safety intelligence for 5M worshippers
                </div>
                <h1 className="mt-8 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  One platform for safe stays, fast response, and total camp coordination.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                  Real-time incident orchestration, guest property oversight, and crowd safety tools built for the scale of Redemption City.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#1B3A6B] shadow-lg transition hover:bg-slate-100">
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link href="/properties" className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                    Browse properties
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Trusted by camp operations</p>
                    <p className="mt-3 text-3xl font-semibold text-white">Redemption City</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-900">Live</Badge>
                </div>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Peak worshippers', value: '5M+' },
                    { label: 'Dispatch latency', value: '3s' },
                    { label: 'Camp area', value: '2,500 ha' },
                    { label: 'Ops uptime', value: '24/7' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-3xl bg-slate-950/80 p-5">
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Problem section ── */}
        <section className="bg-slate-50 py-24 px-6" id="features">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#1B3A6B]">Why Nexum</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Operational gaps become managed workflows.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                When existing tools break down at scale, Nexum provides a single source of truth for property bookings, incident response, and crowd coordination.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: '⏱',
                  title: 'Slow manual response',
                  body: 'Locating a helper in a crowded camp costs precious minutes. Nexum automates escalation, so every alert reaches the right responder immediately.',
                  accent: 'bg-red-50 border-red-200 text-red-900',
                },
                {
                  icon: '📢',
                  title: 'Human escalation only',
                  body: 'Alerts get lost in chat groups and radios. Nexum broadcasts missing person and emergency alerts directly to active camp users and officers.',
                  accent: 'bg-amber-50 border-amber-200 text-amber-900',
                },
                {
                  icon: '🗂',
                  title: 'Invisible property operations',
                  body: 'Bookings and inspections happen offline. Nexum brings every guest property into a shared registry with availability, approvals, and audit trails.',
                  accent: 'bg-blue-50 border-blue-200 text-blue-900',
                },
              ].map(card => (
                <div key={card.title} className={`rounded-3xl border p-6 ${card.accent}`}>
                  <div className="text-4xl mb-5">{card.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{card.title}</h3>
                  <p className="text-sm leading-6 text-slate-700">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Modules section ── */}
        <section className="py-24 px-6" id="modules">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Every module built for camp scale</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                From emergency dispatch to parking and missing persons, each module is designed for one mission: keep millions safe and moving.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {[
                {
                  icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
                  badge: 'Track 0D Core',
                  title: 'Emergency Dispatch',
                  body: 'One-tap incident reporting with GPS, proximity-based officer dispatch, and automated escalation if a responder doesn’t acknowledge in time.',
                  points: ['Medical & security incidents', 'Auto-dispatch to nearest officer', 'Automated re-escalation'],
                },
                {
                  icon: <Search className="h-6 w-6 text-amber-500" />,
                  badge: 'Track 0D Core',
                  title: 'Missing Persons',
                  body: 'Live missing person broadcasts with photo and location updates sent to camp users and security teams across the venue.',
                  points: ['Camp-wide photo alert', 'GPS sighting reporting', 'Live sightings map'],
                },
                {
                  icon: <Car className="h-6 w-6 text-blue-500" />,
                  badge: 'Differentiator',
                  title: 'Smart Parking',
                  body: 'Drivers pin vehicle locations, report blocked cars, and receive automatic escalation when a vehicle is abandoned in a critical lane.',
                  points: ['GPS car pinning', 'Blocking vehicle alerts', 'Auto-escalation to wardens'],
                },
                {
                  icon: <Bus className="h-6 w-6 text-teal-600" />,
                  badge: 'Differentiator',
                  title: 'Transit & Shuttle Routing',
                  body: 'Shuttle routing and congestion-aware dispatch using the camp road network to keep key routes flowing.',
                  points: ['GPS proximity dispatch', 'Live congestion detection', 'Dynamic route recalculation'],
                },
              ].map(item => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                      {item.icon}
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{item.badge}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-sm leading-7 text-slate-600 mb-5">{item.body}</p>
                  <ul className="space-y-3 text-sm text-slate-600">
                    {item.points.map(point => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-1 block h-2.5 w-2.5 rounded-full bg-slate-800" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Role CTAs ── */}
        <section className="bg-slate-50 py-24 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Built for every role in camp operations</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Tailored workflows so worshippers, officers, drivers, and hosts all have exactly what they need.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { emoji: '🙏', role: 'Worshipper', desc: 'Report emergencies, find missing people, pin your car, and book approved lodging.', cta: 'Register free', href: '/register' },
                { emoji: '🏥', role: 'Medical Officer', desc: 'Receive urgent dispatch alerts, manage incident queues, and close cases fast.', cta: 'Responder login', href: '/login?group=responder' },
                { emoji: '👮', role: 'Security Officer', desc: 'Respond to missing-person alerts, manage perimeter incidents, and coordinate teams.', cta: 'Responder login', href: '/login?group=responder' },
                { emoji: '🚌', role: 'Shuttle Driver', desc: 'Accept pickup requests, share real-time location, and follow optimized camp routes.', cta: 'Driver login', href: '/login?group=driver' },
              ].map(card => (
                <div key={card.role} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{card.emoji}</div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{card.role}</h3>
                  <p className="text-sm leading-6 text-slate-600 mb-6">{card.desc}</p>
                  <Link href={card.href} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B3A6B] transition hover:text-[#2563EB]">
                    {card.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Properties CTA ── */}
        <section className="bg-[#1B3A6B] py-24 px-6 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-[#94c5ff]">Find a safe stay</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Browse approved guest properties for Redemption City.</h2>
            <p className="mt-4 text-base leading-7 text-slate-200">
              View verified listings and book securely with full oversight from camp operations.
            </p>
            <Link href="/properties" className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#1B3A6B] shadow-lg transition hover:bg-slate-100">
              Browse Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-slate-200 bg-white py-12 px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Shield className="h-5 w-5 text-[#1B3A6B]" />
              <span className="font-semibold">Nexum</span>
              <span className="text-sm text-slate-500">Redemption City Safety Platform</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
              <Link href="/properties" className="hover:text-[#1B3A6B]">Properties</Link>
              <Link href="/login" className="hover:text-[#1B3A6B]">Sign In</Link>
              <Link href="/register" className="hover:text-[#1B3A6B]">Get Started</Link>
            </div>
            <div className="text-sm text-slate-500">© 2026 Nexum · Track 0D Submission</div>
          </div>
        </footer>
      </main>
    </div>
  );
}
